export interface GeminiBlueprint {
  patternName: string;
  pitch: string;
  products: string[];
  buildSteps: string[];
  geminiFit: number;
}

const PATTERNS: { match: RegExp; blueprint: Omit<GeminiBlueprint, "pitch"> & { pitchTpl: string } }[] = [
  {
    match: /support|contact|cx|frontline|intake|access|citizen/i,
    patternName: "Gemini Enterprise agent + Workspace",
    pitchTpl: "Grounded answers and actions where people already work — {stack}.",
    products: ["Gemini Enterprise", "Gemini in Workspace", "Agentspace"],
    buildSteps: [
      "Connect enterprise search to Drive, Sites, and ticketing knowledge",
      "Deploy a governed Gemini agent with human-in-the-loop escalations",
      "Measure deflection, CSAT, and time-to-resolution in BigQuery",
    ],
    geminiFit: 94,
  },
  {
    match: /supply|demand|forecast|inventory|grid|renewable|trading/i,
    patternName: "BigQuery + Gemini analytics copilot",
    pitchTpl: "Turn operational signals into narratives executives trust — layered on {stack}.",
    products: ["BigQuery", "Gemini", "Looker", "Vertex AI"],
    buildSteps: [
      "Unify POS, ERP, and telemetry streams in BigQuery",
      "Use Gemini to generate forecasts and anomaly explanations",
      "Publish CXO-ready dashboards with natural-language drill-down",
    ],
    geminiFit: 91,
  },
  {
    match: /security|secops|fraud|aml|risk|compliance|hipaa|foia/i,
    patternName: "Gemini security & governance agent",
    pitchTpl: "Summarize alerts and policy in plain language — integrated with {stack}.",
    products: ["Gemini Enterprise", "Google SecOps", "Chronicle", "VPC Service Controls"],
    buildSteps: [
      "Ingest alerts and policy corpora into a secured Gemini workspace",
      "Generate explainable triage narratives for analysts",
      "Auto-draft compliance responses with citation links",
    ],
    geminiFit: 89,
  },
  {
    match: /document|loan|claims|invoice|rfq|grant|procurement|prior auth/i,
    patternName: "Document AI + Gemini extraction",
    pitchTpl: "Read messy documents once, reuse structured insight everywhere in {stack}.",
    products: ["Document AI", "Gemini", "Cloud Storage", "Apigee"],
    buildSteps: [
      "Extract entities from PDFs, scans, and email with Document AI",
      "Reason over bundles with Gemini for decision-ready summaries",
      "Write outcomes back to CRM/ERP via secure APIs",
    ],
    geminiFit: 92,
  },
  {
    match: /engineer|developer|product|code|eco|sow|demo/i,
    patternName: "Gemini Code + solution accelerator",
    pitchTpl: "Prototype agents and integrations faster on {stack}.",
    products: ["Gemini Code Assist", "Vertex AI Agent Builder", "Cloud Run"],
    buildSteps: [
      "Scaffold agent tools and APIs with Gemini-assisted code generation",
      "Deploy pilots on Cloud Run with identity-aware proxies",
      "Iterate with eval harnesses in Vertex AI",
    ],
    geminiFit: 88,
  },
  {
    match: /field|plant|maintenance|technician|inspector|vision|quality/i,
    patternName: "Gemini multimodal field copilot",
    pitchTpl: "Voice, photo, and manual grounding for frontline teams on {stack}.",
    products: ["Gemini", "Vertex AI Vision", "Mobile offline cache", "GKE"],
    buildSteps: [
      "Capture photos/voice on device with governed sync",
      "Gemini multimodal reasoning over manuals and prior fixes",
      "Close the loop with work-order updates to ERP",
    ],
    geminiFit: 90,
  },
];

const DEFAULT_PATTERN = {
  patternName: "Gemini Enterprise grounded agent",
  pitchTpl: "A governed Gemini agent that connects to your data estate — {stack}.",
  products: ["Gemini Enterprise", "Vertex AI", "Google Cloud"],
  buildSteps: [
    "Ground Gemini on customer-approved data sources",
    "Orchestrate tools with Agentspace / Agent Builder",
    "Instrument adoption and business outcomes in BigQuery",
  ],
  geminiFit: 86,
};

export function buildGeminiBlueprint(
  title: string,
  summary: string,
  tags: string[],
  stackPhrase: string
): GeminiBlueprint {
  const blob = `${title} ${summary} ${tags.join(" ")}`;
  const stack = stackPhrase || "Google Cloud and existing apps";
  const src = PATTERNS.find((p) => p.match.test(blob)) ?? DEFAULT_PATTERN;

  return {
    patternName: src.patternName,
    pitch: src.pitchTpl.replace("{stack}", stack),
    products: src.products,
    buildSteps: src.buildSteps,
    geminiFit: src.geminiFit,
  };
}

export function attachGeminiToUseCase<
  T extends {
    title: string;
    summary: string;
    tags: string[];
    geminiBlueprint?: GeminiBlueprint;
  },
>(item: T, stackPhrase: string): T {
  return {
    ...item,
    geminiBlueprint: buildGeminiBlueprint(item.title, item.summary, item.tags, stackPhrase),
  };
}
