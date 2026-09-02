// Copyright (c) 2026, Dux Digitech and contributors
// For license information, please see license.txt

frappe.query_reports["Scrap Stock"] = {
	filters: [
		{ fieldname: "campus", label: __("Campus"), fieldtype: "Data" },
		{ fieldname: "department", label: __("Department"), fieldtype: "Link", options: "Department" },
		{ fieldname: "scrap_warehouse", label: __("Warehouse"), fieldtype: "Link", options: "Warehouse" },
		{ fieldname: "item", label: __("Item"), fieldtype: "Link", options: "Item" },
		{
			fieldname: "availability",
			label: __("Availability"),
			fieldtype: "Select",
			options: "\nAvailable\nFully Dispatched",
		},
	],
};
