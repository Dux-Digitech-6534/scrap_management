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


def on_cancel(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	scrap = frappe.get_doc("Scrap", doc.custom_scrap)
	if scrap.sales_invoice == doc.name:
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
