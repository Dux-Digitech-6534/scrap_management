import frappe
from frappe.utils import flt


@frappe.whitelist()
def get_dashboard_data():
	stats = {
		"total_scrap": frappe.db.count("Scrap"),
		"pending_approval": frappe.db.count("Scrap", {"status": "Pending Approval"}),
		"approved": frappe.db.count(
			"Scrap", {"status": ["not in", ["Draft", "Pending Approval", "Rejected", "Returned for Correction"]]}
		),
		"available_for_sale": frappe.db.count("Scrap", {"status": "Available for Sale"}),
		"quotations_pending": frappe.db.sql(
			"""select count(distinct q.name) from `tabQuotation` q
			inner join `tabScrap Reference` sr on sr.parent = q.name
			where q.custom_approval_status != 'Approved' and q.docstatus != 2"""
		)[0][0],
		"quotations_pending_approval": frappe.db.count("Quotation", {"custom_approval_status": "Pending Approval"}),
		"sales_orders": frappe.db.count("Sales Order", {"custom_scrap": ["is", "set"], "docstatus": ["!=", 2]}),
		"pending_dispatch": frappe.db.count("Scrap", {"status": "Sales Order Created"}),
		"pending_invoice": frappe.db.count("Scrap", {"status": "Dispatched"}),
		"pending_payment": frappe.db.count("Scrap", {"payment_status": ["in", ["Pending", "Partially Paid"]]}),
		"closed": frappe.db.count("Scrap", {"status": "Closed"}),
	}
	stats["total_sale_value"] = flt(frappe.db.sql("select sum(approved_sale_value) from `tabScrap`")[0][0] or 0)

	recent = frappe.get_all(
		"Scrap",
		fields=["name", "scrap_date", "department", "status", "stock_entry"],
		order_by="creation desc",
		limit_page_length=8,
	)
	for row in recent:
		items = frappe.get_all("Scrap Item", filters={"parent": row.name}, fields=["item_name", "item", "qty"])
		row["item_summary"] = ", ".join(i.item_name or i.item for i in items) or "—"
		row["item_count"] = len(items)
		row["quotation_count"] = frappe.db.sql(
			"""select count(distinct q.name) from `tabQuotation` q
			inner join `tabScrap Reference` sr on sr.parent = q.name
			where sr.scrap = %s and q.docstatus != 2""",
			row.name,
		)[0][0]
	stats["recent"] = recent

	pending_approvals = []
	roles = frappe.get_roles()
	if "Scrap Approver" in roles or "System Manager" in roles:
		for row in frappe.get_all("Scrap", filters={"status": "Pending Approval"}, fields=["name", "scrap_date"], limit_page_length=5):
			pending_approvals.append({"doctype": "Scrap", "reference": row.name, "date": row.scrap_date, "label": row.name})
	if "Quotation Approver" in roles or "System Manager" in roles:
		for row in frappe.get_all(
			"Quotation", filters={"custom_approval_status": "Pending Approval"}, fields=["name", "transaction_date", "party_name"], limit_page_length=5
		):
			pending_approvals.append({"doctype": "Quotation", "reference": row.name, "date": row.transaction_date, "label": row.party_name or row.name})
	stats["pending_approvals"] = pending_approvals
	return stats


@frappe.whitelist()
def get_scrap_items_by_parent(scrap_names):
	"""Batched Scrap Item lookup for the custom UI's list/creation screens. Child
	tables (istable=1) can't be queried directly via frappe.client.get_list — that
	API disallows list-view style queries against table doctypes regardless of
	DocPerm — so this thin, permission-checked wrapper does the query server-side."""
	scrap_names = frappe.parse_json(scrap_names) if isinstance(scrap_names, str) else (scrap_names or [])
	if not scrap_names:
		return []
	if not frappe.has_permission("Scrap", "read"):
		frappe.throw(frappe._("Not permitted"), frappe.PermissionError)
	return frappe.get_all(
		"Scrap Item",
		filters={"parent": ["in", scrap_names]},
		fields=["parent", "item", "item_name", "qty", "uom"],
	)


@frappe.whitelist()
def search_scrap_by_item(search_text):
	"""Used by the Scrap list screen's item search box (see get_scrap_items_by_parent
	for why this can't be a plain frappe.client.get_list("Scrap Item", ...) call)."""
	if not frappe.has_permission("Scrap", "read"):
		frappe.throw(frappe._("Not permitted"), frappe.PermissionError)
	if not search_text:
		return []
	names = frappe.get_all("Scrap Item", filters={"item_name": ["like", f"%{search_text}%"]}, pluck="parent")
	return list(set(names))


@frappe.whitelist()
def get_quotations_list():
	"""One row per (Quotation, linked Scrap) pair — a Quotation can bundle items
	from several Scraps, so the custom UI's Quotations screen lists each Scrap's
	share separately rather than pretending each Quotation maps to just one. A
	Quotation created directly (no linked Scrap at all) has no Scrap Reference
	row, so the join is a LEFT JOIN and such Quotations still get their own row
	with a blank Scrap column."""
	if not frappe.has_permission("Quotation", "read"):
		frappe.throw(frappe._("Not permitted"), frappe.PermissionError)
	rows = frappe.db.sql(
		"""
		select q.name, sr.scrap, q.party_name, q.transaction_date, q.docstatus,
			q.custom_approval_status, sr.selected, s.sales_order as scrap_sales_order
		from `tabQuotation` q
		left join `tabScrap Reference` sr on sr.parent = q.name
		left join `tabScrap` s on s.name = sr.scrap
		where q.docstatus != 2
		order by q.creation desc
		""",
		as_dict=True,
	)
	for row in rows:
		item_filters = {"parent": row.name, "custom_scrap": row.scrap} if row.scrap else {"parent": row.name}
		item_rows = frappe.get_all("Quotation Item", filters=item_filters, fields=["qty", "rate"])
		row["total"] = sum(flt(r.rate) * flt(r.qty) for r in item_rows)

	# When a Scrap has more than one competing Quotation, flag whichever one
	# quoted the highest total so the UI can highlight it.
	by_scrap = {}
	for row in rows:
		if row.scrap:
			by_scrap.setdefault(row.scrap, []).append(row)
	for scrap_rows in by_scrap.values():
		if len(scrap_rows) < 2:
			continue
		max_total = max(flt(r["total"]) for r in scrap_rows)
		for r in scrap_rows:
			r["is_highest_total"] = max_total > 0 and flt(r["total"]) == max_total

	return rows


@frappe.whitelist()
def get_scrap_stock_balance(filters=None):
	"""The real, authoritative Stock Ledger balance (ERPNext's own Stock Balance
	report), scoped to only the items this app has actually received as scrap
	(via a Scrap Item row on some Scrap) and the warehouses scrap has ever been
	received into — this is a Scrap-only view, not the warehouse's full
	inventory. An explicit Company/Warehouse filter (mirroring the real report's
	own filter bar) can widen the warehouse scope, but the item scope always
	stays limited to actual scrap items."""
	filters = frappe.parse_json(filters) if isinstance(filters, str) else (filters or {})

	scrap_wh_rows = frappe.get_all("Scrap", filters={"scrap_warehouse": ["is", "set"]}, fields=["company", "scrap_warehouse"])
	if not scrap_wh_rows:
		return {"columns": [], "data": []}

	scrap_items = list(set(frappe.get_all("Scrap Item", pluck="item")))
	if not scrap_items:
		return {"columns": [], "data": []}

	by_company = {}
	for row in scrap_wh_rows:
		by_company.setdefault(row.company, set()).add(row.scrap_warehouse)

	company = filters.get("company") or scrap_wh_rows[0].company
	company_warehouses = sorted(by_company.get(company, []))

	if filters.get("warehouse"):
		warehouse = [filters["warehouse"]] if isinstance(filters["warehouse"], str) else filters["warehouse"]
	elif company_warehouses:
		warehouse = company_warehouses
	else:
		return {"columns": [], "data": []}

	if filters.get("item_code"):
		item_code = [filters["item_code"]] if isinstance(filters["item_code"], str) else filters["item_code"]
	else:
		item_code = scrap_items

	from erpnext.stock.report.stock_balance.stock_balance import execute

	# The report reads filters via attribute access (self.filters.company) — it
	# expects a frappe._dict, not a plain dict.
	report_filters = {
		"company": company,
		"from_date": filters.get("from_date") or "2000-01-01",
		"to_date": filters.get("to_date") or frappe.utils.today(),
		"warehouse": warehouse,
		"item_code": item_code,
		"include_zero_stock_items": frappe.utils.cint(filters.get("include_zero_stock_items")),
	}

	columns, data = execute(frappe._dict(report_filters))
	return {"columns": columns, "data": data}


@frappe.whitelist()
def get_scrap_stock_summary(filters=None):
	from scrap_management.scrap_management.report.scrap_stock.scrap_stock import execute

	filters = frappe.parse_json(filters) if isinstance(filters, str) else (filters or {})
	columns, data = execute(filters)
	return {"data": data}


@frappe.whitelist()
def get_report(report_name, filters=None):
	allowed = {"Scrap Stock", "Scrap Quotations", "Scrap Sales Order", "Scrap Closure", "Scrap Report"}
	if report_name not in allowed:
		frappe.throw("Not permitted")
	module_map = {
		"Scrap Stock": "scrap_management.scrap_management.report.scrap_stock.scrap_stock",
		"Scrap Quotations": "scrap_management.scrap_management.report.scrap_quotations.scrap_quotations",
		"Scrap Sales Order": "scrap_management.scrap_management.report.scrap_sales_order.scrap_sales_order",
		"Scrap Closure": "scrap_management.scrap_management.report.scrap_closure.scrap_closure",
		"Scrap Report": "scrap_management.scrap_management.report.scrap_report.scrap_report",
	}
	module = frappe.get_module(module_map[report_name])
	filters = frappe.parse_json(filters) if isinstance(filters, str) else (filters or {})
	result = module.execute(filters)
	columns, data = result[0], result[1]
	summary = result[4] if len(result) > 4 else None
	return {"columns": columns, "data": data, "summary": summary}
