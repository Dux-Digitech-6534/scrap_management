import frappe

from scrap_management.scrap_management.utils import get_scrap_for_reference, recalculate_scrap


def validate(doc, method=None):
	if not doc.get("custom_scrap") and doc.get("items"):
		row = doc.items[0]
		scrap_name = None
		if row.get("delivery_note"):
			scrap_name = get_scrap_for_reference("Delivery Note", row.get("delivery_note"))
		if not scrap_name and row.get("sales_order"):
			scrap_name = get_scrap_for_reference("Sales Order", row.get("sales_order"))
		if scrap_name:
			doc.custom_scrap = scrap_name


def on_submit(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	frappe.db.set_value(
		"Scrap",
		doc.custom_scrap,
		{
			"sales_invoice": doc.name,
			"invoice_amount": doc.grand_total,
			"outstanding_amount": doc.outstanding_amount,
			"pending_amount": doc.outstanding_amount,
			"payment_status": "Pending",
			"status": "Invoiced",
		},
	)
	recalculate_scrap(doc.custom_scrap)


def before_cancel(doc, method=None):
	"""Scrap Management closes a scrap Sales Order once it is dispatched and billed
	(to release ERPNext's stock reservation). ERPNext refuses to cancel an invoice
	against a Closed order, so reopen it first."""
	if not doc.get("custom_scrap"):
		return
	for so_name in {row.sales_order for row in doc.items if row.get("sales_order")}:
		if frappe.db.get_value("Sales Order", so_name, "status") == "Closed":
			frappe.get_doc("Sales Order", so_name).update_status("Draft")


def on_cancel(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	scrap = frappe.get_doc("Scrap", doc.custom_scrap)
	# A Scrap dispatched in parts can have several invoices — fall back to the
	# latest one that is still valid instead of forgetting all of them.
	other = frappe.get_all(
		"Sales Invoice",
		filters={"custom_scrap": doc.custom_scrap, "docstatus": 1, "name": ["!=", doc.name]},
		fields=["name", "grand_total", "outstanding_amount"],
		order_by="posting_date desc, creation desc",
		limit=1,
	)
	if scrap.sales_invoice == doc.name and other:
		scrap.db_set(
			{
				"sales_invoice": other[0].name,
				"invoice_amount": other[0].grand_total,
				"outstanding_amount": other[0].outstanding_amount,
				"pending_amount": other[0].outstanding_amount,
				"status": "Invoiced",
			},
			update_modified=False,
		)
		scrap.add_comment("Info", frappe.bold(f"Sales Invoice {doc.name} was cancelled — Scrap now points to {other[0].name}."))
	elif scrap.sales_invoice == doc.name:
		scrap.db_set(
			{
				"sales_invoice": None,
				"invoice_amount": 0,
				"outstanding_amount": 0,
				"pending_amount": 0,
				"payment_status": "Not Invoiced",
				"status": "Dispatched",
			},
			update_modified=False,
		)
		scrap.add_comment("Info", frappe.bold(f"Sales Invoice {doc.name} was cancelled — Scrap reverted to Dispatched."))
	recalculate_scrap(doc.custom_scrap)
