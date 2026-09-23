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
  buildSnakeOrder,
  industryLabel,
  type IndustryKey,
  type UseCaseCandidate,
} from "@/hackathon/data/useCaseLibrary";
import { tailorUseCasePool } from "@/hackathon/data/intakeUseCaseGenerator";

const PARTNER_STORAGE_KEY = "hackathon-use-case-draft-v2";
const CUSTOMER_STORAGE_KEY = "hackathon-use-case-draft-customer-v1";

export type HackathonPhase = "intake" | "plan" | "draft" | "outcome" | "handoff";

export type HandoffAudience = "partner" | "customer";

export interface GoogleUser {
  name: string;
  email: string;
  picture?: string;
  demo?: boolean;
}

export interface IntakeAnswers {
  customerName: string;
  industryStack: string;
  painPoint: string;
  cxoOutcome: string;
  headcount: number;
}

export interface DraftPick {
  useCaseId: string;
  owner: string;
  round: number;
  contested: boolean;
}

export interface HackathonState {
  user: GoogleUser | null;
  brandName: string;
  brandAccent: string;
  phase: HackathonPhase;
  intake: IntakeAnswers;
  curatedIndustry: IndustryKey | null;
  curatedIndustryPhrase: string;
  pool: UseCaseCandidate[];
  participants: string[];
  snakeOrder: number[];
  draftIndex: number;
  picks: DraftPick[];
  handoffAudience: HandoffAudience;
  dafSubmitted: boolean;
  intakeSessionKey: number;
  telemetry: { event: string; at: string; detail?: string }[];
}

const defaultIntake: IntakeAnswers = {
  customerName: "",
  industryStack: "",
  painPoint: "",
  cxoOutcome: "",
  headcount: 6,
};

const initialState: HackathonState = {
  user: null,
  brandName: "Softchoice",
  brandAccent: "#0078D4",
  phase: "intake",
  intake: defaultIntake,
  curatedIndustry: null,
  curatedIndustryPhrase: "",
  pool: [],
  participants: [],
  snakeOrder: [],
  draftIndex: 0,
  picks: [],
  handoffAudience: "partner",
  dafSubmitted: false,
  intakeSessionKey: 0,
  telemetry: [],
};

function buildDraftSnakeOrder(participantCount: number, poolSize: number): number[] {
  const maxRounds = 3;
  const cap = Math.min(poolSize, participantCount * maxRounds);
  const rounds = Math.max(1, Math.ceil(cap / participantCount));
  return buildSnakeOrder(participantCount, rounds).slice(0, cap);
}

function participantNames(count: number): string[] {
  const roles = [
    "CXO sponsor",
    "VP Operations",
    "IT director",
    "Line-of-business lead",
    "Data & analytics",
    "Security & risk",
    "Finance partner",
    "Customer success",
  ];
  return roles.slice(0, Math.max(4, Math.min(count, roles.length)));
}

interface HackathonContextValue {
  state: HackathonState;
  setUser: (user: GoogleUser | null) => void;
  setBrand: (name: string, accent?: string) => void;
  updateIntake: (patch: Partial<IntakeAnswers>) => void;
  completeIntake: () => void;
  returnToIntake: () => void;
  startDraft: () => void;
  pickUseCase: (useCaseId: string) => void;
  advanceToOutcome: () => void;
  setHandoffAudience: (audience: HandoffAudience) => void;
  submitDaf: () => void;
  resetHackathon: () => void;
  recordOutcomeDownload: (kind: "shortlist" | "use-case", detail: string | number) => void;
  rankedShortlist: { useCase: UseCaseCandidate; owner: string; contested: boolean }[];
  currentPicker: string | null;
  availableCases: UseCaseCandidate[];
  agentMessage: string;
}

const HackathonContext = createContext<HackathonContextValue | null>(null);

export function HackathonDraftProvider({
  children,
  sessionScope = "partner",
}: {
  children: ReactNode;
  sessionScope?: "partner" | "customer";
}) {
  const storageKey =
    sessionScope === "customer" ? CUSTOMER_STORAGE_KEY : PARTNER_STORAGE_KEY;
  const [state, setState] = useState<HackathonState>(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) return JSON.parse(raw) as HackathonState;
    } catch {
      /* ignore */
    }
    return initialState;
  });

  const logTelemetry = useCallback((event: string, detail?: string) => {
    setState((prev) => ({
      ...prev,
      telemetry: [
        ...prev.telemetry,
        { event, at: new Date().toISOString(), detail },
      ].slice(-40),
    }));
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(storageKey, JSON.stringify(state));
    }, 300);
    return () => clearTimeout(timer);
  }, [state, storageKey]);

  // Recover sessions stuck on Run after all use cases were drafted (older bug).
  useEffect(() => {
    if (
      state.phase === "draft" &&
      state.pool.length > 0 &&
      state.picks.length >= state.pool.length
    ) {
      setState((prev) => ({ ...prev, phase: "outcome" }));
    }
  }, [state.phase, state.picks.length, state.pool.length]);

  const setUser = useCallback(
    (user: GoogleUser | null) => {
      setState((prev) => ({ ...prev, user }));
      if (user) logTelemetry("auth.google", user.email);
    },
    [logTelemetry]
  );

  const setBrand = useCallback((name: string, accent?: string) => {
    setState((prev) => ({
      ...prev,
      brandName: name,
      brandAccent: accent ?? prev.brandAccent,
    }));
  }, []);

  const updateIntake = useCallback((patch: Partial<IntakeAnswers>) => {
    setState((prev) => ({ ...prev, intake: { ...prev.intake, ...patch } }));
  }, []);

  const completeIntake = useCallback(() => {
    setState((prev) => {
      const { industry, industryPhrase, pool } = tailorUseCasePool(prev.intake);
      const participants = participantNames(prev.intake.headcount);
      const snakeOrder = buildDraftSnakeOrder(participants.length, pool.length);
      return {
        ...prev,
        phase: "plan",
        curatedIndustry: industry,
        curatedIndustryPhrase: industryPhrase,
        pool,
        participants,
        snakeOrder,
        draftIndex: 0,
        picks: [],
        telemetry: [
          ...prev.telemetry,
          {
            event: "intake.complete",
            at: new Date().toISOString(),
            detail: `${prev.intake.customerName} · ${industryLabel(industry)}`,
          },
        ].slice(-40),
      };
    });
  }, []);

  const returnToIntake = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "intake",
      curatedIndustry: null,
      curatedIndustryPhrase: "",
      pool: [],
      participants: [],
      snakeOrder: [],
      draftIndex: 0,
      picks: [],
      dafSubmitted: false,
      intakeSessionKey: prev.intakeSessionKey + 1,
    }));
  }, []);

  const startDraft = useCallback(() => {
    setState((prev) => {
      logTelemetry("draft.start");
      return { ...prev, phase: "draft" };
    });
  }, [logTelemetry]);

  const pickUseCase = useCallback(
    (useCaseId: string) => {
      setState((prev) => {
        if (prev.phase !== "draft") return prev;
        const already = prev.picks.some((p) => p.useCaseId === useCaseId);
        if (already) return prev;

        const pickerIdx = prev.snakeOrder[prev.draftIndex];
        const owner = prev.participants[pickerIdx] ?? "Facilitator";
        const contested = prev.picks.some((p) => p.useCaseId === useCaseId);
        const round = Math.floor(prev.draftIndex / prev.participants.length) + 1;
        const picks = [
          ...prev.picks,
          { useCaseId, owner, round, contested },
        ];
        const nextIndex = prev.draftIndex + 1;
        const done =
          nextIndex >= prev.snakeOrder.length || picks.length >= prev.pool.length;

        return {
          ...prev,
          picks,
          draftIndex: nextIndex,
          phase: done ? "outcome" : prev.phase,
          telemetry: [
            ...prev.telemetry,
            {
              event: "draft.pick",
              at: new Date().toISOString(),
              detail: `${owner}:${useCaseId}`,
            },
          ].slice(-40),
        };
      });
    },
    [logTelemetry]
  );

  const advanceToOutcome = useCallback(() => {
    setState((prev) => ({ ...prev, phase: "outcome" }));
    logTelemetry("outcome.review");
  }, [logTelemetry]);

  const setHandoffAudience = useCallback((audience: HandoffAudience) => {
    setState((prev) => ({ ...prev, handoffAudience: audience, phase: "handoff" }));
    logTelemetry("handoff.audience", audience);
  }, [logTelemetry]);

  const submitDaf = useCallback(() => {
    setState((prev) => ({ ...prev, dafSubmitted: true }));
    logTelemetry("handoff.daf.submit", "Deal Acceleration Funds — POC seam");
  }, [logTelemetry]);

  const resetHackathon = useCallback(() => {
    setState({ ...initialState, intakeSessionKey: Date.now() });
    localStorage.removeItem(storageKey);
  }, [storageKey]);

  const recordOutcomeDownload = useCallback((kind: "shortlist" | "use-case", detail: string | number) => {
    setState((prev) => ({
      ...prev,
      telemetry: [
        ...prev.telemetry,
        {
          event: `outcome.doc.${kind}`,
          at: new Date().toISOString(),
          detail: String(detail),
        },
      ].slice(-40),
    }));
  }, []);

  const rankedShortlist = useMemo(() => {
    const byId = new Map(state.pool.map((c) => [c.id, c]));
    return state.picks
      .map((p) => {
        const useCase = byId.get(p.useCaseId);
        if (!useCase) return null;
        return { useCase, owner: p.owner, contested: p.contested };
      })
      .filter(Boolean) as { useCase: UseCaseCandidate; owner: string; contested: boolean }[];
  }, [state.picks, state.pool]);

  const currentPicker = useMemo(() => {
    if (state.phase !== "draft" || state.draftIndex >= state.snakeOrder.length) {
      return null;
    }
    const idx = state.snakeOrder[state.draftIndex];
    return state.participants[idx] ?? null;
  }, [state.phase, state.draftIndex, state.snakeOrder, state.participants]);

  const pickedIds = useMemo(() => new Set(state.picks.map((p) => p.useCaseId)), [state.picks]);

  const availableCases = useMemo(
    () => state.pool.filter((c) => !pickedIds.has(c.id)),
    [state.pool, pickedIds]
  );

  const agentMessage = useMemo(() => {
    const { phase } = state;
    switch (phase) {
      case "intake":
        return `Let's scope this Use-Case Draft conversationally — answer in the chat below and I'll build your Gemini-ready board.`;
      case "plan":
        return `Plan ready for ${state.curatedIndustry ? industryLabel(state.curatedIndustry) : state.intake.industryStack || "this account"}. Each card includes a Gemini on Google Cloud build pattern — agents, grounding, and stack fit — then a snake order for ${state.participants.length} stakeholders.`;
      case "draft":
        return currentPicker
          ? `${currentPicker} — you're on the clock. Pick one use case; I'll flag duplicates and suggest trades if two owners want the same item.`
          : "Draft complete — moving to outcomes.";
      case "outcome":
        return `Shortlist locked with named owners. Download Google Docs briefs for each outcome, then continue to audience-aware handoff.`;
      case "handoff":
        return state.handoffAudience === "partner"
          ? "Partner path: submit the ranked shortlist, register the pilot, and apply for Deal Acceleration Funds (DAF)."
          : "Customer path: send the ranked shortlist to their Google PDM with the top pick as next step.";
      default:
        return "";
    }
  }, [state, currentPicker]);

  const value: HackathonContextValue = {
    state,
    setUser,
    setBrand,
    updateIntake,
    completeIntake,
    returnToIntake,
    startDraft,
    pickUseCase,
    advanceToOutcome,
    setHandoffAudience,
    submitDaf,
    resetHackathon,
    recordOutcomeDownload,
    rankedShortlist,
    currentPicker,
    availableCases,
    agentMessage,
  };

  return <HackathonContext.Provider value={value}>{children}</HackathonContext.Provider>;
}

export function useHackathonDraft() {
  const ctx = useContext(HackathonContext);
  if (!ctx) throw new Error("useHackathonDraft must be used within HackathonDraftProvider");
  return ctx;
}
