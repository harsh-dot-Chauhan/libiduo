export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/lib/db";
import { type OrderStatus } from "@prisma/client";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

type PageProps = { searchParams: Record<string, string | undefined> };

const STATUS_FILTERS: { label: string; value: string }[] = [
  { label: "All", value: "" },
  { label: "Pending", value: "PENDING" },
  { label: "Confirmed", value: "CONFIRMED" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
  { label: "Cancelled", value: "CANCELLED" },
];

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const page = Math.max(1, parseInt(searchParams.page ?? "1"));
  const status = searchParams.status as OrderStatus | undefined;
  const limit = 20;

  const where = { ...(status && { status }) };

  const [orders, total] = await Promise.all([
    db.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
      include: {
        user: { select: { name: true, email: true } },
        payment: { select: { method: true, status: true } },
        _count: { select: { items: true } },
      },
    }),
    db.order.count({ where }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">{total} total</p>
      </div>

      {/* Status filter tabs */}
      <div className="flex gap-1 flex-wrap">
        {STATUS_FILTERS.map(({ label, value }) => {
          const active = (searchParams.status ?? "") === value;
          const href = value ? `/admin/orders?status=${value}` : "/admin/orders";
          return (
            <Link
              key={value}
              href={href}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                active ? "bg-indigo-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {label}
            </Link>
          );
        })}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Order", "Customer", "Items", "Amount", "Payment", "Status", "Date"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <Link href={`/orders/${o.id}`} className="text-xs font-mono text-indigo-600 hover:underline">
                    #{o.id.slice(-8).toUpperCase()}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="text-sm text-gray-900">{o.user.name ?? "—"}</p>
                  <p className="text-xs text-gray-400 truncate max-w-[140px]">{o.user.email}</p>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">{o._count.items}</td>
                <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                  ₹{parseFloat(o.total.toString()).toLocaleString("en-IN")}
                </td>
                <td className="px-4 py-3">
                  <p className="text-xs text-gray-600">{o.payment?.method ?? "—"}</p>
                  <p className={`text-xs font-medium ${o.payment?.status === "PAID" ? "text-green-600" : "text-yellow-600"}`}>
                    {o.payment?.status ?? "—"}
                  </p>
                </td>
                <td className="px-4 py-3">
                  <OrderStatusSelect orderId={o.id} current={o.status} />
                </td>
                <td className="px-4 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} className="px-4 py-12 text-center text-sm text-gray-400">No orders found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/admin/orders?page=${p}${status ? `&status=${status}` : ""}`}
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
