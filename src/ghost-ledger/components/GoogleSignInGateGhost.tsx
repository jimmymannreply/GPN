import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import { useGhostLedger, type GoogleUser } from "@/ghost-ledger/hooks/useGhostLedger";

const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID ?? "";

function SignInButtons({ onSignIn }: { onSignIn: (user: GoogleUser) => void }) {
  if (clientId) {
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
            onSignIn({
              name: payload.name ?? "Signed-in user",
              email: payload.email ?? "",
              picture: payload.picture,
            });
          } catch {
            onSignIn({ name: "Signed-in user", email: "google-user@signed.in" });
          }
        }}
        onError={() => {}}
        theme="outline"
        size="large"
        width="320"
        text="continue_with"
        shape="rectangular"
      />
    );
  }
  return (
    <button
      type="button"
      data-testid="google-demo-signin"
      onClick={() =>
        onSignIn({
          name: "Alex Rivera",
          email: "alex.rivera@partner.example",
          demo: true,
        })
      }
      className="flex w-full items-center justify-center gap-3 rounded-dl border border-dl-border bg-dl-surface px-4 py-3 text-sm font-medium text-dl-text shadow-card"
    >
      <span className="text-lg" aria-hidden>G</span>
      Continue with Google (demo)
    </button>
  );
}

export function GoogleSignInGateGhost({ children }: { children: React.ReactNode }) {
  const { state, setUser } = useGhostLedger();

  if (state.user) return <>{children}</>;

  const inner = (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="text-2xl font-semibold text-dl-text">Sign in to open the ledger</h1>
      <p className="mt-2 text-sm text-dl-text-secondary">
        Google sign-in gates the partner workspace for the Ghost Ledger session.
      </p>
      <div className="mt-8 flex justify-center">
        <SignInButtons onSignIn={setUser} />
      </div>
    </div>
  );

  if (clientId) {
    return <GoogleOAuthProvider clientId={clientId}>{inner}</GoogleOAuthProvider>;
  }
  return inner;
}
