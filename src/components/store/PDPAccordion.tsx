"use client";

import { useState } from "react";

const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const GOLD = "#C9973A";
const BORDER = "rgba(201,151,58,0.2)";

type Item = { title: string; content: React.ReactNode };

export default function PDPAccordion({ items, defaultOpen = 0 }: { items: Item[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);

  return (
    <div style={{ marginBottom: 20 }}>
      {items.map((item, i) => (
        <div key={i} style={{ borderBottom: `0.5px solid ${BORDER}` }}>
          <button
            onClick={() => setOpen(open === i ? null : i)}
            style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 0", background: "none", border: "none", cursor: "pointer" }}
          >
            <span style={{ fontSize: 14, fontWeight: 500, color: TEXT, textAlign: "left" }}>{item.title}</span>
            <span style={{ fontSize: 14, color: GOLD, transition: "transform 0.3s", display: "inline-block", transform: open === i ? "rotate(180deg)" : "rotate(0deg)", flexShrink: 0, marginLeft: 8 }}>
              ⌄
            </span>
          </button>
          <div style={{ fontSize: 13, color: MUTED, lineHeight: 1.8, paddingBottom: open === i ? 16 : 0, maxHeight: open === i ? 600 : 0, overflow: "hidden", transition: "max-height 0.3s ease, padding-bottom 0.3s" }}>
            {item.content}
          </div>
        </div>
      ))}
    </div>
  );
}
