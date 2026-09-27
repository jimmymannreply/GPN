import type {
  CrmAccount,
  CrmContact,
  CustomerSessionState,
  LedgerFields,
} from "@/customer/hooks/useCustomerSession";
import { simulateLinkedInProfile } from "@/shared/attendees/simulateLinkedIn";
import type { AttendeeProfile } from "@/shared/attendees/types";

export type CrmScopeSeed = CustomerSessionState["scope"];

/** Optional CRM enrichment beyond identity (Company, Industry, Contact). */
export interface MockCrmEnrichment {
  techStack?: string;
  painPoint?: string;
  cxoOutcome?: string;
  constraints?: string;
  ledger?: Partial<LedgerFields>;
  hackathonAttendees?: CrmContact[];
}

export interface MockCrmAccount extends CrmAccount, MockCrmEnrichment {}

/** Demo quick-picks on the customer CRM step (choose one). */
export const CUSTOMER_DEMO_ACCOUNT_IDS = [
  "crm-heartland-mutual",
  "crm-northwind-health",
  "crm-contoso-retail",
] as const;

function attendeesFor(company: string, people: CrmContact[]): AttendeeProfile[] {
  return people.map((p) => ({
    ...p,
    linkedIn: simulateLinkedInProfile(p.name, company),
  }));
}

export const MOCK_CRM_ACCOUNTS: MockCrmAccount[] = [
  {
    id: "crm-heartland-mutual",
    company: "Heartland Mutual Insurance",
    industry: "Insurance",
    contact: { name: "Michelle Dorsey", role: "VP Claims Operations" },
    partnerOfRecord: "CDW",
    segment: "Enterprise",
    techStack: "M365 · Guidewire · Azure",
    painPoint:
      "Claims intake sits days in queues while analysts re-key PDF packets by hand across legacy imaging systems.",
    cxoOutcome:
      "Cut claims cycle time and overtime without a net-new headcount plan this fiscal year.",
    constraints:
      "Q2 window; no new core-system RFP; must stay on existing Microsoft 365 footprint with CDW as partner of record.",
    ledger: {
      monthlyToolSpend: 180000,
      ticketsPerMonth: 6200,
      minutesPerTicket: 14,
      hoursLostPerWeek: 90,
      hourlyLoadedCost: 95,
      monthlyChurnRevenue: 40000,
    },
    hackathonAttendees: [
      { name: "Michelle Dorsey", role: "VP Claims Operations" },
      { name: "Dana Reyes", role: "Director of IT" },
    ],
  },
  {
    id: "crm-northwind-health",
    company: "Northwind Health Systems",
    industry: "Healthcare",
    contact: { name: "Priya Nair", role: "Chief Medical Information Officer" },
    partnerOfRecord: "Softchoice",
    segment: "Enterprise",
    techStack: "M365 · Epic · Google Cloud",
    painPoint:
      "Care-team knowledge is trapped in inboxes and shared drives, slowing prior-auth and discharge workflows.",
    cxoOutcome:
      "Give clinicians a grounded Gemini assistant that answers from approved clinical ops content in under a minute.",
    constraints:
      "HIPAA-aligned deployment only; Softchoice-led discovery; no PHI in prompt logs for the pilot.",
    // No ledger numbers — intake must ask ghost-ledger questions for ledger format
    hackathonAttendees: [
      { name: "Priya Nair", role: "Chief Medical Information Officer" },
      { name: "Jordan Blake", role: "VP Clinical Operations" },
    ],
  },
  {
    id: "crm-contoso-retail",
    company: "Contoso Retail Group",
    industry: "Retail",
    contact: { name: "Sam Ortiz", role: "VP Store Operations" },
    partnerOfRecord: "SHI",
    segment: "Commercial",
    techStack: "ChromeOS · Salesforce · Google Workspace",
    // Sparse enrichment — intake asks pain + attendees if needed
    hackathonAttendees: [{ name: "Sam Ortiz", role: "VP Store Operations" }],
  },
  {
    id: "crm-fabrikam-mfg",
    company: "Fabrikam Advanced Manufacturing",
    industry: "Manufacturing",
    contact: { name: "Chris Vogel", role: "Plant Operations Director" },
    partnerOfRecord: "CDW",
    segment: "Mid-market",
    // Identity only — intake asks everything else
  },
  {
    id: "crm-adventure-works",
    company: "Adventure Works Outdoors",
    industry: "Consumer goods",
    contact: { name: "Taylor Kim", role: "VP Merchandising" },
    partnerOfRecord: "Softchoice",
    segment: "Commercial",
  },
  {
    id: "crm-litware-financial",
    company: "Litware Financial Services",
    industry: "Financial services",
    contact: { name: "Avery Shaw", role: "Head of KYC Operations" },
    partnerOfRecord: "SHI",
    segment: "Enterprise",
    techStack: "M365 · ServiceNow · Snowflake",
  },
  {
    id: "crm-wide-world-importers",
    company: "Wide World Importers",
    industry: "Distribution",
    contact: { name: "Morgan Lee", role: "Director of Supply Planning" },
    partnerOfRecord: "CDW",
    segment: "Mid-market",
  },
];

export function customerDemoAccounts(): MockCrmAccount[] {
  return CUSTOMER_DEMO_ACCOUNT_IDS.map(
    (id) => MOCK_CRM_ACCOUNTS.find((a) => a.id === id)!,
  ).filter(Boolean);
}

export function toCrmIdentity(account: MockCrmAccount): CrmAccount {
  return {
    id: account.id,
    company: account.company,
    industry: account.industry,
    contact: account.contact,
    partnerOfRecord: account.partnerOfRecord,
    segment: account.segment,
  };
}

export function enrichmentFromMock(account: MockCrmAccount): {
  techStack: string;
  scope: CrmScopeSeed;
  ledger: Partial<LedgerFields>;
  attendees: AttendeeProfile[];
} {
  return {
    techStack: account.techStack ?? "",
    scope: {
      painPoint: account.painPoint ?? "",
      cxoOutcome: account.cxoOutcome ?? "",
      constraints: account.constraints ?? "",
    },
    ledger: account.ledger ?? {},
    attendees: attendeesFor(account.company, account.hackathonAttendees ?? []),
  };
}

export function scopeFromCrmAccount(account: CrmAccount): CrmScopeSeed {
  const known = MOCK_CRM_ACCOUNTS.find((a) => a.id === account.id);
  if (known?.painPoint || known?.cxoOutcome || known?.constraints) {
    return {
      painPoint: known.painPoint ?? "",
      cxoOutcome: known.cxoOutcome ?? "",
      constraints: known.constraints ?? "",
    };
  }
  return { painPoint: "", cxoOutcome: "", constraints: "" };
}

export function attendeesFromCrmAccount(account: CrmAccount): AttendeeProfile[] {
  const known = MOCK_CRM_ACCOUNTS.find((a) => a.id === account.id);
  if (!known?.hackathonAttendees?.length) return [];
  return attendeesFor(known.company, known.hackathonAttendees);
}
