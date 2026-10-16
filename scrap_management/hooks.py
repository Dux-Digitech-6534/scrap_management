app_name = "scrap_management"
app_title = "Scrap Management"
app_publisher = "Dux Digitech"
app_description = "Scrap Management app for Scrap Entry to Closure lifecycle"
app_email = "admin@raisonigroup.duxdigitech.in"
app_license = "mit"

required_apps = ["erpnext"]

# Workflow fixtures link to Workflow State / Workflow Action Master records that a
# fresh site does not have — create them before fixtures are synced.
before_install = "scrap_management.scrap_management.install.ensure_workflow_masters"
before_migrate = "scrap_management.scrap_management.install.ensure_workflow_masters"

# Role permissions on standard doctypes (Quotation, Sales Order, ...) — applied after
# fixtures have created the roles, so every site pulling this app gets the same access.
after_install = "scrap_management.scrap_management.install.setup_role_permissions"
after_migrate = "scrap_management.scrap_management.install.setup_role_permissions"

# Desk theme, scoped at runtime (scrap_management.js) to Scrap Management's own
# screens only — see public/js/scrap_management.js for the route guard.
app_include_css = "/assets/scrap_management/css/scrap_management.css"
app_include_js = "/assets/scrap_management/js/scrap_management.js"

# Fixtures
# --------
fixtures = [
	{
		"dt": "Custom Field",
		"filters": [
			[
				"name",
				"in",
				[
					"Stock Entry-custom_scrap",
					"Quotation-custom_scrap_section",
					"Quotation-custom_scraps",
					"Quotation-custom_approval_status",
					"Quotation-custom_column_break_qty",
					"Quotation-custom_approved_by",
					"Quotation-custom_approval_date",
					"Quotation-custom_approval_remarks",
					"Quotation-custom_attachment",
					"Quotation Item-custom_scrap",
					"Quotation Item-custom_attachment",
					"Sales Order-custom_scrap",
					"Sales Order-custom_attachment",
					"Sales Order Item-custom_attachment",
					"Delivery Note-custom_scrap",
					"Delivery Note-custom_gate_pass_section",
					"Delivery Note-custom_gate_pass_no",
					"Delivery Note-custom_vehicle_number",
					"Delivery Note-custom_column_break_gp1",
					"Delivery Note-custom_driver_name",
					"Delivery Note-custom_driver_mobile",
					"Delivery Note-custom_driver_id",
					"Delivery Note-custom_column_break_gp2",
					"Delivery Note-custom_handover_confirmed",
					"Delivery Note-custom_handover_datetime",
					"Delivery Note-custom_security_exit_confirmed",
					"Delivery Note-custom_security_exit_datetime",
					"Delivery Note-custom_security_remarks",
					"Sales Invoice-custom_scrap",
					"Payment Entry-custom_scrap",
				],
			]
		],
	},
	{"dt": "Role", "filters": [["name", "in", [
			"Scrap Creator",
			"Scrap Approver",
			"Quotation Approver",
			"Security User",
			"Scrap Quotations Creator",
			"Scrap Sale Order Creator",
			"Scrap Delivery Note",
			"Scrap Sales invoice",
			"Scrap Payment Entry",
		]]]},
	{"dt": "Workflow", "filters": [["name", "in", ["Scrap Approval Workflow", "Quotation Approval Workflow"]]]},
]

# Document Events
# ---------------
doc_events = {
	"Stock Entry": {
		"on_submit": "scrap_management.scrap_management.doc_events.stock_entry.on_submit",
		"on_cancel": "scrap_management.scrap_management.doc_events.stock_entry.on_cancel",
	},
	"Quotation": {
		"validate": "scrap_management.scrap_management.doc_events.quotation.validate",
		"on_update": "scrap_management.scrap_management.doc_events.quotation.on_update",
		"on_cancel": "scrap_management.scrap_management.doc_events.quotation.on_cancel",
	},
	"Sales Order": {
		"validate": "scrap_management.scrap_management.doc_events.sales_order.validate",
		"on_submit": "scrap_management.scrap_management.doc_events.sales_order.on_submit",
		"on_cancel": "scrap_management.scrap_management.doc_events.sales_order.on_cancel",
	},
	"Delivery Note": {
		"validate": "scrap_management.scrap_management.doc_events.delivery_note.validate",
		"on_submit": "scrap_management.scrap_management.doc_events.delivery_note.on_submit",
		"on_cancel": "scrap_management.scrap_management.doc_events.delivery_note.on_cancel",
	},
	"Sales Invoice": {
		"validate": "scrap_management.scrap_management.doc_events.sales_invoice.validate",
		"on_submit": "scrap_management.scrap_management.doc_events.sales_invoice.on_submit",
		"on_cancel": "scrap_management.scrap_management.doc_events.sales_invoice.on_cancel",
	},
	"Payment Entry": {
		"validate": "scrap_management.scrap_management.doc_events.payment_entry.validate",
		"on_submit": "scrap_management.scrap_management.doc_events.payment_entry.on_submit",
		"on_cancel": "scrap_management.scrap_management.doc_events.payment_entry.on_cancel",
	},
}
