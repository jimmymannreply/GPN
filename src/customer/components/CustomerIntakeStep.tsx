import { useRef, useState } from "react";
import {
  CUSTOMER_SESSION_HEADCOUNT_PROMPT,
  CUSTOMER_SESSION_INTAKE_OPENING,
  CUSTOMER_SESSION_NEW_ACCOUNT_OPENING,
  customerSessionIntakePrefixSteps,
  customerSessionNewAccountPrefixSteps,
  parseIndustryFromStack,
  parsePartnerFromIndustryStack,
} from "@/customer/data/customerIntakeSteps";
import type { CrmAccount, CustomerSessionState } from "@/customer/hooks/useCustomerSession";
import { SessionIntakeWithAttendees } from "@/shared/conversational/SessionIntakeWithAttendees";
import type { AttendeeProfile } from "@/shared/attendees/types";

export function CustomerIntakeStep({
  account,
  scope,
  onApplyScopeField,
  onCreateAccount,
  onAttendeesChange,
  onComplete,
  onSkipWithCrmDefaults,
}: {
  account: CrmAccount | null;
  scope: CustomerSessionState["scope"];
  onApplyScopeField: (patch: Partial<CustomerSessionState["scope"]>) => void;
  onCreateAccount: (account: CrmAccount) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onComplete: () => void;
  onSkipWithCrmDefaults: () => void;
}) {
  const [sessionKey] = useState(() => Date.now());
  const draftRef = useRef({ name: "", stack: "" });
  const addingAccount = !account;

  return (
    <div className="space-y-4" data-testid="stage-intake">
      <div>
        <h2 className="text-lg font-semibold">
          {addingAccount ? "Add your account via intake" : "Intake chat"}
        </h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          {addingAccount ? (
            <>
              We&apos;ll create your CRM account from this chat, then capture scope and who&apos;s in
              the room.
            </>
          ) : (
            <>
              Beyond company lookup — capture pain, outcome, constraints, and who&apos;s in the room
              for <strong>{account.company}</strong>.
            </>
          )}
        </p>
      </div>

      <SessionIntakeWithAttendees
        sessionKey={sessionKey}
        openingLine={
          addingAccount ? CUSTOMER_SESSION_NEW_ACCOUNT_OPENING : CUSTOMER_SESSION_INTAKE_OPENING
        }
        accent="#1a73e8"
        companyHint={account?.company || draftRef.current.name || "your organization"}
        prefixSteps={
          addingAccount ? customerSessionNewAccountPrefixSteps : customerSessionIntakePrefixSteps
        }
        headcountMin={1}
        headcountMax={3}
        headcountPrompt={CUSTOMER_SESSION_HEADCOUNT_PROMPT}
        suffixSteps={[]}
        onApplyField={(stepId, value) => {
          const text = String(value);
          if (stepId === "customerName") {
            draftRef.current.name = text;
            return;
          }
          if (stepId === "industryStack") {
            draftRef.current.stack = text;
            return;
          }
          if (stepId === "painPoint" || stepId === "cxoOutcome" || stepId === "constraints") {
            onApplyScopeField({ [stepId]: text });
          }
        }}
        onAttendeesChange={onAttendeesChange}
        onComplete={() => {
          if (addingAccount) {
            const company = draftRef.current.name.trim() || "New customer account";
            const stack = draftRef.current.stack;
            onCreateAccount({
              id: `crm-chat-${Date.now()}`,
              company,
              partnerOfRecord: parsePartnerFromIndustryStack(stack),
              industry: parseIndustryFromStack(stack),
              segment: "Commercial",
            });
          }
          onComplete();
        }}
      />

      {!addingAccount && (
        <button
          type="button"
          className="text-sm text-dl-brand hover:underline"
          data-testid="intake-skip-crm-defaults"
          onClick={onSkipWithCrmDefaults}
        >
          Skip chat — use CRM scope defaults
          {scope.painPoint ? " (already started)" : ""}
        </button>
      )}
    </div>
  );
}
