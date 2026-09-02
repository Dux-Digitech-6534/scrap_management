frappe.pages["scrap-management-ui"].on_page_load = function (wrapper) {
	new ScrapManagementUI(wrapper);
};

// DUX thin-stroke icon set (24x24, 1.7 stroke, round caps, currentColor)
const SM_ICON_PATHS = {
	layers: '<path d="m12 3 9 5-9 5-9-5z"/><path d="m3 13 9 5 9-5"/>',
	box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="M3 8l9 5 9-5M12 13v8"/>',
	building: '<path d="M5 21V5a1 1 0 0 1 1-1h8a1 1 0 0 1 1 1v16"/><path d="M15 9h3a1 1 0 0 1 1 1v11"/><path d="M9 8h2M9 12h2M9 16h2"/><path d="M3 21h18"/>',
	copy: '<rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h8"/>',
	truck: '<path d="M3 7h11v8H3z"/><path d="M14 9h4l3 3v3h-7"/><circle cx="7" cy="17" r="1.6"/><circle cx="17" cy="17" r="1.6"/>',
	check: '<path d="M4 12.5 9 17.5 20 6.5"/>',
	rupee: '<path d="M7 5h10M7 9h10M16 5c0 4-3.5 5-6.5 5L16 19"/><path d="M7 9h3"/>',
	clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
	search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
	inbox: '<path d="M3 12h5l2 3h4l2-3h5"/><path d="M5 4h14l2 8v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-6z"/>',
	note: '<path d="M8 3h8l4 4v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M9 8h6M9 12h6M9 16h4"/>',
};
function sm_icon(name, size) {
	size = size || 18;
	return `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" style="display:block;flex:0 0 auto;">${SM_ICON_PATHS[name] || SM_ICON_PATHS.box}</svg>`;
}

const SM_STYLE = `
<style>
#sm2-root { font-family: 'Geist','Geist Variable',system-ui,sans-serif; }
#sm2-root, #sm2-root * { box-sizing: border-box; }
#sm2-root {
	--p-iris:#5c4de6; --p-iris2:#4a3cd0; --p-cyan:#0e9c8b;
	--p-bg:#f3f4f7; --p-card:#fff; --p-line:#e7e9ee; --p-line2:#dcdfe6;
	--p-fg1:#1a2030; --p-fg2:#586273; --p-fg3:#8a93a3;
	--p-ok:#15916a; --p-okbg:rgba(21,145,106,.1);
	--p-pending:#b0741a; --p-pendingbg:rgba(176,116,26,.11);
	--p-err:#c8475e; --p-errbg:rgba(200,71,94,.09);
	--p-mono:'JetBrains Mono',ui-monospace,monospace;
	background: var(--p-bg); min-height: calc(100vh - 120px); margin: -15px -15px -15px -15px; padding: 0;
	display: grid; grid-template-columns: 220px 1fr;
}
#sm2-root .sm2-sidebar { background: var(--p-card); border-right: 1px solid var(--p-line); padding: 16px 10px; }
#sm2-root .sm2-nav-label { padding: 16px 10px 6px; color: var(--p-fg3); font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .1em; }
#sm2-root .sm2-nav-btn { width: 100%; border: 0; background: transparent; color: var(--p-fg2); font: 600 13px inherit; text-align: left; padding: 9px 12px; border-radius: 10px; margin: 2px 0; cursor: pointer; display: flex; align-items: center; gap: 9px; }
#sm2-root .sm2-nav-btn svg { color: var(--p-fg3); flex-shrink: 0; }
#sm2-root .sm2-nav-btn:hover svg, #sm2-root .sm2-nav-btn.active svg { color: var(--p-iris); }
#sm2-root .sm2-nav-btn:hover { background: rgba(92,77,230,.07); color: var(--p-iris); }
#sm2-root .sm2-nav-btn.active { background: rgba(92,77,230,.1); color: var(--p-iris); }
#sm2-root .sm2-content { padding: 22px 26px; overflow-x: auto; }
#sm2-root .sm2-page { display: none; }
#sm2-root .sm2-page.active { display: block; }
#sm2-root h1.sm2-title { font-size: 24px; margin: 0 0 4px; font-weight: 700; letter-spacing: -.02em; color: var(--p-fg1); }
#sm2-root p.sm2-sub { color: var(--p-fg2); margin: 0 0 18px; max-width: 760px; line-height: 1.5; }
#sm2-root .sm2-hero { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; }
#sm2-root .sm2-grid4 { display: grid; grid-template-columns: repeat(4,1fr); gap: 14px; margin-bottom: 18px; }
#sm2-root .sm2-card { background: var(--p-card); border: 1px solid var(--p-line); border-radius: 16px; box-shadow: 0 6px 26px rgba(22,28,46,.06); }
#sm2-root .sm2-kpi { padding: 18px; }
#sm2-root .sm2-kpi-icon { width: 34px; height: 34px; border-radius: 10px; display: flex; align-items: center; justify-content: center; background: rgba(14,156,139,.1); color: var(--p-cyan); margin-bottom: 12px; }
#sm2-root .sm2-kpi small { font-size: 10px; text-transform: uppercase; letter-spacing: .07em; color: var(--p-fg3); }
#sm2-root .sm2-kpi strong { display: block; font: 700 26px var(--p-mono); color: var(--p-fg1); margin: 8px 0 2px; }
#sm2-root .sm2-kpi span { font-size: 11px; color: var(--p-fg3); }
#sm2-root .sm2-greeting { font-size: 22px; font-weight: 700; letter-spacing: -.01em; margin: 0 0 2px; color: var(--p-fg1); }
#sm2-root .sm2-greeting .accent { color: var(--p-iris); }
#sm2-root .sm2-dashboard-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
#sm2-root .sm2-pill .dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; display: inline-block; margin-right: 5px; }
#sm2-root .sm2-approval-row { display: flex; align-items: center; justify-content: space-between; padding: 10px 18px; border-bottom: 1px solid var(--p-line); font-size: 12.5px; }
#sm2-root .sm2-approval-row:last-child { border-bottom: 0; }
#sm2-root .sm2-empty-approvals { padding: 40px 20px; text-align: center; color: var(--p-fg3); }
#sm2-root .sm2-empty-approvals svg { margin: 0 auto 10px; opacity: .5; }
@media (max-width: 1100px) { #sm2-root .sm2-dashboard-grid { grid-template-columns: 1fr; } }
#sm2-root .sm2-section { margin-top: 16px; }
#sm2-root .sm2-head { padding: 14px 18px; border-bottom: 1px solid var(--p-line); display: flex; align-items: center; justify-content: space-between; gap: 10px; }
#sm2-root .sm2-head h3 { margin: 0; font-size: 14px; color: var(--p-fg1); }
#sm2-root .sm2-toolbar { display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
#sm2-root .sm2-input, #sm2-root .sm2-select { background: var(--p-card); color: var(--p-fg1); border: 1px solid var(--p-line2); border-radius: 10px; padding: 8px 11px; font-size: 12.5px; outline: 0; }
#sm2-root .sm2-tablewrap { overflow: auto; }
#sm2-root table.sm2-table { width: 100%; min-width: 900px; border-collapse: collapse; }
#sm2-root table.sm2-table th { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--p-fg3); text-align: left; padding: 9px 14px; border-bottom: 1px solid var(--p-line); background: #fafafc; white-space: nowrap; }
#sm2-root table.sm2-table td { font-size: 12.5px; color: var(--p-fg2); padding: 11px 14px; border-bottom: 1px solid var(--p-line); white-space: nowrap; }
#sm2-root table.sm2-table tr:hover td { background: rgba(92,77,230,.03); }
#sm2-root .sm2-item-grid-row { display: flex; align-items: center; }
#sm2-root .sm2-item-grid-head { font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--p-fg3); background: #fafafc; padding: 9px 14px 9px 0; border-bottom: 1px solid var(--p-line); }
#sm2-root .sm2-item-grid-row:not(.sm2-item-grid-head) { padding: 8px 14px 8px 0; border-bottom: 1px solid var(--p-line); }
#sm2-root .sm2-item-grid-row > div { padding-right: 10px; flex-shrink: 0; }
#sm2-root .sm2-link { border: 0; background: none; color: var(--p-iris); font-weight: 700; cursor: pointer; text-decoration: none; font-family: var(--p-mono); }
#sm2-root .sm2-mono { font-family: var(--p-mono); }
#sm2-root .sm2-pill { display: inline-flex; padding: 4px 10px; border-radius: 999px; font-size: 10.5px; font-weight: 600; white-space: nowrap; }
#sm2-root .sm2-pill.ok { background: var(--p-okbg); color: var(--p-ok); }
#sm2-root .sm2-pill.pending { background: var(--p-pendingbg); color: var(--p-pending); }
#sm2-root .sm2-pill.err { background: var(--p-errbg); color: var(--p-err); }
#sm2-root .sm2-pill.draft { background: #f0f2f5; color: #717b8c; }
#sm2-root .sm2-btn { height: 32px; border: 1px solid var(--p-line2); background: var(--p-card); color: var(--p-fg2); border-radius: 999px; padding: 0 14px; font-weight: 600; font-size: 12px; cursor: pointer; }
#sm2-root .sm2-btn.primary { border: 0; background: linear-gradient(150deg, var(--p-iris), var(--p-iris2)); color: #fff; box-shadow: 0 6px 18px rgba(109,94,246,.35); }
#sm2-root .sm2-btn.danger { border: 1px solid transparent; background: var(--p-errbg); color: var(--p-err); }
#sm2-root .sm2-btn.danger:hover { background: var(--p-err); color: #fff; }
#sm2-root .sm2-empty { padding: 34px; text-align: center; color: var(--p-fg3); font-size: 13px; }
#sm2-root .sm2-notice { border: 1px dashed rgba(92,77,230,.35); background: rgba(92,77,230,.05); border-radius: 12px; padding: 12px 14px; color: var(--p-fg2); font-size: 12px; line-height: 1.55; margin-bottom: 14px; }

/* Full-page document detail (replaces navigating to the real Desk form) */
#sm2-root .sm2-crumb { font-size: 10px; text-transform: uppercase; letter-spacing: .08em; color: var(--p-fg3); margin-bottom: 6px; }
#sm2-root .sm2-crumb a { color: var(--p-iris); cursor: pointer; text-decoration: none; }
#sm2-root .sm2-detail-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 14px; margin-bottom: 16px; }
#sm2-root .sm2-detail-title { font-size: 22px; font-weight: 700; letter-spacing: -.01em; margin: 0 0 6px; color: var(--p-fg1); }
#sm2-root .sm2-detail-grid { display: grid; grid-template-columns: 2fr 1fr; gap: 16px; align-items: start; }
#sm2-root .sm2-card.numbered { position: relative; }
#sm2-root .sm2-num { display: inline-flex; align-items: center; justify-content: center; width: 20px; height: 20px; border-radius: 6px; background: rgba(92,77,230,.1); color: var(--p-iris); font-size: 10px; font-weight: 700; font-family: var(--p-mono); flex-shrink: 0; }
#sm2-root .sm2-field-grid { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; padding: 14px 18px; }
#sm2-root .sm2-field-grid .f small { display: block; font-size: 10px; text-transform: uppercase; letter-spacing: .06em; color: var(--p-fg3); margin-bottom: 3px; }
#sm2-root .sm2-field-grid .f div { font-size: 13px; font-weight: 600; color: var(--p-fg1); }
#sm2-root .sm2-timeline { padding: 4px 18px 14px; max-height: 340px; overflow-y: auto; }
#sm2-root .sm2-timeline-row { display: flex; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--p-line); }
#sm2-root .sm2-timeline-row:last-child { border-bottom: 0; }
#sm2-root .sm2-avatar { width: 26px; height: 26px; border-radius: 50%; background: rgba(92,77,230,.12); color: var(--p-iris); display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 700; flex-shrink: 0; }
#sm2-root .sm2-timeline-row .meta { font-size: 11px; color: var(--p-fg3); margin-bottom: 2px; }
#sm2-root .sm2-timeline-row .content { font-size: 12.5px; color: var(--p-fg2); line-height: 1.5; word-break: break-word; }
#sm2-root .sm2-linked-row { display: flex; align-items: center; justify-content: space-between; padding: 9px 18px; border-bottom: 1px solid var(--p-line); font-size: 12.5px; }
#sm2-root .sm2-linked-row:last-child { border-bottom: 0; }
@media (max-width: 1100px) { #sm2-root .sm2-detail-grid { grid-template-columns: 1fr; } }
@media (max-width: 900px) { #sm2-root { grid-template-columns: 1fr; } #sm2-root .sm2-sidebar { display: none; } #sm2-root .sm2-grid4 { grid-template-columns: 1fr 1fr; } #sm2-root .sm2-field-grid { grid-template-columns: 1fr 1fr; } }
</style>`;

const SM_STATUS_TONE = {
	Draft: "draft",
	"Pending Approval": "pending",
	"Returned for Correction": "pending",
	Rejected: "err",
	Approved: "ok",
	"Available for Sale": "ok",
	"Quotation in Process": "pending",
	"Quotation Approved": "ok",
	"Sales Order Created": "ok",
	Dispatched: "pending",
	Invoiced: "pending",
	"Payment Pending": "pending",
	Closed: "ok",
};

function sm_pill(status) {
	const tone = SM_STATUS_TONE[status] || "draft";
	return `<span class="sm2-pill ${tone}"><span class="dot"></span>${frappe.utils.escape_html(status || "")}</span>`;
}

function sm_money(v) {
	return v || v === 0 ? "₹" + Number(v).toLocaleString("en-IN", { maximumFractionDigits: 2 }) : "";
}

// Opens Frappe's own print view in a new tab — this is a read-only, printable
// render (not the editable Desk form), so it doesn't break the "everything
// stays inside this custom page" rule the same way a Form redirect would.
// Without an explicit format Frappe auto-renders a Standard print showing every
// field on the document.
function sm_print(doctype, name, format) {
	const params = new URLSearchParams({ doctype, name, no_letterhead: "0" });
	if (format) params.set("format", format);
	window.open(`/printview?${params.toString()}`, "_blank");
}

// Dedicated, scoped-down print formats for this app's own doctypes — the
// generic "Print" button on every entity detail page uses these instead of
// Frappe's Standard auto-layout when one exists for that doctype.
const SM_DEFAULT_PRINT_FORMAT = {
	Scrap: "Scrap Print",
	Quotation: "Quotation Print",
	"Sales Order": "Sales Order Print",
};

// Real Activity timeline — built from frappe.desk.form.load.get_docinfo, the same
// data Frappe's own document sidebar uses (workflow transitions, field-change
// versions, comments) — not a fabricated log.
function sm_render_timeline(docinfo) {
	if (!docinfo) return `<div class="sm2-empty">No activity yet.</div>`;
	const entries = [];
	(docinfo.workflow_logs || []).forEach((c) => entries.push({ owner: c.owner, creation: c.creation, label: "Workflow", content: c.content }));
	(docinfo.info_logs || []).forEach((c) => entries.push({ owner: c.owner, creation: c.creation, label: "Activity", content: c.content }));
	(docinfo.comments || []).forEach((c) => entries.push({ owner: c.owner, creation: c.creation, label: "Comment", content: c.content }));
	(docinfo.versions || []).forEach((v) => {
		let data = {};
		try {
			data = JSON.parse(v.data || "{}");
		} catch (e) {
			data = {};
		}
		const changes = (data.changed || []).map((c) => `${c[0]}: ${c[1] ?? "—"} → ${c[2] ?? "—"}`);
		if (changes.length) entries.push({ owner: v.owner, creation: v.creation, label: "Document updated", content: changes.join(", ") });
	});
	entries.sort((a, b) => new Date(b.creation) - new Date(a.creation));
	if (!entries.length) return `<div class="sm2-empty">No activity yet.</div>`;
	return entries
		.slice(0, 15)
		.map((e) => {
			const initials = (e.owner || "?").split("@")[0].slice(0, 2).toUpperCase();
			return `<div class="sm2-timeline-row">
				<div class="sm2-avatar">${initials}</div>
				<div style="flex:1;min-width:0;">
					<div class="meta"><b style="color:var(--p-fg2)">${frappe.utils.escape_html(e.label)}</b> &middot; ${frappe.utils.escape_html(e.owner || "")} &middot; ${comment_when(e.creation)}</div>
					<div class="content">${frappe.utils.escape_html(e.content || "")}</div>
				</div>
			</div>`;
		})
		.join("");
}

function sm_link(doctype, name, label) {
	if (!name) return "—";
	return `<a class="sm2-link" href="/app/${frappe.router.slug(doctype)}/${encodeURIComponent(name)}" target="_blank">${label || name}</a>`;
}

// Scrap references always open the in-page detail dialog instead of navigating
// to the real Desk form — matches every other "everything inside the page" flow.
function sm_scrap_link(name) {
	if (!name) return "—";
	return `<button type="button" class="sm2-link" data-open-scrap="${frappe.utils.escape_html(name)}" style="border:0;background:none;cursor:pointer;padding:0;">${name}</button>`;
}

// Same idea for every other doctype in the Scrap chain — Quotation, Sales
// Order, Delivery Note, Sales Invoice, Stock Entry, Payment Entry all open an
// in-page detail dialog instead of the real Desk form.
const SM_ENTITY_CONFIG = {
	Quotation: {
		fields: [
			["Buyer", "party_name"],
			["Date", "transaction_date"],
			["Valid Till", "valid_till"],
			["Grand Total", "grand_total", "Currency"],
			["Approval Status", "custom_approval_status", "Status"],
		],
		items: "items",
		itemFields: [
			["Item", "item_code"],
			["Scrap", "custom_scrap"],
			["Qty", "qty"],
			["Quotation Rate", "rate", "Currency"],
			["Quotation Amount", "amount", "Currency"],
			["Quotation Attachment", "custom_attachment", "Attach"],
		],
	},
	"Sales Order": {
		fields: [
			["Confirmed Buyer", "customer"],
			["Order Date", "transaction_date"],
			["Final Sale Value", "grand_total", "Currency"],
			["Quantity Being Disposed", "total_qty"],
			["Status", "status", "Status"],
			["Delivered %", "per_delivered"],
			["Billed %", "per_billed"],
		],
		items: "items",
		itemFields: [["Item", "item_code"], ["Qty", "qty"], ["Rate", "rate", "Currency"], ["Warehouse", "warehouse"], ["Attachment", "custom_attachment", "Attach"]],
	},
	"Delivery Note": {
		fields: [
			["Customer", "customer"],
			["Posting Date", "posting_date"],
			["Upload Gate Pass", "custom_gate_pass_no", "Attach"],
			["Vehicle Number", "custom_vehicle_number"],
			["Driver Name", "custom_driver_name"],
			["Handover Confirmed", "custom_handover_confirmed", "Check"],
			["Security Exit Confirmed", "custom_security_exit_confirmed", "Check"],
		],
		items: "items",
		itemFields: [["Item", "item_code"], ["Qty", "qty"], ["Warehouse", "warehouse"]],
	},
	"Sales Invoice": {
		fields: [
			["Customer", "customer"],
			["Posting Date", "posting_date"],
			["Grand Total", "grand_total", "Currency"],
			["Outstanding Amount", "outstanding_amount", "Currency"],
			["Status", "status", "Status"],
		],
		items: "items",
		itemFields: [["Item", "item_code"], ["Qty", "qty"], ["Rate", "rate", "Currency"], ["Amount", "amount", "Currency"]],
	},
	"Stock Entry": {
		fields: [
			["Type", "stock_entry_type"],
			["Posting Date", "posting_date"],
			["Linked Scrap", "custom_scrap"],
		],
		items: "items",
		itemFields: [["Item", "item_code"], ["Qty", "qty"], ["Target Warehouse", "t_warehouse"]],
	},
	"Payment Entry": {
		fields: [
			["Party", "party"],
			["Paid Amount", "paid_amount", "Currency"],
			["Mode of Payment", "mode_of_payment"],
			["Reference No", "reference_no"],
			["Reference Date", "reference_date"],
		],
	},
};

function sm_entity_link(doctype, name) {
	if (!name) return "—";
	return `<button type="button" class="sm2-link" data-open-entity="${frappe.utils.escape_html(doctype)}|${frappe.utils.escape_html(name)}" style="border:0;background:none;cursor:pointer;padding:0;">${name}</button>`;
}

// Route any Link column pointing at one of our in-scope doctypes through the
// in-page dialog; anything else (Customer, Item, Warehouse, Department, ...)
// still opens the real Desk record — those aren't part of this complaint and
// building custom views for every ERPNext master doctype is out of scope.
function sm_smart_link(doctype, name) {
	if (!name) return "—";
	if (doctype === "Scrap") return sm_scrap_link(name);
	if (SM_ENTITY_CONFIG[doctype]) return sm_entity_link(doctype, name);
	return sm_link(doctype, name);
}

// Shared delete action for every list row / detail page in this app. Frappe's
// own delete_doc already refuses (with a clear error) if the record is linked
// from another document, so no extra guard is needed here beyond confirmation.
// ERPNext's Quotation -> Sales Order mapping (get_mapped_doc) requires the
// source Quotation to be submitted, even though our approval workflow itself
// runs entirely at docstatus 0 — an Approved-but-never-Submitted Quotation is
// valid app state, so Sales Order creation submits it first when needed.
function sm_ensure_quotation_submitted(quotationName) {
	if (!quotationName) return Promise.resolve();
	return frappe.call({ method: "frappe.client.get_value", args: { doctype: "Quotation", filters: quotationName, fieldname: "docstatus" } }).then((r) => {
		if (r.message && r.message.docstatus === 1) return;
		return frappe.call({ method: "frappe.client.get", args: { doctype: "Quotation", name: quotationName }, freeze: true }).then((r2) =>
			frappe.call({ method: "frappe.client.submit", args: { doc: r2.message }, freeze: true })
		);
	});
}

function sm_confirm_delete(doctype, name, on_done) {
	frappe.confirm(__("Are you sure you want to permanently delete {0} <b>{1}</b>? This cannot be undone.", [doctype, name]), () => {
		frappe.call({ method: "frappe.client.delete", args: { doctype, name }, freeze: true }).then(() => {
			frappe.show_alert({ message: __("{0} {1} deleted.", [doctype, name]), indicator: "green" });
			if (on_done) on_done();
		});
	});
}

// Cancelling a submitted document reverses its GL/stock ledger entries — always
// confirm first, same as delete.
function sm_confirm_cancel(doctype, name, on_done) {
	frappe.confirm(
		__("Are you sure you want to cancel {0} <b>{1}</b>? This reverses its accounting/stock entries.", [doctype, name]),
		() => {
			frappe.call({ method: "frappe.client.cancel", args: { doctype, name }, freeze: true }).then(() => {
				frappe.show_alert({ message: __("{0} {1} cancelled.", [doctype, name]), indicator: "orange" });
				if (on_done) on_done();
			});
		}
	);
}

class ScrapManagementUI {
	constructor(wrapper) {
		this.page = frappe.ui.make_app_page({ parent: wrapper, title: "Scrap Management", single_column: true });
		$(this.page.main).css({ padding: 0 });
		this.render_shell();
		this.page.main.on("click", "[data-open-scrap]", (e) => this.open_scrap_detail($(e.currentTarget).data("open-scrap")));
		this.page.main.on("click", "[data-open-entity]", (e) => {
			const [doctype, name] = $(e.currentTarget).data("open-entity").split("|");
			this.open_entity_detail(doctype, name);
		});
		this.go("dashboard");
	}

	render_shell() {
		const NAV = [
			{ key: "dashboard", label: "Dashboard", icon: "layers" },
			{ key: "scrap", label: "Scrap Entry", group: "Scrap Process", icon: "box" },
			{ key: "stock", label: "Scrap Stock", icon: "building" },
			{ key: "quotation", label: "Quotations", icon: "copy" },
			{ key: "salesorder", label: "Sales Order", icon: "truck" },
			{ key: "deliverynote", label: "Delivery Note", icon: "note" },
			{ key: "salesinvoice", label: "Sales Invoice", icon: "inbox" },
			{ key: "paymententry", label: "Payment Entry", icon: "rupee" },
			{ key: "closure", label: "Closure", icon: "check" },
			{ key: "report", label: "Scrap Report", group: "Reports", icon: "search" },
		];
		let nav_html = "";
		let last_group = null;
		NAV.forEach((n) => {
			if (n.group && n.group !== last_group) {
				nav_html += `<div class="sm2-nav-label">${n.group}</div>`;
				last_group = n.group;
			}
			nav_html += `<button class="sm2-nav-btn" data-page="${n.key}">${sm_icon(n.icon)}<span>${n.label}</span></button>`;
		});

		this.page.main.html(`
			${SM_STYLE}
			<div id="sm2-root">
				<aside class="sm2-sidebar">${nav_html}</aside>
				<main class="sm2-content">
					<section class="sm2-page" id="sm2-dashboard"></section>
					<section class="sm2-page" id="sm2-scrap"></section>
					<section class="sm2-page" id="sm2-stock"></section>
					<section class="sm2-page" id="sm2-quotation"></section>
					<section class="sm2-page" id="sm2-salesorder"></section>
					<section class="sm2-page" id="sm2-deliverynote"></section>
					<section class="sm2-page" id="sm2-salesinvoice"></section>
					<section class="sm2-page" id="sm2-paymententry"></section>
					<section class="sm2-page" id="sm2-closure"></section>
					<section class="sm2-page" id="sm2-report"></section>
					<section class="sm2-page" id="sm2-detail"></section>
				</main>
			</div>
		`);

		this.page.main.find(".sm2-nav-btn").on("click", (e) => this.go($(e.currentTarget).data("page")));
	}

	go(key) {
		this.page.main.find(".sm2-nav-btn").removeClass("active").filter(`[data-page="${key}"]`).addClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		this.page.main.find("#sm2-" + key).addClass("active");
		this._last_nav_page = key;
		const renderers = {
			dashboard: () => this.render_dashboard(),
			scrap: () => this.render_scrap_list(),
			stock: () => this.render_stock_screen(),
			quotation: () => this.render_quotation_screen(),
			salesorder: () => this.render_report_screen("salesorder", "Scrap Sales Order"),
			deliverynote: () => this.render_delivery_note_screen(),
			salesinvoice: () => this.render_sales_invoice_screen(),
			paymententry: () => this.render_payment_entry_screen(),
			closure: () => this.render_closure_screen(),
			report: () => this.render_scrap_report(),
		};
		(renderers[key] || function () {})();
	}

	// ---------------- Dashboard ----------------
	render_dashboard() {
		const $el = this.page.main.find("#sm2-dashboard");
		$el.html(`<div class="sm2-empty">Loading…</div>`);
		frappe.call({ method: "scrap_management.api.get_dashboard_data" }).then((r) => {
			const d = r.message || {};
			const hour = new Date().getHours();
			const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";
			const fullname = frappe.session.user_fullname || frappe.session.user;

			const kpis = [
				["box", "Total Scrap", d.total_scrap, "Custom Scrap records"],
				["clock", "Pending Approval", d.pending_approval, "Awaiting Scrap Approver"],
				["check", "Available for Sale", d.available_for_sale, "Stock received, ready to quote"],
				["rupee", "Pending Payment", d.pending_payment, "Invoiced, payment outstanding"],
			];

			const approvals = d.pending_approvals || [];
			const approvals_html = approvals.length
				? approvals
						.map(
							(a) => `<div class="sm2-approval-row">
						<div>${sm_link(a.doctype, a.reference)}<div style="color:var(--p-fg3);font-size:11px;margin-top:2px;">${frappe.utils.escape_html(a.label || "")}</div></div>
						<span class="sm2-pill pending"><span class="dot"></span>Pending</span>
					</div>`
						)
						.join("")
				: `<div class="sm2-empty-approvals">${sm_icon("inbox", 34)}<div style="font-weight:600;color:var(--p-fg2);margin-top:4px;">No pending approvals</div><div style="font-size:11.5px;">You are all caught up.</div></div>`;

			$el.html(`
				<div class="sm2-hero"><div>
					<h1 class="sm2-greeting">Good <span class="accent">${greeting}</span>, ${frappe.utils.escape_html(fullname)}</h1>
					<p class="sm2-sub">Here is your live Scrap Management activity summary. Total sale value to date: <b class="sm2-mono">${sm_money(d.total_sale_value)}</b>.</p>
				</div></div>
				<div class="sm2-grid4">
					${kpis
						.map(
							(k) => `<div class="sm2-card sm2-kpi"><div class="sm2-kpi-icon">${sm_icon(k[0], 18)}</div><small>${k[1]}</small><strong>${k[2] || 0}</strong><span>${k[3]}</span></div>`
						)
						.join("")}
				</div>
				<div class="sm2-dashboard-grid sm2-section">
					<div class="sm2-card">
						<div class="sm2-head"><h3>Recent Activity</h3><span style="font-size:11px;color:var(--p-fg3)">latest Scrap records</span></div>
						<div class="sm2-tablewrap"><table class="sm2-table"><thead><tr><th>Scrap</th><th>Items</th><th>Status</th><th>Stock</th><th>Quotations</th></tr></thead>
						<tbody>${(d.recent || [])
							.map(
								(x) => `<tr><td>${sm_scrap_link(x.name)}</td><td>${frappe.utils.escape_html(x.item_summary || "—")}</td>
							<td>${sm_pill(x.status)}</td>
							<td>${x.stock_entry ? sm_entity_link("Stock Entry", x.stock_entry) : "—"}</td><td>${x.quotation_count}</td></tr>`
							)
							.join("") || '<tr><td colspan="5" class="sm2-empty">No Scrap records yet.</td></tr>'}</tbody></table></div>
					</div>
					<div class="sm2-card">
						<div class="sm2-head"><h3>Pending Approvals</h3><span style="font-size:11px;color:var(--p-fg3)">${approvals.length} awaiting action</span></div>
						${approvals_html}
					</div>
				</div>
			`);
		});
	}

	// ---------------- Scrap Entry ----------------
	render_scrap_list(filters) {
		const $el = this.page.main.find("#sm2-scrap");
		filters = filters || {};
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Scrap Entry</h1>
			<p class="sm2-sub">The only custom transaction DocType. Approval auto-creates a real ERPNext Stock Entry.</p></div>
			<button class="sm2-btn primary" id="sm2-new-scrap-btn">+ New Scrap</button></div>
			<div class="sm2-card">
				<div class="sm2-head"><h3>Scrap List</h3>
					<div class="sm2-toolbar">
						<input class="sm2-input" id="sm2-scrap-search" placeholder="Search item" style="width:200px">
						<select class="sm2-select" id="sm2-scrap-status">
							<option value="">All Status</option>
							<option>Draft</option><option>Pending Approval</option><option>Approved</option>
							<option>Rejected</option><option>Available for Sale</option><option>Closed</option>
						</select>
					</div>
				</div>
				<div class="sm2-tablewrap" id="sm2-scrap-table"><div class="sm2-empty">Loading…</div></div>
			</div>
		`);
		$el.find("#sm2-new-scrap-btn").on("click", () => this.open_new_scrap());
		$el.find("#sm2-scrap-search").on("input", frappe.utils.debounce(() => this.load_scrap_list(), 300));
		$el.find("#sm2-scrap-status").on("change", () => this.load_scrap_list());
		this.load_scrap_list();
	}

	load_scrap_list() {
		const $el = this.page.main.find("#sm2-scrap");
		const search = $el.find("#sm2-scrap-search").val();
		const status = $el.find("#sm2-scrap-status").val();
		const filters = {};
		if (status) filters.status = status;

		(search
			? frappe.call({ method: "scrap_management.api.search_scrap_by_item", args: { search_text: search } }).then((r) => {
					filters.name = ["in", (r.message || []).concat("__none__")];
			  })
			: Promise.resolve()
		).then(() => {
			frappe.call({
				method: "frappe.client.get_list",
				args: {
					doctype: "Scrap",
					fields: ["name", "scrap_date", "department", "status"],
					filters,
					order_by: "creation desc",
					limit_page_length: 100,
				},
			}).then((r) => {
				const rows = r.message || [];
				const names = rows.map((x) => x.name);
				(names.length
					? frappe.call({
							method: "scrap_management.api.get_scrap_items_by_parent",
							args: { scrap_names: names },
					  }).then((r2) => {
							const byScrap = {};
							(r2.message || []).forEach((it) => (byScrap[it.parent] = byScrap[it.parent] || []).push(it));
							rows.forEach((row) => (row.items = byScrap[row.name] || []));
					  })
					: Promise.resolve()
				).then(() => {
					$el.find("#sm2-scrap-table").html(`
						<table class="sm2-table"><thead><tr><th>Scrap ID</th><th>Date</th><th>Items</th><th>Department</th><th>Qty</th><th>Status</th><th>Action</th></tr></thead>
						<tbody>${rows
							.map(
								(x) => `<tr><td>${sm_scrap_link(x.name)}</td><td>${x.scrap_date || ""}</td>
							<td>${frappe.utils.escape_html(x.items.map((i) => i.item_name || i.item).join(", ") || "—")}</td><td>${frappe.utils.escape_html(x.department || "")}</td>
							<td class="sm2-mono">${x.items.map((i) => `${i.qty} ${i.uom || ""}`).join(", ")}</td><td>${sm_pill(x.status)}</td>
							<td><button class="sm2-btn" data-print-scrap="${x.name}">Print</button> <button class="sm2-btn danger" data-del-scrap="${x.name}">Delete</button></td></tr>`
							)
							.join("") || '<tr><td colspan="7" class="sm2-empty">No records found.</td></tr>'}</tbody></table>
					`);
					$el.find("[data-print-scrap]").on("click", (e) => sm_print("Scrap", $(e.currentTarget).data("print-scrap"), "Scrap Print"));
					$el.find("[data-del-scrap]").on("click", (e) => {
						sm_confirm_delete("Scrap", $(e.currentTarget).data("del-scrap"), () => this.load_scrap_list());
					});
				});
			});
		});
	}

	// Full-page creation form (not a popup) — matches the "New Material Request"
	// reference: Back / primary action at top, a banner explaining real ERPNext
	// rules apply, and a numbered card holding real Link/Data/Currency controls.
	// Also doubles as the Edit form for a Scrap in an editable workflow state
	// (Draft / Returned for Correction) — pass the fetched doc to pre-fill.
	open_new_scrap() {
		this._render_scrap_form(null);
	}

	open_edit_scrap(name) {
		frappe.call({ method: "frappe.client.get", args: { doctype: "Scrap", name }, freeze: true }).then((r) => {
			if (r.message) this._render_scrap_form(r.message);
		});
	}

	_render_scrap_form(existingDoc) {
		const isEdit = !!existingDoc;
		this._detail_return_page = this._last_nav_page || "scrap";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; ${isEdit ? existingDoc.name : "New Scrap"}</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">${isEdit ? `Edit ${existingDoc.name}` : "New Scrap"}</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-new-scrap-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-new-scrap-save">${isEdit ? "Save Changes" : "Create &amp; Send for Approval"}</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Scrap Details</h3></div>
				<div id="sm2-new-scrap-fields" style="padding:6px 18px 18px;"></div>
			</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Items</h3></div>
				<div style="padding:6px 18px 18px;">
					<div class="sm2-item-grid">
						<div class="sm2-item-grid-row sm2-item-grid-head">
							<div style="flex:2;">Item</div><div style="flex:1.4;">Item Group</div><div style="flex:0.8;">Qty</div><div style="flex:0.8;">UOM</div><div style="flex:1.4;">Reason</div><div style="flex:1.4;">Image of Scrap <span style="color:var(--p-err);">*</span></div><div style="width:40px;flex:0 0 40px;"></div>
						</div>
						<div id="sm2-item-rows"></div>
						<div id="sm2-item-rows-empty" class="sm2-empty">No items added yet.</div>
					</div>
					<button class="sm2-btn" id="sm2-add-item-row" style="margin-top:10px;">+ Add Item</button>
				</div>
			</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">03</span>&nbsp; Remark</h3></div>
				<div id="sm2-new-scrap-tail" style="padding:6px 18px 18px;"></div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-new-scrap-back").on("click", () => {
			if (isEdit) this.open_scrap_detail(existingDoc.name);
			else this.go(this._detail_return_page);
		});

		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-scrap-fields"),
			fields: [
				{
					fieldtype: "Link",
					fieldname: "company",
					label: "Company",
					options: "Company",
					reqd: 1,
					default: isEdit ? existingDoc.company : frappe.defaults.get_user_default("Company"),
				},
				{ fieldtype: "Column Break" },
				{ fieldtype: "Date", fieldname: "required_date", label: "Date", default: isEdit ? existingDoc.required_date : null },
				{ fieldtype: "Section Break" },
				{
					fieldtype: "Link",
					fieldname: "scrap_warehouse",
					label: "Scrap Warehouse",
					options: "Warehouse",
					reqd: 1,
					default: isEdit ? existingDoc.scrap_warehouse : null,
					get_query: () => ({ filters: { company: fg.get_value("company"), is_group: 0 } }),
				},
				{ fieldtype: "Column Break" },
				{
					fieldtype: "Link",
					fieldname: "department",
					label: "Department",
					options: "Department",
					default: isEdit ? existingDoc.department : null,
					get_query: () => ({ filters: { company: fg.get_value("company") } }),
				},
			],
		});
		fg.make();

		const tail_fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-scrap-tail"),
			fields: [
				{ fieldtype: "Small Text", fieldname: "reason_for_scrap", label: "Remark", reqd: 1, default: isEdit ? existingDoc.reason_for_scrap : null },
			],
		});
		tail_fg.make();

		// Hand-built item rows (plain divs, not a <table>) instead of a Frappe Grid.
		// The Grid widget expects a full Form/frm context to add rows reliably, and
		// a Link control's autocomplete dropdown gets clipped when its input sits
		// inside a <td> (table cells clip absolutely-positioned overflow content in
		// some browsers even with table-layout:fixed) — plain divs avoid both issues.
		const itemRows = [];
		const $rowsBody = $el.find("#sm2-item-rows");
		const $emptyRow = $el.find("#sm2-item-rows-empty");

		const addItemRow = (data) => {
			$emptyRow.hide();
			const $row = $(`<div class="sm2-item-grid-row">
				<div class="sm2-item-cell" style="flex:2;min-width:0;"></div>
				<div style="flex:1.4;min-width:0;"><input type="text" class="sm2-input sm2-item-category" style="width:100%;box-sizing:border-box;" readonly placeholder="Item Group"></div>
				<div style="flex:0.8;min-width:0;"><input type="number" step="any" class="sm2-input" style="width:100%;box-sizing:border-box;" placeholder="Qty"></div>
				<div style="flex:0.8;min-width:0;"><input type="text" class="sm2-input sm2-item-uom" style="width:100%;box-sizing:border-box;" readonly placeholder="UOM"></div>
				<div style="flex:1.4;min-width:0;"><input type="text" class="sm2-input sm2-item-reason" style="width:100%;box-sizing:border-box;" placeholder="Reason"></div>
				<div class="sm2-attach-cell" style="flex:1.4;min-width:0;"></div>
				<div style="width:40px;flex:0 0 40px;"><button type="button" class="sm2-btn danger" style="padding:0 10px;">&times;</button></div>
			</div>`);
			$rowsBody.append($row);
			const item_control = frappe.ui.form.make_control({
				parent: $row.find(".sm2-item-cell"),
				df: {
					fieldtype: "Link",
					fieldname: "item",
					options: "Item",
					placeholder: "Search Item",
					onchange: () => {
						const item_code = item_control.get_value();
						if (!item_code) return;
						frappe.db.get_value("Item", item_code, ["stock_uom", "item_group"]).then((r) => {
							if (r.message && r.message.stock_uom) row.$uom.val(r.message.stock_uom);
							if (r.message && r.message.item_group) row.$category.val(r.message.item_group);
						});
					},
				},
				render_input: true,
				only_input: true,
			});
			item_control.refresh();
			const attach_control = frappe.ui.form.make_control({
				parent: $row.find(".sm2-attach-cell"),
				df: { fieldtype: "Attach Image", fieldname: "attachment", reqd: 1 },
				render_input: true,
				only_input: true,
			});
			attach_control.refresh();
			const row = {
				item_control,
				attach_control,
				$category: $row.find(".sm2-item-category"),
				$qty: $row.find('input[type="number"]'),
				$uom: $row.find(".sm2-item-uom"),
				$reason: $row.find(".sm2-item-reason"),
			};
			if (data) {
				item_control.set_value(data.item);
				row.$qty.val(data.qty);
				row.$uom.val(data.uom);
				row.$category.val(data.scrap_category);
				row.$reason.val(data.reason);
				if (data.attachment) attach_control.set_value(data.attachment);
			}
			itemRows.push(row);
			$row.find(".sm2-btn.danger").on("click", () => {
				itemRows.splice(itemRows.indexOf(row), 1);
				$row.remove();
				if (!itemRows.length) $emptyRow.show();
			});
		};

		$el.find("#sm2-add-item-row").on("click", () => addItemRow());
		if (isEdit && existingDoc.items.length) existingDoc.items.forEach((row) => addItemRow(row));
		else addItemRow();

		$el.find("#sm2-new-scrap-save").on("click", () => {
			const values = fg.get_values();
			const tail_values = tail_fg.get_values();
			if (!values || !tail_values) return;
			const items = itemRows
				.map((row) => ({
					item: row.item_control.get_value(),
					qty: parseFloat(row.$qty.val()) || 0,
					uom: row.$uom.val(),
					scrap_category: row.$category.val(),
					reason: row.$reason.val(),
					attachment: row.attach_control.get_value(),
				}))
				.filter((row) => row.item && row.qty > 0);
			if (!items.length) {
				frappe.msgprint(__("Add at least one Item with a valid Quantity."));
				return;
			}
			if (items.some((row) => !row.attachment)) {
				frappe.msgprint(__("Upload an Image of Scrap for every item."));
				return;
			}

			if (isEdit) {
				const doc = Object.assign({}, existingDoc, values, tail_values, { items });
				frappe.call({ method: "frappe.client.save", args: { doc }, freeze: true }).then((r) => {
					if (!r.message) return;
					frappe.show_alert({ message: __("Scrap {0} updated.", [r.message.name]), indicator: "green" });
					this.open_scrap_detail(r.message.name);
				});
				return;
			}

			frappe.call({
				method: "frappe.client.insert",
				args: { doc: Object.assign({ doctype: "Scrap", items }, values, tail_values) },
				freeze: true,
			}).then((r) => {
				if (!r.message) return;
				frappe.call({
					method: "frappe.model.workflow.apply_workflow",
					args: { doc: JSON.stringify(r.message), action: "Send For Approval" },
					freeze: true,
				}).then(() => {
					frappe.show_alert({ message: __("Scrap created and sent for approval."), indicator: "green" });
					this.open_scrap_detail(r.message.name);
				});
			});
		});
	}

	// ---------------- Scrap Detail (full in-page view, replaces navigating to the real Desk form) ----------------
	open_scrap_detail(name) {
		this._detail_return_page = this._last_nav_page || "scrap";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");
		$el.html(`<div class="sm2-empty">Loading…</div>`);

		Promise.all([
			frappe.call({ method: "frappe.client.get", args: { doctype: "Scrap", name }, freeze: true }),
			frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.get_quotation_comparison", args: { scrap_name: name } }),
			frappe.call({ method: "frappe.desk.form.load.get_docinfo", args: { doctype: "Scrap", name } }).catch(() => ({ docinfo: null })),
		]).then(([docRes, quoteRes, infoRes]) => {
			const doc = docRes.message;
			if (!doc) return;
			frappe.call({ method: "frappe.model.workflow.get_transitions", args: { doc: JSON.stringify(doc) } }).then((transRes) => {
				this.render_scrap_detail_page(doc, quoteRes.message || [], transRes.message || [], infoRes.docinfo);
			});
		});
	}

	render_scrap_detail_page(doc, quotes, transitions, docinfo) {
		const $el = this.page.main.find("#sm2-detail");

		const quoteTable = quotes.length
			? `<table class="sm2-table"><thead><tr><th>Quotation</th><th>Customer</th><th>Items</th><th>Total</th><th>Approval</th><th>Selected</th></tr></thead>
				<tbody>${quotes
					.map(
						(q) => `<tr><td>${sm_entity_link("Quotation", q.name)}</td><td>${frappe.utils.escape_html(q.customer || "")}</td>
					<td class="sm2-mono">${q.item_count || ""}</td>
					<td class="sm2-mono" style="${q.is_highest_total ? "font-weight:700;color:var(--p-ok)" : ""}">${sm_money(q.total)}</td>
					<td>${sm_pill(q.approval_status || "Draft")}</td><td>${q.selected ? "Yes" : "No"}</td></tr>`
					)
					.join("")}</tbody></table>`
			: `<div class="sm2-empty">No Quotation created yet.</div>`;

		const itemsTable = (doc.items || []).length
			? `<table class="sm2-table"><thead><tr><th>Item</th><th>Item Group</th><th>Qty</th><th>UOM</th><th>Reason</th><th>Dispatched</th><th>Available</th><th>Image</th></tr></thead>
				<tbody>${doc.items
					.map(
						(row) => `<tr><td>${frappe.utils.escape_html(row.item_name || row.item)}</td>
					<td>${frappe.utils.escape_html(row.scrap_category || "—")}</td>
					<td class="sm2-mono">${row.qty}</td><td>${row.uom || ""}</td>
					<td>${frappe.utils.escape_html(row.reason || "—")}</td>
					<td class="sm2-mono">${row.dispatched_qty ?? 0}</td><td class="sm2-mono">${row.available_qty ?? 0}</td>
					<td>${row.attachment ? `<a href="${row.attachment}" target="_blank">View</a>` : "—"}</td></tr>`
					)
					.join("")}</tbody></table>`
			: `<div class="sm2-empty">No items.</div>`;

		const field = (label, value) => `<div class="f"><small>${label}</small><div>${value == null || value === "" ? "—" : value}</div></div>`;
		const numbered_card = (n, title, innerHtml) => `
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">${String(n).padStart(2, "0")}</span>&nbsp; ${title}</h3></div>
				${innerHtml}
			</div>`;

		const linkedRows = [
			["Stock Entry", doc.stock_entry, "Stock Entry"],
			["Sales Order", doc.sales_order, "Sales Order"],
			["Delivery Note", doc.delivery_note, "Delivery Note"],
			["Sales Invoice", doc.sales_invoice, "Sales Invoice"],
		].filter((r) => r[1]);

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; ${doc.name}</div>
			<div class="sm2-detail-head">
				<div>
					<h1 class="sm2-detail-title">${doc.name} <span style="font-weight:400;color:var(--p-fg3);">— ${(doc.items || []).length} item${(doc.items || []).length === 1 ? "" : "s"}</span></h1>
					${sm_pill(doc.status)}
				</div>
				<div id="sm2-detail-actions" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
			</div>
			<div class="sm2-detail-grid">
				<div>
					${(() => {
						const sections = [
							{
								show: true,
								title: "Document Details",
								html: `<div class="sm2-field-grid">
									${field("Company", frappe.utils.escape_html(doc.company))}
									${field("Department", frappe.utils.escape_html(doc.department))}
									${field("Date", doc.required_date || "—")}
									${field("Scrap Date", doc.scrap_date)}
									${field("Created By", frappe.utils.escape_html(doc.created_by_display))}
								</div>`,
							},
							{
								show: true,
								title: "Material & Inventory",
								html: `<div class="sm2-field-grid">
									${field("Warehouse", frappe.utils.escape_html(doc.scrap_warehouse))}
									${field("Stock Entry", doc.stock_entry ? sm_entity_link("Stock Entry", doc.stock_entry) : "—")}
								</div>
								<div class="sm2-tablewrap">${itemsTable}</div>`,
							},
							{
								show: true,
								title: "Remark",
								html: `<div style="padding:14px 18px;font-size:13px;color:var(--p-fg1);">${frappe.utils.escape_html(doc.reason_for_scrap || "—")}</div>`,
							},
							// Quotations / Sales & Payment only appear once there's actually
							// something in them — showing an empty card upfront is noise.
							{ show: quotes.length > 0, title: "Quotations", html: `<div class="sm2-tablewrap">${quoteTable}</div>` },
							{
								show: Boolean(doc.sales_order || doc.delivery_note || doc.sales_invoice || flt(doc.approved_sale_value) > 0),
								title: "Sales & Payment",
								html: `<div class="sm2-field-grid">
									${field("Sales Order", doc.sales_order ? sm_entity_link("Sales Order", doc.sales_order) : "—")}
									${field("Delivery Note", doc.delivery_note ? sm_entity_link("Delivery Note", doc.delivery_note) : "—")}
									${field("Sales Invoice", doc.sales_invoice ? sm_entity_link("Sales Invoice", doc.sales_invoice) : "—")}
									${field("Approved Sale Value", sm_money(doc.approved_sale_value))}
									${field("Pending Amount", sm_money(doc.pending_amount))}
									${field("Payment Status", frappe.utils.escape_html(doc.payment_status))}
								</div>`,
							},
						];
						let cardIdx = 0;
						return sections
							.filter((s) => s.show)
							.map((s) => numbered_card(++cardIdx, s.title, s.html))
							.join("");
					})()}
				</div>
				<div>
					<div class="sm2-card" style="margin-bottom:14px;">
						<div class="sm2-head"><h3>Activity</h3></div>
						<div class="sm2-timeline">${sm_render_timeline(docinfo)}</div>
					</div>
					<div class="sm2-card">
						<div class="sm2-head"><h3>Linked Documents</h3><span style="font-size:11px;color:var(--p-fg3)">${linkedRows.length} document${linkedRows.length === 1 ? "" : "s"}</span></div>
						${
							linkedRows.length
								? linkedRows.map((r) => `<div class="sm2-linked-row"><span>${r[0]}</span>${sm_entity_link(r[2], r[1])}</div>`).join("")
								: `<div class="sm2-empty">No linked documents yet.</div>`
						}
					</div>
				</div>
			</div>
		`);

		$el.find("[data-back-to-list]").on("click", () => this.go(this._detail_return_page));

		const $actions = $el.find("#sm2-detail-actions");
		if (doc.approval_state === "Draft" || doc.approval_state === "Returned for Correction") {
			$actions.append($(`<button class="sm2-btn">Edit</button>`).on("click", () => this.open_edit_scrap(doc.name)));
		}
		const seen_actions = new Set();
		const unique_transitions = (transitions || []).filter((t) => (seen_actions.has(t.action) ? false : seen_actions.add(t.action)));
		unique_transitions.forEach((t) => {
			$actions.append(
				$(`<button class="sm2-btn ${t.action === "Approve" ? "primary" : ""}">${t.action}</button>`).on("click", () => {
					frappe.call({ method: "frappe.model.workflow.apply_workflow", args: { doc: JSON.stringify(doc), action: t.action }, freeze: true }).then(() => {
						frappe.show_alert({ message: __("Scrap {0}: {1}", [doc.name, t.action]), indicator: "green" });
						this.open_scrap_detail(doc.name);
					});
				})
			);
		});
		if (doc.status === "Available for Sale" || doc.status === "Quotation in Process") {
			$actions.append(
				$(`<button class="sm2-btn primary">+ Quotation</button>`).on("click", () => this.open_new_quotation(doc.name))
			);
		}
		if (doc.selected_quotation && !doc.sales_order && (doc.items || []).some((r) => flt(r.available_qty) > 0)) {
			$actions.append(
				$(`<button class="sm2-btn primary">+ Sales Order</button>`).on("click", () =>
					this.create_sales_order_flow(doc.selected_quotation, doc.name)
				)
			);
		}
		$actions.append($(`<button class="sm2-btn">Print</button>`).on("click", () => sm_print("Scrap", doc.name, "Scrap Print")));
		$actions.append(
			$(`<button class="sm2-btn danger">Delete</button>`).on("click", () => {
				sm_confirm_delete("Scrap", doc.name, () => this.go(this._detail_return_page));
			})
		);
	}

	// ---------------- Generic entity detail (Quotation / Sales Order / Delivery Note / Sales Invoice / Stock Entry / Payment Entry) ----------------
	// Full in-page view — mirrors render_scrap_detail_page exactly so nothing in
	// this app ever navigates away to a real Desk form.
	open_entity_detail(doctype, name) {
		if (!name) return;
		this._detail_return_page = this._last_nav_page || "dashboard";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");
		$el.html(`<div class="sm2-empty">Loading…</div>`);

		Promise.all([
			frappe.call({ method: "frappe.client.get", args: { doctype, name }, freeze: true }),
			frappe.call({ method: "frappe.desk.form.load.get_docinfo", args: { doctype, name } }).catch(() => ({ docinfo: null })),
		]).then(([docRes, infoRes]) => {
			const doc = docRes.message;
			if (!doc) return;
			if (doctype === "Quotation") {
				const scrapNames = (doc.custom_scraps || []).map((r) => r.scrap);
				Promise.all([
					frappe.call({ method: "frappe.model.workflow.get_transitions", args: { doc: JSON.stringify(doc) } }),
					scrapNames.length
						? frappe.call({ method: "frappe.client.get_list", args: { doctype: "Scrap", filters: { name: ["in", scrapNames] }, fields: ["name", "sales_order"], limit_page_length: 0 } })
						: Promise.resolve({ message: [] }),
				]).then(([transRes, scrapRes]) => {
					doc.__so_by_scrap = {};
					(scrapRes.message || []).forEach((s) => (doc.__so_by_scrap[s.name] = s.sales_order));
					this.render_entity_detail_page(doctype, doc, infoRes.docinfo, transRes.message || []);
				});
			} else {
				this.render_entity_detail_page(doctype, doc, infoRes.docinfo, []);
			}
		});
	}

	render_entity_detail_page(doctype, doc, docinfo, transitions) {
		const $el = this.page.main.find("#sm2-detail");
		const cfg = SM_ENTITY_CONFIG[doctype] || { fields: [] };

		const fmt = (val, type, fn) => {
			if (fn === "custom_scrap") return val ? sm_scrap_link(val) : "—";
			if (type === "Check") return val ? "Yes" : "No";
			if (type === "Currency") return sm_money(val);
			if (type === "Status") return sm_pill(val);
			if (type === "Attach") return val ? `<a href="${val}" target="_blank">View</a>` : "—";
			return val == null || val === "" ? "—" : frappe.utils.escape_html(String(val));
		};

		const field = (label, value) => `<div class="f"><small>${label}</small><div>${value == null || value === "" ? "—" : value}</div></div>`;
		const numbered_card = (n, title, innerHtml) => `
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">${String(n).padStart(2, "0")}</span>&nbsp; ${title}</h3></div>
				${innerHtml}
			</div>`;

		const detailFieldsHtml = `<div class="sm2-field-grid">
			${cfg.fields.map(([label, fn, type]) => field(label, fmt(doc[fn], type, fn))).join("")}
		</div>`;

		let itemsTable = "";
		if (cfg.items && doc[cfg.items] && doc[cfg.items].length) {
			itemsTable = `<div class="sm2-tablewrap"><table class="sm2-table"><thead><tr>${cfg.itemFields.map((f) => `<th>${f[0]}</th>`).join("")}</tr></thead>
				<tbody>${doc[cfg.items]
					.map(
						(row) =>
							`<tr>${cfg.itemFields.map((f) => `<td class="${f[2] === "Currency" ? "sm2-mono" : ""}">${fmt(row[f[1]], f[2], f[1])}</td>`).join("")}</tr>`
					)
					.join("")}</tbody></table></div>`;
		}

		const linkedRows =
			doctype === "Quotation"
				? (doc.custom_scraps || []).map((r) => ["Scrap", r.scrap, "Scrap"])
				: doc.custom_scrap
				? [["Scrap", doc.custom_scrap, "Scrap"]]
				: [];
		const status_val = doc.docstatus === 2 ? "Cancelled" : doc.status || doc.custom_approval_status || (doc.docstatus === 1 ? "Submitted" : "Draft");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; ${doctype} &rsaquo; ${doc.name}</div>
			<div class="sm2-detail-head">
				<div>
					<h1 class="sm2-detail-title">${doc.name}</h1>
					${sm_pill(status_val)}
				</div>
				<div id="sm2-detail-actions" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
			</div>
			<div class="sm2-detail-grid">
				<div>
					${numbered_card(1, `${doctype} Details`, detailFieldsHtml)}
					${itemsTable ? numbered_card(2, "Items", itemsTable) : ""}
				</div>
				<div>
					<div class="sm2-card" style="margin-bottom:14px;">
						<div class="sm2-head"><h3>Activity</h3></div>
						<div class="sm2-timeline">${sm_render_timeline(docinfo)}</div>
					</div>
					<div class="sm2-card">
						<div class="sm2-head"><h3>Linked Documents</h3><span style="font-size:11px;color:var(--p-fg3)">${linkedRows.length} document${linkedRows.length === 1 ? "" : "s"}</span></div>
						${
							linkedRows.length
								? linkedRows.map((r) => `<div class="sm2-linked-row"><span>${r[0]}</span>${sm_smart_link(r[2], r[1])}</div>`).join("")
								: `<div class="sm2-empty">No linked documents yet.</div>`
						}
					</div>
				</div>
			</div>
		`);

		$el.find("[data-back-to-list]").on("click", () => this.go(this._detail_return_page));

		const $actions = $el.find("#sm2-detail-actions");

		// Quotation submission must only ever happen automatically (via
		// sm_ensure_quotation_submitted, right when a Sales Order is created) — a
		// manual Submit here can push docstatus to 1 while the Approval Workflow's
		// states are all pinned to doc_status "0", making every further workflow
		// transition throw "Illegal Document Status".
		if (doc.docstatus === 0 && doctype !== "Quotation") {
			$actions.append(
				$(`<button class="sm2-btn primary">Submit</button>`).on("click", () => {
					frappe.call({ method: "frappe.client.submit", args: { doc }, freeze: true }).then(() => {
						frappe.show_alert({ message: __("{0} submitted.", [doc.name]), indicator: "green" });
						this.open_entity_detail(doctype, doc.name);
					});
				})
			);
		}

		if (doctype === "Quotation") {
			const seen_actions = new Set();
			const unique_transitions = (transitions || []).filter((t) => (seen_actions.has(t.action) ? false : seen_actions.add(t.action)));
			unique_transitions.forEach((t) => {
				$actions.append(
					$(`<button class="sm2-btn ${t.action === "Approve" ? "primary" : ""}">${t.action}</button>`).on("click", () => {
						frappe.call({ method: "frappe.model.workflow.apply_workflow", args: { doc: JSON.stringify(doc), action: t.action }, freeze: true }).then(() => {
							frappe.show_alert({ message: __("Quotation {0}: {1}", [doc.name, t.action]), indicator: "green" });
							this.open_entity_detail(doctype, doc.name);
						});
					})
				);
			});
			if (doc.custom_approval_status === "Approved") {
				(doc.custom_scraps || []).forEach((row) => {
					if (row.selected && !(doc.__so_by_scrap || {})[row.scrap]) {
						$actions.append(
							$(`<button class="sm2-btn primary">Create Sales Order — ${row.scrap}</button>`).on("click", () =>
								this.create_sales_order_flow(doc.name, row.scrap)
							)
						);
					}
				});
			}
		}

		if (doctype === "Sales Order" && flt(doc.per_delivered) < 100) {
			$actions.append(
				$(`<button class="sm2-btn primary">Create Delivery Note</button>`).on("click", () =>
					this.create_delivery_note_flow(doc.name, (name) => this.open_entity_detail("Delivery Note", name))
				)
			);
		}

		if (doctype === "Delivery Note" && flt(doc.per_billed) < 100) {
			$actions.append(
				$(`<button class="sm2-btn primary">Create Sales Invoice</button>`).on("click", () =>
					this.create_sales_invoice_flow(doc.name, (name) => this.open_entity_detail("Sales Invoice", name))
				)
			);
		}

		if (doctype === "Sales Invoice" && doc.docstatus === 1 && flt(doc.outstanding_amount) > 0) {
			$actions.append(
				$(`<button class="sm2-btn primary">Record Payment</button>`).on("click", () =>
					this.open_payment_dialog(doc.name, doc.custom_scrap, (name) => this.open_entity_detail("Payment Entry", name))
				)
			);
		}
		$actions.append($(`<button class="sm2-btn">Print</button>`).on("click", () => sm_print(doctype, doc.name, SM_DEFAULT_PRINT_FORMAT[doctype])));
		if (doctype === "Delivery Note") {
			$actions.append($(`<button class="sm2-btn">Gate Pass</button>`).on("click", () => sm_print(doctype, doc.name, "Scrap Gate Pass")));
		}
		if (doc.docstatus !== 1) {
			$actions.append(
				$(`<button class="sm2-btn danger">Delete</button>`).on("click", () => {
					sm_confirm_delete(doctype, doc.name, () => this.go(this._detail_return_page));
				})
			);
		}
	}

	// ---------------- Report-backed screens (Stock / Sales Order / Closure) ----------------
	render_report_screen(pageKey, reportName) {
		const $el = this.page.main.find("#sm2-" + pageKey);
		$el.html(`<div class="sm2-empty">Loading ${reportName}…</div>`);
		const printInfo = { salesorder: ["Sales Order", "Sales Order Print"] }[pageKey];
		frappe.call({ method: "scrap_management.api.get_report", args: { report_name: reportName } }).then((r) => {
			const { columns, data } = r.message || { columns: [], data: [] };
			const newSoBtn = pageKey === "salesorder" ? `<button class="sm2-btn primary" id="sm2-new-so-btn">+ Create Sales Order</button>` : "";
			$el.html(`
				<div class="sm2-hero"><div><h1 class="sm2-title">${reportName.replace("Scrap ", "")}</h1></div>${newSoBtn}</div>
				<div class="sm2-card"><div class="sm2-tablewrap">
				<table class="sm2-table"><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}${printInfo ? "<th>Action</th>" : ""}</tr></thead>
				<tbody>${
					data.length
						? data
								.map(
									(row) =>
										`<tr>${columns
											.map((c) => {
												let v = row[c.fieldname];
												if (c.fieldtype === "Link" && v) v = sm_smart_link(c.options, v);
												else if (["Currency", "Float", "Int"].includes(c.fieldtype)) v = `<span class="sm2-mono">${c.fieldtype === "Currency" ? sm_money(v) : v ?? ""}</span>`;
												else v = frappe.utils.escape_html(v == null ? "" : String(v));
												return `<td>${v}</td>`;
											})
											.join("")}${
												printInfo
													? `<td><button class="sm2-btn" data-report-print="${row.name}">Print</button>${
															row.docstatus === 1
																? ` <button class="sm2-btn danger" data-report-cancel="${row.name}">Cancel</button>`
																: ` <button class="sm2-btn danger" data-report-delete="${row.name}">Delete</button>`
														}</td>`
													: ""
											}</tr>`
								)
								.join("")
						: `<tr><td colspan="${columns.length + (printInfo ? 1 : 0)}" class="sm2-empty">No records found.</td></tr>`
				}</tbody></table>
				</div></div>
			`);
			if (pageKey === "salesorder") $el.find("#sm2-new-so-btn").on("click", () => this.open_new_sales_order());
			if (printInfo) {
				$el.find("[data-report-print]").on("click", (e) => sm_print(printInfo[0], $(e.currentTarget).data("report-print"), printInfo[1]));
				$el.find("[data-report-delete]").on("click", (e) => {
					sm_confirm_delete(printInfo[0], $(e.currentTarget).data("report-delete"), () => this.render_report_screen(pageKey, reportName));
				});
				$el.find("[data-report-cancel]").on("click", (e) => {
					sm_confirm_cancel(printInfo[0], $(e.currentTarget).data("report-cancel"), () => this.render_report_screen(pageKey, reportName));
				});
			}
		});
	}

	// ---------------- Stock Balance ----------------
	// Real ERPNext Stock Balance report (erpnext.stock.report.stock_balance),
	// scoped by default to warehouses this app has ever received scrap into.
	// Filters mirror the real report's own filter bar (Company/Warehouse/Item/
	// Date range/Include Zero Stock Items) so a Company or Warehouse pick can
	// still widen the view beyond the scrap-only default.
	render_stock_screen() {
		const $el = this.page.main.find("#sm2-stock");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Scrap Stock Balance</h1>
			<p class="sm2-sub">ERPNext's own Stock Ledger balance for scrap items only, across every warehouse scrap has been received into.</p></div></div>
			<div class="sm2-card" style="margin-bottom:14px;">
				<div class="sm2-head"><h3>Filters</h3></div>
				<div class="sm2-toolbar" style="padding:0 18px 16px;flex-wrap:wrap;align-items:flex-end;">
					<div style="min-width:170px;"><small style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--p-fg3);margin-bottom:3px;">Company</small><div id="sm2-stock-f-company"></div></div>
					<div style="min-width:170px;"><small style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--p-fg3);margin-bottom:3px;">Warehouse</small><div id="sm2-stock-f-warehouse"></div></div>
					<div style="min-width:170px;"><small style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--p-fg3);margin-bottom:3px;">Item</small><div id="sm2-stock-f-item"></div></div>
					<div><small style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--p-fg3);margin-bottom:3px;">From Date</small><input type="date" class="sm2-input" id="sm2-stock-f-from"></div>
					<div><small style="display:block;font-size:10px;text-transform:uppercase;letter-spacing:.06em;color:var(--p-fg3);margin-bottom:3px;">To Date</small><input type="date" class="sm2-input" id="sm2-stock-f-to"></div>
					<label style="display:flex;align-items:center;gap:6px;font-size:12.5px;color:var(--p-fg2);height:32px;"><input type="checkbox" id="sm2-stock-f-zero"> Include Zero Stock Items</label>
					<button class="sm2-btn" id="sm2-stock-f-clear">Clear Filters</button>
				</div>
			</div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-stock-table"><div class="sm2-empty">Loading…</div></div></div>
		`);

		this._stockCompanyCtrl = frappe.ui.form.make_control({
			parent: $el.find("#sm2-stock-f-company"),
			df: { fieldtype: "Link", fieldname: "company", options: "Company", placeholder: "All Companies", onchange: () => this.load_stock_table() },
			render_input: true,
			only_input: true,
		});
		this._stockCompanyCtrl.refresh();

		this._stockWarehouseCtrl = frappe.ui.form.make_control({
			parent: $el.find("#sm2-stock-f-warehouse"),
			df: {
				fieldtype: "Link",
				fieldname: "warehouse",
				options: "Warehouse",
				placeholder: "All Warehouses",
				get_query: () => ({ filters: this._stockCompanyCtrl.get_value() ? { company: this._stockCompanyCtrl.get_value() } : {} }),
				onchange: () => this.load_stock_table(),
			},
			render_input: true,
			only_input: true,
		});
		this._stockWarehouseCtrl.refresh();

		this._stockItemCtrl = frappe.ui.form.make_control({
			parent: $el.find("#sm2-stock-f-item"),
			df: { fieldtype: "Link", fieldname: "item_code", options: "Item", placeholder: "All Items", onchange: () => this.load_stock_table() },
			render_input: true,
			only_input: true,
		});
		this._stockItemCtrl.refresh();

		$el.find("#sm2-stock-f-from, #sm2-stock-f-to, #sm2-stock-f-zero").on("change", () => this.load_stock_table());
		$el.find("#sm2-stock-f-clear").on("click", () => {
			this._stockCompanyCtrl.set_value("");
			this._stockWarehouseCtrl.set_value("");
			this._stockItemCtrl.set_value("");
			$el.find("#sm2-stock-f-from").val("");
			$el.find("#sm2-stock-f-to").val("");
			$el.find("#sm2-stock-f-zero").prop("checked", false);
			this.load_stock_table();
		});

		this.load_stock_table();
	}

	load_stock_table() {
		const $el = this.page.main.find("#sm2-stock");
		const filters = {
			company: this._stockCompanyCtrl.get_value(),
			warehouse: this._stockWarehouseCtrl.get_value(),
			item_code: this._stockItemCtrl.get_value(),
			from_date: $el.find("#sm2-stock-f-from").val(),
			to_date: $el.find("#sm2-stock-f-to").val(),
			include_zero_stock_items: $el.find("#sm2-stock-f-zero").is(":checked") ? 1 : 0,
		};
		$el.find("#sm2-stock-table").html('<div class="sm2-empty">Loading…</div>');
		frappe.call({ method: "scrap_management.api.get_scrap_stock_balance", args: { filters: JSON.stringify(filters) } }).then((r) => {
			const { columns, data } = r.message || { columns: [], data: [] };
			$el.find("#sm2-stock-table").html(`
				<table class="sm2-table"><thead><tr>${columns.map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
				<tbody>${
					data.length
						? data
								.map(
									(row) =>
										`<tr>${columns
											.map((c) => {
												let v = row[c.fieldname];
												if (c.fieldtype === "Link" && v) v = sm_smart_link(c.options, v);
												else if (["Currency", "Float", "Int"].includes(c.fieldtype)) v = `<span class="sm2-mono">${c.fieldtype === "Currency" ? sm_money(v) : v ?? ""}</span>`;
												else v = frappe.utils.escape_html(v == null ? "" : String(v));
												return `<td>${v}</td>`;
											})
											.join("")}</tr>`
								)
								.join("")
						: `<tr><td colspan="${columns.length}" class="sm2-empty">No records found.</td></tr>`
				}</tbody></table>
			`);
		});
	}

	// "+ Create Sales Order" entry point on the Sales Order screen — full-page
	// form (same pattern as New Scrap / New Quotation, not a popup). Supports two
	// modes: mapped from a Scrap's approved Quotation (original flow), or a fully
	// direct/manual Sales Order with no Scrap involved at all — this custom page
	// doubles as this bench's general Sales Order screen, not every order here is
	// scrap-related.
	open_new_sales_order() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Scrap",
				filters: { status: "Quotation Approved" },
				fields: ["name", "selected_customer", "approved_sale_value", "selected_quotation"],
				limit_page_length: 50,
			},
		}).then((r) => {
			const scraps = r.message || [];
			const scrapByName = {};
			scraps.forEach((s) => (scrapByName[s.name] = s));
			// Users identify by Quotation, not by the Scrap ID behind it — label each
			// option with its Quotation, keeping the Scrap in parentheses only to stay
			// unique when one Quotation bundles more than one Scrap.
			const scrapByQuotationOption = {};
			const quotationOptions = scraps
				.filter((s) => s.selected_quotation)
				.map((s) => {
					const label = `${s.selected_quotation} (${s.name})`;
					scrapByQuotationOption[label] = s.name;
					return label;
				});

			this._detail_return_page = this._last_nav_page || "salesorder";
			this.page.main.find(".sm2-nav-btn").removeClass("active");
			this.page.main.find(".sm2-page").removeClass("active");
			const $el = this.page.main.find("#sm2-detail").addClass("active");

			$el.html(`
				<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Sales Order</div>
				<div class="sm2-detail-head">
					<h1 class="sm2-detail-title">New Sales Order</h1>
					<div style="display:flex;gap:8px;">
						<button class="sm2-btn" id="sm2-new-so-back">&larr; Back</button>
						<button class="sm2-btn primary" id="sm2-new-so-save">Create Sales Order</button>
					</div>
				</div>
				<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
				<div class="sm2-card numbered" style="margin-bottom:14px;">
					<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Sales Order Details</h3></div>
					<div id="sm2-new-so-fields" style="padding:6px 18px 18px;"></div>
				</div>
				<div class="sm2-card numbered">
					<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Items</h3></div>
					<div style="padding:6px 18px 18px;">
						<div id="sm2-new-so-preview">
							<div class="sm2-item-grid">
								<div class="sm2-item-grid-row sm2-item-grid-head">
									<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:0.8;">UOM</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div><div style="flex:1.2;">Attachment</div>
								</div>
								<div id="sm2-new-so-item-rows"></div>
								<div id="sm2-new-so-item-empty" class="sm2-empty">Select a Scrap above to load its approved Quotation items.</div>
							</div>
						</div>
						<div id="sm2-new-so-manual" style="display:none;">
							<div class="sm2-item-grid">
								<div class="sm2-item-grid-row sm2-item-grid-head">
									<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div><div style="flex:1.2;">Attachment</div><div style="width:40px;flex:0 0 40px;"></div>
								</div>
								<div id="sm2-new-so-manual-rows"></div>
								<div id="sm2-new-so-manual-empty" class="sm2-empty">No items added yet.</div>
							</div>
							<button class="sm2-btn" id="sm2-new-so-add-item" style="margin-top:10px;">+ Add Item</button>
						</div>
					</div>
				</div>
			`);
			$el.find("[data-back-to-list], #sm2-new-so-back").on("click", () => this.go(this._detail_return_page));

			const fg = new frappe.ui.FieldGroup({
				parent: $el.find("#sm2-new-so-fields"),
				fields: [
					{
						fieldtype: "Select",
						fieldname: "order_mode",
						label: "Order Type",
						options: "From Scrap Quotation\nDirect (No Scrap)",
						default: scraps.length ? "From Scrap Quotation" : "Direct (No Scrap)",
						reqd: 1,
						onchange: () => refreshMode(),
					},
					{ fieldtype: "Column Break" },
					{
						fieldtype: "Select",
						fieldname: "quotation",
						label: "Quotation (Approved)",
						options: ["", ...quotationOptions].join("\n"),
						depends_on: "eval:doc.order_mode=='From Scrap Quotation'",
						onchange: () => loadScrapPreview(scrapByQuotationOption[fg.get_value("quotation")]),
					},
					{
						fieldtype: "Link",
						fieldname: "customer",
						label: "Customer",
						options: "Customer",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)'",
					},
					{ fieldtype: "Section Break" },
					{ fieldtype: "Data", fieldname: "buyer_display", label: "Buyer", read_only: 1, depends_on: "eval:doc.order_mode=='From Scrap Quotation'" },
					{ fieldtype: "Date", fieldname: "delivery_date", label: "Expected Delivery Date", default: frappe.datetime.add_days(frappe.datetime.get_today(), 3), reqd: 1 },
				],
			});
			fg.make();

			const $preview = $el.find("#sm2-new-so-preview");
			const $manual = $el.find("#sm2-new-so-manual");
			const $itemRows = $el.find("#sm2-new-so-item-rows");
			const $itemEmpty = $el.find("#sm2-new-so-item-empty");

			const refreshMode = () => {
				const isDirect = fg.get_value("order_mode") === "Direct (No Scrap)";
				$preview.toggle(!isDirect);
				$manual.toggle(isDirect);
			};
			refreshMode();

			const previewAttachControls = {}; // item_code -> live Attach control, read at save time
			const loadScrapPreview = (scrapName) => {
				const scrap = scrapByName[scrapName];
				fg.set_value("buyer_display", (scrap && scrap.selected_customer) || "");
				Object.keys(previewAttachControls).forEach((k) => delete previewAttachControls[k]);
				if (!scrap || !scrap.selected_quotation) {
					$itemRows.empty();
					$itemEmpty.show();
					return;
				}
				frappe.call({ method: "frappe.client.get", args: { doctype: "Quotation", name: scrap.selected_quotation }, freeze: true }).then((r2) => {
					const items = (r2.message && r2.message.items) || [];
					$itemEmpty.toggle(!items.length);
					$itemRows.html(
						items
							.map(
								(it) => `<div class="sm2-item-grid-row" data-item="${frappe.utils.escape_html(it.item_code)}">
							<div style="flex:2;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item_code)}</div>
							<div style="flex:0.8;min-width:0;" class="sm2-mono">${it.qty}</div>
							<div style="flex:0.8;min-width:0;">${it.uom || ""}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.rate)}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.amount)}</div>
							<div class="sm2-so-preview-attach-cell" style="flex:1.2;min-width:0;"></div>
						</div>`
							)
							.join("")
					);
					$itemRows.find(".sm2-item-grid-row").each((_, el) => {
						const $row = $(el);
						const itemCode = $row.data("item");
						const attach_control = frappe.ui.form.make_control({
							parent: $row.find(".sm2-so-preview-attach-cell"),
							df: { fieldtype: "Attach", fieldname: "custom_attachment" },
							render_input: true,
							only_input: true,
						});
						attach_control.refresh();
						previewAttachControls[itemCode] = attach_control;
					});
				});
			};

			// ---- Direct-mode manual item entry ----
			const manualRows = [];
			const $manualBody = $el.find("#sm2-new-so-manual-rows");
			const $manualEmpty = $el.find("#sm2-new-so-manual-empty");

			const addManualRow = () => {
				$manualEmpty.hide();
				const $row = $(`<div class="sm2-item-grid-row">
					<div class="sm2-item-cell" style="flex:2;min-width:0;"></div>
					<div style="flex:0.8;min-width:0;"><input type="number" step="any" class="sm2-input sm2-so-qty" style="width:100%;box-sizing:border-box;" placeholder="Qty"></div>
					<div style="flex:1;min-width:0;"><input type="number" step="any" class="sm2-input sm2-so-rate" style="width:100%;box-sizing:border-box;" placeholder="Rate"></div>
					<div style="flex:1;min-width:0;" class="sm2-mono sm2-so-amount">₹0</div>
					<div class="sm2-so-attach-cell" style="flex:1.2;min-width:0;"></div>
					<div style="width:40px;flex:0 0 40px;"><button type="button" class="sm2-btn danger" style="padding:0 10px;">&times;</button></div>
				</div>`);
				$manualBody.append($row);
				const item_control = frappe.ui.form.make_control({
					parent: $row.find(".sm2-item-cell"),
					df: { fieldtype: "Link", fieldname: "item_code", options: "Item", placeholder: "Search Item" },
					render_input: true,
					only_input: true,
				});
				item_control.refresh();
				const attach_control = frappe.ui.form.make_control({
					parent: $row.find(".sm2-so-attach-cell"),
					df: { fieldtype: "Attach", fieldname: "custom_attachment" },
					render_input: true,
					only_input: true,
				});
				attach_control.refresh();
				const recalc = () => {
					const amount = (parseFloat(row.$qty.val()) || 0) * (parseFloat(row.$rate.val()) || 0);
					row.$amount.text(sm_money(amount));
				};
				const row = { item_control, attach_control, $qty: $row.find(".sm2-so-qty"), $rate: $row.find(".sm2-so-rate"), $amount: $row.find(".sm2-so-amount") };
				row.$qty.on("input", recalc);
				row.$rate.on("input", recalc);
				manualRows.push(row);
				$row.find(".sm2-btn.danger").on("click", () => {
					manualRows.splice(manualRows.indexOf(row), 1);
					$row.remove();
					if (!manualRows.length) $manualEmpty.show();
				});
			};
			$el.find("#sm2-new-so-add-item").on("click", addManualRow);
			addManualRow();

			$el.find("#sm2-new-so-save").on("click", () => {
				const values = fg.get_values();
				if (!values) return;

				if (values.order_mode === "Direct (No Scrap)") {
					const items = manualRows
						.map((row) => ({
							item_code: row.item_control.get_value(),
							qty: parseFloat(row.$qty.val()) || 0,
							rate: parseFloat(row.$rate.val()) || 0,
							custom_attachment: row.attach_control.get_value(),
						}))
						.filter((row) => row.item_code && row.qty > 0);
					if (!values.customer) {
						frappe.msgprint(__("Select a Customer."));
						return;
					}
					if (!items.length) {
						frappe.msgprint(__("Add at least one Item with a valid Quantity."));
						return;
					}
					frappe.call({
						method: "frappe.client.insert",
						args: { doc: { doctype: "Sales Order", customer: values.customer, delivery_date: values.delivery_date, items } },
						freeze: true,
					}).then((r3) => {
						if (!r3.message) return;
						frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
							frappe.show_alert({ message: __("Sales Order {0} created.", [r3.message.name]), indicator: "green" });
							this.open_entity_detail("Sales Order", r3.message.name);
						});
					});
					return;
				}

				if (!values.quotation) {
					frappe.msgprint(__("Select a Quotation."));
					return;
				}
				const scrapName = scrapByQuotationOption[values.quotation];
				frappe.call({ method: "frappe.client.get_value", args: { doctype: "Scrap", filters: scrapName, fieldname: "selected_quotation" } })
					.then((r0) => sm_ensure_quotation_submitted(r0.message && r0.message.selected_quotation))
					.then(() =>
						frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_order", args: { scrap_name: scrapName }, freeze: true })
					)
					.then((r2) => {
						const mapped = r2.message;
						if (!mapped) return;
						(mapped.items || []).forEach((row) => {
							row.delivery_date = values.delivery_date;
							const attach_control = previewAttachControls[row.item_code];
							if (attach_control) row.custom_attachment = attach_control.get_value();
						});
						frappe.call({ method: "frappe.client.insert", args: { doc: mapped }, freeze: true }).then((r3) => {
							frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
								frappe.show_alert({ message: __("Sales Order {0} created.", [r3.message.name]), indicator: "green" });
								this.open_entity_detail("Sales Order", r3.message.name);
							});
						});
					});
			});
		});
	}

	// ---------------- Delivery Note ----------------
	// Delivery Notes are only ever created from a Sales Order's "Create Delivery
	// Note" action (or the Closure screen) — there's no standalone "+ New" entry
	// point here, this screen exists so an already-created Delivery Note can be
	// opened directly and printed without going through its Sales Order first.
	render_delivery_note_screen() {
		const $el = this.page.main.find("#sm2-deliverynote");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Delivery Note</h1>
			<p class="sm2-sub">Standard ERPNext Delivery Notes linked to Scrap via <span class="sm2-mono">custom_scrap</span>.</p></div></div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-dn-table"><div class="sm2-empty">Loading…</div></div></div>
		`);
		this.load_delivery_notes();
	}

	load_delivery_notes() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Delivery Note",
				fields: ["name", "customer", "customer_name", "custom_scrap", "posting_date", "total_qty", "per_billed", "status", "docstatus"],
				filters: { custom_scrap: ["is", "set"] },
				order_by: "creation desc",
				limit_page_length: 100,
			},
		}).then((r) => {
			const rows = r.message || [];
			this.page.main.find("#sm2-dn-table").html(`
				<table class="sm2-table"><thead><tr>
					<th>Delivery Note</th><th>Scrap</th><th>Customer</th><th>Posting Date</th><th>Qty</th><th>Billed %</th><th>Status</th><th>Action</th>
				</tr></thead>
				<tbody>${
					rows.length
						? rows
								.map(
									(row) => `<tr>
								<td>${sm_entity_link("Delivery Note", row.name)}</td>
								<td>${sm_scrap_link(row.custom_scrap)}</td>
								<td>${frappe.utils.escape_html(row.customer_name || row.customer || "")}</td>
								<td>${row.posting_date || ""}</td>
								<td class="sm2-mono">${row.total_qty || 0}</td>
								<td class="sm2-mono">${flt(row.per_billed).toFixed(0)}%</td>
								<td>${sm_pill(row.status)}</td>
								<td>
									<button class="sm2-btn" data-dn-print="${row.name}">Print</button>
									<button class="sm2-btn" data-dn-gatepass="${row.name}">Gate Pass</button>
									${
										row.docstatus === 1
											? ` <button class="sm2-btn danger" data-dn-cancel="${row.name}">Cancel</button>`
											: ` <button class="sm2-btn danger" data-dn-delete="${row.name}">Delete</button>`
									}
								</td>
							</tr>`
								)
								.join("")
						: `<tr><td colspan="8" class="sm2-empty">No Delivery Notes found.</td></tr>`
				}</tbody></table>
			`);
			this.page.main.find("[data-dn-print]").on("click", (e) => sm_print("Delivery Note", $(e.currentTarget).data("dn-print")));
			this.page.main.find("[data-dn-gatepass]").on("click", (e) => sm_print("Delivery Note", $(e.currentTarget).data("dn-gatepass"), "Scrap Gate Pass"));
			this.page.main.find("[data-dn-delete]").on("click", (e) => {
				sm_confirm_delete("Delivery Note", $(e.currentTarget).data("dn-delete"), () => this.load_delivery_notes());
			});
			this.page.main.find("[data-dn-cancel]").on("click", (e) => {
				sm_confirm_cancel("Delivery Note", $(e.currentTarget).data("dn-cancel"), () => this.load_delivery_notes());
			});
		});
	}

	// ---------------- Sales Invoice ----------------
	render_sales_invoice_screen() {
		const $el = this.page.main.find("#sm2-salesinvoice");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Sales Invoice</h1>
			<p class="sm2-sub">Standard ERPNext Sales Invoices linked to Scrap via <span class="sm2-mono">custom_scrap</span>.</p></div>
			<button class="sm2-btn primary" id="sm2-new-si-btn">+ New Sales Invoice</button></div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-si-table"><div class="sm2-empty">Loading…</div></div></div>
		`);
		$el.find("#sm2-new-si-btn").on("click", () => this.open_new_sales_invoice());
		this.load_sales_invoices();
	}

	load_sales_invoices() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Sales Invoice",
				fields: ["name", "customer", "customer_name", "custom_scrap", "posting_date", "grand_total", "outstanding_amount", "status", "docstatus"],
				filters: { custom_scrap: ["is", "set"] },
				order_by: "creation desc",
				limit_page_length: 100,
			},
		}).then((r) => {
			const rows = r.message || [];
			this.page.main.find("#sm2-si-table").html(`
				<table class="sm2-table"><thead><tr>
					<th>Sales Invoice</th><th>Scrap</th><th>Customer</th><th>Posting Date</th><th>Grand Total</th><th>Outstanding</th><th>Status</th><th>Action</th>
				</tr></thead>
				<tbody>${
					rows.length
						? rows
								.map(
									(row) => `<tr>
								<td>${sm_entity_link("Sales Invoice", row.name)}</td>
								<td>${sm_scrap_link(row.custom_scrap)}</td>
								<td>${frappe.utils.escape_html(row.customer_name || row.customer || "")}</td>
								<td>${row.posting_date || ""}</td>
								<td class="sm2-mono">${sm_money(row.grand_total)}</td>
								<td class="sm2-mono">${sm_money(row.outstanding_amount)}</td>
								<td>${sm_pill(row.status)}</td>
								<td>
									<button class="sm2-btn" data-si-print="${row.name}">Print</button>
									${
										row.docstatus === 1 && flt(row.outstanding_amount) > 0
											? ` <button class="sm2-btn primary" data-si-pay="${row.name}" data-scrap="${row.custom_scrap}">Record Payment</button>`
											: ""
									}
									${
										row.docstatus === 1
											? ` <button class="sm2-btn danger" data-si-cancel="${row.name}">Cancel</button>`
											: ` <button class="sm2-btn danger" data-si-delete="${row.name}">Delete</button>`
									}
								</td>
							</tr>`
								)
								.join("")
						: `<tr><td colspan="8" class="sm2-empty">No Sales Invoices found.</td></tr>`
				}</tbody></table>
			`);
			this.page.main.find("[data-si-print]").on("click", (e) => sm_print("Sales Invoice", $(e.currentTarget).data("si-print")));
			this.page.main.find("[data-si-pay]").on("click", (e) => {
				const $btn = $(e.currentTarget);
				this.open_payment_dialog($btn.data("si-pay"), $btn.data("scrap"), () => this.load_sales_invoices());
			});
			this.page.main.find("[data-si-delete]").on("click", (e) => {
				sm_confirm_delete("Sales Invoice", $(e.currentTarget).data("si-delete"), () => this.load_sales_invoices());
			});
			this.page.main.find("[data-si-cancel]").on("click", (e) => {
				sm_confirm_cancel("Sales Invoice", $(e.currentTarget).data("si-cancel"), () => this.load_sales_invoices());
			});
		});
	}

	// ---------------- Payment Entry ----------------
	render_payment_entry_screen() {
		const $el = this.page.main.find("#sm2-paymententry");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Payment Entry</h1>
			<p class="sm2-sub">Standard ERPNext Payment Entries linked to Scrap via <span class="sm2-mono">custom_scrap</span>.</p></div>
			<button class="sm2-btn primary" id="sm2-new-pe-btn">+ New Payment Entry</button></div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-pe-table"><div class="sm2-empty">Loading…</div></div></div>
		`);
		$el.find("#sm2-new-pe-btn").on("click", () => this.open_new_payment_entry());
		this.load_payment_entries();
	}

	load_payment_entries() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Payment Entry",
				fields: ["name", "party", "party_name", "custom_scrap", "posting_date", "paid_amount", "mode_of_payment", "reference_no", "status", "docstatus"],
				filters: { custom_scrap: ["is", "set"] },
				order_by: "creation desc",
				limit_page_length: 100,
			},
		}).then((r) => {
			const rows = r.message || [];
			this.page.main.find("#sm2-pe-table").html(`
				<table class="sm2-table"><thead><tr>
					<th>Payment Entry</th><th>Scrap</th><th>Party</th><th>Posting Date</th><th>Paid Amount</th><th>Mode of Payment</th><th>Reference No</th><th>Status</th><th>Action</th>
				</tr></thead>
				<tbody>${
					rows.length
						? rows
								.map(
									(row) => `<tr>
								<td>${sm_entity_link("Payment Entry", row.name)}</td>
								<td>${sm_scrap_link(row.custom_scrap)}</td>
								<td>${frappe.utils.escape_html(row.party_name || row.party || "")}</td>
								<td>${row.posting_date || ""}</td>
								<td class="sm2-mono">${sm_money(row.paid_amount)}</td>
								<td>${frappe.utils.escape_html(row.mode_of_payment || "")}</td>
								<td>${frappe.utils.escape_html(row.reference_no || "")}</td>
								<td>${sm_pill(row.status || (row.docstatus === 1 ? "Submitted" : "Draft"))}</td>
								<td>
									<button class="sm2-btn" data-pe-print="${row.name}">Print</button>
									${
										row.docstatus === 1
											? ` <button class="sm2-btn danger" data-pe-cancel="${row.name}">Cancel</button>`
											: ` <button class="sm2-btn danger" data-pe-delete="${row.name}">Delete</button>`
									}
								</td>
							</tr>`
								)
								.join("")
						: `<tr><td colspan="9" class="sm2-empty">No Payment Entries found.</td></tr>`
				}</tbody></table>
			`);
			this.page.main.find("[data-pe-print]").on("click", (e) => sm_print("Payment Entry", $(e.currentTarget).data("pe-print")));
			this.page.main.find("[data-pe-delete]").on("click", (e) => {
				sm_confirm_delete("Payment Entry", $(e.currentTarget).data("pe-delete"), () => this.load_payment_entries());
			});
			this.page.main.find("[data-pe-cancel]").on("click", (e) => {
				sm_confirm_cancel("Payment Entry", $(e.currentTarget).data("pe-cancel"), () => this.load_payment_entries());
			});
		});
	}

	// "+ New Sales Invoice" entry point — full-page form (same pattern as New
	// Sales Order): mapped from an unbilled Delivery Note, or fully direct/manual
	// with no Scrap involved.
	open_new_sales_invoice() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Delivery Note",
				filters: { custom_scrap: ["is", "set"], docstatus: 1, per_billed: ["<", 100] },
				fields: ["name", "customer", "customer_name"],
				limit_page_length: 50,
			},
		}).then((r) => {
			const dns = r.message || [];
			const dnByName = {};
			dns.forEach((d) => (dnByName[d.name] = d));

			this._detail_return_page = this._last_nav_page || "salesinvoice";
			this.page.main.find(".sm2-nav-btn").removeClass("active");
			this.page.main.find(".sm2-page").removeClass("active");
			const $el = this.page.main.find("#sm2-detail").addClass("active");

			$el.html(`
				<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Sales Invoice</div>
				<div class="sm2-detail-head">
					<h1 class="sm2-detail-title">New Sales Invoice</h1>
					<div style="display:flex;gap:8px;">
						<button class="sm2-btn" id="sm2-new-si2-back">&larr; Back</button>
						<button class="sm2-btn primary" id="sm2-new-si2-save">Create Sales Invoice</button>
					</div>
				</div>
				<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
				<div class="sm2-card numbered" style="margin-bottom:14px;">
					<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Sales Invoice Details</h3></div>
					<div id="sm2-new-si2-fields" style="padding:6px 18px 18px;"></div>
				</div>
				<div class="sm2-card numbered">
					<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Items</h3></div>
					<div style="padding:6px 18px 18px;">
						<div id="sm2-new-si2-preview">
							<div class="sm2-item-grid">
								<div class="sm2-item-grid-row sm2-item-grid-head">
									<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div>
								</div>
								<div id="sm2-new-si2-item-rows"></div>
								<div id="sm2-new-si2-item-empty" class="sm2-empty">Select a Delivery Note above to load its unbilled items.</div>
							</div>
						</div>
						<div id="sm2-new-si2-manual" style="display:none;">
							<div class="sm2-item-grid">
								<div class="sm2-item-grid-row sm2-item-grid-head">
									<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div><div style="width:40px;flex:0 0 40px;"></div>
								</div>
								<div id="sm2-new-si2-manual-rows"></div>
								<div id="sm2-new-si2-manual-empty" class="sm2-empty">No items added yet.</div>
							</div>
							<button class="sm2-btn" id="sm2-new-si2-add-item" style="margin-top:10px;">+ Add Item</button>
						</div>
					</div>
				</div>
			`);
			$el.find("[data-back-to-list], #sm2-new-si2-back").on("click", () => this.go(this._detail_return_page));

			const fg = new frappe.ui.FieldGroup({
				parent: $el.find("#sm2-new-si2-fields"),
				fields: [
					{
						fieldtype: "Select",
						fieldname: "order_mode",
						label: "Order Type",
						options: "From Delivery Note\nDirect (No Scrap)",
						default: dns.length ? "From Delivery Note" : "Direct (No Scrap)",
						reqd: 1,
						onchange: () => refreshMode(),
					},
					{ fieldtype: "Column Break" },
					{
						fieldtype: "Select",
						fieldname: "delivery_note",
						label: "Delivery Note",
						options: ["", ...dns.map((d) => d.name)].join("\n"),
						depends_on: "eval:doc.order_mode=='From Delivery Note'",
						onchange: () => loadDnPreview(fg.get_value("delivery_note")),
					},
					{ fieldtype: "Link", fieldname: "customer", label: "Customer", options: "Customer", depends_on: "eval:doc.order_mode=='Direct (No Scrap)'" },
					{ fieldtype: "Section Break" },
					{ fieldtype: "Data", fieldname: "buyer_display", label: "Buyer", read_only: 1, depends_on: "eval:doc.order_mode=='From Delivery Note'" },
					{ fieldtype: "Date", fieldname: "posting_date", label: "Posting Date", default: frappe.datetime.get_today(), reqd: 1 },
				],
			});
			fg.make();

			const $preview = $el.find("#sm2-new-si2-preview");
			const $manual = $el.find("#sm2-new-si2-manual");
			const $itemRows = $el.find("#sm2-new-si2-item-rows");
			const $itemEmpty = $el.find("#sm2-new-si2-item-empty");
			let mappedDoc = null;

			const refreshMode = () => {
				const isDirect = fg.get_value("order_mode") === "Direct (No Scrap)";
				$preview.toggle(!isDirect);
				$manual.toggle(isDirect);
			};
			refreshMode();

			const loadDnPreview = (dnName) => {
				const dn = dnByName[dnName];
				fg.set_value("buyer_display", (dn && dn.customer_name) || "");
				mappedDoc = null;
				if (!dnName) {
					$itemRows.empty();
					$itemEmpty.show();
					return;
				}
				frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_invoice", args: { delivery_note_name: dnName }, freeze: true }).then((r2) => {
					mappedDoc = r2.message;
					const items = (mappedDoc && mappedDoc.items) || [];
					$itemEmpty.toggle(!items.length);
					$itemRows.html(
						items
							.map(
								(it) => `<div class="sm2-item-grid-row">
							<div style="flex:2;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item_code)}</div>
							<div style="flex:0.8;min-width:0;" class="sm2-mono">${it.qty}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.rate)}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.amount)}</div>
						</div>`
							)
							.join("")
					);
				});
			};

			// ---- Direct-mode manual item entry ----
			const manualRows = [];
			const $manualBody = $el.find("#sm2-new-si2-manual-rows");
			const $manualEmpty = $el.find("#sm2-new-si2-manual-empty");

			const addManualRow = () => {
				$manualEmpty.hide();
				const $row = $(`<div class="sm2-item-grid-row">
					<div class="sm2-item-cell" style="flex:2;min-width:0;"></div>
					<div style="flex:0.8;min-width:0;"><input type="number" step="any" class="sm2-input sm2-si-qty" style="width:100%;box-sizing:border-box;" placeholder="Qty"></div>
					<div style="flex:1;min-width:0;"><input type="number" step="any" class="sm2-input sm2-si-rate" style="width:100%;box-sizing:border-box;" placeholder="Rate"></div>
					<div style="flex:1;min-width:0;" class="sm2-mono sm2-si-amount">₹0</div>
					<div style="width:40px;flex:0 0 40px;"><button type="button" class="sm2-btn danger" style="padding:0 10px;">&times;</button></div>
				</div>`);
				$manualBody.append($row);
				const item_control = frappe.ui.form.make_control({
					parent: $row.find(".sm2-item-cell"),
					df: { fieldtype: "Link", fieldname: "item_code", options: "Item", placeholder: "Search Item" },
					render_input: true,
					only_input: true,
				});
				item_control.refresh();
				const recalc = () => {
					const amount = (parseFloat(row.$qty.val()) || 0) * (parseFloat(row.$rate.val()) || 0);
					row.$amount.text(sm_money(amount));
				};
				const row = { item_control, $qty: $row.find(".sm2-si-qty"), $rate: $row.find(".sm2-si-rate"), $amount: $row.find(".sm2-si-amount") };
				row.$qty.on("input", recalc);
				row.$rate.on("input", recalc);
				manualRows.push(row);
				$row.find(".sm2-btn.danger").on("click", () => {
					manualRows.splice(manualRows.indexOf(row), 1);
					$row.remove();
					if (!manualRows.length) $manualEmpty.show();
				});
			};
			$el.find("#sm2-new-si2-add-item").on("click", addManualRow);
			addManualRow();

			$el.find("#sm2-new-si2-save").on("click", () => {
				const values = fg.get_values();
				if (!values) return;

				if (values.order_mode === "Direct (No Scrap)") {
					const items = manualRows
						.map((row) => ({ item_code: row.item_control.get_value(), qty: parseFloat(row.$qty.val()) || 0, rate: parseFloat(row.$rate.val()) || 0 }))
						.filter((row) => row.item_code && row.qty > 0);
					if (!values.customer) {
						frappe.msgprint(__("Select a Customer."));
						return;
					}
					if (!items.length) {
						frappe.msgprint(__("Add at least one Item with a valid Quantity."));
						return;
					}
					frappe.call({
						method: "frappe.client.insert",
						args: { doc: { doctype: "Sales Invoice", customer: values.customer, posting_date: values.posting_date, items } },
						freeze: true,
					}).then((r3) => {
						if (!r3.message) return;
						frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
							frappe.show_alert({ message: __("Sales Invoice {0} created.", [r3.message.name]), indicator: "green" });
							this.open_entity_detail("Sales Invoice", r3.message.name);
						});
					});
					return;
				}

				if (!mappedDoc) {
					frappe.msgprint(__("Select a Delivery Note."));
					return;
				}
				mappedDoc.posting_date = values.posting_date;
				frappe.call({ method: "frappe.client.insert", args: { doc: mappedDoc }, freeze: true }).then((r3) => {
					frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
						frappe.show_alert({ message: __("Sales Invoice {0} created.", [r3.message.name]), indicator: "green" });
						this.open_entity_detail("Sales Invoice", r3.message.name);
					});
				});
			});
		});
	}

	// "+ New Payment Entry" entry point — full-page form. Mapped from an unpaid
	// Sales Invoice, or fully direct/manual with no Scrap involved.
	open_new_payment_entry() {
		frappe.call({
			method: "frappe.client.get_list",
			args: {
				doctype: "Sales Invoice",
				filters: { custom_scrap: ["is", "set"], docstatus: 1, outstanding_amount: [">", 0] },
				fields: ["name", "customer", "customer_name", "outstanding_amount"],
				limit_page_length: 50,
			},
		}).then((r) => {
			const invoices = r.message || [];
			const invByName = {};
			invoices.forEach((i) => (invByName[i.name] = i));

			this._detail_return_page = this._last_nav_page || "paymententry";
			this.page.main.find(".sm2-nav-btn").removeClass("active");
			this.page.main.find(".sm2-page").removeClass("active");
			const $el = this.page.main.find("#sm2-detail").addClass("active");

			$el.html(`
				<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Payment Entry</div>
				<div class="sm2-detail-head">
					<h1 class="sm2-detail-title">New Payment Entry</h1>
					<div style="display:flex;gap:8px;">
						<button class="sm2-btn" id="sm2-new-pe2-back">&larr; Back</button>
						<button class="sm2-btn primary" id="sm2-new-pe2-save">Record Payment</button>
					</div>
				</div>
				<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
				<div class="sm2-card numbered">
					<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Payment Details</h3></div>
					<div id="sm2-new-pe2-fields" style="padding:6px 18px 18px;"></div>
				</div>
			`);
			$el.find("[data-back-to-list], #sm2-new-pe2-back").on("click", () => this.go(this._detail_return_page));

			const fg = new frappe.ui.FieldGroup({
				parent: $el.find("#sm2-new-pe2-fields"),
				fields: [
					{
						fieldtype: "Select",
						fieldname: "order_mode",
						label: "Order Type",
						options: "From Sales Invoice\nDirect (No Scrap)",
						default: invoices.length ? "From Sales Invoice" : "Direct (No Scrap)",
						reqd: 1,
					},
					{ fieldtype: "Column Break" },
					{
						fieldtype: "Select",
						fieldname: "sales_invoice",
						label: "Sales Invoice (Outstanding)",
						options: ["", ...invoices.map((i) => i.name)].join("\n"),
						depends_on: "eval:doc.order_mode=='From Sales Invoice'",
						onchange: () => loadSiPreview(fg.get_value("sales_invoice")),
					},
					{ fieldtype: "Section Break", depends_on: "eval:doc.order_mode=='Direct (No Scrap)'" },
					{
						fieldtype: "Select",
						fieldname: "payment_type",
						label: "Payment Type",
						options: "Receive\nPay",
						default: "Receive",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)'",
					},
					{
						fieldtype: "Select",
						fieldname: "party_type",
						label: "Party Type",
						options: "Customer\nSupplier\nEmployee",
						default: "Customer",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)'",
					},
					{ fieldtype: "Column Break", depends_on: "eval:doc.order_mode=='Direct (No Scrap)'" },
					{
						fieldtype: "Dynamic Link",
						fieldname: "party",
						label: "Buyer",
						options: "party_type",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)'",
					},
					{
						fieldtype: "Link",
						fieldname: "company",
						label: "Company",
						options: "Company",
						default: frappe.defaults.get_user_default("Company"),
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)'",
					},
					{ fieldtype: "Section Break", depends_on: "eval:doc.order_mode=='Direct (No Scrap)'" },
					{
						fieldtype: "Link",
						fieldname: "paid_from",
						label: "Account Paid From",
						options: "Account",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)' && doc.payment_type=='Pay'",
					},
					{
						fieldtype: "Link",
						fieldname: "paid_to",
						label: "Account Paid To",
						options: "Account",
						depends_on: "eval:doc.order_mode=='Direct (No Scrap)' && doc.payment_type!='Pay'",
					},
					{ fieldtype: "Section Break" },
					{ fieldtype: "Link", fieldname: "mode_of_payment", label: "Mode of Payment", options: "Mode of Payment", reqd: 1 },
					{ fieldtype: "Currency", fieldname: "paid_amount", label: "Amount", reqd: 1, onchange: () => updatePendingBalance() },
					{
						fieldtype: "Currency",
						fieldname: "pending_balance_display",
						label: "Pending Balance",
						read_only: 1,
						depends_on: "eval:doc.order_mode=='From Sales Invoice'",
					},
					{ fieldtype: "Column Break" },
					{ fieldtype: "Data", fieldname: "reference_no", label: "Reference No", reqd: 1 },
					{ fieldtype: "Date", fieldname: "reference_date", label: "Reference Date", default: frappe.datetime.get_today(), reqd: 1 },
				],
			});
			fg.make();

			let mappedPE = null;

			const updatePendingBalance = () => {
				const inv = invByName[fg.get_value("sales_invoice")];
				if (!inv) return;
				fg.set_value("pending_balance_display", Math.max(flt(inv.outstanding_amount) - flt(fg.get_value("paid_amount")), 0));
			};

			const loadSiPreview = (siName) => {
				mappedPE = null;
				if (!siName) return;
				frappe.call({ method: "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", args: { dt: "Sales Invoice", dn: siName }, freeze: true }).then((r2) => {
					mappedPE = r2.message;
					if (mappedPE) fg.set_value("paid_amount", mappedPE.paid_amount);
					updatePendingBalance();
				});
			};

			$el.find("#sm2-new-pe2-save").on("click", () => {
				const values = fg.get_values();
				if (!values) return;

				if (values.order_mode === "Direct (No Scrap)") {
					if (!values.party) {
						frappe.msgprint(__("Select a Buyer."));
						return;
					}
					frappe.call({
						method: "frappe.client.insert",
						args: {
							doc: {
								doctype: "Payment Entry",
								payment_type: values.payment_type,
								party_type: values.party_type,
								party: values.party,
								company: values.company,
								paid_from: values.payment_type === "Pay" ? values.paid_from : undefined,
								paid_to: values.payment_type !== "Pay" ? values.paid_to : undefined,
								mode_of_payment: values.mode_of_payment,
								paid_amount: values.paid_amount,
								received_amount: values.paid_amount,
								reference_no: values.reference_no,
								reference_date: values.reference_date,
							},
						},
						freeze: true,
					}).then((r3) => {
						if (!r3.message) return;
						frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
							frappe.show_alert({ message: __("Payment recorded."), indicator: "green" });
							this.open_entity_detail("Payment Entry", r3.message.name);
						});
					});
					return;
				}

				if (!mappedPE) {
					frappe.msgprint(__("Select a Sales Invoice."));
					return;
				}
				mappedPE.mode_of_payment = values.mode_of_payment;
				mappedPE.paid_amount = values.paid_amount;
				mappedPE.received_amount = values.paid_amount;
				mappedPE.reference_no = values.reference_no;
				mappedPE.reference_date = values.reference_date;
				if (mappedPE.references && mappedPE.references.length) mappedPE.references[0].allocated_amount = values.paid_amount;
				frappe.call({ method: "frappe.client.insert", args: { doc: mappedPE }, freeze: true }).then((r3) => {
					frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
						frappe.show_alert({ message: __("Payment recorded."), indicator: "green" });
						this.open_entity_detail("Payment Entry", r3.message.name);
					});
				});
			});
		});
	}

	// ---------------- Closure (with Delivery Note / Sales Invoice / Payment actions) ----------------
	render_closure_screen() {
		const $el = this.page.main.find("#sm2-closure");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Closure</h1>
			<p class="sm2-sub">Delivery Note → Gate Pass → Sales Invoice → Payment Entry → Scrap Closed.</p></div></div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-closure-table"><div class="sm2-empty">Loading…</div></div></div>
		`);
		this.load_closure();
	}

	load_closure() {
		frappe.call({ method: "scrap_management.api.get_report", args: { report_name: "Scrap Closure" } }).then((r) => {
			const rows = (r.message || {}).data || [];
			this.page.main.find("#sm2-closure-table").html(`
				<table class="sm2-table"><thead><tr>
					<th>Scrap</th><th>Customer</th><th>Sales Order</th><th>Delivery Note</th><th>Sales Invoice</th>
					<th>Invoice Amount</th><th>Pending Amount</th><th>Status</th><th>Action</th>
				</tr></thead>
				<tbody>${
					rows.length
						? rows
								.map(
									(row) => `<tr>
								<td>${sm_scrap_link(row.name)}</td>
								<td>${frappe.utils.escape_html(row.selected_customer || "")}</td>
								<td>${sm_entity_link("Sales Order", row.sales_order)}</td>
								<td>${sm_entity_link("Delivery Note", row.delivery_note)}</td>
								<td>${sm_entity_link("Sales Invoice", row.sales_invoice)}</td>
								<td class="sm2-mono">${sm_money(row.invoice_amount)}</td>
								<td class="sm2-mono">${sm_money(row.pending_amount)}</td>
								<td>${sm_pill(row.status)}</td>
								<td><button class="sm2-btn" data-closure-print="${row.name}">Print</button> <button class="sm2-btn danger" data-closure-delete="${row.name}">Delete</button> ${this.closure_action_button(row)}</td>
							</tr>`
								)
								.join("")
						: '<tr><td colspan="9" class="sm2-empty">No Sales Order created yet.</td></tr>'
				}</tbody></table>
			`);
			this.page.main.find("[data-closure-print]").on("click", (e) => sm_print("Scrap", $(e.currentTarget).data("closure-print"), "Scrap Print"));
			this.page.main.find("[data-closure-delete]").on("click", (e) => {
				sm_confirm_delete("Scrap", $(e.currentTarget).data("closure-delete"), () => this.load_closure());
			});
			this.page.main.find("[data-closure-action]").on("click", (e) => {
				const $btn = $(e.currentTarget);
				const action = $btn.data("closure-action");
				const scrap = $btn.data("scrap");
				const so = $btn.data("so");
				const dn = $btn.data("dn");
				const si = $btn.data("si");
				if (action === "delivery-note") this.create_delivery_note_flow(so);
				if (action === "sales-invoice") this.create_sales_invoice_flow(dn);
				if (action === "payment") this.open_payment_dialog(si, scrap);
			});
		});
	}

	closure_action_button(row) {
		if (row.status === "Closed") return `<span class="sm2-pill ok">Closed</span>`;
		if (!row.delivery_note)
			return `<button class="sm2-btn primary" data-closure-action="delivery-note" data-so="${row.sales_order}">Create Delivery Note</button>`;
		if (!row.sales_invoice)
			return `<button class="sm2-btn primary" data-closure-action="sales-invoice" data-dn="${row.delivery_note}">Create Sales Invoice</button>`;
		if (flt(row.pending_amount) > 0)
			return `<button class="sm2-btn primary" data-closure-action="payment" data-si="${row.sales_invoice}" data-scrap="${row.name}">Record Payment</button>`;
		return "";
	}

	create_delivery_note_flow(soName, on_done) {
		on_done = on_done || (() => this.load_closure());
		frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.make_delivery_note", args: { sales_order_name: soName }, freeze: true }).then((r) => {
			const mapped = r.message;
			if (!mapped) return;
			this._render_delivery_note_form(mapped, on_done);
		});
	}

	// Full-page creation form (not a dialog) — same pattern as New Scrap / New
	// Quotation / New Sales Order / New Sales Invoice / New Payment Entry.
	_render_delivery_note_form(mapped, on_done) {
		this._detail_return_page = this._last_nav_page || "salesorder";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Delivery Note</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">New Delivery Note — Gate Pass &amp; Handover</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-new-dn-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-new-dn-save">Create &amp; Dispatch</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Gate Pass &amp; Handover Details</h3></div>
				<div id="sm2-new-dn-fields" style="padding:6px 18px 18px;"></div>
			</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Scrap Quantity</h3></div>
				<div style="padding:6px 18px 18px;">
					<div class="sm2-item-grid">
						<div class="sm2-item-grid-row sm2-item-grid-head">
							<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:0.8;">UOM</div>
						</div>
						${
							(mapped.items || [])
								.map(
									(it) => `<div class="sm2-item-grid-row">
							<div style="flex:2;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item_code)}</div>
							<div style="flex:0.8;min-width:0;" class="sm2-mono">${it.qty}</div>
							<div style="flex:0.8;min-width:0;">${it.uom || ""}</div>
						</div>`
								)
								.join("") || `<div class="sm2-empty">No items.</div>`
						}
					</div>
				</div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-new-dn-back").on("click", () => this.go(this._detail_return_page));

		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-dn-fields"),
			fields: [
				{ fieldtype: "Attach", fieldname: "custom_gate_pass_no", label: "Upload Gate Pass" },
				{ fieldtype: "Data", fieldname: "custom_vehicle_number", label: "Vehicle Number" },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Data", fieldname: "custom_driver_name", label: "Driver Name" },
				{ fieldtype: "Data", fieldname: "custom_driver_mobile", label: "Driver Mobile" },
				{ fieldtype: "Section Break" },
				{ fieldtype: "Check", fieldname: "custom_handover_confirmed", label: "Handover Confirmed", default: 1 },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Check", fieldname: "custom_security_exit_confirmed", label: "Security Exit Confirmed" },
			],
		});
		fg.make();

		$el.find("#sm2-new-dn-save").on("click", () => {
			const values = fg.get_values();
			if (!values) return;
			const doc = Object.assign({}, mapped, values);
			if (values.custom_handover_confirmed) doc.custom_handover_datetime = frappe.datetime.now_datetime();
			if (values.custom_security_exit_confirmed) doc.custom_security_exit_datetime = frappe.datetime.now_datetime();
			frappe.call({ method: "frappe.client.insert", args: { doc }, freeze: true }).then((r2) => {
				frappe.call({ method: "frappe.client.submit", args: { doc: r2.message }, freeze: true }).then(() => {
					frappe.show_alert({ message: __("Delivery Note {0} created and dispatched.", [r2.message.name]), indicator: "green" });
					on_done(r2.message.name);
				});
			});
		});
	}

	// Full-page creation form (not a dialog/confirm) — same pattern as New Scrap /
	// New Quotation / New Sales Order.
	create_sales_invoice_flow(dnName, on_done) {
		on_done = on_done || ((name) => this.open_entity_detail("Sales Invoice", name));
		frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_invoice", args: { delivery_note_name: dnName }, freeze: true }).then((r) => {
			const mapped = r.message;
			if (!mapped) return;
			this._render_sales_invoice_form(mapped, on_done);
		});
	}

	_render_sales_invoice_form(mapped, on_done) {
		this._detail_return_page = this._last_nav_page || "closure";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		const itemsHtml = (mapped.items || [])
			.map(
				(it) => `<div class="sm2-item-grid-row">
				<div style="flex:2;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item_code)}</div>
				<div style="flex:0.8;min-width:0;" class="sm2-mono">${it.qty}</div>
				<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.rate)}</div>
				<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.amount)}</div>
			</div>`
			)
			.join("");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Sales Invoice</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">New Sales Invoice</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-new-si-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-new-si-save">Create Sales Invoice</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Sales Invoice Details</h3></div>
				<div id="sm2-new-si-fields" style="padding:6px 18px 18px;"></div>
			</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Items</h3></div>
				<div style="padding:6px 18px 18px;">
					<div class="sm2-item-grid">
						<div class="sm2-item-grid-row sm2-item-grid-head">
							<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div>
						</div>
						${itemsHtml || `<div class="sm2-empty">No items.</div>`}
					</div>
					<div style="padding:14px 0;font-size:13px;text-align:right;"><b>Grand Total: ${sm_money(mapped.grand_total)}</b></div>
				</div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-new-si-back").on("click", () => this.go(this._detail_return_page));

		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-si-fields"),
			fields: [
				{ fieldtype: "Data", fieldname: "customer_display", label: "Customer", read_only: 1, default: mapped.customer_name || mapped.customer },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Data", fieldname: "posting_date_display", label: "Posting Date", read_only: 1, default: mapped.posting_date },
			],
		});
		fg.make();

		$el.find("#sm2-new-si-save").on("click", () => {
			frappe.call({ method: "frappe.client.insert", args: { doc: mapped }, freeze: true }).then((r2) => {
				frappe.call({ method: "frappe.client.submit", args: { doc: r2.message }, freeze: true }).then(() => {
					frappe.show_alert({ message: __("Sales Invoice {0} created and submitted.", [r2.message.name]), indicator: "green" });
					on_done(r2.message.name);
				});
			});
		});
	}

	open_payment_dialog(siName, scrapName, on_done) {
		on_done = on_done || ((name) => this.open_entity_detail("Payment Entry", name));
		frappe.call({ method: "erpnext.accounts.doctype.payment_entry.payment_entry.get_payment_entry", args: { dt: "Sales Invoice", dn: siName }, freeze: true }).then((r) => {
			const pe = r.message;
			if (!pe) return;
			this._render_payment_entry_form(pe, scrapName, on_done);
		});
	}

	// Full-page creation form (not a Dialog) — same pattern as New Scrap / New
	// Quotation / New Sales Order.
	_render_payment_entry_form(pe, scrapName, on_done) {
		this._detail_return_page = this._last_nav_page || "closure";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; Record Payment</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">Record Payment${scrapName ? ` — ${scrapName}` : ""}</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-new-pe-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-new-pe-save">Record Payment</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Payment Details</h3></div>
				<div id="sm2-new-pe-fields" style="padding:6px 18px 18px;"></div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-new-pe-back").on("click", () => this.go(this._detail_return_page));

		const invoiceRef = (pe.references && pe.references[0]) || {};
		const outstandingAmount = flt(invoiceRef.outstanding_amount);
		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-pe-fields"),
			fields: [
				{ fieldtype: "Data", fieldname: "party_display", label: "Party", read_only: 1, default: pe.party },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Data", fieldname: "against_invoice_display", label: "Against Invoice", read_only: 1, default: invoiceRef.reference_name || "" },
				{ fieldtype: "Section Break" },
				{ fieldtype: "Link", fieldname: "mode_of_payment", label: "Mode of Payment", options: "Mode of Payment", reqd: 1 },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Date", fieldname: "posting_date", label: "Payment Date", default: pe.posting_date || frappe.datetime.get_today(), reqd: 1 },
				{ fieldtype: "Section Break" },
				{
					fieldtype: "Currency",
					fieldname: "paid_amount",
					label: "Amount",
					default: pe.paid_amount,
					reqd: 1,
					onchange: () => fg.set_value("pending_balance_display", Math.max(outstandingAmount - flt(fg.get_value("paid_amount")), 0)),
				},
				{ fieldtype: "Column Break" },
				{
					fieldtype: "Currency",
					fieldname: "pending_balance_display",
					label: "Pending Balance",
					read_only: 1,
					default: Math.max(outstandingAmount - flt(pe.paid_amount), 0),
				},
				{ fieldtype: "Section Break" },
				{ fieldtype: "Data", fieldname: "reference_no", label: "Reference No", reqd: 1 },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Date", fieldname: "reference_date", label: "Reference Date", default: frappe.datetime.get_today(), reqd: 1 },
			],
		});
		fg.make();

		$el.find("#sm2-new-pe-save").on("click", () => {
			const values = fg.get_values();
			if (!values) return;
			pe.mode_of_payment = values.mode_of_payment;
			pe.posting_date = values.posting_date;
			pe.paid_amount = values.paid_amount;
			pe.received_amount = values.paid_amount;
			pe.reference_no = values.reference_no;
			pe.reference_date = values.reference_date;
			if (pe.references && pe.references.length) pe.references[0].allocated_amount = values.paid_amount;
			frappe.call({ method: "frappe.client.insert", args: { doc: pe }, freeze: true }).then((r2) => {
				frappe.call({ method: "frappe.client.submit", args: { doc: r2.message }, freeze: true }).then(() => {
					frappe.show_alert({ message: __("Payment recorded."), indicator: "green" });
					on_done(r2.message.name);
				});
			});
		});
	}

	// ---------------- Quotations ----------------
	render_quotation_screen() {
		const $el = this.page.main.find("#sm2-quotation");
		$el.html(`
			<div class="sm2-hero"><div><h1 class="sm2-title">Quotations</h1>
			<p class="sm2-sub">One row per linked Scrap — a Quotation can bundle several Scraps' items together; only one Quotation gets selected per Scrap.</p></div>
			<button class="sm2-btn primary" id="sm2-new-quote-btn">+ New Quotation</button></div>
			<div class="sm2-card"><div class="sm2-tablewrap" id="sm2-quote-table"><div class="sm2-empty">Loading…</div></div></div>
		`);
		$el.find("#sm2-new-quote-btn").on("click", () => this.open_new_quotation());
		this.load_quotations();
	}

	load_quotations() {
		frappe.call({ method: "scrap_management.api.get_quotations_list" }).then((r) => this.render_quotation_table(r.message || []));
	}

	render_quotation_table(rows) {
		this.page.main.find("#sm2-quote-table").html(`
			<table class="sm2-table"><thead><tr>
				<th>Quotation</th><th>Scrap</th><th>Buyer</th><th>Scrap's Total</th><th>Date</th><th>Docstatus</th><th>Approval</th><th>Selected</th><th>Action</th>
			</tr></thead>
			<tbody>${
				rows.length
					? rows
							.map(
								(row) => `<tr>
							<td>${sm_entity_link("Quotation", row.name)}</td>
							<td>${sm_scrap_link(row.scrap)}</td>
							<td>${frappe.utils.escape_html(row.party_name || "")}</td>
							<td class="sm2-mono" style="${row.is_highest_total ? "font-weight:700;color:var(--p-ok)" : ""}">${sm_money(row.total)}</td>
							<td>${row.transaction_date || ""}</td>
							<td>${row.docstatus === 1 ? "Submitted" : "Draft"}</td>
							<td>${sm_pill(row.custom_approval_status)}</td>
							<td>${row.selected ? "Yes" : "No"}</td>
							<td>${this.quotation_action_button(row)}</td>
						</tr>`
							)
							.join("")
					: `<tr><td colspan="9" class="sm2-empty">No Quotations found.</td></tr>`
			}</tbody></table>
		`);
		this.page.main.find("[data-quote-action]").on("click", (e) => {
			const $btn = $(e.currentTarget);
			const action = $btn.data("quote-action");
			const name = $btn.data("name");
			const scrap = $btn.data("scrap");
			if (action === "send-approval") this.apply_quotation_workflow(name, "Send For Approval");
			if (action === "approve") this.apply_quotation_workflow(name, "Approve");
			if (action === "reject") this.apply_quotation_workflow(name, "Reject");
			if (action === "create-so") this.create_sales_order_flow(name, scrap);
			if (action === "print") sm_print("Quotation", name, "Quotation Print");
			if (action === "delete") sm_confirm_delete("Quotation", name, () => this.load_quotations());
		});
	}

	quotation_action_button(row) {
		// The approval workflow (custom_approval_status) runs entirely independent of
		// docstatus — a Quotation can be fully Approved while still docstatus 0 — so
		// these are additive, not mutually exclusive with the Submit action.
		const parts = [];
		if (row.custom_approval_status === "Draft")
			parts.push(`<button class="sm2-btn" data-quote-action="send-approval" data-name="${row.name}">Send For Approval</button>`);
		else if (row.custom_approval_status === "Pending Approval")
			parts.push(
				`<button class="sm2-btn primary" data-quote-action="approve" data-name="${row.name}">Approve</button>`,
				`<button class="sm2-btn" data-quote-action="reject" data-name="${row.name}">Reject</button>`
			);
		// Approved-but-not-selected happens when a later Quotation for the same Scrap
		// got approved instead (only one can be selected per Scrap) — Create Sales
		// Order must only ever act on this Scrap's own selected Quotation, and only
		// while this Scrap doesn't already have a Sales Order.
		else if (row.custom_approval_status === "Approved" && row.selected && !row.scrap_sales_order)
			parts.push(`<button class="sm2-btn primary" data-quote-action="create-so" data-name="${row.name}" data-scrap="${row.scrap}">Create Sales Order</button>`);
		parts.push(`<button class="sm2-btn" data-quote-action="print" data-name="${row.name}">Print</button>`);
		if (row.docstatus !== 1) parts.push(`<button class="sm2-btn danger" data-quote-action="delete" data-name="${row.name}">Delete</button>`);
		return parts.join(" ");
	}

	apply_quotation_workflow(name, action) {
		frappe.call({ method: "frappe.client.get", args: { doctype: "Quotation", name }, freeze: true }).then((r) => {
			frappe.call({ method: "frappe.model.workflow.apply_workflow", args: { doc: JSON.stringify(r.message), action }, freeze: true }).then(() => {
				frappe.show_alert({ message: __("Quotation {0}: {1}", [name, action]), indicator: "green" });
				this.load_quotations();
			});
		});
	}

	// A Quotation can now bundle items from several Scraps, so "create a Sales
	// Order" always needs to say which Scrap's share it's for — no more inferring
	// a single custom_scrap off the Quotation itself.
	create_sales_order_flow(quotationName, scrapName, on_done) {
		on_done = on_done || ((name) => this.open_entity_detail("Sales Order", name));
		sm_ensure_quotation_submitted(quotationName).then(() => this._make_sales_order_from_quotation(scrapName, on_done));
	}

	_make_sales_order_from_quotation(scrapName, on_done) {
		frappe.call({ method: "scrap_management.scrap_management.doctype.scrap.scrap.make_sales_order", args: { scrap_name: scrapName }, freeze: true }).then((r2) => {
			const mapped = r2.message;
			if (!mapped) return;
			this._render_sales_order_from_quotation_form(mapped, on_done);
		});
	}

	// Full-page creation form (not a Dialog) — same pattern as the other
	// "New X" screens. Reached from a Quotation's or Scrap's own "Create Sales
	// Order" action, once its Quotation is already approved.
	_render_sales_order_from_quotation_form(mapped, on_done) {
		this._detail_return_page = this._last_nav_page || "quotation";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Sales Order</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">New Sales Order</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-mkso-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-mkso-save">Create Sales Order</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Sales Order Details</h3></div>
				<div id="sm2-mkso-fields" style="padding:6px 18px 18px;"></div>
			</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Items</h3></div>
				<div style="padding:6px 18px 18px;">
					<div class="sm2-item-grid">
						<div class="sm2-item-grid-row sm2-item-grid-head">
							<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:0.8;">UOM</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div><div style="flex:1.2;">Attachment</div>
						</div>
						${
							(mapped.items || [])
								.map(
									(it, idx) => `<div class="sm2-item-grid-row" data-idx="${idx}">
							<div style="flex:2;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item_code)}</div>
							<div style="flex:0.8;min-width:0;" class="sm2-mono">${it.qty}</div>
							<div style="flex:0.8;min-width:0;">${it.uom || ""}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.rate)}</div>
							<div style="flex:1;min-width:0;" class="sm2-mono">${sm_money(it.amount)}</div>
							<div class="sm2-mkso-attach-cell" style="flex:1.2;min-width:0;"></div>
						</div>`
								)
								.join("") || `<div class="sm2-empty">No items.</div>`
						}
					</div>
				</div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-mkso-back").on("click", () => this.go(this._detail_return_page));

		const itemAttachControls = {}; // idx -> live Attach control, read at save time
		$el.find(".sm2-item-grid-row[data-idx]").each((_, el) => {
			const $row = $(el);
			const idx = $row.data("idx");
			const attach_control = frappe.ui.form.make_control({
				parent: $row.find(".sm2-mkso-attach-cell"),
				df: { fieldtype: "Attach", fieldname: "custom_attachment" },
				render_input: true,
				only_input: true,
			});
			attach_control.refresh();
			itemAttachControls[idx] = attach_control;
		});

		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-mkso-fields"),
			fields: [{ fieldtype: "Date", fieldname: "delivery_date", label: "Expected Delivery Date", default: frappe.datetime.add_days(frappe.datetime.get_today(), 3), reqd: 1 }],
		});
		fg.make();

		$el.find("#sm2-mkso-save").on("click", () => {
			const values = fg.get_values();
			if (!values) return;
			const doc = Object.assign({}, mapped);
			(doc.items || []).forEach((row, idx) => {
				row.delivery_date = values.delivery_date;
				const attach_control = itemAttachControls[idx];
				if (attach_control) row.custom_attachment = attach_control.get_value();
			});
			frappe.call({ method: "frappe.client.insert", args: { doc }, freeze: true }).then((r3) => {
				frappe.call({ method: "frappe.client.submit", args: { doc: r3.message }, freeze: true }).then(() => {
					frappe.show_alert({ message: __("Sales Order {0} created.", [r3.message.name]), indicator: "green" });
					on_done(r3.message.name);
				});
			});
		});
	}

	// Full-page creation form (not a popup) — same pattern as New Scrap. A
	// Quotation can now bundle items from several Scraps in one go (like a
	// Supplier Quotation): pick Scraps in "Linked Scraps", the combined Items
	// table below pulls in every picked Scrap's items automatically, and the
	// user keys a Quotation Rate per line (Quotation Amount = Qty × Rate).
	// `preselected_scrap`: when opened via a Scrap's own "+ Quotation" action,
	// pre-fill one Linked Scrap row instead of making the user pick it again.
	open_new_quotation(preselected_scrap) {
		frappe.call({
			method: "frappe.client.get_list",
			args: { doctype: "Scrap", filters: { status: ["in", ["Available for Sale", "Quotation in Process"]] }, fields: ["name"], limit_page_length: 50 },
		}).then((r) => {
			const eligibleScraps = (r.message || []).map((s) => s.name);
			this._render_new_quotation_form(eligibleScraps, preselected_scrap);
		});
	}

	_render_new_quotation_form(eligibleScraps, preselected_scrap) {
		this._detail_return_page = this._last_nav_page || "quotation";
		this.page.main.find(".sm2-nav-btn").removeClass("active");
		this.page.main.find(".sm2-page").removeClass("active");
		const $el = this.page.main.find("#sm2-detail").addClass("active");

		$el.html(`
			<div class="sm2-crumb"><a data-back-to-list="1">Scrap Management</a> &rsaquo; New Quotation</div>
			<div class="sm2-detail-head">
				<h1 class="sm2-detail-title">New Quotation</h1>
				<div style="display:flex;gap:8px;">
					<button class="sm2-btn" id="sm2-new-quote-back">&larr; Back</button>
					<button class="sm2-btn primary" id="sm2-new-quote-save">Create Quotation</button>
				</div>
			</div>
			<div class="sm2-notice">This form stays inside Scrap Management. Real ERPNext permissions, validations and workflow rules run when you save.</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;">
				<div class="sm2-head"><h3><span class="sm2-num">01</span>&nbsp; Quotation Details</h3></div>
				<div id="sm2-new-quote-fields" style="padding:6px 18px 18px;"></div>
			</div>
			<div class="sm2-card numbered" style="margin-bottom:14px;" id="sm2-quote-scrap-card">
				<div class="sm2-head"><h3><span class="sm2-num">02</span>&nbsp; Linked Scraps</h3></div>
				<div style="padding:6px 18px 18px;">
					<div class="sm2-item-grid">
						<div class="sm2-item-grid-row sm2-item-grid-head">
							<div style="flex:2;">Scrap</div><div style="flex:3;">Remark</div><div style="width:40px;flex:0 0 40px;"></div>
						</div>
						<div id="sm2-scrap-rows"></div>
						<div id="sm2-scrap-rows-empty" class="sm2-empty">No Scrap linked yet.</div>
					</div>
					<button class="sm2-btn" id="sm2-add-scrap-row" style="margin-top:10px;">+ Add Scrap</button>
				</div>
			</div>
			<div class="sm2-card numbered">
				<div class="sm2-head"><h3><span class="sm2-num">03</span>&nbsp; Items</h3></div>
				<div style="padding:6px 18px 18px;">
					<div id="sm2-quote-items-fromscrap">
						<div class="sm2-item-grid">
							<div class="sm2-item-grid-row sm2-item-grid-head">
								<div style="flex:1.6;">Item</div><div style="flex:1.2;">Scrap</div><div style="flex:0.7;">Qty</div><div style="flex:0.7;">UOM</div><div style="flex:1;">Quotation Rate</div><div style="flex:1;">Quotation Amount</div><div style="flex:1.2;">Attachment</div>
							</div>
							<div id="sm2-quote-item-rows"></div>
							<div id="sm2-quote-item-rows-empty" class="sm2-empty">Add a Scrap above to pull in its items.</div>
						</div>
					</div>
					<div id="sm2-quote-items-manual" style="display:none;">
						<div class="sm2-item-grid">
							<div class="sm2-item-grid-row sm2-item-grid-head">
								<div style="flex:2;">Item</div><div style="flex:0.8;">Qty</div><div style="flex:1;">Rate</div><div style="flex:1;">Amount</div><div style="width:40px;flex:0 0 40px;"></div>
							</div>
							<div id="sm2-quote-manual-rows"></div>
							<div id="sm2-quote-manual-empty" class="sm2-empty">No items added yet.</div>
						</div>
						<button class="sm2-btn" id="sm2-quote-add-item" style="margin-top:10px;">+ Add Item</button>
					</div>
				</div>
			</div>
		`);
		$el.find("[data-back-to-list], #sm2-new-quote-back").on("click", () => this.go(this._detail_return_page));

		const fg = new frappe.ui.FieldGroup({
			parent: $el.find("#sm2-new-quote-fields"),
			fields: [
				{
					fieldtype: "Select",
					fieldname: "quotation_mode",
					label: "Quotation Type",
					options: "From Scrap\nDirect (No Scrap)",
					default: eligibleScraps.length ? "From Scrap" : "Direct (No Scrap)",
					reqd: 1,
					onchange: () => refreshMode(),
				},
				{ fieldtype: "Column Break" },
				{ fieldtype: "Link", fieldname: "party_name", label: "Buyer", options: "Customer", reqd: 1 },
				{ fieldtype: "Column Break" },
				{ fieldtype: "Date", fieldname: "transaction_date", label: "Quotation Date", default: frappe.datetime.get_today() },
			],
		});
		fg.make();

		const $scrapCard = $el.find("#sm2-quote-scrap-card");
		const $itemsFromScrap = $el.find("#sm2-quote-items-fromscrap");
		const $itemsManual = $el.find("#sm2-quote-items-manual");
		const refreshMode = () => {
			const isDirect = fg.get_value("quotation_mode") === "Direct (No Scrap)";
			$scrapCard.toggle(!isDirect);
			$itemsFromScrap.toggle(!isDirect);
			$itemsManual.toggle(isDirect);
		};
		refreshMode();

		// ---- Direct-mode manual item entry ----
		const quoteManualRows = [];
		const $quoteManualBody = $el.find("#sm2-quote-manual-rows");
		const $quoteManualEmpty = $el.find("#sm2-quote-manual-empty");
		const addQuoteManualRow = () => {
			$quoteManualEmpty.hide();
			const $row = $(`<div class="sm2-item-grid-row">
				<div class="sm2-item-cell" style="flex:2;min-width:0;"></div>
				<div style="flex:0.8;min-width:0;"><input type="number" step="any" class="sm2-input sm2-quote-manual-qty" style="width:100%;box-sizing:border-box;" placeholder="Qty"></div>
				<div style="flex:1;min-width:0;"><input type="number" step="any" class="sm2-input sm2-quote-manual-rate" style="width:100%;box-sizing:border-box;" placeholder="Rate"></div>
				<div style="flex:1;min-width:0;" class="sm2-mono sm2-quote-manual-amount">₹0</div>
				<div style="width:40px;flex:0 0 40px;"><button type="button" class="sm2-btn danger" style="padding:0 10px;">&times;</button></div>
			</div>`);
			$quoteManualBody.append($row);
			const item_control = frappe.ui.form.make_control({
				parent: $row.find(".sm2-item-cell"),
				df: { fieldtype: "Link", fieldname: "item_code", options: "Item", placeholder: "Search Item" },
				render_input: true,
				only_input: true,
			});
			item_control.refresh();
			const recalc = () => {
				const amount = (parseFloat(row.$qty.val()) || 0) * (parseFloat(row.$rate.val()) || 0);
				row.$amount.text(sm_money(amount));
			};
			const row = { item_control, $qty: $row.find(".sm2-quote-manual-qty"), $rate: $row.find(".sm2-quote-manual-rate"), $amount: $row.find(".sm2-quote-manual-amount") };
			row.$qty.on("input", recalc);
			row.$rate.on("input", recalc);
			quoteManualRows.push(row);
			$row.find(".sm2-btn.danger").on("click", () => {
				quoteManualRows.splice(quoteManualRows.indexOf(row), 1);
				$row.remove();
				if (!quoteManualRows.length) $quoteManualEmpty.show();
			});
		};
		$el.find("#sm2-quote-add-item").on("click", addQuoteManualRow);
		addQuoteManualRow();

		const scrapRows = [];
		const $scrapRowsBody = $el.find("#sm2-scrap-rows");
		const $scrapEmpty = $el.find("#sm2-scrap-rows-empty");
		const qtyByKey = {}; // "scrap::item" -> qty typed by the user, preserved across item-table refreshes
		const rateByKey = {}; // "scrap::item" -> rate typed by the user, preserved across item-table refreshes
		const attachByKey = {}; // "scrap::item" -> uploaded file url, preserved across item-table refreshes
		const attachControls = {}; // "scrap::item" -> live Attach control, so save can read current values

		const refreshItemsTable = () => {
			const scrapNames = scrapRows.map((row) => row.scrap_control.get_value()).filter(Boolean);
			const $itemsBody = $el.find("#sm2-quote-item-rows");
			const $itemsEmpty = $el.find("#sm2-quote-item-rows-empty");
			if (!scrapNames.length) {
				$itemsBody.empty();
				$itemsEmpty.show();
				return;
			}
			frappe.call({ method: "scrap_management.api.get_scrap_items_by_parent", args: { scrap_names: scrapNames } }).then((r) => {
				const items = r.message || [];
				$itemsEmpty.toggle(!items.length);
				$itemsBody.html(
					items
						.map((it) => {
							const key = `${it.parent}::${it.item}`;
							const rate = rateByKey[key] || 0;
							const qty = qtyByKey[key] ?? it.qty;
							return `<div class="sm2-item-grid-row" data-key="${key}" data-scrap="${it.parent}" data-item="${it.item}" data-uom="${it.uom || ""}">
								<div style="flex:1.6;min-width:0;">${frappe.utils.escape_html(it.item_name || it.item)}</div>
								<div style="flex:1.2;min-width:0;">${sm_scrap_link(it.parent)}</div>
								<div style="flex:0.7;min-width:0;"><input type="number" step="any" class="sm2-input sm2-quote-qty" style="width:100%;box-sizing:border-box;" value="${qty}" placeholder="Qty"></div>
								<div style="flex:0.7;min-width:0;">${it.uom || ""}</div>
								<div style="flex:1;min-width:0;"><input type="number" step="any" class="sm2-input sm2-quote-rate" style="width:100%;box-sizing:border-box;" value="${rate || ""}" placeholder="Rate"></div>
								<div style="flex:1;min-width:0;" class="sm2-mono sm2-quote-amount">${sm_money(flt(rate) * flt(qty))}</div>
								<div class="sm2-quote-attach-cell" style="flex:1.2;min-width:0;"></div>
							</div>`;
						})
						.join("")
				);
				const recalcQuoteRow = ($row) => {
					const rate = parseFloat($row.find(".sm2-quote-rate").val()) || 0;
					const qty = parseFloat($row.find(".sm2-quote-qty").val()) || 0;
					$row.find(".sm2-quote-amount").text(sm_money(rate * qty));
				};
				$itemsBody.find(".sm2-quote-rate").on("input", (e) => {
					const $row = $(e.currentTarget).closest(".sm2-item-grid-row");
					rateByKey[$row.data("key")] = parseFloat($(e.currentTarget).val()) || 0;
					recalcQuoteRow($row);
				});
				$itemsBody.find(".sm2-quote-qty").on("input", (e) => {
					const $row = $(e.currentTarget).closest(".sm2-item-grid-row");
					qtyByKey[$row.data("key")] = parseFloat($(e.currentTarget).val()) || 0;
					recalcQuoteRow($row);
				});
				$itemsBody.find(".sm2-item-grid-row").each((_, el) => {
					const $row = $(el);
					const key = $row.data("key");
					const attach_control = frappe.ui.form.make_control({
						parent: $row.find(".sm2-quote-attach-cell"),
						df: { fieldtype: "Attach", fieldname: "custom_attachment", onchange: () => (attachByKey[key] = attach_control.get_value()) },
						render_input: true,
						only_input: true,
					});
					attach_control.refresh();
					if (attachByKey[key]) attach_control.set_value(attachByKey[key]);
					attachControls[key] = attach_control;
				});
			});
		};

		const addScrapRow = (data) => {
			$scrapEmpty.hide();
			const $row = $(`<div class="sm2-item-grid-row">
				<div class="sm2-scrap-cell" style="flex:2;min-width:0;"></div>
				<div style="flex:3;min-width:0;"><input type="text" class="sm2-input" style="width:100%;box-sizing:border-box;" placeholder="Remark"></div>
				<div style="width:40px;flex:0 0 40px;"><button type="button" class="sm2-btn danger" style="padding:0 10px;">&times;</button></div>
			</div>`);
			$scrapRowsBody.append($row);
			const scrap_control = frappe.ui.form.make_control({
				parent: $row.find(".sm2-scrap-cell"),
				df: {
					fieldtype: "Link",
					fieldname: "scrap",
					options: "Scrap",
					placeholder: "Search Scrap",
					get_query: () => ({ filters: { name: ["in", eligibleScraps] } }),
					onchange: refreshItemsTable,
				},
				render_input: true,
				only_input: true,
			});
			scrap_control.refresh();
			if (data) scrap_control.set_value(data);
			const row = { scrap_control, $remark: $row.find('input[type="text"]') };
			scrapRows.push(row);
			$row.find(".sm2-btn.danger").on("click", () => {
				scrapRows.splice(scrapRows.indexOf(row), 1);
				$row.remove();
				if (!scrapRows.length) $scrapEmpty.show();
				refreshItemsTable();
			});
		};

		$el.find("#sm2-add-scrap-row").on("click", () => addScrapRow());
		addScrapRow(preselected_scrap || null);
		if (preselected_scrap) refreshItemsTable();

		$el.find("#sm2-new-quote-save").on("click", () => {
			const values = fg.get_values();
			if (!values) return;

			if (values.quotation_mode === "Direct (No Scrap)") {
				const items = quoteManualRows
					.map((row) => ({ item_code: row.item_control.get_value(), qty: parseFloat(row.$qty.val()) || 0, rate: parseFloat(row.$rate.val()) || 0 }))
					.filter((row) => row.item_code && row.qty > 0);
				if (!items.length) {
					frappe.msgprint(__("Add at least one Item with a valid Quantity."));
					return;
				}
				frappe.call({
					method: "frappe.client.insert",
					args: { doc: { doctype: "Quotation", quotation_to: "Customer", party_name: values.party_name, transaction_date: values.transaction_date, items } },
					freeze: true,
				}).then((r2) => {
					if (!r2.message) return;
					frappe.show_alert({ message: __("Quotation {0} created.", [r2.message.name]), indicator: "green" });
					this.open_entity_detail("Quotation", r2.message.name);
				});
				return;
			}

			const custom_scraps = scrapRows
				.map((row) => ({ scrap: row.scrap_control.get_value(), remark: row.$remark.val() }))
				.filter((row) => row.scrap);
			if (!custom_scraps.length) {
				frappe.msgprint(__("Link at least one Scrap."));
				return;
			}
			const items = [];
			$el.find("#sm2-quote-item-rows .sm2-item-grid-row").each((_, el) => {
				const $row = $(el);
				const rate = parseFloat($row.find(".sm2-quote-rate").val()) || 0;
				const qty = parseFloat($row.find(".sm2-quote-qty").val()) || 0;
				if (qty <= 0) return;
				const attach_control = attachControls[$row.data("key")];
				items.push({
					item_code: $row.data("item"),
					qty,
					uom: $row.data("uom"),
					rate,
					custom_attachment: attach_control ? attach_control.get_value() : "",
					custom_scrap: $row.data("scrap"),
				});
			});
			if (!items.length) {
				frappe.msgprint(__("No items found for the linked Scraps."));
				return;
			}
			frappe.call({
				method: "frappe.client.insert",
				args: {
					doc: {
						doctype: "Quotation",
						quotation_to: "Customer",
						party_name: values.party_name,
						transaction_date: values.transaction_date,
						custom_scraps,
						items,
					},
				},
				freeze: true,
			}).then((r2) => {
				if (!r2.message) return;
				frappe.show_alert({ message: __("Quotation {0} created.", [r2.message.name]), indicator: "green" });
				this.open_entity_detail("Quotation", r2.message.name);
			});
		});
	}

	// ---------------- Scrap Report ----------------
	render_scrap_report() {
		const $el = this.page.main.find("#sm2-report");
		$el.html(`<div class="sm2-empty">Loading…</div>`);
		frappe.call({ method: "scrap_management.api.get_report", args: { report_name: "Scrap Report" } }).then((r) => {
			const { columns, data, summary } = r.message || {};
			this._report_columns = columns;
			this._report_data = data;
			$el.html(`
				<div class="sm2-hero"><div><h1 class="sm2-title">Scrap Report</h1>
				<p class="sm2-sub">Full material-to-closure detail. Use Export CSV for offline analysis.</p></div>
				<button class="sm2-btn" id="sm2-export-csv">Export CSV</button></div>
				<div class="sm2-grid4">${(summary || [])
					.slice(0, 4)
					.map((s) => `<div class="sm2-card sm2-kpi"><small>${s.label}</small><strong>${s.datatype === "Currency" ? sm_money(s.value) : s.value}</strong></div>`)
					.join("")}</div>
				<div class="sm2-card"><div class="sm2-tablewrap">
				<table class="sm2-table"><thead><tr>${(columns || []).map((c) => `<th>${c.label}</th>`).join("")}</tr></thead>
				<tbody>${
					(data || []).length
						? data
								.map(
									(row) =>
										`<tr>${columns
											.map((c) => {
												let v = row[c.fieldname];
												if (c.fieldtype === "Link" && v) v = sm_smart_link(c.options, v);
												else if (["Currency", "Float", "Int"].includes(c.fieldtype)) v = `<span class="sm2-mono">${c.fieldtype === "Currency" ? sm_money(v) : v ?? ""}</span>`;
												else v = frappe.utils.escape_html(v == null ? "" : String(v));
												return `<td>${v}</td>`;
											})
											.join("")}</tr>`
								)
								.join("")
						: `<tr><td colspan="${(columns || []).length}" class="sm2-empty">No records found.</td></tr>`
				}</tbody></table>
				</div></div>
			`);
			$el.find("#sm2-export-csv").on("click", () => this.export_report_csv());
		});
	}

	export_report_csv() {
		const columns = this._report_columns || [];
		const data = this._report_data || [];
		const esc = (v) => (v == null ? "" : /[",\n]/.test(String(v)) ? '"' + String(v).replace(/"/g, '""') + '"' : String(v));
		const lines = [columns.map((c) => esc(c.label)).join(",")].concat(data.map((row) => columns.map((c) => esc(row[c.fieldname])).join(",")));
		const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
		const a = document.createElement("a");
		a.href = URL.createObjectURL(blob);
		a.download = "Scrap_Report.csv";
		a.click();
		setTimeout(() => URL.revokeObjectURL(a.href), 1000);
	}
}
