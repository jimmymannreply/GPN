import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  buildFreezeOptions,
  computeCostOfInaction,
  type CostBreakdown,
  type FreezeOption,
  type LedgerIntake,
} from "@/ghost-ledger/data/costModel";

const PARTNER_STORAGE_KEY = "ghost-ledger-hackathon-v1";
const CUSTOMER_STORAGE_KEY = "ghost-ledger-customer-v1";

export type GhostPhase = "intake" | "plan" | "run" | "outcome" | "handoff";
export type HandoffAudience = "partner" | "customer";

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  demo?: boolean;
}

export interface GhostState {
  user: GoogleUser | null;
  brandName: string;
  brandAccent: string;
  phase: GhostPhase;
  intake: LedgerIntake;
  breakdown: CostBreakdown | null;
  freezeOptions: FreezeOption[];
  runStartedAt: number | null;
  elapsedSeconds: number;
  frozen: boolean;
  frozenAtSeconds: number;
  frozenLossUsd: number;
  selectedFreezeId: string | null;
  committedMonthlySavings: number;
  handoffAudience: HandoffAudience;
  dafSubmitted: boolean;
  intakeSessionKey: number;
  telemetry: { event: string; at: string; detail?: string }[];
}

const defaultIntake: LedgerIntake = {
  customerName: "",
  industryStack: "",
  headcount: 3,
  attendees: [],
  monthlyToolSpend: 0,
  ticketsPerMonth: 0,
  minutesPerTicket: 12,
  hoursLostPerWeek: 0,
  hourlyLoadedCost: 85,
  monthlyChurnRevenue: 0,
};

const initialState: GhostState = {
  user: null,
  brandName: "Softchoice",
  brandAccent: "#0078D4",
  phase: "intake",
  intake: defaultIntake,
  breakdown: null,
  freezeOptions: [],
  runStartedAt: null,
  elapsedSeconds: 0,
  frozen: false,
  frozenAtSeconds: 0,
  frozenLossUsd: 0,
  selectedFreezeId: null,
  committedMonthlySavings: 0,
  handoffAudience: "partner",
  dafSubmitted: false,
  intakeSessionKey: 0,
  telemetry: [],
};

interface GhostContextValue {
  state: GhostState;
  setUser: (user: GoogleUser | null) => void;
  setBrand: (name: string, accent?: string) => void;
  updateIntake: (patch: Partial<LedgerIntake>) => void;
  completeIntake: () => void;
  returnToIntake: () => void;
  startRun: () => void;
  freezeLedger: (optionId: string) => void;
  goToHandoff: () => void;
  setHandoffAudience: (audience: HandoffAudience) => void;
  submitDaf: () => void;
  resetSession: () => void;
  liveLossUsd: number;
  agentMessage: string;
}

const GhostContext = createContext<GhostContextValue | null>(null);

export function GhostLedgerProvider({
  children,
  sessionScope = "partner",
}: {
  children: ReactNode;
  sessionScope?: "partner" | "customer";
}) {
  const storageKey =
    sessionScope === "customer" ? CUSTOMER_STORAGE_KEY : PARTNER_STORAGE_KEY;
  const [state, setState] = useState<GhostState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as GhostState;
    } catch {
      /* ignore */
    }
    return initialState;
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timer);
  }, [state, storageKey]);

  useEffect(() => {
    if (state.phase !== "run" || state.frozen || !state.breakdown) return;
    const id = window.setInterval(() => {
      setState((prev) => {
        if (prev.phase !== "run" || prev.frozen) return prev;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [state.phase, state.frozen, state.breakdown]);

  const setUser = useCallback((user: GoogleUser | null) => {
    setState((prev) => ({
      ...prev,
      user,
      telemetry: user
        ? [
            ...prev.telemetry,
            { event: "auth.google", at: new Date().toISOString(), detail: user.email },
          ].slice(-40)
        : prev.telemetry,
    }));
  }, []);

  const setBrand = useCallback((name: string, accent?: string) => {
    setState((prev) => ({
      ...prev,
      brandName: name,
      brandAccent: accent ?? prev.brandAccent,
    }));
  }, []);

  const updateIntake = useCallback((patch: Partial<LedgerIntake>) => {
    setState((prev) => ({ ...prev, intake: { ...prev.intake, ...patch } }));
  }, []);

  const completeIntake = useCallback(() => {
    setState((prev) => {
      const breakdown = computeCostOfInaction(prev.intake);
      const freezeOptions = buildFreezeOptions(prev.intake);
      return {
        ...prev,
        phase: "plan",
        breakdown,
        freezeOptions,
        telemetry: [
          ...prev.telemetry,
          {
            event: "intake.complete",
            at: new Date().toISOString(),
            detail: prev.intake.customerName,
          },
        ].slice(-40),
      };
    });
  }, []);

  const returnToIntake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "intake",
      breakdown: null,
      freezeOptions: [],
      runStartedAt: null,
      elapsedSeconds: 0,
      frozen: false,
      frozenAtSeconds: 0,
      frozenLossUsd: 0,
      selectedFreezeId: null,
      committedMonthlySavings: 0,
      dafSubmitted: false,
      intakeSessionKey: prev.intakeSessionKey + 1,
    }));
  }, []);

  const startRun = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "run",
      runStartedAt: Date.now(),
      elapsedSeconds: 0,
      telemetry: [
        ...prev.telemetry,
        { event: "ledger.run.start", at: new Date().toISOString() },
      ].slice(-40),
    }));
  }, []);

  const freezeLedger = useCallback((optionId: string) => {
    setState((prev) => {
      if (!prev.breakdown) return prev;
      const option = prev.freezeOptions.find((o) => o.id === optionId);
      const liveLoss = prev.elapsedSeconds * prev.breakdown.perSecond;
      const committedMonthlySavings = option
        ? prev.breakdown.monthlyTotal * option.savingsPercent
        : 0;
      return {
        ...prev,
        frozen: true,
        frozenAtSeconds: prev.elapsedSeconds,
        frozenLossUsd: liveLoss,
        selectedFreezeId: optionId,
        committedMonthlySavings,
        phase: "outcome",
        telemetry: [
          ...prev.telemetry,
          {
            event: "ledger.freeze",
            at: new Date().toISOString(),
            detail: `${optionId}:${Math.round(liveLoss)}`,
          },
        ].slice(-40),
      };
    });
  }, []);

  const goToHandoff = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "handoff" }));
  }, []);

  const setHandoffAudience = useCallback((audience: HandoffAudience) => {
    setState((prev) => ({ ...prev, handoffAudience: audience }));
  }, []);

  const submitDaf = useCallback(() => {
    setState((prev) => ({
      ...prev,
      dafSubmitted: true,
      telemetry: [
        ...prev.telemetry,
        {
          event: "handoff.daf.submit",
          at: new Date().toISOString(),
          detail: String(Math.round(prev.frozenLossUsd)),
        },
      ].slice(-40),
    }));
  }, []);

  const resetSession = useCallback(() => {
    setState({ ...initialState, intakeSessionKey: Date.now() });
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const liveLossUsd = useMemo(() => {
    if (!state.breakdown) return 0;
    return state.elapsedSeconds * state.breakdown.perSecond;
  }, [state.breakdown, state.elapsedSeconds]);

  const agentMessage = useMemo(() => {
    const { phase, breakdown, frozen } = state;
    switch (phase) {
      case "intake":
        return `Answer the agent in the chat — real spend, volume, and churn numbers only. Then we'll start the live ledger.`;
      case "plan":
        return breakdown
          ? `Cost-of-inaction model ready: ${breakdown.monthlyTotal.toFixed(0)} per month walking out the door. In Run, the ledger ticks live while the room debates.`
          : "Complete intake to model cost of inaction.";
      case "run":
        return frozen
          ? "Ledger frozen — capture the outcome."
          : "Watch the counter. Debate has a price tag. Freeze by committing to a use case with a dollar figure that reverses the bleed.";
      case "outcome":
        return state.frozen
          ? `Frozen at ${state.frozenLossUsd.toFixed(0)} session loss so far, with ${state.committedMonthlySavings.toFixed(0)}/mo reversal target. Route handoff by audience.`
          : "The ledger is still running — freeze or let it count.";
      case "handoff":
        return state.handoffAudience === "partner"
          ? "Partner path: file the frozen figure plus Gemini pilot scope and apply for DAF."
          : "Customer path: send the frozen ledger and Gemini reversal plan to their Google PDM.";
      default:
        return "";
    }
  }, [state]);

  const value: GhostContextValue = {
    state,
    setUser,
    setBrand,
    updateIntake,
    completeIntake,
    returnToIntake,
    startRun,
    freezeLedger,
    goToHandoff,
    setHandoffAudience,
    submitDaf,
    resetSession,
    liveLossUsd,
    agentMessage,
  };

  return <GhostContext.Provider value={value}>{children}</GhostContext.Provider>;
}

export function useGhostLedger() {
  const ctx = useContext(GhostContext);
  if (!ctx) throw new Error("useGhostLedger must be used within GhostLedgerProvider");
  return ctx;
}
