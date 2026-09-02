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

	function apply_theme_class() {
		var route = (frappe.get_route() || []).join("/").toLowerCase();
		var is_scrap_route = SCRAP_ROUTES.some(function (r) {
			return route === r || route.indexOf(r + "/") === 0;
		});
		document.body.classList.toggle("scrap-mgmt-theme", is_scrap_route);
	}

	frappe.router.on("change", apply_theme_class);
	$(document).on("app_ready", apply_theme_class);
	apply_theme_class();
})();
