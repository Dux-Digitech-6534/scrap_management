import frappe

WORKFLOW_STATES = ("Draft", "Pending Approval", "Approved", "Rejected", "Returned for Correction")
WORKFLOW_ACTIONS = ("Send For Approval", "Approve", "Reject", "Return for Correction")


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
