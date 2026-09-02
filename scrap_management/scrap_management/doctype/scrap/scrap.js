// Copyright (c) 2026, Dux Digitech and contributors
// For license information, please see license.txt

frappe.ui.form.on("Scrap", {
	refresh(frm) {
		frm.set_df_property("lifecycle_html", "hidden", 1);
		if (window.sm_apply_form_theme) window.sm_apply_form_theme(frm, true);
		render_quotation_comparison(frm);
		render_payment_entries(frm);
		set_custom_buttons(frm);
	},
});

function render_quotation_comparison(frm) {
	if (frm.is_new()) {
		frm.set_df_property("quotation_comparison_html", "options", "<p class='text-muted'>Save the Scrap first to manage Quotations.</p>");
		return;
	}
	frappe.call({
		method: "scrap_management.scrap_management.doctype.scrap.scrap.get_quotation_comparison",
		args: { scrap_name: frm.doc.name },
		callback(r) {
			const rows = r.message || [];
			if (!rows.length) {
				frm.set_df_property(
					"quotation_comparison_html",
					"options",
					"<p class='text-muted'>No Quotation created yet.</p>"
				);
				return;
			}
			const table = `
				<table class="table table-bordered" style="font-size:12px;">
					<thead><tr>
						<th>Quotation</th><th>Customer / Buyer</th><th>Items</th>
						<th>Total Value</th><th>Date</th><th>Attachment</th><th>Workflow Status</th>
						<th>Approval Status</th><th>Selected</th>
					</tr></thead>
					<tbody>
					${rows
						.map(
							(row) => `<tr>
						<td><a href="/app/quotation/${row.name}">${row.name}</a></td>
						<td>${frappe.utils.escape_html(row.customer || "")}</td>
						<td>${row.item_count || ""}</td>
						<td style="font-family:var(--sm-font-mono,inherit);${row.is_highest_total ? "font-weight:700;color:var(--sm-ok,#15916a);" : ""}">${format_currency(row.total)}</td>
						<td>${frappe.datetime.str_to_user(row.quotation_date) || ""}</td>
						<td>${row.has_attachment ? "&#128206;" : "&mdash;"}</td>
						<td>${frappe.utils.escape_html(row.docstatus === 1 ? "Submitted" : "Draft")}</td>
						<td><span class="indicator-pill ${approval_color(row.approval_status)}">${row.approval_status || "Draft"}</span></td>
						<td>${row.selected ? "&#9989; Yes" : "No"}</td>
					</tr>`
						)
						.join("")}
					</tbody>
				</table>`;
			frm.set_df_property("quotation_comparison_html", "options", table);
		},
	});
}

function approval_color(status) {
	return { Approved: "green", Rejected: "red", "Pending Approval": "orange" }[status] || "gray";
}

function format_currency(v) {
	return v ? format_number(v, null, 2) : "";
}

function render_payment_entries(frm) {
	if (!frm.doc.sales_invoice) {
		frm.set_df_property("payment_entries_html", "options", "");
		return;
	}
	frappe.db
		.get_list("Payment Entry Reference", {
			filters: { reference_doctype: "Sales Invoice", reference_name: frm.doc.sales_invoice },
			fields: ["parent", "allocated_amount"],
			parent_doctype: "Payment Entry",
		})
		.then((rows) => {
			if (!rows.length) {
				frm.set_df_property("payment_entries_html", "options", "<p class='text-muted'>No Payment Entry recorded yet.</p>");
				return;
			}
			const html = `<table class="table table-bordered" style="font-size:12px;">
				<thead><tr><th>Payment Entry</th><th>Allocated Amount</th></tr></thead>
				<tbody>${rows
					.map((r) => `<tr><td><a href="/app/payment-entry/${r.parent}">${r.parent}</a></td><td>${format_currency(r.allocated_amount)}</td></tr>`)
					.join("")}</tbody></table>`;
			frm.set_df_property("payment_entries_html", "options", html);
		});
}

function set_custom_buttons(frm) {
	if (frm.is_new()) return;

	if (frm.doc.status === "Available for Sale" || frm.doc.status === "Quotation in Process") {
		frm.add_custom_button(
			__("Quotation"),
			() => {
				frappe.new_doc("Quotation", {
					quotation_to: "Customer",
					custom_scraps: [{ scrap: frm.doc.name }],
					items: (frm.doc.items || []).map((row) => ({ item_code: row.item, qty: row.qty, uom: row.uom, custom_scrap: frm.doc.name })),
				});
			},
			__("Create")
		);
	}

	if (frm.doc.selected_quotation && !frm.doc.sales_order && (frm.doc.items || []).some((r) => flt(r.available_qty) > 0)) {
		frm.add_custom_button(
			__("Sales Order"),
			() => {
				frappe.call({
					method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_order",
					args: { scrap_name: frm.doc.name },
					callback(r) {
						if (r.message) frappe.model.sync(r.message), frappe.set_route("Form", "Sales Order", r.message.name);
					},
				});
			},
			__("Create")
		);
	}

	if (frm.doc.sales_order && !frm.doc.delivery_note) {
		frm.add_custom_button(
			__("Delivery Note"),
			() => {
				frappe.call({
					method: "scrap_management.scrap_management.doctype.scrap.scrap.make_delivery_note",
					args: { sales_order_name: frm.doc.sales_order },
					callback(r) {
						if (r.message) frappe.model.sync(r.message), frappe.set_route("Form", "Delivery Note", r.message.name);
					},
				});
			},
			__("Create")
		);
	}

	if (frm.doc.delivery_note && !frm.doc.sales_invoice) {
		frm.add_custom_button(
			__("Sales Invoice"),
			() => {
				frappe.call({
					method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_invoice",
					args: { delivery_note_name: frm.doc.delivery_note },
					callback(r) {
						if (r.message) frappe.model.sync(r.message), frappe.set_route("Form", "Sales Invoice", r.message.name);
					},
				});
			},
			__("Create")
		);
	}

	["stock_entry", "sales_order", "delivery_note", "sales_invoice", "selected_quotation"].forEach((f) => {
		if (frm.doc[f]) {
			frm.get_field(f) && frm.get_field(f).$wrapper.find("a").attr("target", "_blank");
		}
	});
}
