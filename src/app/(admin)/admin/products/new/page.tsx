export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import ProductForm from "@/components/admin/ProductForm";

export default async function NewProductPage() {
  const categories = await db.category.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true, parentId: true } });

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-2xl font-bold text-gray-900">Add Product</h1>
      <ProductForm categories={categories} />
    </div>
  );
}
