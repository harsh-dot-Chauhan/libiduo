export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";

type PageProps = { searchParams: Record<string, string | undefined> };

export default async function AdminCustomersPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const search = searchParams.q ?? "";
  const limit = 20;

  const where = search
    ? {
        role: "USER" as const,
        deletedAt: null,
        OR: [{ email: { contains: search } }, { name: { contains: search } }],
      }
    : { role: "USER" as const, deletedAt: null };

  const [users, total] = await Promise.all([
    db.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        _count: { select: { orders: true } },
        orders: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: { shippingAddress: true, total: true, createdAt: true },
        },
      },
    }),
    db.user.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Customers</h1>
        <p className="text-sm text-gray-500">{total} total</p>
      </div>

      {/* Search */}
      <form method="GET" className="flex gap-2 max-w-sm">
        <input
          name="q"
          defaultValue={search}
          placeholder="Search by name or email…"
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">
          Search
        </button>
        {search && (
          <Link href="/admin/customers" className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 hover:bg-gray-50">
            Clear
          </Link>
        )}
      </form>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Customer", "Phone", "Orders", "Joined", "Last Order", ""].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((u) => {
              const latestOrder = u.orders[0];
              const addr = latestOrder?.shippingAddress as Record<string, string> | null;
              const phone = addr?.phone ?? "—";
              return (
                <tr key={u.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${u.id}`} className="hover:underline">
                      <p className="text-sm font-medium text-gray-900">{u.name ?? "—"}</p>
                      <p className="text-xs text-gray-400 truncate max-w-[180px]">{u.email}</p>
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">{phone}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{u._count.orders}</td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {new Date(u.createdAt).toLocaleDateString("en-IN")}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-400">
                    {latestOrder ? new Date(latestOrder.createdAt).toLocaleDateString("en-IN") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`/admin/customers/${u.id}`} className="text-xs text-indigo-600 hover:underline font-medium">
                      View →
                    </Link>
                  </td>
                </tr>
              );
            })}
            {users.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No customers found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/customers?page=${p}${search ? `&q=${encodeURIComponent(search)}` : ""}`}
              className={`h-8 w-8 rounded text-sm font-medium flex items-center justify-center ${
                p === page ? "bg-indigo-600 text-white" : "border border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
