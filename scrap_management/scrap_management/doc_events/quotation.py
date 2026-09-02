import frappe
from frappe import _
from frappe.utils import flt, now_datetime

from scrap_management.scrap_management.utils import recalculate_scrap

ELIGIBLE_STATES = (
	"Available for Sale",
	"Quotation in Process",
	"Quotation Approved",
	"Sales Order Created",
)


def _scrap_amount(doc, scrap_name):
	"""Sum(qty * rate) of only the item rows tagged to this particular Scrap — a
	Quotation can bundle items from several Scraps, so the whole document's
	grand_total is not this Scrap's own quoted value."""
	return sum(flt(row.qty) * flt(row.rate) for row in doc.items if row.get("custom_scrap") == scrap_name)


def validate(doc, method=None):
	if not doc.get("custom_scraps"):
		return

	scrap_names = [row.scrap for row in doc.custom_scraps]
	scraps = frappe.get_all("Scrap", filters={"name": ["in", scrap_names]}, fields=["name", "status", "company"])
	scrap_by_name = {s.name: s for s in scraps}

	for name in scrap_names:
		if name not in scrap_by_name:
			frappe.throw(_("Linked Scrap {0} does not exist.").format(name))

	companies = {s.company for s in scraps if s.company}
	if len(companies) > 1:
		frappe.throw(_("All Scraps linked to one Quotation must belong to the same Company."))

	if doc.is_new() and companies:
		# A Quotation defaults to the user's session Company, which can differ from the
		# Scraps' own Company — left uncorrected this drags a mismatched warehouse all
		# the way through Sales Order -> Delivery Note and fails with a cross-company error.
		doc.company = companies.pop()

	if doc.is_new():
		for name in scrap_names:
			if scrap_by_name[name].status not in ELIGIBLE_STATES:
				frappe.throw(_("Quotation can only be created once linked Scrap {0} is Approved and Available for Sale.").format(name))

	for row in doc.items:
		if row.get("custom_scrap") and row.custom_scrap not in scrap_names:
			frappe.throw(_("Item row {0} is tagged to Scrap {1}, which isn't in this Quotation's Linked Scraps.").format(row.idx, row.custom_scrap))

	if doc.get("custom_approval_status") == "Approved":
		for name in scrap_names:
			total_available = flt(
				frappe.db.sql("select sum(available_qty) from `tabScrap Item` where parent=%s", name)[0][0] or 0
			)
			if total_available <= 0:
				frappe.throw(_("Cannot approve this Quotation — no available Scrap stock remains against {0}.").format(name))


def on_update(doc, method=None):
	if not doc.get("custom_scraps"):
		return

	previous = doc.get_doc_before_save()
	previous_status = previous.custom_approval_status if previous else None
	scrap_names = [row.scrap for row in doc.custom_scraps]

	if doc.custom_approval_status == "Approved" and previous_status != "Approved":
		frappe.db.set_value(
			"Quotation", doc.name, {"custom_approved_by": frappe.session.user, "custom_approval_date": now_datetime()}
		)
		for row in doc.custom_scraps:
			# Only one Quotation may be the selected/approved one for a given Scrap.
			frappe.db.set_value("Scrap Reference", {"scrap": row.scrap, "parent": ["!=", doc.name]}, "selected", 0)
			frappe.db.set_value("Scrap Reference", row.name, "selected", 1)

			scrap = frappe.get_doc("Scrap", row.scrap)
			scrap.db_set(
				{
					"selected_quotation": doc.name,
					"selected_customer": doc.party_name,
					"approved_sale_value": _scrap_amount(doc, row.scrap),
					"status": "Quotation Approved",
				},
				update_modified=False,
			)
			scrap.add_comment("Info", frappe.bold(f"Quotation {doc.name} approved — {doc.party_name} selected as buyer."))
			_reject_competing_quotations(row.scrap, doc.name)

	elif previous_status == "Approved" and doc.custom_approval_status != "Approved":
		# Approval was reversed (e.g. corrected back to Draft) — undo the selection.
		for row in doc.custom_scraps:
			_unselect_if_current(row.scrap, doc.name)
			frappe.db.set_value("Scrap Reference", row.name, "selected", 0)

	elif doc.is_new() is False and previous_status != doc.custom_approval_status:
		# Any other transition (e.g. into Pending Approval) just nudges Scrap forward for visibility.
		for name in scrap_names:
			scrap = frappe.get_doc("Scrap", name)
			if scrap.status == "Available for Sale":
				scrap.db_set("status", "Quotation in Process", update_modified=False)

	for name in scrap_names:
		recalculate_scrap(name)


def on_cancel(doc, method=None):
	if not doc.get("custom_scraps"):
		return
	for row in doc.custom_scraps:
		_unselect_if_current(row.scrap, doc.name)
		recalculate_scrap(row.scrap)


def _unselect_if_current(scrap_name, quotation_name):
	"""If `quotation_name` is the Scrap's selected/approved quotation, clear the
	selection and drop the Scrap back to Available for Sale (or Sales Order Created
	stays untouched — a Sales Order already exists by then and this path won't be hit
	for that quotation since Sales Order can't be created without an approved one,
	and cancelling the quotation after that point is an unusual out-of-order action
	best surfaced via recalculate_scrap rather than silently rewritten here)."""
	scrap = frappe.get_doc("Scrap", scrap_name)
	if scrap.selected_quotation != quotation_name:
		return
	scrap.db_set(
		{
			"selected_quotation": None,
			"selected_customer": None,
			"approved_sale_value": 0,
			"status": "Available for Sale",
		},
		update_modified=False,
	)
	scrap.add_comment("Info", frappe.bold(f"Quotation {quotation_name} was cancelled/un-approved — selection cleared."))


def _reject_competing_quotations(scrap_name, approved_quotation_name):
	"""Once a Quotation is approved for a Scrap, any other Quotation still competing
	for that same Scrap is no longer relevant — auto-reject it rather than leaving it
	to linger in Draft/Pending Approval. A competing Quotation that also bundles a
	different, still-open Scrap is left alone, since rejecting it would incorrectly
	kill that unrelated Scrap's own quotation too."""
	competing_names = set(
		frappe.get_all(
			"Scrap Reference",
			filters={"scrap": scrap_name, "parent": ["!=", approved_quotation_name], "parenttype": "Quotation"},
			pluck="parent",
		)
	)
	for qname in competing_names:
		q = frappe.db.get_value("Quotation", qname, ["custom_approval_status", "docstatus"], as_dict=True)
		if not q or q.docstatus == 2 or q.custom_approval_status in ("Approved", "Rejected"):
			continue
		linked_scraps = set(frappe.get_all("Scrap Reference", filters={"parent": qname, "parenttype": "Quotation"}, pluck="scrap"))
		if len(linked_scraps) > 1:
			continue
		frappe.db.set_value("Quotation", qname, "custom_approval_status", "Rejected")
		frappe.get_doc("Quotation", qname).add_comment(
			"Info", frappe.bold(f"Auto-rejected — {approved_quotation_name} was approved for Scrap {scrap_name} instead.")
		)
