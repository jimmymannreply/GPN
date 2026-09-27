import { tailorUseCasePool } from "@/hackathon/data/intakeUseCaseGenerator";
import type { UseCaseCandidate } from "@/hackathon/data/useCaseLibrary";
import type { CustomerSessionState } from "@/customer/hooks/useCustomerSession";

const MIN_CANDIDATES = 6;
const MAX_CANDIDATES = 8;

/** Build 6–8 Gemini pilot candidates from staged session scope + stack. */
export function generateRunCandidates(state: CustomerSessionState): UseCaseCandidate[] {
  const industryStack = [
    state.crmAccount?.industry,
    state.techStack.trim() || state.crmAccount?.segment,
  ]
    .filter(Boolean)
    .join(" · ");

  const { pool } = tailorUseCasePool({
    customerName: state.crmAccount?.company ?? "Customer",
    industryStack: industryStack || "General",
    painPoint: state.scope.painPoint,
    cxoOutcome: state.scope.cxoOutcome,
  });

  const count = Math.min(MAX_CANDIDATES, Math.max(MIN_CANDIDATES, pool.length));
  return pool.slice(0, count);
}
