"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

const GOLD = "#C9973A";
const MUTED = "#B8A99A";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";

export default function Pagination({ currentPage, totalPages }: { currentPage: number; totalPages: number }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  const goTo = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    router.push(`/products?${params.toString()}`);
  };

  const btnBase: React.CSSProperties = {
    width: 36, height: 36, borderRadius: 8, fontSize: 13, fontWeight: 500,
    border: "0.5px solid rgba(201,151,58,0.25)", cursor: "pointer",
    display: "flex", alignItems: "center", justifyContent: "center",
    background: MID, color: MUTED, transition: "all 0.2s",
  };

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}>
      <button onClick={() => goTo(currentPage - 1)} disabled={currentPage === 1} style={{ ...btnBase, opacity: currentPage === 1 ? 0.35 : 1 }}>
        <ChevronLeft size={15} />
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          onClick={() => goTo(page)}
          style={{
            ...btnBase,
            background: page === currentPage ? GOLD : MID,
            color: page === currentPage ? "#0D0608" : MUTED,
            borderColor: page === currentPage ? GOLD : "rgba(201,151,58,0.25)",
            fontWeight: page === currentPage ? 700 : 500,
          }}
        >
          {page}
        </button>
      ))}

      <button onClick={() => goTo(currentPage + 1)} disabled={currentPage === totalPages} style={{ ...btnBase, opacity: currentPage === totalPages ? 0.35 : 1 }}>
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
