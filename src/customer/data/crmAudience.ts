export type CrmAudience = "google" | "partner" | "customer";

export type PartnerOfRecord = "Softchoice" | "CDW" | "SHI";

export const CRM_PARTNERS: PartnerOfRecord[] = ["Softchoice", "CDW", "SHI"];

export const CRM_AUDIENCE_STORAGE_KEY = "value-session-crm-audience-v1";

export interface CrmAudienceState {
  audience: CrmAudience;
  partnerOfRecord: PartnerOfRecord;
}

const DEFAULT_STATE: CrmAudienceState = {
  audience: "customer",
  partnerOfRecord: "CDW",
};

export function readCrmAudienceState(): CrmAudienceState {
  try {
    const raw = sessionStorage.getItem(CRM_AUDIENCE_STORAGE_KEY);
    if (!raw) return { ...DEFAULT_STATE };
    const parsed = JSON.parse(raw) as Partial<CrmAudienceState>;
    const audience: CrmAudience =
      parsed.audience === "google" || parsed.audience === "partner" || parsed.audience === "customer"
        ? parsed.audience
        : "customer";
    const partnerOfRecord = CRM_PARTNERS.includes(parsed.partnerOfRecord as PartnerOfRecord)
      ? (parsed.partnerOfRecord as PartnerOfRecord)
      : "CDW";
    return { audience, partnerOfRecord };
  } catch {
    return { ...DEFAULT_STATE };
  }
}

export function writeCrmAudienceState(state: CrmAudienceState): void {
  try {
    sessionStorage.setItem(CRM_AUDIENCE_STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* ignore */
  }
}

/** Partner home PDM lens → Google; Partner lens → partner. Customer campaign stays customer. */
export function setCrmAudienceFromPartnerLens(lens: "partner" | "pdm", partner: PartnerOfRecord = "CDW") {
  writeCrmAudienceState({
    audience: lens === "pdm" ? "google" : "partner",
    partnerOfRecord: partner,
  });
}

export function setCrmAudienceCustomer() {
  writeCrmAudienceState({ audience: "customer", partnerOfRecord: "CDW" });
}
