// Tags <body> with `scrap-mgmt-theme` only while the user is actually on a
// Scrap Management screen, so scrap_management.css never bleeds into any
// other module's pages on this shared Desk.
(function () {
	var SCRAP_ROUTES = [
		"scrap",
		"scrap-management",
		"query-report/scrap stock",
		"query-report/scrap quotations",
		"query-report/scrap sales order",
		"query-report/scrap closure",
		"query-report/scrap report",
	];

	var FORM_DOCTYPES = ["scrap", "quotation", "sales order", "delivery note", "sales invoice", "payment entry"];

	function apply_theme_class() {
		var route_parts = frappe.get_route() || [];
		var route = route_parts.join("/").toLowerCase();
		var is_scrap_route = SCRAP_ROUTES.some(function (r) {
			return route === r || route.indexOf(r + "/") === 0;
		});
		document.body.classList.toggle("scrap-mgmt-theme", is_scrap_route);

		// Leaving a document form entirely (or opening a Form of some unrelated
		// doctype) always clears the per-document reskin; the doctype's own
		// refresh handler re-applies it if the newly opened record is in scope.
		var is_relevant_form = route_parts[0] === "Form" && FORM_DOCTYPES.indexOf(String(route_parts[1] || "").toLowerCase()) !== -1;
		if (!is_relevant_form) document.body.classList.remove("sm-form-theme");
	}

	frappe.router.on("change", apply_theme_class);
	$(document).on("app_ready", apply_theme_class);
	apply_theme_class();
})();

// Document-level form reskin: numbered card sections + clean read-only field
// display, applied ONLY when the open document is actually linked to a Scrap
// (custom_scrap is set) — never by doctype/route alone. A normal Quotation,
// Sales Order, Delivery Note, Sales Invoice or Payment Entry used by any other
// team for any other purpose is completely unaffected.
window.sm_apply_form_theme = function (frm, force) {
	var in_scope = force || !!(frm.doc && frm.doc.custom_scrap);
	document.body.classList.toggle("sm-form-theme", in_scope);
	if (!in_scope) return;
	frm.$wrapper.find(".form-section .section-head").each(function (i) {
		$(this).attr("data-sm-index", String(i + 1).padStart(2, "0"));
	});
};

["Quotation", "Sales Order", "Delivery Note", "Sales Invoice", "Payment Entry"].forEach(function (doctype) {
	frappe.ui.form.on(doctype, {
		refresh: function (frm) {
			window.sm_apply_form_theme(frm);
		},
	});
});
