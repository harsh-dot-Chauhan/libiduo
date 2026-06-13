"use client";

import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import axios from "axios";
import { useState } from "react";

type Props = { productSlug: string; reviewId: string };

export default function DeleteReviewButton({ productSlug, reviewId }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete your review?")) return;
    setLoading(true);
    try {
      await axios.delete(`/api/products/${productSlug}/reviews/${reviewId}`);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      aria-label="Delete review"
      style={{ background: "none", border: "none", cursor: loading ? "not-allowed" : "pointer", padding: 4, opacity: loading ? 0.4 : 1, color: "#B8A99A", transition: "color 0.15s" }}
      onMouseEnter={(e) => { if (!loading) (e.currentTarget as HTMLButtonElement).style.color = "#E8A0A8"; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#B8A99A"; }}
    >
      <Trash2 size={13} />
    </button>
  );
}
