export const dynamic = "force-dynamic";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import CategoryManager from "@/components/admin/CategoryManager";

export default async function AdminCategoriesPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  const categories = await db.category.findMany({
    orderBy: { name: "asc" },
    select: {
      id: true, name: true, slug: true, parentId: true,
      parent: { select: { id: true, name: true } },
      _count: { select: { products: true, children: true } },
    },
  });

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-gray-900 mb-1">Categories</h1>
      <p className="text-sm text-gray-500 mb-6">Manage product categories and sub-categories</p>
      <CategoryManager initialCategories={categories} />
    </div>
  );
}
