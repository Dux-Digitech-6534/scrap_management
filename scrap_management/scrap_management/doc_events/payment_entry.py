import frappe

from scrap_management.scrap_management.utils import get_scrap_for_reference, recalculate_scrap


def _linked_scrap(doc):
	if doc.get("custom_scrap"):
		return doc.custom_scrap
	for ref in doc.get("references") or []:
		if ref.reference_doctype == "Sales Invoice":
			scrap_name = get_scrap_for_reference("Sales Invoice", ref.reference_name)
			if scrap_name:
				return scrap_name
	return None


def validate(doc, method=None):
	scrap_name = _linked_scrap(doc)
	if scrap_name and not doc.get("custom_scrap"):
		doc.custom_scrap = scrap_name


def on_submit(doc, method=None):
	scrap_name = _linked_scrap(doc)
	if scrap_name:
		recalculate_scrap(scrap_name)


def on_cancel(doc, method=None):
	scrap_name = _linked_scrap(doc)
	if scrap_name:
		recalculate_scrap(scrap_name)
