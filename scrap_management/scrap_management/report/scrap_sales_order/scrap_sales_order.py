# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	filters = filters or {}
	return get_columns(), get_data(filters)


def get_columns():
	return [
		{"label": _("Sales Order"), "fieldname": "name", "fieldtype": "Link", "options": "Sales Order", "width": 120},
		{"label": _("Scrap"), "fieldname": "custom_scrap", "fieldtype": "Link", "options": "Scrap", "width": 110},
		{"label": _("Customer"), "fieldname": "customer", "fieldtype": "Link", "options": "Customer", "width": 150},
		{"label": _("Approved Quotation"), "fieldname": "selected_quotation", "fieldtype": "Link", "options": "Quotation", "width": 130},
		{"label": _("Qty"), "fieldname": "total_qty", "fieldtype": "Float", "width": 80},
		{"label": _("Total Value"), "fieldname": "grand_total", "fieldtype": "Currency", "width": 120},
		{"label": _("Order Date"), "fieldname": "transaction_date", "fieldtype": "Date", "width": 100},
		{"label": _("Delivery Status"), "fieldname": "delivery_status", "fieldtype": "Data", "width": 130},
		{"label": _("Billing Status"), "fieldname": "billing_status", "fieldtype": "Data", "width": 120},
		{"label": _("Status"), "fieldname": "status", "fieldtype": "Data", "width": 100},
	]


def get_data(filters):
	conditions = ["so.custom_scrap is not null", "so.custom_scrap != ''"]
	values = {}

	if filters.get("scrap"):
		conditions.append("so.custom_scrap = %(scrap)s")
		values["scrap"] = filters["scrap"]
	if filters.get("customer"):
		conditions.append("so.customer = %(customer)s")
		values["customer"] = filters["customer"]
	if filters.get("from_date"):
		conditions.append("so.transaction_date >= %(from_date)s")
		values["from_date"] = filters["from_date"]
	if filters.get("to_date"):
		conditions.append("so.transaction_date <= %(to_date)s")
		values["to_date"] = filters["to_date"]

	rows = frappe.db.sql(
		f"""
		select so.name, so.custom_scrap, so.customer, so.transaction_date, so.total_qty,
			so.grand_total, so.status, so.per_delivered, so.per_billed, so.docstatus,
			s.selected_quotation
		from `tabSales Order` so
		left join `tabScrap` s on s.name = so.custom_scrap
		where {" and ".join(conditions)}
		order by so.transaction_date desc
		""",
		values,
		as_dict=True,
	)
	for row in rows:
		row["delivery_status"] = (
			"Fully Delivered" if (row.per_delivered or 0) >= 100 else ("Partially Delivered" if (row.per_delivered or 0) > 0 else "Pending")
		)
		row["billing_status"] = (
			"Fully Billed" if (row.per_billed or 0) >= 100 else ("Partially Billed" if (row.per_billed or 0) > 0 else "Not Billed")
		)
	return rows
