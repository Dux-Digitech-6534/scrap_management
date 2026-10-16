import frappe
from frappe.permissions import add_permission, update_permission_property

WORKFLOW_STATES = ("Draft", "Pending Approval", "Approved", "Rejected", "Returned for Correction")
WORKFLOW_ACTIONS = ("Send For Approval", "Approve", "Reject", "Return for Correction")

# One role per step of the Scrap lifecycle (see fixtures/role.json):
#   Scrap Entry        -> Scrap Creator
#   Scrap Approval     -> Scrap Approver
#   Scrap Quotations   -> Scrap Quotations Creator
#   Quotation approval -> Quotation Approver
#   Sale Order Entry   -> Scrap Sale Order Creator
#   Delivery Note      -> Scrap Delivery Note
#   Sale Invoice       -> Scrap Sales invoice
#   Payment Entry      -> Scrap Payment Entry
SCRAP_ROLES = (
	"Scrap Creator",
	"Scrap Approver",
	"Scrap Quotations Creator",
	"Quotation Approver",
	"Scrap Sale Order Creator",
	"Scrap Delivery Note",
	"Scrap Sales invoice",
	"Scrap Payment Entry",
)

READ = ("read", "print", "report")
ENTRY = ("read", "write", "create", "print", "email", "report", "export")
SUBMIT_ENTRY = (*ENTRY, "submit")

# Masters every Scrap role needs to read so link fields, filters and the
# custom UI's lookups resolve.
COMMON_READ_DOCTYPES = (
	"Company",
	"Department",
	"Warehouse",
	"Item",
	"Item Group",
	"UOM",
	"Customer",
	"Customer Group",
	"Territory",
	"Currency",
	"Price List",
	"Address",
	"Contact",
	"Cost Center",
	"Fiscal Year",
)

# Standard ERPNext doctypes the Scrap roles act on. Scrap / Scrap Item's own
# permissions live in their doctype JSON.
ROLE_PERMISSIONS = {
	"Scrap Creator": {"Stock Entry": READ},
	"Scrap Approver": {"Stock Entry": READ},
	"Scrap Quotations Creator": {"Quotation": ENTRY},
	"Quotation Approver": {"Quotation": ("read", "write", "submit", "print", "email", "report")},
	# The Sales Order screen submits the approved Quotation first if it is still a draft.
	"Scrap Sale Order Creator": {
		"Sales Order": SUBMIT_ENTRY,
		"Quotation": ("read", "write", "submit", "print", "report"),
	},
	"Scrap Delivery Note": {
		"Delivery Note": SUBMIT_ENTRY,
		"Sales Order": READ,
	},
	"Scrap Sales invoice": {
		"Sales Invoice": SUBMIT_ENTRY,
		"Delivery Note": READ,
		"Sales Order": READ,
		"Account": READ,
		"Sales Taxes and Charges Template": READ,
		"Payment Terms Template": READ,
	},
	"Scrap Payment Entry": {
		"Payment Entry": SUBMIT_ENTRY,
		"Sales Invoice": READ,
		"Account": READ,
		"Mode of Payment": READ,
		"Bank Account": READ,
	},
}


def ensure_workflow_masters():
	"""Create the Workflow State / Workflow Action Master records used by
	fixtures/workflow.json if they're missing. Idempotent; runs before install
	and before every migrate (i.e. before fixtures are synced)."""
	for state in WORKFLOW_STATES:
		if not frappe.db.exists("Workflow State", state):
			frappe.get_doc({"doctype": "Workflow State", "workflow_state_name": state}).insert(ignore_permissions=True)
	for action in WORKFLOW_ACTIONS:
		if not frappe.db.exists("Workflow Action Master", action):
			frappe.get_doc({"doctype": "Workflow Action Master", "workflow_action_name": action}).insert(
				ignore_permissions=True
			)


def setup_role_permissions():
	"""Grant each Scrap role the permissions on standard doctypes it needs.
	Runs after install and after every migrate (after fixtures have created the
	roles), so a fresh site pulling this app ends up with the same access.
	Only ever grants — never revokes rights added by hand in Role Permission Manager."""
	plan = {}
	for role in SCRAP_ROLES:
		for doctype in COMMON_READ_DOCTYPES:
			plan.setdefault(doctype, {}).setdefault(role, set()).update(READ)
	for role, doctypes in ROLE_PERMISSIONS.items():
		for doctype, ptypes in doctypes.items():
			plan.setdefault(doctype, {}).setdefault(role, set()).update(ptypes)

	for doctype, roles in plan.items():
		if not frappe.db.exists("DocType", doctype):
			continue
		for role, ptypes in roles.items():
			if not frappe.db.exists("Role", role):
				continue
			_grant(doctype, role, ptypes)
		frappe.clear_cache(doctype=doctype)


def _grant(doctype, role, ptypes):
	filters = {"parent": doctype, "role": role, "permlevel": 0, "if_owner": 0}
	if not frappe.db.exists("Custom DocPerm", filters):
		# add_permission first copies the doctype's standard perms into Custom DocPerm,
		# so existing roles keep their access.
		add_permission(doctype, role, 0, "read")
	current = frappe.db.get_value("Custom DocPerm", filters, list(ptypes), as_dict=True) or {}
	for ptype in ptypes:
		if not current.get(ptype):
			update_permission_property(doctype, role, 0, ptype, 1, validate=False)
