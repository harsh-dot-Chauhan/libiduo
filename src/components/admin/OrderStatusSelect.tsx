"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const STATUSES = ["PENDING", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED", "RETURNED"] as const;

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  RETURNED: "bg-gray-100 text-gray-600",
};

export default function OrderStatusSelect({ orderId, current }: { orderId: string; current: string }) {
  const [status, setStatus] = useState(current);
  const [saving, setSaving] = useState(false);
  const router = useRouter();

  const handleChange = async (next: string) => {
    setSaving(true);
    try {
      await axios.put(`/api/admin/orders/${orderId}`, { status: next });
      setStatus(next);
      router.refresh();
    } finally {
      setSaving(false);
    }
  };

  return (
    <select
      value={status}
      onChange={(e) => handleChange(e.target.value)}
      disabled={saving}
      className={`rounded-full border-0 px-2.5 py-0.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer disabled:opacity-60 ${STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600"}`}
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>{s.charAt(0) + s.slice(1).toLowerCase()}</option>
      ))}
    </select>
  );
}
