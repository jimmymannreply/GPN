import { Link } from "react-router-dom";
import { useJourneyV3 } from "@/v3/hooks/useJourneyV3";

const v3Standalone = import.meta.env.VITE_V3_STANDALONE === "true";
const journeyPath = v3Standalone ? "/journey" : "/v3/journey";

export function LandingPageV3() {
  const { startJourney } = useJourneyV3();

  return (
    <div className="min-h-screen bg-me-navy-dark text-white">
      <header className="border-b border-white/10 px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <p className="font-serif text-lg">Partner Story Interview V3</p>
          {!v3Standalone && (
            <div className="flex gap-3 text-sm">
              <Link to="/hackathon" className="text-me-ice hover:underline">Hackathon POC</Link>
              <Link to="/v2" className="text-me-ice hover:underline">View V2 demo</Link>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-6 py-24 text-center">
        <h1 className="font-serif text-4xl leading-tight">
          Tell us about your win — just talk.
        </h1>
        <p className="mt-4 text-lg text-me-ice">
          Prefer to type or upload instead? You can switch anytime.
        </p>
        <p className="mt-6 text-sm text-me-ice/90">
          By continuing, you consent to us using what you share for this story.
        </p>
        <Link
          to={journeyPath}
          onClick={startJourney}
          className="mt-10 inline-block rounded-lg bg-me-navy px-8 py-3 font-medium text-white ring-2 ring-me-ice/30"
          data-testid="v3-start"
        >
          Start
        </Link>
      </main>
    </div>
  );
}
