"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Trash2, ChevronRight, Tag } from "lucide-react";
import axios from "axios";

type Category = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent: { id: string; name: string } | null;
  _count: { products: number; children: number };
};

type Props = { initialCategories: Category[] };

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function CategoryManager({ initialCategories }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [parentId, setParentId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const topLevel = categories.filter((c) => !c.parentId);
  const children = categories.filter((c) => c.parentId);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !slug.trim()) { setError("Name and slug are required"); return; }
    setSubmitting(true);
    try {
      const res = await axios.post<{ success: boolean; data: Category }>("/api/admin/categories", {
        name: name.trim(),
        slug: slug.trim(),
        parentId: parentId || null,
      });
      setCategories((prev) => [...prev, res.data.data].sort((a, b) => a.name.localeCompare(b.name)));
      setName(""); setSlug(""); setParentId("");
      router.refresh();
    } catch (err) {
      setError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to create") : "Failed to create");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this category?")) return;
    setDeletingId(id);
    try {
      await axios.delete(`/api/admin/categories/${id}`);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      router.refresh();
    } catch (err) {
      alert(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed to delete") : "Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Create form */}
      <div className="rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={15} className="text-indigo-500" /> New Category
        </h2>
        <form onSubmit={handleCreate} className="space-y-4">
          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-xs text-red-700">{error}</p>}

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Name</label>
            <input
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              className="input w-full"
              placeholder="e.g. Vibrators"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Slug</label>
            <input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="input w-full"
              placeholder="vibrators"
            />
            <p className="mt-1 text-xs text-gray-400">Used in URLs — auto-generated from name</p>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Parent category <span className="text-gray-400">(optional)</span></label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="input w-full"
            >
              <option value="">— Top level (no parent) —</option>
              {topLevel.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-400">Leave blank to create a top-level category</p>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {submitting ? "Creating…" : "Create Category"}
          </button>
        </form>
      </div>

      {/* Category tree */}
      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b px-5 py-3.5">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Tag size={15} className="text-indigo-500" /> All Categories
            <span className="ml-auto text-xs font-normal text-gray-400">{categories.length} total</span>
          </h2>
        </div>

        {categories.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Tag size={32} strokeWidth={1.5} className="text-gray-300" />
            <p className="mt-3 text-sm text-gray-500">No categories yet</p>
            <p className="text-xs text-gray-400">Create your first category on the left</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 max-h-[480px] overflow-y-auto">
            {topLevel.map((cat) => (
              <li key={cat.id}>
                {/* Parent row */}
                <div className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-400">{cat.slug} · {cat._count.products} product{cat._count.products !== 1 ? "s" : ""}</p>
                  </div>
                  {cat._count.children > 0 && (
                    <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">{cat._count.children} sub</span>
                  )}
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-opacity"
                    title="Delete category"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* Children */}
                {children.filter((c) => c.parentId === cat.id).map((child) => (
                  <div key={child.id} className="flex items-center gap-3 px-5 py-2.5 pl-10 bg-gray-50/60 hover:bg-gray-100/60 group border-t border-gray-100">
                    <ChevronRight size={12} className="text-gray-300 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-700">{child.name}</p>
                      <p className="text-xs text-gray-400">{child.slug} · {child._count.products} product{child._count.products !== 1 ? "s" : ""}</p>
                    </div>
                    <button
                      onClick={() => handleDelete(child.id)}
                      disabled={deletingId === child.id}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-opacity"
                      title="Delete sub-category"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </li>
            ))}

            {/* Orphaned children (parent was deleted externally) */}
            {children.filter((c) => !topLevel.find((t) => t.id === c.parentId)).map((cat) => (
              <li key={cat.id} className="flex items-center gap-3 px-5 py-3 hover:bg-gray-50 group">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                  <p className="text-xs text-gray-400">{cat.slug} · {cat._count.products} products</p>
                </div>
                <button
                  onClick={() => handleDelete(cat.id)}
                  disabled={deletingId === cat.id}
                  className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 disabled:opacity-30 transition-opacity"
                >
                  <Trash2 size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
