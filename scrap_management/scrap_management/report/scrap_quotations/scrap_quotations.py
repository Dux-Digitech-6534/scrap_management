# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _


def execute(filters=None):
	filters = filters or {}
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{"label": _("Quotation"), "fieldname": "name", "fieldtype": "Link", "options": "Quotation", "width": 120},
		{"label": _("Scrap"), "fieldname": "scrap", "fieldtype": "Link", "options": "Scrap", "width": 110},
		{"label": _("Customer"), "fieldname": "party_name", "fieldtype": "Dynamic Link", "options": "quotation_to", "width": 150},
		{"label": _("Item"), "fieldname": "item_code", "fieldtype": "Link", "options": "Item", "width": 120},
		{"label": _("Qty"), "fieldname": "qty", "fieldtype": "Float", "width": 80},
		{"label": _("Rate"), "fieldname": "rate", "fieldtype": "Currency", "width": 100},
		{"label": _("Total"), "fieldname": "total", "fieldtype": "Currency", "width": 110},
		{"label": _("Quotation Date"), "fieldname": "transaction_date", "fieldtype": "Date", "width": 110},
		{"label": _("Workflow Status"), "fieldname": "docstatus_label", "fieldtype": "Data", "width": 110},
		{"label": _("Approval Status"), "fieldname": "custom_approval_status", "fieldtype": "Data", "width": 120},
		{"label": _("Selected"), "fieldname": "selected_label", "fieldtype": "Data", "width": 80},
	]


def get_data(filters):
	conditions = ["q.docstatus != 2"]
	values = {}

	if filters.get("scrap"):
		conditions.append("qi.custom_scrap = %(scrap)s")
		values["scrap"] = filters["scrap"]
	if filters.get("customer"):
		conditions.append("q.party_name = %(customer)s")
		values["customer"] = filters["customer"]
	if filters.get("approval_status"):
		conditions.append("q.custom_approval_status = %(approval_status)s")
		values["approval_status"] = filters["approval_status"]
	if filters.get("from_date"):
		conditions.append("q.transaction_date >= %(from_date)s")
		values["from_date"] = filters["from_date"]
	if filters.get("to_date"):
		conditions.append("q.transaction_date <= %(to_date)s")
		values["to_date"] = filters["to_date"]

	rows = frappe.db.sql(
		f"""
		select q.name, qi.custom_scrap as scrap, q.party_name, q.quotation_to, q.transaction_date,
			q.docstatus, q.custom_approval_status, sr.selected,
			qi.item_code, qi.qty, qi.rate, qi.amount as total
		from `tabQuotation` q
		inner join `tabQuotation Item` qi on qi.parent = q.name
		left join `tabScrap Reference` sr on sr.parent = q.name and sr.scrap = qi.custom_scrap
		where qi.custom_scrap is not null and qi.custom_scrap != '' and {" and ".join(conditions)}
		order by qi.custom_scrap, q.transaction_date desc
		""",
		values,
		as_dict=True,
	)
	for row in rows:
		row["docstatus_label"] = {0: "Draft", 1: "Submitted"}.get(row.docstatus, "")
		row["selected_label"] = "Yes" if row.selected else "No"
	return rows
