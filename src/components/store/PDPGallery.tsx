"use client";

import { useState } from "react";
import Image from "next/image";

const BUR_DARK = "#3C0A14";
const MID2 = "#251018";
const GOLD = "#C9973A";
const DARK = "#0D0608";
const MUTED = "#B8A99A";

type Props = { images: string[]; productName: string; badge?: string | null };

export default function PDPGallery({ images, productName, badge }: Props) {
  const [active, setActive] = useState(0);
  const hasImages = images.length > 0;

  function handleShare() {
    if (navigator.share) {
      navigator.share({ title: `LIBIDUO — ${productName}`, url: window.location.href });
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  }

  return (
    <div style={{ background: MID2 }}>
      {/* Main */}
      <div style={{ height: 340, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: `linear-gradient(135deg, ${BUR_DARK} 0%, ${MID2} 100%)`, overflow: "hidden" }}>
        {hasImages ? (
          <Image src={images[active]} alt={productName} fill sizes="100vw" style={{ objectFit: "cover", opacity: 0.9 }} priority />
        ) : (
          <span style={{ fontSize: 100 }}>🌹</span>
        )}
        {badge && (
          <div style={{ position: "absolute", top: 14, left: 14, fontSize: 10, fontWeight: 600, padding: "4px 12px", borderRadius: 20, letterSpacing: 1, textTransform: "uppercase", background: GOLD, color: DARK }}>
            {badge}
          </div>
        )}
        <button onClick={handleShare} aria-label="Share" style={{ position: "absolute", top: 14, right: 14, width: 34, height: 34, background: "rgba(13,6,8,0.6)", border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: MUTED, fontSize: 15 }}>
          ↑
        </button>
      </div>

      {/* Thumbs */}
      {hasImages && images.length > 1 && (
        <div style={{ display: "flex", gap: 8, padding: "12px 16px", overflowX: "auto", scrollbarWidth: "none" }}>
          {images.map((src, i) => (
            <button key={i} onClick={() => setActive(i)} style={{ position: "relative", width: 60, height: 60, borderRadius: 10, border: `1.5px solid ${i === active ? GOLD : "transparent"}`, background: MID2, cursor: "pointer", padding: 0, overflow: "hidden", flexShrink: 0, transition: "border-color 0.2s" }}>
              <Image src={src} alt={`View ${i + 1}`} fill sizes="60px" style={{ objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}

      {/* Dots */}
      {hasImages && images.length > 1 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 6, paddingBottom: 14 }}>
          {images.map((_, i) => (
            <button key={i} onClick={() => setActive(i)} aria-label={`Image ${i + 1}`} style={{ width: i === active ? 18 : 6, height: 6, borderRadius: i === active ? 3 : "50%", background: i === active ? GOLD : "rgba(201,151,58,0.3)", border: "none", cursor: "pointer", padding: 0, transition: "all 0.2s" }} />
          ))}
        </div>
      )}
    </div>
  );
}
