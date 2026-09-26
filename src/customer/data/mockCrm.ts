import type { CrmAccount, CustomerSessionState } from "@/customer/hooks/useCustomerSession";

export type CrmScopeSeed = CustomerSessionState["scope"];

export interface MockCrmAccount extends CrmAccount {
  scope: CrmScopeSeed;
}

export const MOCK_CRM_ACCOUNTS: MockCrmAccount[] = [
  {
    id: "crm-heartland-mutual",
    company: "Heartland Mutual Insurance",
    partnerOfRecord: "CDW",
    industry: "Insurance",
    segment: "Enterprise",
    scope: {
      painPoint:
        "Claims intake sits days in queues while analysts re-key PDF packets by hand across legacy imaging systems.",
      cxoOutcome:
        "Cut claims cycle time and overtime without a net-new headcount plan this fiscal year.",
      constraints:
        "Q2 window; no new core-system RFP; must stay on existing Microsoft 365 footprint with CDW as partner of record.",
    },
  },
  {
    id: "crm-northwind-health",
    company: "Northwind Health Systems",
    partnerOfRecord: "Softchoice",
    industry: "Healthcare",
    segment: "Enterprise",
    scope: {
      painPoint:
        "Care-team knowledge is trapped in inboxes and shared drives, slowing prior-auth and discharge workflows.",
      cxoOutcome:
        "Give clinicians a grounded Gemini assistant that answers from approved clinical ops content in under a minute.",
      constraints:
        "HIPAA-aligned deployment only; Softchoice-led discovery; no PHI in prompt logs for the pilot.",
    },
  },
  {
    id: "crm-contoso-retail",
    company: "Contoso Retail Group",
    partnerOfRecord: "SHI",
    industry: "Retail",
    segment: "Commercial",
    scope: {
      painPoint:
        "Store associates can't find consistent answers on promotions and returns, driving escalations to HQ.",
      cxoOutcome:
        "Stand up a store-floor Gemini agent that resolves the top 20 associate questions without a ticket.",
      constraints:
        "Must work on existing Chrome books; SHI delivers enablement; holiday freeze after mid-November.",
    },
  },
  {
    id: "crm-fabrikam-mfg",
    company: "Fabrikam Advanced Manufacturing",
    partnerOfRecord: "CDW",
    industry: "Manufacturing",
    segment: "Mid-market",
    scope: {
      painPoint:
        "Shift handoffs lose tribal knowledge; quality deviations take hours to reconstruct from paper travelers.",
      cxoOutcome:
        "Capture and retrieve line-side procedures with Gemini so first-pass yield stops depending on who is on shift.",
      constraints:
        "Air-gapped plant Wi-Fi zones; CDW owns hardware refresh; pilot limited to two lines in Plant 3.",
    },
  },
  {
    id: "crm-adventure-works",
    company: "Adventure Works Outdoors",
    partnerOfRecord: "Softchoice",
    industry: "Consumer goods",
    segment: "Commercial",
    scope: {
      painPoint:
        "Merchandising briefs and vendor emails bury seasonal buy decisions until it's too late to reallocate.",
      cxoOutcome:
        "Weekly Gemini brief that ranks SKU risk and recommended actions for the merchandising council.",
      constraints:
        "Softchoice-facilitated workshop; data from existing ERP exports only; no custom warehouse build in phase 1.",
    },
  },
  {
    id: "crm-litware-financial",
    company: "Litware Financial Services",
    partnerOfRecord: "SHI",
    industry: "Financial services",
    segment: "Enterprise",
    scope: {
      painPoint:
        "KYC analysts rework the same document packs across systems with inconsistent checklist outcomes.",
      cxoOutcome:
        "Reduce average KYC case handling time by 30% with a Gemini-assisted evidence checklist.",
      constraints:
        "Model residency in approved region; SHI + compliance co-own the RAI review; no customer PII in training.",
    },
  },
  {
    id: "crm-wide-world-importers",
    company: "Wide World Importers",
    partnerOfRecord: "CDW",
    industry: "Distribution",
    segment: "Mid-market",
    scope: {
      painPoint:
        "Supplier exception emails pile up; planners rebuild the same status deck every Monday morning.",
      cxoOutcome:
        "Auto-draft exception digests and recommended carrier actions before the planning standup.",
      constraints:
        "CDW runs the session; integrate with existing Teams + Excel exports; 60-day pilot clock.",
    },
  },
];

export function scopeFromCrmAccount(account: CrmAccount): CrmScopeSeed {
  const known = MOCK_CRM_ACCOUNTS.find((a) => a.id === account.id);
  if (known) return { ...known.scope };
  return {
    painPoint: `${account.company} (${account.industry}) is losing time to manual, fragmented work across teams.`,
    cxoOutcome: `Prove a Gemini Enterprise pilot that improves ${account.industry.toLowerCase()} operating outcomes for the ${account.segment.toLowerCase()} segment.`,
    constraints: `Partner of record: ${account.partnerOfRecord}. Keep the pilot inside existing tools; editable once the room refines scope.`,
  };
}
