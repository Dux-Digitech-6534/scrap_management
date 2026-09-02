# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt


def execute(filters=None):
	filters = filters or {}
	return get_columns(), get_data(filters)


def get_columns():
	return [
		{"label": _("Scrap"), "fieldname": "name", "fieldtype": "Link", "options": "Scrap", "width": 110},
		{"label": _("Customer"), "fieldname": "selected_customer", "fieldtype": "Link", "options": "Customer", "width": 140},
		{"label": _("Sales Order"), "fieldname": "sales_order", "fieldtype": "Link", "options": "Sales Order", "width": 110},
		{"label": _("Delivery Note"), "fieldname": "delivery_note", "fieldtype": "Link", "options": "Delivery Note", "width": 120},
		{"label": _("Gate Pass No"), "fieldname": "gate_pass_no", "fieldtype": "Data", "width": 100},
		{"label": _("Sales Invoice"), "fieldname": "sales_invoice", "fieldtype": "Link", "options": "Sales Invoice", "width": 120},
		{"label": _("Payment Entry"), "fieldname": "payment_entry", "fieldtype": "Link", "options": "Payment Entry", "width": 120},
		{"label": _("Invoice Amount"), "fieldname": "invoice_amount", "fieldtype": "Currency", "width": 110},
		{"label": _("Payment Received"), "fieldname": "payment_received", "fieldtype": "Currency", "width": 120},
		{"label": _("Pending Amount"), "fieldname": "pending_amount", "fieldtype": "Currency", "width": 110},
		{"label": _("Dispatch Status"), "fieldname": "dispatch_status", "fieldtype": "Data", "width": 120},
		{"label": _("Payment Status"), "fieldname": "payment_status", "fieldtype": "Data", "width": 110},
		{"label": _("Scrap Status"), "fieldname": "status", "fieldtype": "Data", "width": 120},
		{"label": _("Closure Date"), "fieldname": "closed_on", "fieldtype": "Datetime", "width": 150},
	]


def get_data(filters):
	conditions = ["s.sales_order is not null", "s.sales_order != ''"]
	values = {}

	if filters.get("scrap_status"):
		conditions.append("s.status = %(scrap_status)s")
		values["scrap_status"] = filters["scrap_status"]
	if filters.get("payment_status"):
		conditions.append("s.payment_status = %(payment_status)s")
		values["payment_status"] = filters["payment_status"]
	if filters.get("customer"):
		conditions.append("s.selected_customer = %(customer)s")
		values["customer"] = filters["customer"]
	if filters.get("incomplete_only"):
		conditions.append("s.status != 'Closed'")

	rows = frappe.db.sql(
		f"""
		select s.name, s.selected_customer, s.sales_order, s.delivery_note, s.gate_pass_no,
			s.sales_invoice, s.invoice_amount, s.pending_amount, s.payment_status, s.status,
			s.closed_on,
			(select sum(qty) from `tabScrap Item` where parent = s.name) as total_qty,
			(select sum(dispatched_qty) from `tabScrap Item` where parent = s.name) as total_dispatched_qty
		from `tabScrap` s
		where {" and ".join(conditions)}
		order by s.modified desc
		""",
		values,
		as_dict=True,
	)

	for row in rows:
		row["dispatch_status"] = "Fully Dispatched" if flt(row.total_dispatched_qty) >= flt(row.total_qty) else (
			"Partially Dispatched" if flt(row.total_dispatched_qty) > 0 else "Pending"
		)
		row["payment_received"] = (row.invoice_amount or 0) - (row.pending_amount or 0)
		row["payment_entry"] = None
		if row.sales_invoice:
			pe_ref = frappe.db.get_value(
				"Payment Entry Reference",
				{"reference_doctype": "Sales Invoice", "reference_name": row.sales_invoice},
				"parent",
			)
			row["payment_entry"] = pe_ref
	return rows
