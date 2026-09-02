// Copyright (c) 2026, Dux Digitech and contributors
// For license information, please see license.txt

frappe.query_reports["Scrap Sales Order"] = {
	filters: [
		{ fieldname: "scrap", label: __("Scrap"), fieldtype: "Link", options: "Scrap" },
		{ fieldname: "customer", label: __("Customer"), fieldtype: "Link", options: "Customer" },
		{ fieldname: "from_date", label: __("From Date"), fieldtype: "Date" },
		{ fieldname: "to_date", label: __("To Date"), fieldtype: "Date" },
	],
};
