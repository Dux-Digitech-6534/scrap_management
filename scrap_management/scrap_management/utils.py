import frappe
from frappe.utils import flt, now_datetime


def recalculate_scrap(scrap_name):
	"""Recompute stock/sales/payment derived fields on a Scrap from the real ERPNext
	transactions linked to it. Safe to call repeatedly (idempotent) — always reads the
	current state of linked documents rather than accumulating deltas."""
	if not scrap_name or not frappe.db.exists("Scrap", scrap_name):
		return

	doc = frappe.get_doc("Scrap", scrap_name)
	updates = {}

	is_received = bool(doc.stock_entry and frappe.db.get_value("Stock Entry", doc.stock_entry, "docstatus") == 1)
	total_dispatched = 0
	for row in doc.items:
		received_qty = flt(row.qty) if is_received else 0
		dispatched_qty = flt(
			frappe.db.sql(
				"""select sum(dni.qty) from `tabDelivery Note Item` dni
				inner join `tabDelivery Note` dn on dn.name = dni.parent
				where dn.custom_scrap=%s and dn.docstatus=1 and dni.item_code=%s""",
				(scrap_name, row.item),
			)[0][0]
			or 0
		)
		available_qty = received_qty - dispatched_qty
		frappe.db.set_value("Scrap Item", row.name, {"dispatched_qty": dispatched_qty, "available_qty": available_qty}, update_modified=False)
		total_dispatched += dispatched_qty

	# Sales Order display
	if doc.sales_order and frappe.db.exists("Sales Order", doc.sales_order):
		so = frappe.db.get_value(
			"Sales Order", doc.sales_order, ["per_delivered", "per_billed", "status"], as_dict=True
		)
		updates["delivery_status"] = "Fully Delivered" if flt(so.per_delivered) >= 100 else (
			"Partially Delivered" if flt(so.per_delivered) > 0 else "Pending"
		)
		updates["billing_status"] = "Fully Billed" if flt(so.per_billed) >= 100 else (
			"Partially Billed" if flt(so.per_billed) > 0 else "Not Billed"
		)

	# Payment/invoice display
	if doc.sales_invoice and frappe.db.exists("Sales Invoice", doc.sales_invoice):
		si = frappe.db.get_value(
			"Sales Invoice", doc.sales_invoice, ["grand_total", "outstanding_amount", "docstatus"], as_dict=True
		)
		if si.docstatus == 1:
			updates["invoice_amount"] = si.grand_total
			updates["outstanding_amount"] = si.outstanding_amount
			updates["pending_amount"] = si.outstanding_amount
			if flt(si.outstanding_amount) <= 0:
				updates["payment_status"] = "Paid"
			elif flt(si.outstanding_amount) < flt(si.grand_total):
				updates["payment_status"] = "Partially Paid"
			else:
				updates["payment_status"] = "Pending"
		elif si.docstatus == 2:
			updates["invoice_amount"] = 0
			updates["outstanding_amount"] = 0
			updates["pending_amount"] = 0
			updates["payment_status"] = "Not Invoiced"
	else:
		updates["payment_status"] = updates.get("payment_status") or "Not Invoiced"

	doc.db_set(updates, update_modified=False)

	# Forward-only status cascade. Only runs once the Scrap Approval Workflow has
	# actually reached "Approved" — approval_state (not status) is the field the
	# Workflow owns, since status also carries post-approval values the Workflow
	# never declares as valid states.
	if doc.approval_state == "Approved":
		new_status = _compute_forward_status(doc, updates, total_dispatched)
		if new_status and new_status != doc.status:
			status_updates = {"status": new_status}
			if new_status == "Closed" and not doc.closed_on:
				status_updates["closed_on"] = now_datetime()
			doc.db_set(status_updates, update_modified=False)
			doc.add_comment("Info", frappe.bold(f"Status automatically updated to {new_status}"))


def _compute_forward_status(doc, updates, total_dispatched):
	if updates.get("payment_status") == "Paid" and total_dispatched > 0:
		return "Closed"
	if doc.sales_invoice:
		return "Invoiced" if updates.get("payment_status") in ("Pending", "Partially Paid") else "Payment Pending"
	if doc.delivery_note or total_dispatched > 0:
		return "Dispatched"
	if doc.sales_order:
		return "Sales Order Created"
	if doc.selected_quotation:
		return "Quotation Approved"
	has_open_quotation = frappe.db.sql(
		"""select 1 from `tabQuotation` q
		inner join `tabScrap Reference` sr on sr.parent = q.name
		where sr.scrap = %s and q.docstatus != 2 limit 1""",
		doc.name,
	)
	if has_open_quotation:
		return "Quotation in Process"
	if doc.stock_entry:
		return "Available for Sale"
	return doc.status


def get_scrap_for_reference(doctype, name, fieldname="custom_scrap"):
	"""Best-effort lookup of a linked Scrap name for propagation hooks."""
	if not name:
		return None
	return frappe.db.get_value(doctype, name, fieldname)


ATTACH_FIELDTYPES = ("Attach", "Attach Image")


def link_attachments(doc, method=None):
	"""Files picked in the Scrap Management screen are uploaded before the document
	exists, so they land as private Files attached to nothing — and an unattached
	private file can only be opened by whoever uploaded it. Attach every private
	file this document (or one of its child rows) points at to the document itself,
	so anyone allowed to read the document can open its attachments."""
	for file_url in _private_attachment_urls(doc):
		try:
			_attach_file(file_url, doc.doctype, doc.name)
		except Exception:
			# Never block saving the document over an attachment link.
			frappe.log_error(title=f"Scrap Management: could not attach {file_url} to {doc.doctype} {doc.name}")


def _private_attachment_urls(doc):
	urls = set()
	for d in [doc, *doc.get_all_children()]:
		for df in frappe.get_meta(d.doctype).fields:
			value = d.get(df.fieldname) if df.fieldtype in ATTACH_FIELDTYPES else None
			if value and value.startswith("/private/files/"):
				urls.add(value)
	return urls


def _attach_file(file_url, doctype, name):
	files = frappe.get_all(
		"File",
		filters={"file_url": file_url, "is_folder": 0},
		fields=["name", "attached_to_doctype", "attached_to_name"],
		order_by="creation asc",
	)
	if not files or any(f.attached_to_doctype == doctype and f.attached_to_name == name for f in files):
		return

	unattached = next((f for f in files if not f.attached_to_doctype), None)
	if unattached:
		frappe.db.set_value(
			"File", unattached.name, {"attached_to_doctype": doctype, "attached_to_name": name}, update_modified=False
		)
		return

	# Already attached to another document (e.g. a Quotation's attachment carried
	# onto its Sales Order) — give this document its own File record for the same file.
	src = frappe.get_doc("File", files[0].name)
	frappe.get_doc(
		{
			"doctype": "File",
			"file_url": file_url,
			"file_name": src.file_name,
			"is_private": 1,
			"folder": src.folder,
			"attached_to_doctype": doctype,
			"attached_to_name": name,
		}
	).insert(ignore_permissions=True)
