"use client";

import Image from "next/image";
import { useState } from "react";

const BUR = "#6B1A2A";
const GOLD = "#C9973A";

export default function ProductImageGallery({ images }: { images: string[] }) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <div style={{ position: "relative", aspectRatio: "1/1", width: "100%", overflow: "hidden", borderRadius: 16, background: BUR }}>
        <Image
          src={images[active] ?? ""}
          alt="Product image"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>

      {images.length > 1 && (
        <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 4 }}>
          {images.map((src, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              style={{
                position: "relative", width: 64, height: 64, flexShrink: 0,
                overflow: "hidden", borderRadius: 10, border: `1.5px solid ${i === active ? GOLD : "rgba(201,151,58,0.15)"}`,
                background: BUR, cursor: "pointer", padding: 0, transition: "border-color 0.2s",
              }}
            >
              <Image src={src} alt={`Thumbnail ${i + 1}`} fill sizes="64px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
