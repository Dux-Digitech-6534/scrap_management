// Copyright (c) 2026, Dux Digitech and contributors
// For license information, please see license.txt

frappe.query_reports["Scrap Closure"] = {
	filters: [
		{
			fieldname: "scrap_status",
			label: __("Scrap Status"),
			fieldtype: "Select",
			options:
				"\nSales Order Created\nDispatched\nInvoiced\nPayment Pending\nClosed",
		},
		{
			fieldname: "payment_status",
			label: __("Payment Status"),
			fieldtype: "Select",
			options: "\nNot Invoiced\nPending\nPartially Paid\nPaid",
		},
		{ fieldname: "customer", label: __("Customer"), fieldtype: "Link", options: "Customer" },
		{ fieldname: "incomplete_only", label: __("Show Incomplete Only"), fieldtype: "Check" },
	],
};
