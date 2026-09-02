# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import flt


def execute(filters=None):
	filters = filters or {}
	columns = get_columns()
	data = get_data(filters)
	report_summary = get_report_summary(data)
	return columns, data, None, None, report_summary


def get_columns():
	return [
		{"label": _("Scrap ID"), "fieldname": "name", "fieldtype": "Link", "options": "Scrap", "width": 100},
		{"label": _("Scrap Date"), "fieldname": "scrap_date", "fieldtype": "Date", "width": 95},
		{"label": _("Department"), "fieldname": "department", "fieldtype": "Link", "options": "Department", "width": 120},
		{"label": _("Item Group"), "fieldname": "scrap_category", "fieldtype": "Data", "width": 100},
		{"label": _("Item"), "fieldname": "item", "fieldtype": "Link", "options": "Item", "width": 110},
		{"label": _("Quantity"), "fieldname": "qty", "fieldtype": "Float", "width": 80},
		{"label": _("UOM"), "fieldname": "uom", "fieldtype": "Link", "options": "UOM", "width": 70},
		{"label": _("Reason"), "fieldname": "reason_for_scrap", "fieldtype": "Data", "width": 130},
		{"label": _("Remarks"), "fieldname": "remarks", "fieldtype": "Data", "width": 110},
		{"label": _("Approval Status"), "fieldname": "approval_status", "fieldtype": "Data", "width": 110},
		{"label": _("Stock Entry"), "fieldname": "stock_entry", "fieldtype": "Link", "options": "Stock Entry", "width": 110},
		{"label": _("Scrap Warehouse"), "fieldname": "scrap_warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 130},
		{"label": _("Received Qty"), "fieldname": "received_qty", "fieldtype": "Float", "width": 100},
		{"label": _("Available Qty"), "fieldname": "available_qty", "fieldtype": "Float", "width": 100},
		{"label": _("No. of Quotations"), "fieldname": "quotation_count", "fieldtype": "Int", "width": 110},
		{"label": _("Selected Customer"), "fieldname": "selected_customer", "fieldtype": "Link", "options": "Customer", "width": 140},
		{"label": _("Approved Quotation"), "fieldname": "selected_quotation", "fieldtype": "Link", "options": "Quotation", "width": 130},
		{"label": _("Final Sale Value"), "fieldname": "approved_sale_value", "fieldtype": "Currency", "width": 110},
		{"label": _("Sales Order"), "fieldname": "sales_order", "fieldtype": "Link", "options": "Sales Order", "width": 110},
		{"label": _("Delivery Note"), "fieldname": "delivery_note", "fieldtype": "Link", "options": "Delivery Note", "width": 120},
		{"label": _("Gate Pass No"), "fieldname": "gate_pass_no", "fieldtype": "Data", "width": 100},
		{"label": _("Sales Invoice"), "fieldname": "sales_invoice", "fieldtype": "Link", "options": "Sales Invoice", "width": 120},
		{"label": _("Payment Entry"), "fieldname": "payment_entry", "fieldtype": "Link", "options": "Payment Entry", "width": 120},
		{"label": _("Payment Received"), "fieldname": "payment_received", "fieldtype": "Currency", "width": 120},
		{"label": _("Pending Amount"), "fieldname": "pending_amount", "fieldtype": "Currency", "width": 110},
		{"label": _("Final Status"), "fieldname": "status", "fieldtype": "Data", "width": 120},
		{"label": _("Closure Date"), "fieldname": "closed_on", "fieldtype": "Datetime", "width": 150},
	]


def get_data(filters):
	# One row per Scrap Item — a Scrap can hold multiple items, each scrapped/received/
	# dispatched independently, so per-item detail can't collapse onto one Scrap row.
	conditions = ["1=1"]
	values = {}

	simple_field_filters = {
		"campus": "s.campus",
		"department": "s.department",
		"scrap_category": "si.scrap_category",
		"item": "si.item",
		"scrap_warehouse": "s.scrap_warehouse",
		"status": "s.status",
		"selected_customer": "s.selected_customer",
		"payment_status": "s.payment_status",
	}
	for key, column in simple_field_filters.items():
		if filters.get(key):
			conditions.append(f"{column} = %({key})s")
			values[key] = filters[key]

	if filters.get("from_date"):
		conditions.append("s.scrap_date >= %(from_date)s")
		values["from_date"] = filters["from_date"]
	if filters.get("to_date"):
		conditions.append("s.scrap_date <= %(to_date)s")
		values["to_date"] = filters["to_date"]

	rows = frappe.db.sql(
		f"""
		select s.name, s.scrap_date, s.campus, s.department, si.scrap_category, si.item, si.item_name,
			si.qty, si.uom, s.reason_for_scrap, s.remarks, s.status, s.stock_entry, s.scrap_warehouse,
			si.dispatched_qty, si.available_qty, s.selected_customer, s.selected_quotation,
			s.approved_sale_value, s.sales_order, s.delivery_note, s.gate_pass_no,
			s.sales_invoice, s.invoice_amount, s.pending_amount, s.payment_status, s.closed_on
		from `tabScrap` s
		inner join `tabScrap Item` si on si.parent = s.name
		where {" and ".join(conditions)}
		order by s.scrap_date desc
		""",
		values,
		as_dict=True,
	)

	for row in rows:
		row["received_qty"] = flt(row.dispatched_qty) + flt(row.available_qty)
		row["approval_status"] = "Approved" if row.status not in ("Draft", "Pending Approval", "Rejected", "Returned for Correction") else row.status
		row["quotation_count"] = frappe.db.sql(
			"""select count(distinct q.name) from `tabQuotation` q
			inner join `tabScrap Reference` sr on sr.parent = q.name
			where sr.scrap = %s and q.docstatus != 2""",
			row.name,
		)[0][0]
		row["payment_received"] = (row.invoice_amount or 0) - (row.pending_amount or 0)
		row["payment_entry"] = None
		if row.sales_invoice:
			row["payment_entry"] = frappe.db.get_value(
				"Payment Entry Reference",
				{"reference_doctype": "Sales Invoice", "reference_name": row.sales_invoice},
				"parent",
			)
	return rows


def get_report_summary(data):
	total_records = len(data)
	total_qty = sum(flt(r.qty) for r in data)
	total_sale_value = sum(flt(r.approved_sale_value) for r in {r.name: r for r in data}.values())
	total_payment_received = sum(flt(r.payment_received) for r in {r.name: r for r in data}.values())
	total_pending_amount = sum(flt(r.pending_amount) for r in {r.name: r for r in data}.values())

	return [
		{"value": total_records, "label": _("Total Scrap Item Rows"), "datatype": "Int"},
		{"value": total_qty, "label": _("Total Scrap Qty"), "datatype": "Float"},
		{"value": total_sale_value, "label": _("Total Sale Value"), "datatype": "Currency"},
		{"value": total_payment_received, "label": _("Total Payment Received"), "datatype": "Currency"},
		{"value": total_pending_amount, "label": _("Total Pending Amount"), "datatype": "Currency"},
	]
