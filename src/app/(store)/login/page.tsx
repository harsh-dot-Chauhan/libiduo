"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const BUR = "#6B1A2A";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") ?? "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  async function handleCredentials(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    const result = await signIn("credentials", { redirect: false, email, password });
    setLoading(false);
    if (result?.error) setError("Invalid email or password.");
    else router.push(callbackUrl);
  }

  const inputStyle: React.CSSProperties = {
    display: "block", width: "100%", background: "rgba(13,6,8,0.6)",
    border: "0.5px solid rgba(201,151,58,0.35)", color: TEXT,
    padding: "13px 18px", borderRadius: 40, fontSize: 14, outline: "none",
  };

  return (
    <div style={{ minHeight: "100vh", background: DARK, display: "flex", alignItems: "center", justifyContent: "center", padding: "40px 24px" }}>
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <Link href="/" style={{ fontFamily: "var(--font-playfair), serif", fontSize: 28, fontWeight: 900, color: GOLD, letterSpacing: 4, textDecoration: "none" }}>LIBIDUO</Link>
          <h1 style={{ marginTop: 16, fontSize: 20, fontWeight: 600, color: TEXT, fontFamily: "var(--font-playfair), serif" }}>Welcome back</h1>
          <p style={{ marginTop: 6, fontSize: 13, color: MUTED }}>
            Don&apos;t have an account?{" "}
            <Link href={`/register?callbackUrl=${encodeURIComponent(callbackUrl)}`} style={{ color: GOLD, textDecoration: "none" }}>Register</Link>
          </p>
        </div>

        <div style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 20, padding: 28, display: "flex", flexDirection: "column", gap: 20 }}>
          {error && <p style={{ background: "rgba(107,26,42,0.3)", border: "0.5px solid rgba(107,26,42,0.5)", color: "#E8A0A8", padding: "12px 16px", borderRadius: 10, fontSize: 13 }}>{error}</p>}

          {/* Google */}
          <button onClick={() => { setGoogleLoading(true); signIn("google", { callbackUrl }); }} disabled={googleLoading}
            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, background: "rgba(255,255,255,0.06)", border: "0.5px solid rgba(201,151,58,0.25)", color: TEXT, borderRadius: 40, padding: "13px 0", fontSize: 13, cursor: "pointer", letterSpacing: 0.5, opacity: googleLoading ? 0.6 : 1 }}>
            <svg viewBox="0 0 24 24" style={{ width: 18, height: 18 }}>
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ flex: 1, borderTop: "0.5px solid rgba(201,151,58,0.15)" }} />
            <span style={{ fontSize: 11, color: MUTED, letterSpacing: 1 }}>or</span>
            <div style={{ flex: 1, borderTop: "0.5px solid rgba(201,151,58,0.15)" }} />
          </div>

          <form onSubmit={handleCredentials} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <label style={{ display: "block", fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Email</label>
              <input type="email" required autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} placeholder="you@example.com" />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 11, color: MUTED, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Password</label>
              <input type="password" required autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} style={inputStyle} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ background: loading ? BUR : GOLD, color: loading ? TEXT : DARK, borderRadius: 40, padding: "14px 0", fontSize: 12, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.7 : 1 }}>
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return <Suspense><LoginForm /></Suspense>;
}
