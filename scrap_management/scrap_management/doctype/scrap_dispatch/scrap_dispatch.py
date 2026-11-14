# Copyright (c) 2026, Dux Digitech and contributors
# For license information, please see license.txt

import frappe
from frappe import _
from frappe.model.document import Document
from frappe.utils import flt, now_datetime

from scrap_management.scrap_management.utils import (
	get_dispatched_qty_by_item,
	is_scrap_received,
	recalculate_scrap,
)


class ScrapDispatch(Document):
	"""Scrap leaving the campus. Replaces ERPNext's Delivery Note for scrap so that
	scrap stock is tracked only inside Scrap Management and never posts to ERPNext's
	Stock Ledger — works the same for stock and non-stock (e.g. fixed asset) items."""

	def validate(self):
		scrap = frappe.get_doc("Scrap", self.scrap)
		if not is_scrap_received(scrap):
			frappe.throw(_("Scrap {0} must be Approved before it can be dispatched.").format(self.scrap))

		self.company = scrap.company
		self.scrap_warehouse = scrap.scrap_warehouse
		self._validate_sales_order(scrap)
		self._validate_items(scrap)
		self._validate_handover()

	def before_update_after_submit(self):
		self._validate_handover()

	def on_submit(self):
		self._sync_to_scrap()
		recalculate_scrap(self.scrap)

	def on_update_after_submit(self):
		if frappe.db.get_value("Scrap", self.scrap, "scrap_dispatch") == self.name:
			self._sync_to_scrap()

	def on_cancel(self):
		billed = frappe.db.get_value("Sales Invoice", {"custom_scrap_dispatch": self.name, "docstatus": 1}, "name")
		if billed:
			frappe.throw(_("Cancel Sales Invoice {0} before cancelling this Scrap Dispatch.").format(billed))

		if frappe.db.get_value("Scrap", self.scrap, "scrap_dispatch") == self.name:
			previous = frappe.get_all(
				"Scrap Dispatch",
				filters={"scrap": self.scrap, "docstatus": 1, "name": ["!=", self.name]},
				order_by="posting_date desc, creation desc",
				limit=1,
				pluck="name",
			)
			if previous:
				frappe.get_doc("Scrap Dispatch", previous[0])._sync_to_scrap()
			else:
				frappe.db.set_value(
					"Scrap",
					self.scrap,
					{
						"scrap_dispatch": None,
						"gate_pass_no": None,
						"vehicle_number": None,
						"driver_name": None,
						"handover_confirmed": 0,
						"security_exit_confirmed": 0,
						"status": "Sales Order Created",
					},
					update_modified=False,
				)
		frappe.get_doc("Scrap", self.scrap).add_comment(
			"Info", frappe.bold(f"Scrap Dispatch {self.name} was cancelled — its quantity is back in Scrap stock.")
		)
		recalculate_scrap(self.scrap)

	def _validate_sales_order(self, scrap):
		if not self.sales_order:
			frappe.throw(_("Sales Order is required for a Scrap Dispatch."))
		so = frappe.db.get_value("Sales Order", self.sales_order, ["custom_scrap", "docstatus", "customer"], as_dict=True)
		if not so:
			frappe.throw(_("Sales Order {0} does not exist.").format(self.sales_order))
		if so.custom_scrap != self.scrap:
			frappe.throw(_("Sales Order {0} does not belong to Scrap {1}.").format(self.sales_order, self.scrap))
		if so.docstatus != 1:
			frappe.throw(_("Sales Order {0} must be submitted before dispatch.").format(self.sales_order))
		self.customer = self.customer or so.customer

	def _validate_items(self, scrap):
		if not self.items:
			frappe.throw(_("Add at least one item to dispatch."))

		received = {}
		uom_by_item = {}
		for row in scrap.items:
			received[row.item] = flt(received.get(row.item)) + flt(row.qty)
			uom_by_item.setdefault(row.item, row.uom)

		already = get_dispatched_qty_by_item(self.scrap, exclude_dispatch=self.name)
		this_dispatch = {}
		for row in self.items:
			if row.item not in received:
				frappe.throw(_("Row {0}: Item {1} is not part of Scrap {2}.").format(row.idx, row.item, self.scrap))
			if flt(row.qty) <= 0:
				frappe.throw(_("Row {0}: Quantity must be greater than zero.").format(row.idx))
			row.uom = row.uom or uom_by_item.get(row.item)
			this_dispatch[row.item] = flt(this_dispatch.get(row.item)) + flt(row.qty)

		for item, qty in this_dispatch.items():
			available = flt(received[item]) - flt(already.get(item))
			if qty > available:
				frappe.throw(
					_("Dispatch quantity {0} for {1} exceeds available Scrap stock {2} on {3}.").format(
						qty, frappe.bold(item), available, self.scrap
					)
				)

	def _validate_handover(self):
		if self.security_exit_confirmed and not self.handover_confirmed:
			frappe.throw(_("Security Exit cannot be confirmed before Handover is confirmed."))
		if self.handover_confirmed and not self.handover_datetime:
			self.handover_datetime = now_datetime()
		if self.security_exit_confirmed and not self.security_exit_datetime:
			self.security_exit_datetime = now_datetime()

	def _sync_to_scrap(self):
		frappe.db.set_value(
			"Scrap",
			self.scrap,
			{
				"scrap_dispatch": self.name,
				"gate_pass_no": self.gate_pass_attachment,
				"vehicle_number": self.vehicle_number,
				"driver_name": self.driver_name,
				"handover_confirmed": self.handover_confirmed or 0,
				"security_exit_confirmed": self.security_exit_confirmed or 0,
			},
			update_modified=False,
		)
