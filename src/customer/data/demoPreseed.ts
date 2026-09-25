import { MOCK_CRM_ACCOUNTS } from "@/customer/data/mockCrm";
import type {
  CustomerSessionState,
  SessionFormat,
} from "@/customer/hooks/useCustomerSession";
import { DEFAULT_FUNDING_CLAIM } from "@/partner-home/data/mockFunding";
import { simulateLinkedInProfile } from "@/shared/attendees/simulateLinkedIn";
import type { AttendeeProfile } from "@/shared/attendees/types";

export const DEMO_PRESEED_STORAGE_KEY = "customer-demo-preseed-v1";
export const STAGED_SESSION_KEY = "customer-staged-session-v1";
export const JOURNEY_SEED_KEY = "customer-session-seed-v1";

const HEARTLAND =
  MOCK_CRM_ACCOUNTS.find((a) => a.id === "crm-heartland-mutual") ?? MOCK_CRM_ACCOUNTS[0];

function demoAttendees(company: string): AttendeeProfile[] {
  const people = [
    { name: "Michelle Dorsey", role: "VP Claims Operations" },
    { name: "Dana Reyes", role: "Director of IT" },
  ];
  return people.map((p) => ({
    ...p,
    linkedIn: simulateLinkedInProfile(p.name, company),
  }));
}

export function isDemoPreseedEnabled(): boolean {
  try {
    return sessionStorage.getItem(DEMO_PRESEED_STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setDemoPreseedEnabled(on: boolean): void {
  try {
    sessionStorage.setItem(DEMO_PRESEED_STORAGE_KEY, on ? "1" : "0");
  } catch {
    /* ignore */
  }
}

export function applyDemoPreseed(format: SessionFormat): CustomerSessionState {
  const attendees = demoAttendees(HEARTLAND.company);
  const scope = {
    painPoint: "Claims intake sits days in queues while analysts re-key PDF packets by hand.",
    cxoOutcome: "Cut cycle time and overtime without a net-new headcount plan this fiscal year.",
    constraints: "Q2 window; no new core-system RFP; must use existing Microsoft 365 footprint.",
  };
  const staged: CustomerSessionState = {
    format,
    stage: "plan",
    crmAccount: HEARTLAND,
    attendees,
    scope,
    fundingStatus: DEFAULT_FUNDING_CLAIM.status,
    fundingValueLabel: DEFAULT_FUNDING_CLAIM.annualValueLabel,
  };

  const journeySeed = {
    customerName: HEARTLAND.company,
    industryStack: `${HEARTLAND.industry} · ${HEARTLAND.segment}`,
    painPoint: scope.painPoint,
    cxoOutcome: scope.cxoOutcome,
    headcount: Math.max(attendees.length, 4),
    attendees,
  };

  try {
    localStorage.setItem(STAGED_SESSION_KEY, JSON.stringify(staged));
    sessionStorage.setItem(JOURNEY_SEED_KEY, JSON.stringify(journeySeed));
  } catch {
    /* ignore */
  }

  return staged;
}
