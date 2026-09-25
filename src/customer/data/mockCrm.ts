import type { CrmAccount } from "@/customer/hooks/useCustomerSession";

export const MOCK_CRM_ACCOUNTS: CrmAccount[] = [
  {
    id: "crm-heartland-mutual",
    company: "Heartland Mutual Insurance",
    partnerOfRecord: "CDW",
    industry: "Insurance",
    segment: "Enterprise",
  },
  {
    id: "crm-northwind-health",
    company: "Northwind Health Systems",
    partnerOfRecord: "Softchoice",
    industry: "Healthcare",
    segment: "Enterprise",
  },
  {
    id: "crm-contoso-retail",
    company: "Contoso Retail Group",
    partnerOfRecord: "SHI",
    industry: "Retail",
    segment: "Commercial",
  },
  {
    id: "crm-fabrikam-mfg",
    company: "Fabrikam Advanced Manufacturing",
    partnerOfRecord: "CDW",
    industry: "Manufacturing",
    segment: "Mid-market",
  },
  {
    id: "crm-adventure-works",
    company: "Adventure Works Outdoors",
    partnerOfRecord: "Softchoice",
    industry: "Consumer goods",
    segment: "Commercial",
  },
  {
    id: "crm-litware-financial",
    company: "Litware Financial Services",
    partnerOfRecord: "SHI",
    industry: "Financial services",
    segment: "Enterprise",
  },
  {
    id: "crm-wide-world-importers",
    company: "Wide World Importers",
    partnerOfRecord: "CDW",
    industry: "Distribution",
    segment: "Mid-market",
  },
];
