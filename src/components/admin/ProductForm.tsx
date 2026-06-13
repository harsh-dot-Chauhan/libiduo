"use client";

import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createProductSchema, type CreateProductInput } from "@/lib/validations/product";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { X, Upload, Plus } from "lucide-react";
import axios from "axios";

type Category = { id: string; name: string; parentId?: string | null };

type Props = {
  categories: Category[];
  defaultValues?: Partial<CreateProductInput>;
  productSlug?: string;
};

function slugify(str: string) {
  return str.toLowerCase().trim().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export default function ProductForm({ categories: initialCategories, defaultValues, productSlug }: Props) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Quick-create category
  const [showNewCat, setShowNewCat] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [newCatParentId, setNewCatParentId] = useState("");
  const [creatingCat, setCreatingCat] = useState(false);
  const [catError, setCatError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CreateProductInput>({
    resolver: zodResolver(createProductSchema) as Resolver<CreateProductInput>,
    defaultValues: { isActive: true, stock: 0, images: [], tags: [], ...defaultValues },
  });

  const images = watch("images") ?? [];
  const topLevelCats = categories.filter((c) => !c.parentId);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    setUploading(true);
    try {
      const urls = await Promise.all(
        files.map(async (file) => {
          const fd = new FormData();
          fd.append("file", file);
          const res = await axios.post<{ success: boolean; data: { url: string } }>("/api/admin/upload", fd);
          return res.data.data.url;
        })
      );
      setValue("images", [...images, ...urls]);
    } catch {
      setError("Image upload failed");
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (url: string) => setValue("images", images.filter((u) => u !== url));

  const handleCreateCategory = async () => {
    if (!newCatName.trim()) { setCatError("Name is required"); return; }
    setCreatingCat(true); setCatError(null);
    try {
      const res = await axios.post<{ success: boolean; data: Category }>("/api/admin/categories", {
        name: newCatName.trim(),
        slug: slugify(newCatName.trim()),
        parentId: newCatParentId || null,
      });
      const created = res.data.data;
      setCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setValue("categoryId", created.id);
      setNewCatName(""); setNewCatParentId(""); setShowNewCat(false);
    } catch (err) {
      setCatError(axios.isAxiosError(err) ? (err.response?.data?.error ?? "Failed") : "Failed");
    } finally {
      setCreatingCat(false);
    }
  };

  const onSubmit = async (data: CreateProductInput) => {
    setSubmitting(true);
    setError(null);
    try {
      if (productSlug) {
        await axios.put(`/api/products/${productSlug}`, data);
      } else {
        await axios.post("/api/products", data);
      }
      router.push("/admin/products");
      router.refresh();
    } catch (e: unknown) {
      const msg = axios.isAxiosError(e) ? e.response?.data?.error : "Something went wrong";
      setError(msg ?? "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && <p className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input {...register("name")} className="mt-1 input" />
          {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Slug</label>
          <input {...register("slug")} className="mt-1 input" placeholder="my-product-name" />
          {errors.slug && <p className="mt-1 text-xs text-red-600">{errors.slug.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
          <input {...register("price", { valueAsNumber: true })} type="number" step="0.01" className="mt-1 input" />
          {errors.price && <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Stock</label>
          <input {...register("stock", { valueAsNumber: true })} type="number" className="mt-1 input" />
          {errors.stock && <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>}
        </div>

        {/* Category selector */}
        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <button
              type="button"
              onClick={() => { setShowNewCat((v) => !v); setCatError(null); }}
              className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
            >
              <Plus size={12} /> {showNewCat ? "Cancel" : "New category"}
            </button>
          </div>

          {showNewCat ? (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50/40 p-4 space-y-3">
              {catError && <p className="text-xs text-red-600">{catError}</p>}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Category name</label>
                  <input
                    value={newCatName}
                    onChange={(e) => setNewCatName(e.target.value)}
                    className="input w-full"
                    placeholder="e.g. Vibrators"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Parent <span className="text-gray-400">(optional)</span></label>
                  <select
                    value={newCatParentId}
                    onChange={(e) => setNewCatParentId(e.target.value)}
                    className="input w-full"
                  >
                    <option value="">— Top level —</option>
                    {topLevelCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <button
                type="button"
                onClick={handleCreateCategory}
                disabled={creatingCat}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {creatingCat ? "Creating…" : "Create & select"}
              </button>
            </div>
          ) : (
            <>
              <select {...register("categoryId")} className="mt-1 input">
                <option value="">Select category</option>
                {topLevelCats.map((parent) => {
                  const subs = categories.filter((c) => c.parentId === parent.id);
                  return subs.length > 0 ? (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>{parent.name} (all)</option>
                      {subs.map((sub) => (
                        <option key={sub.id} value={sub.id}>&nbsp;&nbsp;↳ {sub.name}</option>
                      ))}
                    </optgroup>
                  ) : (
                    <option key={parent.id} value={parent.id}>{parent.name}</option>
                  );
                })}
              </select>
              {errors.categoryId && <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>}
            </>
          )}
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input {...register("isActive")} type="checkbox" id="isActive" className="h-4 w-4 rounded border-gray-300 text-indigo-600" />
          <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active (visible in store)</label>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Description</label>
        <textarea {...register("description")} rows={4} className="mt-1 input resize-none" />
        {errors.description && <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Tags <span className="text-gray-400 font-normal">(comma separated)</span></label>
        <input
          type="text"
          className="mt-1 input"
          placeholder="wellness, premium, bestseller"
          onChange={(e) => setValue("tags", e.target.value.split(",").map((t) => t.trim()).filter(Boolean))}
          defaultValue={(defaultValues?.tags ?? []).join(", ")}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Images</label>
        <div className="mt-2 flex flex-wrap gap-3">
          {images.map((url) => (
            <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-gray-200">
              <Image src={url} alt="Product image" fill sizes="80px" className="object-cover" />
              <button
                type="button"
                onClick={() => removeImage(url)}
                className="absolute right-0.5 top-0.5 rounded-full bg-gray-800/70 p-0.5 text-white"
              >
                <X size={10} />
              </button>
            </div>
          ))}
          <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 hover:border-indigo-400">
            <Upload size={18} className="text-gray-400" />
            <span className="mt-1 text-xs text-gray-400">{uploading ? "Uploading…" : "Upload"}</span>
            <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} disabled={uploading} />
          </label>
        </div>
        {errors.images && <p className="mt-1 text-xs text-red-600">{errors.images.message}</p>}
      </div>

      <div className="flex justify-end gap-3">
        <button type="button" onClick={() => router.back()} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting || uploading}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
        >
          {submitting ? "Saving…" : productSlug ? "Update Product" : "Create Product"}
        </button>
      </div>
    </form>
  );
}
