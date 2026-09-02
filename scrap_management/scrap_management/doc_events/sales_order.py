import frappe
from frappe import _
from frappe.utils import flt

from scrap_management.scrap_management.utils import recalculate_scrap


def validate(doc, method=None):
	if not doc.get("custom_scrap") and doc.get("items"):
		# Best-effort only: a Quotation can bundle items from several Scraps, so this
		# fallback (for a Sales Order created manually via ERPNext's own "Create"
		# button rather than through scrap.make_sales_order) can only guess the first
		# item's Scrap tag — scrap.make_sales_order always sets custom_scrap itself.
		quotation_item = doc.items[0].get("quotation_item")
		if quotation_item:
			doc.custom_scrap = frappe.db.get_value("Quotation Item", quotation_item, "custom_scrap")

	if not doc.get("custom_scrap"):
		return

	scrap = frappe.db.get_value("Scrap", doc.custom_scrap, ["selected_quotation"], as_dict=True)
	if not scrap:
		frappe.throw(_("Linked Scrap {0} does not exist.").format(doc.custom_scrap))

	if not scrap.selected_quotation:
		frappe.throw(_("Sales Order cannot be created — no Quotation has been approved for Scrap {0}.").format(doc.custom_scrap))

	total_qty = sum(flt(row.qty) for row in doc.items)
	total_available = flt(
		frappe.db.sql("select sum(available_qty) from `tabScrap Item` where parent=%s", doc.custom_scrap)[0][0] or 0
	)
	if total_qty > total_available:
		frappe.throw(
			_("Sales Order quantity ({0}) exceeds available Scrap stock ({1}) for {2}.").format(
				total_qty, total_available, doc.custom_scrap
			)
		)


def on_submit(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	frappe.db.set_value(
		"Scrap",
		doc.custom_scrap,
		{"sales_order": doc.name, "sales_order_date": doc.transaction_date, "status": "Sales Order Created"},
	)
	recalculate_scrap(doc.custom_scrap)


def on_cancel(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	scrap = frappe.get_doc("Scrap", doc.custom_scrap)
	if scrap.sales_order == doc.name:
		scrap.db_set(
			{"sales_order": None, "sales_order_date": None, "status": "Quotation Approved"},
			update_modified=False,
		)
		scrap.add_comment("Info", frappe.bold(f"Sales Order {doc.name} was cancelled — Scrap reverted to Quotation Approved."))
	recalculate_scrap(doc.custom_scrap)
