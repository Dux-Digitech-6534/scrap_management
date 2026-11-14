# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, now_datetime

from scrap_management.scrap_management.utils import recalculate_scrap

LOCKED_AFTER_STATES = ("Draft", "Pending Approval", "Returned for Correction")


class Scrap(Document):
	def before_insert(self):
		self.created_by_display = frappe.utils.get_fullname(frappe.session.user)
		self.creation_date_display = now_datetime()
		if not self.approval_state:
			self.approval_state = "Draft"
		if not self.status:
			self.status = "Draft"

	def validate(self):
		if not self.items:
			frappe.throw(_("Add at least one Item."))
		for row in self.items:
			if flt(row.qty) <= 0:
				frappe.throw(_("Row {0}: Quantity must be greater than zero.").format(row.idx))

		# Required for every Scrap still with its creator. Scraps already sent on
		# before the field existed must stay approvable without it.
		if (self.is_new() or self.approval_state in ("Draft", "Returned for Correction")) and not (
			self.dump_location or ""
		).strip():
			frappe.throw(_("Dump Location is mandatory."))

		self._guard_locked_fields()

	def before_save(self):
		previous = self.get_doc_before_save()
		if not previous or self.approval_state == previous.approval_state:
			return

		if self.approval_state in ("Approved", "Rejected", "Returned for Correction"):
			self.approved_by = frappe.session.user
			self.approval_date = now_datetime()

		if self.approval_state == "Approved":
			# `status` carries the full post-approval lifecycle and must never be fed
			# back into the Workflow (it holds values, like "Available for Sale", that
			# aren't declared workflow states) — approval_state is the only field the
			# Workflow itself may drive.
			self.status = "Approved"
			self.flags.received_on_approval = True
		else:
			self.status = self.approval_state

	def on_update(self):
		if self.flags.received_on_approval:
			# Approval puts the scrap into Scrap Management's own stock — no ERPNext
			# Stock Entry, so stock and non-stock (fixed asset) items behave the same.
			self.flags.received_on_approval = False
			self.add_comment("Info", frappe.bold("Scrap approved — quantity added to Scrap stock."))
			recalculate_scrap(self.name)

	def _guard_locked_fields(self):
		"""Once a Scrap has left the editable pre-approval states, its material/financial
		facts are frozen — only the automation layer (via db_set, which bypasses this
		validate()) may keep moving the lifecycle forward."""
		if self.is_new() or frappe.flags.in_install or frappe.flags.in_migrate:
			return
		if frappe.session.user == "Administrator" or "System Manager" in frappe.get_roles():
			return
		previous = self.get_doc_before_save()
		if not previous or previous.approval_state in LOCKED_AFTER_STATES:
			return
		locked_fields = ("scrap_warehouse",)
		for fieldname in locked_fields:
			if self.get(fieldname) != previous.get(fieldname):
				frappe.throw(_("Cannot change {0} after Scrap has been approved.").format(frappe.bold(fieldname)))


@frappe.whitelist()
def get_quotation_comparison(scrap_name):
	# A Quotation can bundle items from several Scraps, so both "which Quotations
	# apply here" and "what did this Scrap's share come to" go through the
	# Scrap Reference / Quotation Item tagging rather than a single custom_scrap field.
	rows = frappe.db.sql(
		"""
		select q.name, q.party_name as customer, q.transaction_date as quotation_date, q.valid_till,
			q.custom_approval_status as approval_status, q.docstatus, sr.selected
		from `tabQuotation` q
		inner join `tabScrap Reference` sr on sr.parent = q.name
		where sr.scrap = %s and q.docstatus != 2
		""",
		scrap_name,
		as_dict=True,
	)
	for row in rows:
		item_rows = frappe.get_all(
			"Quotation Item", filters={"parent": row.name, "custom_scrap": scrap_name}, fields=["qty", "rate"]
		)
		row["item_count"] = len(item_rows)
		row["total"] = sum(flt(r.rate) * flt(r.qty) for r in item_rows)
		attachments = frappe.get_all(
			"File", filters={"attached_to_doctype": "Quotation", "attached_to_name": row.name}, limit=1
		)
		row["has_attachment"] = bool(attachments)

	rows.sort(key=lambda r: flt(r["total"]), reverse=True)
	if rows:
		max_total = max(flt(r["total"]) for r in rows)
		for row in rows:
			row["is_highest_total"] = flt(row["total"]) == max_total and max_total > 0
	return rows


@frappe.whitelist()
def make_sales_order(scrap_name):
	doc = frappe.get_doc("Scrap", scrap_name)
	if not doc.selected_quotation:
		frappe.throw(_("A Quotation must be approved before creating a Sales Order."))
	total_available = sum(flt(row.available_qty) for row in doc.items)
	if doc.status not in ("Quotation Approved", "Sales Order Created") or total_available <= 0:
		frappe.throw(_("Sales Order can only be created once Scrap is approved, stock is available, and the selected Quotation is approved."))

	from erpnext.selling.doctype.quotation.quotation import make_sales_order as quotation_to_sales_order

	sales_order = quotation_to_sales_order(doc.selected_quotation)

	# The source Quotation may bundle items from several Scraps — keep only the
	# rows tagged to this specific Scrap (via Quotation Item.custom_scrap), traced
	# through the mapped doc's own quotation_item back-reference.
	qi_rows = frappe.get_all("Quotation Item", filters={"parent": doc.selected_quotation}, fields=["name", "custom_scrap"])
	scrap_by_qi = {r.name: r.custom_scrap for r in qi_rows}
	sales_order.items = [row for row in sales_order.items if scrap_by_qi.get(row.quotation_item) == scrap_name]
	if not sales_order.items:
		frappe.throw(_("No items tagged to Scrap {0} were found on the approved Quotation.").format(scrap_name))

	sales_order.custom_scrap = doc.name
	sales_order.company = doc.company
	for row in sales_order.items:
		row.warehouse = doc.scrap_warehouse
	return sales_order


@frappe.whitelist()
def make_scrap_dispatch(sales_order_name):
	"""Unsaved Scrap Dispatch for whatever is still left to dispatch on this scrap
	Sales Order, capped at the Scrap stock still available per item."""
	so = frappe.get_doc("Sales Order", sales_order_name)
	if not so.get("custom_scrap"):
		frappe.throw(_("Sales Order {0} is not linked to a Scrap.").format(sales_order_name))
	if so.docstatus != 1:
		frappe.throw(_("Sales Order {0} must be submitted before dispatch.").format(sales_order_name))

	scrap = frappe.get_doc("Scrap", so.custom_scrap)
	recalculate_scrap(scrap.name)
	scrap.reload()
	available = {}
	for row in scrap.items:
		available[row.item] = flt(available.get(row.item)) + flt(row.available_qty)

	dispatched_by_so_row = dict(
		frappe.db.sql(
			"""select sdi.sales_order_item, sum(sdi.qty) from `tabScrap Dispatch Item` sdi
			inner join `tabScrap Dispatch` sd on sd.name = sdi.parent
			where sd.sales_order=%s and sd.docstatus=1 group by sdi.sales_order_item""",
			sales_order_name,
		)
	)

	dispatch = frappe.new_doc("Scrap Dispatch")
	dispatch.scrap = scrap.name
	dispatch.company = scrap.company
	dispatch.scrap_warehouse = scrap.scrap_warehouse
	dispatch.sales_order = so.name
	dispatch.customer = so.customer
	for row in so.items:
		pending = flt(row.qty) - flt(dispatched_by_so_row.get(row.name))
		qty = min(pending, flt(available.get(row.item_code)))
		if qty <= 0:
			continue
		available[row.item_code] = flt(available.get(row.item_code)) - qty
		dispatch.append(
			"items",
			{"item": row.item_code, "item_name": row.item_name, "qty": qty, "uom": row.uom, "sales_order_item": row.name},
		)
	if not dispatch.items:
		frappe.throw(_("Nothing left to dispatch on Sales Order {0}.").format(sales_order_name))
	return dispatch


@frappe.whitelist()
def make_sales_invoice(scrap_dispatch=None, delivery_note_name=None):
	"""Sales Invoice for one Scrap Dispatch, billed from its Sales Order with Update
	Stock off, so billing never touches ERPNext stock. `delivery_note_name` is kept
	for Delivery Notes created before Scrap Dispatch existed."""
	if delivery_note_name and not scrap_dispatch:
		from erpnext.stock.doctype.delivery_note.delivery_note import make_sales_invoice as dn_to_si

		scrap_name = frappe.db.get_value("Delivery Note", delivery_note_name, "custom_scrap")
		si = dn_to_si(delivery_note_name)
		if scrap_name:
			si.custom_scrap = scrap_name
		return si

	from erpnext.selling.doctype.sales_order.sales_order import make_sales_invoice as so_to_si

	dispatch = frappe.get_doc("Scrap Dispatch", scrap_dispatch)
	if dispatch.docstatus != 1:
		frappe.throw(_("Scrap Dispatch {0} must be submitted before billing.").format(dispatch.name))
	billed = frappe.db.get_value("Sales Invoice", {"custom_scrap_dispatch": dispatch.name, "docstatus": ["!=", 2]}, "name")
	if billed:
		frappe.throw(_("Scrap Dispatch {0} is already billed in Sales Invoice {1}.").format(dispatch.name, billed))

	qty_by_so_row = {}
	for row in dispatch.items:
		qty_by_so_row[row.sales_order_item] = flt(qty_by_so_row.get(row.sales_order_item)) + flt(row.qty)

	si = so_to_si(dispatch.sales_order)
	si.items = [row for row in si.items if row.so_detail in qty_by_so_row]
	if not si.items:
		frappe.throw(_("No unbilled Sales Order items found for Scrap Dispatch {0}.").format(dispatch.name))
	for row in si.items:
		row.qty = qty_by_so_row[row.so_detail]
	si.update_stock = 0
	si.custom_scrap = dispatch.scrap
	si.custom_scrap_dispatch = dispatch.name
	si.run_method("calculate_taxes_and_totals")
	return si
