import frappe
from frappe import _
from frappe.utils import flt

from scrap_management.scrap_management.utils import get_scrap_for_reference, recalculate_scrap


def validate(doc, method=None):
	if not doc.get("custom_scrap") and doc.get("items"):
		sales_order = doc.items[0].get("against_sales_order")
		if sales_order:
			doc.custom_scrap = get_scrap_for_reference("Sales Order", sales_order)

	if not doc.get("custom_scrap"):
		return

	scrap = frappe.db.get_value("Scrap", doc.custom_scrap, ["stock_entry"], as_dict=True)
	if not scrap:
		frappe.throw(_("Linked Scrap {0} does not exist.").format(doc.custom_scrap))

	is_received = bool(scrap.stock_entry and frappe.db.get_value("Stock Entry", scrap.stock_entry, "docstatus") == 1)
	received_qty = flt(
		frappe.db.sql("select sum(qty) from `tabScrap Item` where parent=%s", doc.custom_scrap)[0][0] or 0
	) if is_received else 0

	already_dispatched = frappe.db.sql(
		"""select sum(dni.qty) from `tabDelivery Note Item` dni
		inner join `tabDelivery Note` dn on dn.name = dni.parent
		where dn.custom_scrap=%s and dn.docstatus=1 and dn.name != %s""",
		(doc.custom_scrap, doc.name or "New Delivery Note"),
	)[0][0] or 0

	this_qty = sum(flt(row.qty) for row in doc.items)
	available = received_qty - flt(already_dispatched)
	if this_qty > available:
		frappe.throw(
			_("Dispatch quantity ({0}) exceeds available Scrap stock ({1}) for {2}.").format(
				this_qty, available, doc.custom_scrap
			)
		)

	if doc.get("custom_security_exit_confirmed") and not doc.get("custom_handover_confirmed"):
		frappe.throw(_("Security Exit cannot be confirmed before Handover is confirmed."))


def on_submit(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	frappe.db.set_value(
		"Scrap",
		doc.custom_scrap,
		{
			"delivery_note": doc.name,
			"gate_pass_no": doc.get("custom_gate_pass_no"),
			"vehicle_number": doc.get("custom_vehicle_number"),
			"driver_name": doc.get("custom_driver_name"),
			"handover_confirmed": doc.get("custom_handover_confirmed") or 0,
			"security_exit_confirmed": doc.get("custom_security_exit_confirmed") or 0,
			"status": "Dispatched",
		},
	)
	recalculate_scrap(doc.custom_scrap)


def on_cancel(doc, method=None):
	if not doc.get("custom_scrap"):
		return
	scrap = frappe.get_doc("Scrap", doc.custom_scrap)
	if scrap.delivery_note == doc.name:
		scrap.db_set(
			{
				"delivery_note": None,
				"gate_pass_no": None,
				"vehicle_number": None,
				"driver_name": None,
				"handover_confirmed": 0,
				"security_exit_confirmed": 0,
				"status": "Sales Order Created",
			},
			update_modified=False,
		)
		scrap.add_comment("Info", frappe.bold(f"Delivery Note {doc.name} was cancelled — Scrap reverted to Sales Order Created."))
	recalculate_scrap(doc.custom_scrap)
