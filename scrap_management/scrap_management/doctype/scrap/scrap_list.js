frappe.listview_settings["Scrap"] = {
	add_fields: ["status"],
	get_indicator: function (doc) {
		var colors = {
			Draft: "gray",
			"Pending Approval": "orange",
			Approved: "green",
			Rejected: "red",
			"Returned for Correction": "orange",
			"Available for Sale": "blue",
			"Quotation in Process": "yellow",
			"Quotation Approved": "blue",
			"Sales Order Created": "blue",
			Dispatched: "orange",
			Invoiced: "orange",
			"Payment Pending": "orange",
			Closed: "green",
		};
		return [doc.status, colors[doc.status] || "gray", "status,=," + doc.status];
	},
};
