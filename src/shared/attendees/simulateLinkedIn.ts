import type { LinkedInSimulation } from "./types";

const TITLES = [
  "Chief Digital Officer",
  "VP of Operations",
  "Director of IT",
  "Head of Customer Experience",
  "VP Finance",
  "Director of Data & Analytics",
];

const FOCUS = [
  ["AI adoption", "operating model"],
  ["cost to serve", "automation"],
  ["cloud modernization", "security"],
  ["employee productivity", "knowledge work"],
  ["revenue growth", "CX"],
];

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function simulateLinkedInProfile(name: string, companyHint: string): LinkedInSimulation {
  const company = companyHint.trim() || "their organization";
  const h = hashStr(`${name.toLowerCase()}|${company.toLowerCase()}`);
  const title = TITLES[h % TITLES.length];
  const focusAreas = FOCUS[h % FOCUS.length];
  const years = 2 + (h % 8);
  return {
    headline: `${title} at ${company}`,
    title,
    company,
    tenure: `${years}+ years in role`,
    focusAreas: [...focusAreas],
    simulated: true,
  };
}

export function formatLinkedInBubble(name: string, profile: LinkedInSimulation): string {
  return [
    `LinkedIn · ${name}`,
    profile.headline,
    `${profile.title} · ${profile.tenure}`,
    `Focus: ${profile.focusAreas.join(" · ")}`,
    "Simulated LinkedIn enrichment for demo.",
  ].join("\n");
}
