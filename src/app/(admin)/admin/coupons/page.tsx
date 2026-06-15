"use client";

import { useEffect, useState } from "react";
import { Plus, Trash2, ToggleLeft, ToggleRight, Pencil, X, Check } from "lucide-react";

type Coupon = {
  id: string;
  code: string;
  discountPct: number;
  label: string;
  isActive: boolean;
  isPublic: boolean;
  expiresAt: string | null;
  usageLimit: number | null;
  usageCount: number;
  createdAt: string;
};

type FormState = {
  code: string;
  discountPct: string;
  label: string;
  isActive: boolean;
  isPublic: boolean;
  expiresAt: string;
  usageLimit: string;
};

const EMPTY_FORM: FormState = {
  code: "", discountPct: "", label: "", isActive: true, isPublic: false, expiresAt: "", usageLimit: "",
};

export default function AdminCouponsPage() {
  const [coupons, setCoupons]     = useState<Coupon[]>([]);
  const [loading, setLoading]     = useState(true);
  const [showForm, setShowForm]   = useState(false);
  const [form, setForm]           = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [error, setError]         = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/coupons");
    const json = await res.json();
    if (json.success) setCoupons(json.data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError(null);
    setShowForm(true);
  }

  function openEdit(c: Coupon) {
    setEditingId(c.id);
    setForm({
      code:        c.code,
      discountPct: String(c.discountPct),
      label:       c.label,
      isActive:    c.isActive,
      isPublic:    c.isPublic,
      expiresAt:   c.expiresAt ? c.expiresAt.slice(0, 10) : "",
      usageLimit:  c.usageLimit !== null ? String(c.usageLimit) : "",
    });
    setError(null);
    setShowForm(true);
  }

  async function save() {
    setSaving(true); setError(null);
    const body = {
      code:        form.code.trim().toUpperCase(),
      discountPct: parseInt(form.discountPct, 10),
      label:       form.label.trim(),
      isActive:    form.isActive,
      isPublic:    form.isPublic,
      expiresAt:   form.expiresAt ? new Date(form.expiresAt).toISOString() : null,
      usageLimit:  form.usageLimit ? parseInt(form.usageLimit, 10) : null,
    };
    const url    = editingId ? `/api/admin/coupons/${editingId}` : "/api/admin/coupons";
    const method = editingId ? "PUT" : "POST";
    const res    = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const json   = await res.json();
    setSaving(false);
    if (!json.success) { setError(json.error); return; }
    setShowForm(false);
    load();
  }

  async function toggleActive(c: Coupon) {
    await fetch(`/api/admin/coupons/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !c.isActive }),
    });
    load();
  }

  async function deleteCoupon(id: string) {
    if (!confirm("Delete this coupon?")) return;
    await fetch(`/api/admin/coupons/${id}`, { method: "DELETE" });
    load();
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Coupons</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} /> Add coupon
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {editingId ? "Edit coupon" : "New coupon"}
          </h2>
          {error && <p className="mb-4 rounded bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Code</label>
              <input
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value.toUpperCase() }))}
                placeholder="e.g. SAVE20"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Discount %</label>
              <input
                type="number" min={1} max={100}
                value={form.discountPct}
                onChange={(e) => setForm((f) => ({ ...f, discountPct: e.target.value }))}
                placeholder="e.g. 10"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Label (shown to customer)</label>
              <input
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                placeholder="e.g. 10% off your order!"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Expires on (optional)</label>
              <input
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm((f) => ({ ...f, expiresAt: e.target.value }))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium uppercase tracking-wide text-gray-500 mb-1">Usage limit (optional)</label>
              <input
                type="number" min={1}
                value={form.usageLimit}
                onChange={(e) => setForm((f) => ({ ...f, usageLimit: e.target.value }))}
                placeholder="Unlimited"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Active</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isActive: !f.isActive }))}
                  className={form.isActive ? "text-indigo-600" : "text-gray-400"}
                >
                  {form.isActive ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
              <div className="flex items-center gap-2">
                <label className="text-sm font-medium text-gray-700">Show on cart</label>
                <button
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, isPublic: !f.isPublic }))}
                  className={form.isPublic ? "text-green-600" : "text-gray-400"}
                  title="When enabled, this coupon code is shown as a suggestion on the cart page"
                >
                  {form.isPublic ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                </button>
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={save} disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              <Check size={15} /> {saving ? "Saving…" : "Save"}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex items-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50"
            >
              <X size={15} /> Cancel
            </button>
          </div>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <p className="text-sm text-gray-500">Loading…</p>
      ) : coupons.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-16 text-center">
          <p className="text-sm text-gray-500">No coupons yet. Add one above.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Code</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Discount</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Label</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Usage</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Expires</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Visible</th>
                <th className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {coupons.map((c) => {
                const expired = c.expiresAt && new Date(c.expiresAt) < new Date();
                const limitHit = c.usageLimit !== null && c.usageCount >= c.usageLimit;
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3 font-mono text-sm font-semibold text-gray-900">{c.code}</td>
                    <td className="px-5 py-3 text-sm text-gray-900">{c.discountPct}%</td>
                    <td className="px-5 py-3 text-sm text-gray-500 max-w-xs truncate">{c.label}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {c.usageCount}{c.usageLimit !== null ? ` / ${c.usageLimit}` : ""}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString("en-IN") : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${c.isPublic ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-500"}`}>
                        {c.isPublic ? "Public" : "Private"}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {expired || limitHit ? (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-red-100 text-red-700">
                          {expired ? "Expired" : "Limit hit"}
                        </span>
                      ) : c.isActive ? (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700">Active</span>
                      ) : (
                        <span className="inline-flex rounded-full px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600">Inactive</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(c)} className="rounded p-1 text-gray-400 hover:text-indigo-600" title="Edit">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => toggleActive(c)} className={`rounded p-1 ${c.isActive ? "text-green-500 hover:text-gray-400" : "text-gray-400 hover:text-green-500"}`} title={c.isActive ? "Deactivate" : "Activate"}>
                          {c.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                        </button>
                        <button onClick={() => deleteCoupon(c.id)} className="rounded p-1 text-gray-400 hover:text-red-600" title="Delete">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
