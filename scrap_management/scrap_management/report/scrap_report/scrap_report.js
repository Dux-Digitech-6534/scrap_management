// Copyright (c) 2026, Dux Digitech and contributors
// For license information, please see license.txt

frappe.query_reports["Scrap Report"] = {
	filters: [
		{ fieldname: "from_date", label: __("Date From"), fieldtype: "Date" },
		{ fieldname: "to_date", label: __("Date To"), fieldtype: "Date" },
		{ fieldname: "campus", label: __("Campus"), fieldtype: "Data" },
		{ fieldname: "department", label: __("Department"), fieldtype: "Link", options: "Department" },
		{ fieldname: "scrap_category", label: __("Category (Item Group)"), fieldtype: "Link", options: "Item Group" },
		{ fieldname: "item", label: __("Item"), fieldtype: "Link", options: "Item" },
		{ fieldname: "scrap_warehouse", label: __("Warehouse"), fieldtype: "Link", options: "Warehouse" },
		{
			fieldname: "status",
			label: __("Scrap Status"),
			fieldtype: "Select",
			options:
				"\nDraft\nPending Approval\nApproved\nRejected\nReturned for Correction\nAvailable for Sale\nQuotation in Process\nQuotation Approved\nSales Order Created\nDispatched\nInvoiced\nPayment Pending\nClosed",
		},
		{ fieldname: "selected_customer", label: __("Customer"), fieldtype: "Link", options: "Customer" },
		{
			fieldname: "payment_status",
			label: __("Payment Status"),
			fieldtype: "Select",
			options: "\nNot Invoiced\nPending\nPartially Paid\nPaid",
		},
	],
};
