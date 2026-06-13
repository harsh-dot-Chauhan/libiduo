export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { Plus, Pencil, Trash2 } from "lucide-react";

export default async function AdminProductsPage() {
  const products = await db.product.findMany({
    where: { deletedAt: null },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      stock: true,
      isActive: true,
      category: { select: { name: true } },
    },
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          <Plus size={16} />
          Add product
        </Link>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Stock</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">Status</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 bg-white">
            {products.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.category.name}</td>
                <td className="px-6 py-4 text-sm text-gray-900">₹{parseFloat(p.price.toString()).toLocaleString("en-IN")}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{p.stock}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {p.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/products/${p.id}/edit`} className="rounded p-1 text-gray-400 hover:text-indigo-600">
                      <Pencil size={16} />
                    </Link>
                    <DeleteProductButton id={p.id} />
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No products yet.{" "}
                  <Link href="/admin/products/new" className="text-indigo-600 hover:underline">
                    Add your first product
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DeleteProductButton({ id }: { id: string }) {
  return (
    <form
      action={async () => {
        "use server";
        const { db } = await import("@/lib/db");
        await db.product.update({ where: { id }, data: { deletedAt: new Date() } });
        const { revalidatePath } = await import("next/cache");
        revalidatePath("/admin/products");
      }}
    >
      <button type="submit" className="rounded p-1 text-gray-400 hover:text-red-600">
        <Trash2 size={16} />
      </button>
    </form>
  );
}
