"use client";

import { useEffect, useState } from "react";

const B = "#6B1A2A";
const GOLD = "#C9973A";
const CREAM = "#F5EDD8";
const DARK = "#0D0608";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";

const KEY = "libiduo_age_verified";

export default function AgeGate() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!sessionStorage.getItem(KEY)) {
      setVisible(true);
    }
  }, []);

  function confirm() {
    sessionStorage.setItem(KEY, "1");
    setVisible(false);
  }

  function exit() {
    window.location.href = "https://www.google.com";
  }

  if (!visible) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
        background: "rgba(13,6,8,0.96)",
        backdropFilter: "blur(8px)",
      }}
    >
      {/* Subtle radial glow */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(107,26,42,0.35) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          background: MID,
          border: `0.5px solid rgba(201,151,58,0.35)`,
          borderRadius: 20,
          padding: "40px 28px",
          maxWidth: 360,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 24px 60px rgba(0,0,0,0.7)",
        }}
      >
        {/* Logo */}
        <div
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            fontSize: 22,
            color: GOLD,
            letterSpacing: 4,
            marginBottom: 8,
          }}
        >
          LIBIDUO
        </div>

        {/* 18+ badge */}
        <div
          style={{
            display: "inline-block",
            background: B,
            border: `0.5px solid rgba(201,151,58,0.5)`,
            borderRadius: 50,
            padding: "6px 18px",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: 3,
            textTransform: "uppercase" as const,
            color: GOLD,
            marginBottom: 24,
          }}
        >
          18+ Only
        </div>

        <h2
          style={{
            fontFamily: "var(--font-playfair), 'Playfair Display', serif",
            fontSize: 24,
            fontWeight: 700,
            color: TEXT,
            lineHeight: 1.2,
            marginBottom: 12,
          }}
        >
          Age Verification
        </h2>

        <p style={{ fontSize: 13, color: MUTED, lineHeight: 1.7, marginBottom: 28 }}>
          This website contains adult content intended for individuals aged{" "}
          <strong style={{ color: CREAM }}>18 years and above</strong>. By entering, you
          confirm that you are of legal age and consent to view such content.
        </p>

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 12 }}>
          <button
            onClick={confirm}
            style={{
              background: GOLD,
              color: DARK,
              border: "none",
              borderRadius: 40,
              padding: "14px 24px",
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: "uppercase" as const,
              cursor: "pointer",
              width: "100%",
            }}
          >
            Yes, I am 18+
          </button>

          <button
            onClick={exit}
            style={{
              background: "transparent",
              color: MUTED,
              border: `0.5px solid rgba(184,169,154,0.3)`,
              borderRadius: 40,
              padding: "13px 24px",
              fontSize: 13,
              fontWeight: 500,
              letterSpacing: 1,
              textTransform: "uppercase" as const,
              cursor: "pointer",
              width: "100%",
            }}
          >
            No, Exit
          </button>
        </div>

        <p style={{ fontSize: 10, color: "rgba(184,169,154,0.4)", marginTop: 20, letterSpacing: 1 }}>
          © 2026 LIBIDUO · For adults only
        </p>
      </div>
    </div>
  );
}
