"use client";

import { useState } from "react";

const GOLD = "#C9973A";
const DARK = "#0D0608";
const MID = "#1A0C10";
const MID2 = "#251018";
const BUR_DARK = "#3C0A14";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const GREEN = "#7CBA5A";
const BORDER = "rgba(201,151,58,0.2)";

const TRUST = [
  { icon: "🔒", title: "Discreet Ship", sub: "Plain box, no branding" },
  { icon: "💵", title: "COD Available", sub: "Pay on delivery" },
  { icon: "🔄", title: "Easy Returns", sub: "7-day return policy" },
  { icon: "🛡️", title: "100% Safe", sub: "Body-safe materials" },
];

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

export default function PDPPincode() {
  const [pincode, setPincode] = useState("");
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState("");

  function check() {
    if (pincode.length !== 6) {
      setError("Enter a valid 6-digit pincode");
      setResult(null);
      return;
    }
    setError("");
    const d = new Date();
    d.setDate(d.getDate() + 2);
    setResult(`Delivery by ${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]} — Discreet packaging`);
  }

  return (
    <div style={{ background: MID, border: `0.5px solid ${BORDER}`, borderRadius: 16, padding: 16, marginBottom: 20 }}>
      <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: GOLD, marginBottom: 14 }}>
        Delivery &amp; Availability
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: result || error ? 10 : 14 }}>
        <input
          type="number"
          placeholder="Enter pincode"
          value={pincode}
          onChange={e => { setPincode(e.target.value.slice(0, 6)); setResult(null); setError(""); }}
          style={{ flex: 1, background: MID2, border: `0.5px solid ${BORDER}`, borderRadius: 40, padding: "10px 16px", color: TEXT, fontSize: 13, outline: "none", fontFamily: "inherit" }}
        />
        <button onClick={check} style={{ background: GOLD, color: DARK, border: "none", padding: "10px 20px", borderRadius: 40, fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>
          Check
        </button>
      </div>
      {result && (
        <div style={{ fontSize: 12, color: GREEN, marginBottom: 14, display: "flex", alignItems: "center", gap: 6 }}>
          ✓ <span>{result}</span>
        </div>
      )}
      {error && (
        <div style={{ fontSize: 12, color: "#E8A0A8", marginBottom: 14 }}>{error}</div>
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
        {TRUST.map(({ icon, title, sub }) => (
          <div key={title} style={{ display: "flex", alignItems: "flex-start", gap: 8 }}>
            <div style={{ width: 30, height: 30, background: BUR_DARK, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 14 }}>
              {icon}
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 500, color: TEXT }}>{title}</div>
              <div style={{ fontSize: 10, color: MUTED, marginTop: 1 }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
