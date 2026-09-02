# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.utils import date_diff, flt, nowdate


def execute(filters=None):
	filters = filters or {}
	columns = get_columns()
	data = get_data(filters)
	return columns, data


def get_columns():
	return [
		{"label": _("Scrap"), "fieldname": "name", "fieldtype": "Link", "options": "Scrap", "width": 110},
		{"label": _("Item"), "fieldname": "item", "fieldtype": "Link", "options": "Item", "width": 120},
		{"label": _("Item Name"), "fieldname": "item_name", "fieldtype": "Data", "width": 150},
		{"label": _("Campus"), "fieldname": "campus", "fieldtype": "Data", "width": 110},
		{"label": _("Department"), "fieldname": "department", "fieldtype": "Link", "options": "Department", "width": 130},
		{"label": _("Warehouse"), "fieldname": "scrap_warehouse", "fieldtype": "Link", "options": "Warehouse", "width": 140},
		{"label": _("Received Qty"), "fieldname": "received_qty", "fieldtype": "Float", "width": 110},
		{"label": _("Dispatched Qty"), "fieldname": "dispatched_qty", "fieldtype": "Float", "width": 120},
		{"label": _("Available Qty"), "fieldname": "available_qty", "fieldtype": "Float", "width": 110},
		{"label": _("UOM"), "fieldname": "uom", "fieldtype": "Link", "options": "UOM", "width": 80},
		{"label": _("Stock Status"), "fieldname": "stock_status", "fieldtype": "Data", "width": 130},
		{"label": _("Age in Inventory (days)"), "fieldname": "age", "fieldtype": "Int", "width": 140},
	]


def get_data(filters):
	# One row per Scrap Item — a multi-item Scrap can have some items available and
	# others fully dispatched, so this can't be reported on at the Scrap level alone.
	conditions = ["s.stock_entry is not null", "s.stock_entry != ''"]
	values = {}

	if filters.get("campus"):
		conditions.append("s.campus = %(campus)s")
		values["campus"] = filters["campus"]
	if filters.get("department"):
		conditions.append("s.department = %(department)s")
		values["department"] = filters["department"]
	if filters.get("scrap_warehouse"):
		conditions.append("s.scrap_warehouse = %(scrap_warehouse)s")
		values["scrap_warehouse"] = filters["scrap_warehouse"]
	if filters.get("item"):
		conditions.append("si.item = %(item)s")
		values["item"] = filters["item"]
	if filters.get("availability") == "Available":
		conditions.append("si.available_qty > 0")
	elif filters.get("availability") == "Fully Dispatched":
		conditions.append("si.available_qty <= 0")

	rows = frappe.db.sql(
		f"""
		select s.name, si.item, si.item_name, s.campus, s.department, s.scrap_warehouse,
			si.qty as received_qty, si.dispatched_qty, si.available_qty, si.uom,
			s.stock_entry_date
		from `tabScrap` s
		inner join `tabScrap Item` si on si.parent = s.name
		where {" and ".join(conditions)}
		order by s.stock_entry_date desc
		""",
		values,
		as_dict=True,
	)

	today = nowdate()
	for row in rows:
		row["age"] = date_diff(today, row.stock_entry_date) if row.stock_entry_date else None
		row["stock_status"] = "Fully Dispatched" if flt(row.available_qty) <= 0 else (
			"Partially Dispatched" if flt(row.dispatched_qty) > 0 else "Available"
		)
	return rows
