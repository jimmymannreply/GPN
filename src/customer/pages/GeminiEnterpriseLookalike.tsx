import { useState } from "react";
import { Link } from "react-router-dom";
import { BusinessCaseModal } from "@/customer/components/BusinessCaseModal";

const FEATURES = [
  {
    title: "Grounded in your business data",
    body: "Securely connect to Microsoft 365, Google Workspace, and more so answers reflect your reality.",
  },
  {
    title: "Agents that automate real work",
    body: "Prebuilt and no-code agents for multi-step, multi-app workflows your teams already run.",
  },
  {
    title: "Enterprise control",
    body: "You control your data, permissions, and policies — with built-in safety and governance.",
  },
];

export function GeminiEnterpriseLookalike() {
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = () => setModalOpen(true);

  return (
    <div className="min-h-screen bg-white text-gray-900" data-testid="customer-gemini-landing">
      <header className="border-b border-gray-200">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <p className="text-sm font-medium text-gray-700">Google Cloud · Gemini Enterprise</p>
          <a href="#editions" className="text-sm text-[#1a73e8] hover:underline">
            Editions
          </a>
        </div>
      </header>

      <section className="mx-auto max-w-6xl px-6 py-16 md:py-24">
        <p className="text-sm font-medium text-[#1a73e8]">Gemini Enterprise app</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-normal tracking-tight text-gray-900 md:text-5xl">
          Best of Google AI for every employee
        </h1>
        <p className="mt-5 max-w-2xl text-lg text-gray-600">
          Securely connect to your apps, deploy agents that automate multi-step workflows, and keep
          control of your data — then build the business case with your stakeholders.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            data-testid="build-business-case"
            onClick={openModal}
            className="rounded-full bg-[#1a73e8] px-6 py-3 text-sm font-medium text-white shadow hover:bg-[#1765cc]"
          >
            Build my business case
          </button>
          <a
            href="#features"
            className="rounded-full border border-gray-300 px-6 py-3 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Learn more
          </a>
        </div>
      </section>

      <section id="features" className="border-t border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 py-16 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div key={f.title} className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
              <h2 className="text-lg font-medium text-gray-900">{f.title}</h2>
              <p className="mt-2 text-sm text-gray-600">{f.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="editions" className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-normal text-gray-900">Gemini Enterprise editions</h2>
        <p className="mt-2 text-sm text-gray-600">
          Demo surface — trial CTAs replaced with business-case entry.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {["Business", "Standard / Plus"].map((edition) => (
            <div key={edition} className="rounded-2xl border border-gray-200 p-6">
              <h3 className="text-lg font-medium">{edition}</h3>
              <p className="mt-2 text-sm text-gray-600">
                For teams ready to prove value with Gemini Enterprise in the room.
              </p>
              <button
                type="button"
                onClick={openModal}
                className="mt-6 rounded-full bg-[#1a73e8] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#1765cc]"
              >
                Build my business case
              </button>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-gray-200 py-8 text-center text-xs text-gray-500">
        <p>Demo lookalike for stage-fit hackathon — not an official Google Cloud page.</p>
        <p className="mt-2">
          <Link to="/telemetry" className="text-[#1a73e8] hover:underline">
            Partner telemetry
          </Link>
        </p>
      </footer>

      <BusinessCaseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
