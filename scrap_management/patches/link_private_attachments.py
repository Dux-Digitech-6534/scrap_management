import frappe

from scrap_management.scrap_management.utils import link_attachments


def execute():
	"""Attach the private files already saved on Scrap-flow documents to those
	documents (see utils.link_attachments) so users other than the uploader can open them."""
	names_by_doctype = {
		"Scrap": frappe.get_all("Scrap", pluck="name"),
		"Quotation": list(set(frappe.get_all("Scrap Reference", filters={"parenttype": "Quotation"}, pluck="parent"))),
		"Sales Order": frappe.get_all("Sales Order", filters={"custom_scrap": ["is", "set"]}, pluck="name"),
		"Delivery Note": frappe.get_all("Delivery Note", filters={"custom_scrap": ["is", "set"]}, pluck="name"),
	}
	for doctype, names in names_by_doctype.items():
		for name in names:
			if frappe.db.exists(doctype, name):
				link_attachments(frappe.get_doc(doctype, name))
