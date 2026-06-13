"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Star } from "lucide-react";
import axios from "axios";

type Props = { productSlug: string };

const GOLD = "#C9973A";
const MID = "#1A0C10";
const TEXT = "#F0E6D3";
const MUTED = "#B8A99A";
const DARK = "#0D0608";

export default function ReviewForm({ productSlug }: Props) {
  const router = useRouter();
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) { setError("Please select a rating"); return; }
    setSubmitting(true);
    setError(null);
    try {
      await axios.post(`/api/products/${productSlug}/reviews`, { rating, comment: comment.trim() || undefined });
      router.refresh();
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Something went wrong") : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ background: MID, border: "0.5px solid rgba(201,151,58,0.2)", borderRadius: 16, padding: 24, display: "flex", flexDirection: "column", gap: 16 }}>
      <h3 style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: GOLD }}>Write a Review</h3>

      {error && (
        <p style={{ background: "rgba(107,26,42,0.3)", border: "0.5px solid rgba(107,26,42,0.5)", color: "#E8A0A8", padding: "10px 14px", borderRadius: 8, fontSize: 12 }}>{error}</p>
      )}

      <div>
        <p style={{ fontSize: 11, color: MUTED, marginBottom: 8, letterSpacing: 0.5 }}>Your rating</p>
        <div style={{ display: "flex", gap: 4 }}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(0)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, transition: "transform 0.1s" }}
            >
              <Star
                size={26}
                style={{
                  fill: star <= (hovered || rating) ? GOLD : "transparent",
                  color: star <= (hovered || rating) ? GOLD : MUTED,
                  transition: "color 0.15s, fill 0.15s",
                }}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label htmlFor="review-comment" style={{ display: "block", fontSize: 11, color: MUTED, letterSpacing: 0.5, marginBottom: 6 }}>
          Comment <span style={{ color: "#6B5A50" }}>(optional)</span>
        </label>
        <textarea
          id="review-comment"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder="Share your experience…"
          style={{ display: "block", width: "100%", background: "rgba(13,6,8,0.6)", border: "0.5px solid rgba(201,151,58,0.3)", color: TEXT, padding: "12px 14px", borderRadius: 10, fontSize: 13, outline: "none", resize: "none", fontFamily: "inherit" }}
        />
        <p style={{ marginTop: 4, textAlign: "right", fontSize: 11, color: "#6B5A50" }}>{comment.length}/1000</p>
      </div>

      <button
        type="submit"
        disabled={submitting || rating === 0}
        style={{ background: submitting || rating === 0 ? "rgba(201,151,58,0.3)" : GOLD, color: submitting || rating === 0 ? MUTED : DARK, border: "none", borderRadius: 40, padding: "13px 0", fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: "uppercase", cursor: submitting || rating === 0 ? "not-allowed" : "pointer" }}
      >
        {submitting ? "Submitting…" : "Submit Review"}
      </button>
    </form>
  );
}
