import { useState } from "react";
import {
  CUSTOMER_SESSION_HEADCOUNT_PROMPT,
  CUSTOMER_SESSION_INTAKE_OPENING,
  customerSessionIntakePrefixSteps,
} from "@/customer/data/customerIntakeSteps";
import type { CrmAccount, CustomerSessionState } from "@/customer/hooks/useCustomerSession";
import { SessionIntakeWithAttendees } from "@/shared/conversational/SessionIntakeWithAttendees";
import type { AttendeeProfile } from "@/shared/attendees/types";

export function CustomerIntakeStep({
  account,
  scope,
  onApplyScopeField,
  onAttendeesChange,
  onComplete,
  onSkipWithCrmDefaults,
}: {
  account: CrmAccount;
  scope: CustomerSessionState["scope"];
  onApplyScopeField: (patch: Partial<CustomerSessionState["scope"]>) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onComplete: () => void;
  onSkipWithCrmDefaults: () => void;
}) {
  const [sessionKey] = useState(() => Date.now());

  return (
    <div className="space-y-4" data-testid="stage-intake">
      <div>
        <h2 className="text-lg font-semibold">Intake chat</h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          Beyond company lookup — capture pain, outcome, constraints, and who&apos;s in the room for{" "}
          <strong>{account.company}</strong>.
        </p>
      </div>

      <SessionIntakeWithAttendees
        sessionKey={sessionKey}
        openingLine={CUSTOMER_SESSION_INTAKE_OPENING}
        accent="#1a73e8"
        companyHint={account.company}
        prefixSteps={customerSessionIntakePrefixSteps}
        headcountMin={1}
        headcountMax={3}
        headcountPrompt={CUSTOMER_SESSION_HEADCOUNT_PROMPT}
        suffixSteps={[]}
        onApplyField={(stepId, value) => {
          if (
            stepId === "painPoint" ||
            stepId === "cxoOutcome" ||
            stepId === "constraints"
          ) {
            onApplyScopeField({ [stepId]: String(value) });
          }
        }}
        onAttendeesChange={onAttendeesChange}
        onComplete={onComplete}
      />

      <button
        type="button"
        className="text-sm text-dl-brand hover:underline"
        data-testid="intake-skip-crm-defaults"
        onClick={onSkipWithCrmDefaults}
      >
        Skip chat — use CRM scope defaults
        {scope.painPoint ? " (already started)" : ""}
      </button>
    </div>
  );
}
