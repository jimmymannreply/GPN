import {
  compositeScore,
  industryLabel,
  type IndustryKey,
  type UseCaseCandidate,
} from "@/hackathon/data/useCaseLibrary";

export interface OutcomeDocContext {
  brandName: string;
  curatedIndustry: IndustryKey | null;
  curatedIndustryPhrase: string;
  intake: {
    customerName: string;
    industryStack: string;
    painPoint: string;
    cxoOutcome: string;
    headcount: number;
  };
}

export interface RankedOutcomeItem {
  useCase: UseCaseCandidate;
  owner: string;
  contested: boolean;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function docShell(title: string, body: string): string {
  return `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11pt; color: #222; line-height: 1.45; }
  h1 { font-size: 18pt; color: #1a1a1a; }
  h2 { font-size: 13pt; margin-top: 18px; color: #0078d4; }
  table { border-collapse: collapse; width: 100%; margin: 12px 0; }
  th, td { border: 1px solid #ccc; padding: 8px; text-align: left; vertical-align: top; }
  th { background: #f3f3f3; }
  .meta { color: #555; font-size: 10pt; }
  .footer { margin-top: 24px; font-size: 9pt; color: #777; }
</style>
</head>
<body>
${body}
</body>
</html>`;
}

function intakeBlock(state: OutcomeDocContext): string {
  const { intake, curatedIndustry, curatedIndustryPhrase } = state;
  const vertical =
    curatedIndustry != null ? industryLabel(curatedIndustry as IndustryKey) : "—";
  return `
<h2>Customer context</h2>
<table>
<tr><th>Customer</th><td>${escapeHtml(intake.customerName)}</td></tr>
<tr><th>Industry &amp; stack</th><td>${escapeHtml(intake.industryStack)}</td></tr>
<tr><th>Curated vertical</th><td>${escapeHtml(curatedIndustryPhrase || vertical)}</td></tr>
<tr><th>Pain that booked the meeting</th><td>${escapeHtml(intake.painPoint)}</td></tr>
<tr><th>CXO outcome</th><td>${escapeHtml(intake.cxoOutcome)}</td></tr>
<tr><th>Session headcount</th><td>${intake.headcount}</td></tr>
</table>`;
}

function useCaseDetailTable(uc: UseCaseCandidate, owner: string, rank: number, contested: boolean): string {
  const score = compositeScore(uc);
  return `
<h2>${rank}. ${escapeHtml(uc.title)}</h2>
<p class="meta">Named owner: <strong>${escapeHtml(owner)}</strong>${contested ? " · Contested pick" : ""}</p>
<p>${escapeHtml(uc.summary)}</p>
<table>
<tr><th>Composite score</th><td>${score}</td></tr>
<tr><th>Value</th><td>${uc.valueScore}</td></tr>
<tr><th>Feasibility</th><td>${uc.feasibilityScore}</td></tr>
<tr><th>Risk</th><td>${uc.riskScore}</td></tr>
<tr><th>Tags</th><td>${escapeHtml(uc.tags.join(", "))}</td></tr>
</table>
${
  uc.geminiBlueprint
    ? `<h2>Gemini on Google Cloud — solution pattern</h2>
<p><strong>${escapeHtml(uc.geminiBlueprint.patternName)}</strong> (fit ${uc.geminiBlueprint.geminiFit})</p>
<p>${escapeHtml(uc.geminiBlueprint.pitch)}</p>
<p><em>Google stack:</em> ${escapeHtml(uc.geminiBlueprint.products.join(", "))}</p>
<ol>${uc.geminiBlueprint.buildSteps.map((s) => `<li>${escapeHtml(s)}</li>`).join("")}</ol>`
    : ""
}
<h2>Recommended next steps</h2>
<ul>
<li>90-day pilot scope workshop with ${escapeHtml(owner)} as business sponsor</li>
<li>Technical validation on ${escapeHtml(uc.tags[0] ?? "priority")} workloads</li>
<li>Value checkpoint at day 30 against CXO outcome metrics</li>
</ul>`;
}

export function buildShortlistGoogleDocHtml(
  state: OutcomeDocContext,
  ranked: RankedOutcomeItem[]
): string {
  const generated = new Date().toLocaleString();
  const items = ranked
    .map((item, i) => useCaseDetailTable(item.useCase, item.owner, i + 1, item.contested))
    .join("<hr />");

  const body = `
<h1>Use-Case Draft — ranked shortlist</h1>
<p class="meta">${escapeHtml(state.brandName)} · Generated ${escapeHtml(generated)}</p>
${intakeBlock(state)}
<h2>Ranked outcomes (${ranked.length})</h2>
<p>Ordered by snake-draft selection. Import this file into Google Docs (File → Open → Upload) or upload to Google Drive and open with Google Docs.</p>
${items}
<div class="footer">POC artifact — production would sync to Google Drive via API and share with customer PDM / partner CRM.</div>`;

  return docShell(`${state.intake.customerName} — Use-Case Draft shortlist`, body);
}

export function buildUseCaseGoogleDocHtml(
  state: OutcomeDocContext,
  item: RankedOutcomeItem,
  rank: number
): string {
  const generated = new Date().toLocaleString();
  const body = `
<h1>Use case brief: ${escapeHtml(item.useCase.title)}</h1>
<p class="meta">${escapeHtml(state.brandName)} · ${escapeHtml(state.intake.customerName)} · ${escapeHtml(generated)}</p>
${intakeBlock(state)}
${useCaseDetailTable(item.useCase, item.owner, rank, item.contested)}
<div class="footer">Open in Google Docs to edit with customer stakeholders.</div>`;

  return docShell(`${item.useCase.title} — ${state.intake.customerName}`, body);
}

export function downloadGoogleDoc(fileName: string, html: string): void {
  const safe = fileName.replace(/[^\w\s-]/g, "").replace(/\s+/g, "-").slice(0, 80);
  const blob = new Blob([html], { type: "application/msword;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${safe}.doc`;
  a.click();
  URL.revokeObjectURL(url);
}

export function slugCustomer(customerName: string): string {
  return customerName.trim() || "customer";
}
