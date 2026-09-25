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
export type SessionStage = "crm" | "scope" | "plan" | "run" | "artifacts" | "complete";

export interface CrmAccount {
  id: string;
  company: string;
  partnerOfRecord: string;
  industry: string;
  segment: string;
}

export interface CustomerSessionState {
  format: SessionFormat;
  stage: SessionStage;
  crmAccount: CrmAccount | null;
  attendees: AttendeeProfile[];
  scope: { painPoint: string; cxoOutcome: string; constraints: string };
  fundingStatus: FundingStatus;
  fundingValueLabel: string;
}

const defaultScope: CustomerSessionState["scope"] = {
  painPoint: "",
  cxoOutcome: "",
  constraints: "",
};

function createInitialState(format: SessionFormat = "draft"): CustomerSessionState {
  return {
    format,
    stage: "crm",
    crmAccount: null,
    attendees: [],
    scope: { ...defaultScope },
    fundingStatus: "Draft",
    fundingValueLabel: DEFAULT_FUNDING_CLAIM.annualValueLabel,
  };
}

interface CustomerSessionContextValue {
  state: CustomerSessionState;
  startSession: (format: SessionFormat) => void;
  setCrmAccount: (account: CrmAccount) => void;
  setAttendees: (attendees: AttendeeProfile[]) => void;
  updateScope: (patch: Partial<CustomerSessionState["scope"]>) => void;
  setStage: (stage: SessionStage) => void;
  resetSession: () => void;
}

const CustomerSessionContext = createContext<CustomerSessionContextValue | null>(null);

export function CustomerSessionProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CustomerSessionState>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as CustomerSessionState;
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

  const setCrmAccount = useCallback((account: CrmAccount) => {
    setState((prev) => ({ ...prev, crmAccount: account }));
  }, []);

  const setAttendees = useCallback((attendees: AttendeeProfile[]) => {
    setState((prev) => ({ ...prev, attendees }));
  }, []);

  const updateScope = useCallback((patch: Partial<CustomerSessionState["scope"]>) => {
    setState((prev) => ({ ...prev, scope: { ...prev.scope, ...patch } }));
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
    setAttendees,
    updateScope,
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
