import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useHackathonDraft } from "@/hackathon/hooks/useHackathonDraft";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function DemoGoogleButton({ customerMode }: { customerMode: boolean }) {
  const { setUser } = useHackathonDraft();

  return (
    <button
      type="button"
      data-testid="google-demo-signin"
      onClick={() =>
        setUser({
          name: "Alex Rivera",
          email: customerMode
            ? "alex.rivera@customer.example"
            : "alex.rivera@partner.example",
          demo: true,
        })
      }
      className="flex w-full items-center justify-center gap-3 rounded-dl border border-dl-border bg-dl-surface px-4 py-3 text-sm font-medium text-dl-text shadow-card transition hover:bg-dl-page"
    >
      <span className="text-lg" aria-hidden>G</span>
      Continue with Google (demo)
    </button>
  );
}

function LiveGoogleLogin() {
  const { setUser } = useHackathonDraft();

  return (
    <GoogleLogin
      onSuccess={(credentialResponse) => {
        const token = credentialResponse.credential;
        if (!token) return;
        try {
          const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
            name?: string;
            email?: string;
            picture?: string;
          };
          setUser({
            name: payload.name ?? "Signed-in user",
            email: payload.email ?? "",
            picture: payload.picture,
          });
        } catch {
          setUser({ name: "Signed-in user", email: "google-user@signed.in" });
        }
      }}
      onError={() => {
        /* user cancelled */
      }}
      theme="outline"
      size="large"
      width="320"
      text="continue_with"
      shape="rectangular"
    />
  );
}

export function GoogleSignInGate({
  children,
  customerMode = false,
}: {
  children: React.ReactNode;
  customerMode?: boolean;
}) {
  const { state } = useHackathonDraft();

  if (state.user) {
    return <>{children}</>;
  }

  const inner = (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-dl-text">
        {customerMode ? "Sign in to build your business case" : "Sign in to run the draft"}
      </h1>
      <p className="mt-2 text-sm text-dl-text-secondary">
        {customerMode
          ? "Continue with Google to save your progress through the Gemini Enterprise use-case workshop."
          : "Google sign-in gates the partner workspace. POC uses your identity only for telemetry attribution — no production tenancy."}
      </p>
      <div className="mt-8 flex justify-center">
        {clientId ? <LiveGoogleLogin /> : <DemoGoogleButton customerMode={customerMode} />}
      </div>
      {!clientId && (
        <p className="mt-4 text-center text-xs text-dl-text-secondary">
          Set <code className="text-dl-brand">VITE_GOOGLE_CLIENT_ID</code> for live Google OAuth.
        </p>
      )}
    </div>
  );

  if (clientId) {
    return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
  }

  return inner;
}
