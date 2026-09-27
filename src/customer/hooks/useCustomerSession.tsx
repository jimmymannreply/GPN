import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  DEFAULT_FUNDING_CLAIM,
  type FundingStatus,
} from "@/partner-home/data/mockFunding";
import type { AttendeeProfile } from "@/shared/attendees/types";

const STORAGE_KEY = "customer-staged-session-v1";

export type SessionFormat = "draft" | "ledger";
export type SessionStage =
  | "crm"
  | "intake"
  | "scope"
  | "plan"
  | "run"
  | "artifacts"
  | "complete";

/** Customer identification from CRM (or intake chat). */
export interface CrmContact {
  name: string;
  role: string;
}

export interface CrmAccount {
  id: string;
  company: string;
  industry: string;
  contact: CrmContact;
  partnerOfRecord: string;
  segment: string;
}

export interface LedgerFields {
  monthlyToolSpend: number | null;
  ticketsPerMonth: number | null;
  minutesPerTicket: number | null;
  hoursLostPerWeek: number | null;
  hourlyLoadedCost: number | null;
  monthlyChurnRevenue: number | null;
}

export interface CustomerSessionState {
  format: SessionFormat;
  stage: SessionStage;
  crmAccount: CrmAccount | null;
  techStack: string;
  attendees: AttendeeProfile[];
  scope: { painPoint: string; cxoOutcome: string; constraints: string };
  ledger: LedgerFields;
  fundingStatus: FundingStatus;
  fundingValueLabel: string;
}

const defaultScope: CustomerSessionState["scope"] = {
  painPoint: "",
  cxoOutcome: "",
  constraints: "",
};

const defaultLedger: LedgerFields = {
  monthlyToolSpend: null,
  ticketsPerMonth: null,
  minutesPerTicket: null,
  hoursLostPerWeek: null,
  hourlyLoadedCost: null,
  monthlyChurnRevenue: null,
};

function createInitialState(format: SessionFormat = "draft"): CustomerSessionState {
  return {
    format,
    stage: "crm",
    crmAccount: null,
    techStack: "",
    attendees: [],
    scope: { ...defaultScope },
    ledger: { ...defaultLedger },
    fundingStatus: "Draft",
    fundingValueLabel: DEFAULT_FUNDING_CLAIM.annualValueLabel,
  };
}

interface CustomerSessionContextValue {
  state: CustomerSessionState;
  startSession: (format: SessionFormat) => void;
  setCrmAccount: (account: CrmAccount | null) => void;
  setTechStack: (techStack: string) => void;
  setAttendees: (attendees: AttendeeProfile[]) => void;
  updateScope: (patch: Partial<CustomerSessionState["scope"]>) => void;
  updateLedger: (patch: Partial<LedgerFields>) => void;
  setStage: (stage: SessionStage) => void;
  resetSession: () => void;
}

const CustomerSessionContext = createContext<CustomerSessionContextValue | null>(null);

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomerSessionState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as CustomerSessionState;
        const contact = parsed.crmAccount?.contact ?? { name: "", role: "" };
        return {
          ...createInitialState(parsed.format),
          ...parsed,
          crmAccount: parsed.crmAccount
            ? { ...parsed.crmAccount, contact }
            : null,
          techStack: parsed.techStack ?? "",
          ledger: { ...defaultLedger, ...parsed.ledger },
          scope: { ...defaultScope, ...parsed.scope },
        };
      }
    } catch {
      /* ignore */
    }
    return createInitialState();
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timer);
  }, [state]);

  const startSession = useCallback((format: SessionFormat) => {
    setState(createInitialState(format));
  }, []);

  const setCrmAccount = useCallback((account: CrmAccount | null) => {
    setState((prev) => ({ ...prev, crmAccount: account }));
  }, []);

  const setTechStack = useCallback((techStack: string) => {
    setState((prev) => ({ ...prev, techStack }));
  }, []);

  const setAttendees = useCallback((attendees: AttendeeProfile[]) => {
    setState((prev) => ({ ...prev, attendees }));
  }, []);

  const updateScope = useCallback((patch: Partial<CustomerSessionState["scope"]>) => {
    setState((prev) => ({ ...prev, scope: { ...prev.scope, ...patch } }));
  }, []);

  const updateLedger = useCallback((patch: Partial<LedgerFields>) => {
    setState((prev) => ({ ...prev, ledger: { ...prev.ledger, ...patch } }));
  }, []);

  const setStage = useCallback((stage: SessionStage) => {
    setState((prev) => ({ ...prev, stage }));
  }, []);

  const resetSession = useCallback(() => {
    setState(createInitialState());
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value: CustomerSessionContextValue = {
    state,
    startSession,
    setCrmAccount,
    setTechStack,
    setAttendees,
    updateScope,
    updateLedger,
    setStage,
    resetSession,
  };

  return (
    <CustomerSessionContext.Provider value={value}>{children}</CustomerSessionContext.Provider>
  );
}

export function useCustomerSession() {
  const ctx = useContext(CustomerSessionContext);
  if (!ctx) {
    throw new Error("useCustomerSession must be used within CustomerSessionProvider");
  }
  return ctx;
}
