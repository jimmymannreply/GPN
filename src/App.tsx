import { BrowserRouter, Outlet, Route, Routes } from "react-router-dom";
import { JourneyProvider } from "@/hooks/useJourneyState";
import { SpeechProvider } from "@/hooks/useSpeech";
import { LandingPage } from "@/pages/LandingPage";
import { MockPartnerPage } from "@/pages/MockPartnerPage";
import { JourneyPage } from "@/pages/JourneyPage";
import { ConsentPage } from "@/pages/ConsentPage";
import { JourneyV2Provider } from "@/v2/hooks/useJourneyV2";
import { LandingPageV2 } from "@/v2/pages/LandingPageV2";
import { JourneyPageV2 } from "@/v2/pages/JourneyPageV2";
import { SubmissionsQueuePage } from "@/v2/pages/SubmissionsQueuePage";
import { JourneyV3Provider } from "@/v3/hooks/useJourneyV3";
import { LandingPageV3 } from "@/v3/pages/LandingPageV3";
import { JourneyPageV3 } from "@/v3/pages/JourneyPageV3";
import { SubmissionsQueuePageV3 } from "@/v3/pages/SubmissionsQueuePageV3";
import { HackathonDraftProvider } from "@/hackathon/hooks/useHackathonDraft";
import { LandingPageHackathon } from "@/hackathon/pages/LandingPageHackathon";
import { JourneyPageHackathon } from "@/hackathon/pages/JourneyPageHackathon";
import { GhostLedgerProvider } from "@/ghost-ledger/hooks/useGhostLedger";
import { LandingPageGhostLedger } from "@/ghost-ledger/pages/LandingPageGhostLedger";
import { JourneyPageGhostLedger } from "@/ghost-ledger/pages/JourneyPageGhostLedger";
import { GeminiEnterpriseLookalike } from "@/customer/pages/GeminiEnterpriseLookalike";
import { CustomerDashboardPage } from "@/customer/pages/CustomerDashboardPage";
import { CustomerSessionPage } from "@/customer/pages/CustomerSessionPage";
import { CustomerSessionProvider } from "@/customer/hooks/useCustomerSession";
import { TelemetryPage } from "@/telemetry/pages/TelemetryPage";
import { PartnerHomePage } from "@/partner-home/pages/PartnerHomePage";
import { FundingPage } from "@/partner-home/pages/FundingPage";

const basename =
  import.meta.env.BASE_URL === "/" ? undefined : import.meta.env.BASE_URL.replace(/\/$/, "");

const v2Standalone = import.meta.env.VITE_V2_STANDALONE === "true";
const v2Base = v2Standalone ? "/" : "/v2";
const v2Journey = v2Standalone ? "/journey" : "/v2/journey";
const v2Submissions = v2Standalone ? "/submissions" : "/v2/submissions";

const v3Standalone = import.meta.env.VITE_V3_STANDALONE === "true";
const v3Base = v3Standalone ? "/" : "/v3";
const v3Journey = v3Standalone ? "/journey" : "/v3/journey";
const v3Submissions = v3Standalone ? "/submissions" : "/v3/submissions";

function V1Shell() {
  return (
    <JourneyProvider>
      <Outlet />
    </JourneyProvider>
  );
}

function V2Shell() {
  return (
    <JourneyV2Provider>
      <Outlet />
    </JourneyV2Provider>
  );
}

function V3Shell() {
  return (
    <JourneyV3Provider>
      <Outlet />
    </JourneyV3Provider>
  );
}

export default function App() {
  return (
    <SpeechProvider>
      <BrowserRouter basename={basename}>
        <Routes>
          <Route path="/" element={<PartnerHomePage />} />
          <Route path="/funding" element={<FundingPage />} />
          <Route path="/customer" element={<GeminiEnterpriseLookalike />} />
          <Route
            element={
              <CustomerSessionProvider>
                <Outlet />
              </CustomerSessionProvider>
            }
          >
            <Route path="/customer/dashboard" element={<CustomerDashboardPage />} />
            <Route path="/customer/session" element={<CustomerSessionPage />} />
          </Route>
          <Route path="/telemetry" element={<TelemetryPage />} />
          <Route element={<V1Shell />}>
            <Route path="/v1" element={<LandingPage />} />
            <Route path="/partner" element={<MockPartnerPage />} />
            <Route path="/journey" element={<JourneyPage />} />
            <Route path="/consent" element={<ConsentPage />} />
          </Route>
          <Route element={<V2Shell />}>
            <Route path={v2Base} element={<LandingPageV2 />} />
            <Route path={v2Journey} element={<JourneyPageV2 />} />
            <Route path={v2Submissions} element={<SubmissionsQueuePage />} />
          </Route>
          <Route element={<V3Shell />}>
            <Route path={v3Base} element={<LandingPageV3 />} />
            <Route path={v3Journey} element={<JourneyPageV3 />} />
            <Route path={v3Submissions} element={<SubmissionsQueuePageV3 />} />
          </Route>
          <Route
            element={
              <HackathonDraftProvider>
                <Outlet />
              </HackathonDraftProvider>
            }
          >
            <Route path="/hackathon" element={<LandingPageHackathon />} />
            <Route path="/hackathon/journey" element={<JourneyPageHackathon />} />
          </Route>
          <Route
            path="/customer/use-case-draft"
            element={
              <HackathonDraftProvider sessionScope="customer">
                <JourneyPageHackathon customerMode />
              </HackathonDraftProvider>
            }
          />
          <Route
            element={
              <GhostLedgerProvider>
                <Outlet />
              </GhostLedgerProvider>
            }
          >
            <Route path="/hackathon/ghost-ledger" element={<LandingPageGhostLedger />} />
            <Route path="/hackathon/ghost-ledger/journey" element={<JourneyPageGhostLedger />} />
          </Route>
          <Route
            path="/customer/ghost-ledger"
            element={
              <GhostLedgerProvider sessionScope="customer">
                <JourneyPageGhostLedger customerMode />
              </GhostLedgerProvider>
            }
          />
        </Routes>
      </BrowserRouter>
    </SpeechProvider>
  );
}
