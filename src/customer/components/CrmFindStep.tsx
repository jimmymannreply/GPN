import { useMemo, useState, type FormEvent } from "react";
import { MOCK_CRM_ACCOUNTS } from "@/customer/data/mockCrm";
import type { CrmAccount } from "@/customer/hooks/useCustomerSession";
import { simulateLinkedInProfile } from "@/shared/attendees/simulateLinkedIn";
import type { AttendeeProfile } from "@/shared/attendees/types";

const MAX_ATTENDEES = 3;

export function CrmFindStep({
  selectedAccount,
  attendees,
  onSelectAccount,
  onAttendeesChange,
  onNext,
}: {
  selectedAccount: CrmAccount | null;
  attendees: AttendeeProfile[];
  onSelectAccount: (account: CrmAccount) => void;
  onAttendeesChange: (attendees: AttendeeProfile[]) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [addForm, setAddForm] = useState({
    company: "",
    partnerOfRecord: "CDW",
    industry: "",
    segment: "Enterprise",
  });
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeRole, setAttendeeRole] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return MOCK_CRM_ACCOUNTS;
    return MOCK_CRM_ACCOUNTS.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.partnerOfRecord.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.segment.toLowerCase().includes(q)
    );
  }, [query]);

  const pickAccount = (account: CrmAccount) => {
    onSelectAccount(account);
    setShowAdd(false);
  };

  const submitAdd = (e: FormEvent) => {
    e.preventDefault();
    const company = addForm.company.trim();
    if (!company) return;
    const account: CrmAccount = {
      id: `crm-custom-${Date.now()}`,
      company,
      partnerOfRecord: addForm.partnerOfRecord.trim() || "Partner",
      industry: addForm.industry.trim() || "General",
      segment: addForm.segment.trim() || "Commercial",
    };
    pickAccount(account);
    setAddForm({ company: "", partnerOfRecord: "CDW", industry: "", segment: "Enterprise" });
  };

  const addAttendee = (e: FormEvent) => {
    e.preventDefault();
    if (!selectedAccount || attendees.length >= MAX_ATTENDEES) return;
    const name = attendeeName.trim();
    const role = attendeeRole.trim();
    if (!name || !role) return;
    const linkedIn = simulateLinkedInProfile(name, selectedAccount.company);
    onAttendeesChange([...attendees, { name, role, linkedIn }]);
    setAttendeeName("");
    setAttendeeRole("");
  };

  return (
    <div className="space-y-6" data-testid="stage-crm">
      <div>
        <h2 className="text-lg font-semibold">Find CRM account</h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          Search simulated Softchoice, CDW, and SHI accounts, or add one for this demo.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search company, partner, industry…"
          className="min-w-[16rem] flex-1 rounded-dl border border-dl-border bg-dl-page px-3 py-2 text-sm"
          data-testid="crm-search"
          aria-label="Search CRM accounts"
        />
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
          data-testid="crm-add-toggle"
        >
          {showAdd ? "Cancel add" : "Add account"}
        </button>
      </div>

      {showAdd && (
        <form
          onSubmit={submitAdd}
          className="grid gap-3 rounded-dl border border-dl-border bg-dl-page p-4 sm:grid-cols-2"
          data-testid="crm-add-form"
        >
          <label className="text-sm sm:col-span-2">
            <span className="text-dl-text-secondary">Company</span>
            <input
              required
              value={addForm.company}
              onChange={(e) => setAddForm((f) => ({ ...f, company: e.target.value }))}
              className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-dl-text-secondary">Partner of record</span>
            <input
              value={addForm.partnerOfRecord}
              onChange={(e) => setAddForm((f) => ({ ...f, partnerOfRecord: e.target.value }))}
              className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-dl-text-secondary">Industry</span>
            <input
              value={addForm.industry}
              onChange={(e) => setAddForm((f) => ({ ...f, industry: e.target.value }))}
              className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
            />
          </label>
          <label className="text-sm">
            <span className="text-dl-text-secondary">Segment</span>
            <input
              value={addForm.segment}
              onChange={(e) => setAddForm((f) => ({ ...f, segment: e.target.value }))}
              className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
            />
          </label>
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white"
              data-testid="crm-add-submit"
            >
              Save account
            </button>
          </div>
        </form>
      )}

      <ul className="grid gap-2">
        {filtered.map((account) => {
          const selected = selectedAccount?.id === account.id;
          return (
            <li key={account.id}>
              <button
                type="button"
                onClick={() => pickAccount(account)}
                className={`w-full rounded-dl border p-4 text-left transition ${
                  selected
                    ? "border-dl-brand bg-dl-brand/10 shadow-stage-active"
                    : "border-dl-border bg-dl-surface hover:border-dl-brand/40"
                }`}
                data-testid={`crm-pick-${account.id}`}
              >
                <p className="text-sm font-semibold">{account.company}</p>
                <p className="mt-1 text-xs text-dl-text-secondary">
                  {account.partnerOfRecord} · {account.industry} · {account.segment}
                </p>
              </button>
            </li>
          );
        })}
        {filtered.length === 0 && (
          <li className="rounded-dl border border-dashed border-dl-border p-4 text-sm text-dl-text-secondary">
            No accounts match. Try another search or add an account.
          </li>
        )}
      </ul>

      {selectedAccount && (
        <section className="space-y-4 rounded-dl border border-dl-border bg-dl-page p-4" data-testid="crm-attendees">
          <div>
            <h3 className="text-sm font-semibold">Attendees (optional)</h3>
            <p className="mt-1 text-xs text-dl-text-secondary">
              Add 1–{MAX_ATTENDEES} people for LinkedIn enrichment, or skip and continue.
            </p>
          </div>

          {attendees.length > 0 && (
            <ul className="space-y-2">
              {attendees.map((a) => (
                <li
                  key={`${a.name}-${a.role}`}
                  className="rounded-dl border border-dl-border bg-dl-surface p-3 text-sm"
                >
                  <p className="font-medium">
                    {a.name} · {a.role}
                  </p>
                  <p className="mt-1 text-xs text-dl-text-secondary">{a.linkedIn.headline}</p>
                </li>
              ))}
            </ul>
          )}

          {attendees.length < MAX_ATTENDEES && (
            <form onSubmit={addAttendee} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
              <label className="text-sm">
                <span className="text-dl-text-secondary">Name</span>
                <input
                  value={attendeeName}
                  onChange={(e) => setAttendeeName(e.target.value)}
                  className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
                  data-testid="crm-attendee-name"
                />
              </label>
              <label className="text-sm">
                <span className="text-dl-text-secondary">Role</span>
                <input
                  value={attendeeRole}
                  onChange={(e) => setAttendeeRole(e.target.value)}
                  className="mt-1 w-full rounded-dl border border-dl-border bg-dl-surface px-3 py-2"
                  data-testid="crm-attendee-role"
                />
              </label>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="rounded-dl border border-dl-border px-4 py-2 text-sm font-medium"
                  data-testid="crm-attendee-add"
                >
                  Enrich
                </button>
              </div>
            </form>
          )}

          <button
            type="button"
            onClick={onNext}
            className="text-sm text-dl-brand hover:underline"
            data-testid="crm-skip-attendees"
          >
            Skip attendees
          </button>
        </section>
      )}

      <div>
        <button
          type="button"
          disabled={!selectedAccount}
          onClick={onNext}
          className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
          data-testid="crm-next"
        >
          Next: Scope
        </button>
      </div>
    </div>
  );
}
