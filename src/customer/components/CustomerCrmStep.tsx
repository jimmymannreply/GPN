import { useMemo, useState } from "react";
import {
  customerDemoAccounts,
  MOCK_CRM_ACCOUNTS,
  type MockCrmAccount,
} from "@/customer/data/mockCrm";
import type { CrmAccount } from "@/customer/hooks/useCustomerSession";

export function CustomerCrmStep({
  selectedAccount,
  onSelectAccount,
  onNext,
}: {
  selectedAccount: CrmAccount | null;
  onSelectAccount: (account: MockCrmAccount) => void;
  onNext: () => void;
}) {
  const [query, setQuery] = useState("");
  const demos = customerDemoAccounts();

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];
    return MOCK_CRM_ACCOUNTS.filter(
      (a) =>
        a.company.toLowerCase().includes(q) ||
        a.industry.toLowerCase().includes(q) ||
        a.segment.toLowerCase().includes(q),
    );
  }, [query]);

  return (
    <div className="space-y-6" data-testid="stage-crm">
      <div>
        <h2 className="text-lg font-semibold">Find your account</h2>
        <p className="mt-1 text-sm text-dl-text-secondary">
          Look yourself up in CRM, or pick a demo account. Intake chat comes next for scope details.
        </p>
      </div>

      <div data-testid="crm-demo-picks">
        <p className="text-xs font-semibold uppercase tracking-wider text-dl-text-secondary">
          Demo — pick one account
        </p>
        <div className="mt-2 grid gap-2 sm:grid-cols-3">
          {demos.map((account) => {
            const selected = selectedAccount?.id === account.id;
            return (
              <button
                key={account.id}
                type="button"
                onClick={() => onSelectAccount(account)}
                className={`rounded-dl border p-3 text-left text-sm transition ${
                  selected
                    ? "border-dl-brand bg-dl-brand/10 font-medium"
                    : "border-dl-border bg-dl-page hover:border-dl-brand/40"
                }`}
                data-testid={`crm-demo-${account.id}`}
              >
                <p className="font-medium">{account.company}</p>
                <p className="mt-1 text-xs text-dl-text-secondary">
                  {account.partnerOfRecord} · {account.industry}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-sm">
          <span className="text-dl-text-secondary">Look up your company</span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type at least 2 characters…"
            className="mt-1 w-full rounded-dl border border-dl-border bg-dl-page px-3 py-2 text-sm"
            data-testid="crm-search"
            aria-label="Search CRM accounts"
          />
        </label>
      </div>

      {query.trim().length < 2 ? (
        <p
          className="rounded-dl border border-dashed border-dl-border p-4 text-sm text-dl-text-secondary"
          data-testid="crm-customer-lookup-hint"
        >
          Search to find your account, or use a demo pick above. Full partner directories are not
          shown on the customer path.
        </p>
      ) : (
        <ul className="grid gap-2" data-testid="crm-account-list">
          {filtered.map((account) => {
            const selected = selectedAccount?.id === account.id;
            return (
              <li key={account.id}>
                <button
                  type="button"
                  onClick={() => onSelectAccount(account)}
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
              No match. Try another name or a demo account.
            </li>
          )}
        </ul>
      )}

      {selectedAccount && (
        <p className="text-sm" data-testid="crm-selected">
          Selected: <strong>{selectedAccount.company}</strong>
        </p>
      )}

      <button
        type="button"
        disabled={!selectedAccount}
        onClick={onNext}
        className="rounded-dl bg-dl-brand px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
        data-testid="crm-next"
      >
        Next: Intake chat
      </button>
    </div>
  );
}
