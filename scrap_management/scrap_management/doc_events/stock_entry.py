import frappe

from scrap_management.scrap_management.utils import recalculate_scrap


def on_submit(doc, method=None):
	if doc.custom_scrap:
		recalculate_scrap(doc.custom_scrap)


def on_cancel(doc, method=None):
	if not doc.custom_scrap:
		return
	scrap = frappe.get_doc("Scrap", doc.custom_scrap)
	if scrap.stock_entry == doc.name:
		scrap.db_set(
			{
				"stock_entry": None,
				"stock_entry_date": None,
				"status": "Approved",
			},
			update_modified=False,
		)
		scrap.add_comment("Info", frappe.bold(f"Stock Entry {doc.name} was cancelled — Scrap reverted to Approved / not received."))
	recalculate_scrap(doc.custom_scrap)
