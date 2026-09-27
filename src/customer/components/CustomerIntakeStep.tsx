import { useMemo, useRef, useState } from "react";
import {
  buildCustomerIntakePlan,
  ledgerValueFromStep,
  parsePartnerFromIndustryStack,
} from "@/customer/data/customerIntakeSteps";
import type {
  CrmAccount,
  CustomerSessionState,
  LedgerFields,
  SessionFormat,
} from "@/customer/hooks/useCustomerSession";
import { ConversationalIntake } from "@/shared/conversational/ConversationalIntake";
import { SessionIntakeWithAttendees } from "@/shared/conversational/SessionIntakeWithAttendees";
import type { AttendeeProfile } from "@/shared/attendees/types";

export function CustomerIntakeStep({
  format,
  account,
  scope,
  techStack,
  ledger,
  attendees,
  addingViaChat,
  onApplyScopeField,
  onTechStack,
  onUpdateLedger,
  onCreateAccount,
  onAttendeesChange,
  onComplete,
  onSkipWithCrmDefaults,
}: {
  format: SessionFormat;
  account: CrmAccount | null;
  scope: CustomerSessionState["scope"];
  techStack: string;
  ledger: LedgerFields;
  attendees: AttendeeProfile[];
  addingViaChat: boolean;
  onApplyScopeField: (patch: Partial<CustomerSessionState["scope"]>) => void;
  onTechStack: (stack: string) => void;
  onUpdateLedger: (patch: Partial<LedgerFields>) => void;
  onCreateAccount: (account: CrmAccount) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onComplete: () => void;
  onSkipWithCrmDefaults: () => void;
}) {
  const [sessionKey] = useState(() => Date.now());
  const plan = useMemo(
    () =>
      buildCustomerIntakePlan(
        format,
        account,
        scope,
        techStack,
        ledger,
        attendees.length,
        addingViaChat,
      ),
    // Freeze gaps at mount so filling fields doesn't reshuffle the script
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sessionKey],
  );

  const [phase, setPhase] = useState<"fields" | "attendees">(() =>
    plan.fieldSteps.length === 0 && plan.needAttendees ? "attendees" : "fields",
  );
  const draftRef = useRef({
    customerName: "",
    industry: "",
    contactName: "",
    contactRole: "",
    partnerOfRecord: "",
  });

  const applyField = (stepId: string, value: unknown) => {
    const text = String(value);
    if (stepId === "customerName") draftRef.current.customerName = text;
    else if (stepId === "industry") draftRef.current.industry = text;
    else if (stepId === "contactName") draftRef.current.contactName = text;
    else if (stepId === "contactRole") draftRef.current.contactRole = text;
    else if (stepId === "partnerOfRecord") draftRef.current.partnerOfRecord = text;
    else if (stepId === "techStack") onTechStack(text);
    else if (stepId === "painPoint" || stepId === "cxoOutcome" || stepId === "constraints") {
      onApplyScopeField({ [stepId]: text });
    } else {
      const ledgerPatch = ledgerValueFromStep(stepId, value);
      if (ledgerPatch) onUpdateLedger(ledgerPatch);
    }
  };

  const finishFields = () => {
    if (addingViaChat || !account?.company) {
      const d = draftRef.current;
      onCreateAccount({
        id: `crm-chat-${Date.now()}`,
        company: d.customerName.trim() || "New customer account",
        industry: d.industry.trim() || "General",
        contact: {
          name: d.contactName.trim() || "Primary contact",
          role: d.contactRole.trim() || "Sponsor",
        },
        partnerOfRecord: parsePartnerFromIndustryStack(d.partnerOfRecord || d.industry),
        segment: "Commercial",
      });
    }
    if (plan.needAttendees) setPhase("attendees");
    else onComplete();
  };

  const canSkip = Boolean(account?.company) && !addingViaChat;
  const crmCovered =
    phase === "fields" && plan.fieldSteps.length === 0 && !plan.needAttendees;

  return (
    <div className="space-y-4" data-testid="stage-intake">
      <div>
        <h2 className="text-lg font-semibold">
          {addingViaChat ? "Add your account via intake" : "Intake chat"}
        </h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          Identification is company, industry, and contact. Missing CRM enrichment — pain, tech
          stack
          {format === "ledger" ? ", ghost-ledger numbers" : ""}, and who attends the hackathon — is
          asked here.
        </p>
      </div>

      {crmCovered && (
        <div
          className="rounded-dl border border-dl-border bg-dl-page p-4 text-sm"
          data-testid="intake-crm-covered"
        >
          <p>
            CRM already has identification and enrichment for{" "}
            <span className="font-medium">{account?.company}</span>
            {account?.contact ? ` (contact ${account.contact.name})` : ""}. Nothing left to ask in
            chat.
          </p>
          <button
            type="button"
            className="mt-3 rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
            data-testid="intake-continue-crm"
            onClick={onComplete}
          >
            Continue to scope
          </button>
        </div>
      )}

      {phase === "fields" && plan.fieldSteps.length > 0 && (
        <ConversationalIntake
          sessionKey={sessionKey}
          steps={plan.fieldSteps}
          openingLine={plan.openingLine}
          accent="#1a73e8"
          onApply={applyField}
          onComplete={finishFields}
        />
      )}

      {phase === "attendees" && (
        <SessionIntakeWithAttendees
          sessionKey={sessionKey + 1}
          openingLine="Next — who should attend the hackathon? I'll pull LinkedIn context for each person."
          accent="#1a73e8"
          companyHint={account?.company || draftRef.current.customerName || "your organization"}
          prefixSteps={[]}
          headcountMin={1}
          headcountMax={3}
          headcountPrompt={plan.headcountPrompt}
          suffixSteps={[]}
          onApplyField={() => {}}
          onAttendeesChange={onAttendeesChange}
          onComplete={onComplete}
        />
      )}

      {canSkip && !crmCovered && (
        <button
          type="button"
          className="text-sm text-dl-brand hover:underline"
          data-testid="intake-skip-crm-defaults"
          onClick={onSkipWithCrmDefaults}
        >
          Skip remaining questions — keep CRM values
        </button>
      )}
    </div>
  );
}
