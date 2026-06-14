export const dynamic = "force-dynamic";

import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import OrderStatusSelect from "@/components/admin/OrderStatusSelect";

type PageProps = { params: { id: string } };

const STATUS_COLOR: Record<string, string> = {
  PENDING: "bg-yellow-50 text-yellow-700",
  CONFIRMED: "bg-blue-50 text-blue-700",
  SHIPPED: "bg-purple-50 text-purple-700",
  DELIVERED: "bg-green-50 text-green-700",
  CANCELLED: "bg-red-50 text-red-700",
  RETURNED: "bg-gray-100 text-gray-600",
};

export default async function AdminCustomerDetailPage({ params }: PageProps) {
  const user = await db.user.findUnique({
    where: { id: params.id },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      addresses: { orderBy: [{ isDefault: "desc" }, { id: "desc" }] },
      orders: {
        orderBy: { createdAt: "desc" },
        include: {
          payment: { select: { method: true, status: true } },
          _count: { select: { items: true } },
          items: {
            take: 3,
            include: { product: { select: { name: true } } },
          },
        },
      },
    },
  });

  if (!user) notFound();

  const totalSpent = user.orders.reduce((sum, o) => sum + parseFloat(o.total.toString()), 0);

  // Pull phone from most recent order shippingAddress if not in addresses
  let phone = "";
  if (user.orders[0]?.shippingAddress) {
    const addr = user.orders[0].shippingAddress as Record<string, string>;
    phone = addr.phone ?? "";
  }
  if (!phone && user.addresses[0]) phone = user.addresses[0].phone;

  return (
    <div className="p-6 space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <Link href="/admin/customers" className="hover:text-gray-600">Customers</Link>
        <span>/</span>
        <span className="text-gray-700 font-medium">{user.name ?? user.email}</span>
      </nav>

      {/* Profile card */}
      <div className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
              {(user.name ?? user.email)[0].toUpperCase()}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900">{user.name ?? "—"}</h1>
              <p className="text-sm text-gray-500">{user.email}</p>
              {phone && <p className="text-sm text-gray-500">{phone}</p>}
            </div>
          </div>
          <div className="text-right text-sm text-gray-500 space-y-1">
            <p>Joined: <span className="font-medium text-gray-700">{new Date(user.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}</span></p>
            <p>Orders: <span className="font-medium text-gray-700">{user.orders.length}</span></p>
            <p>Total spent: <span className="font-semibold text-gray-900">₹{totalSpent.toLocaleString("en-IN")}</span></p>
          </div>
        </div>
      </div>

      {/* Saved addresses */}
      {user.addresses.length > 0 && (
        <div className="rounded-xl border border-gray-200 bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-4">Saved Addresses</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {user.addresses.map((addr) => (
              <div key={addr.id} className="rounded-lg border border-gray-100 p-4 text-sm text-gray-600 space-y-0.5">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-gray-900">{addr.name}</span>
                  {addr.isDefault && <span className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-0.5 rounded-full font-medium">Default</span>}
                </div>
                <p>{addr.phone}</p>
                <p>{addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}</p>
                <p>{addr.city}, {addr.state} – {addr.pincode}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Order History ({user.orders.length})</h2>
        </div>
        {user.orders.length === 0 ? (
          <p className="px-6 py-10 text-center text-sm text-gray-400">No orders yet</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {["Order", "Items", "Amount", "Payment", "Status", "Date", ""].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {user.orders.map((o) => {
                const addr = o.shippingAddress as Record<string, string>;
                const preview = o.items.map((i) => i.product.name).join(", ");
                return (
                  <tr key={o.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link href={`/orders/${o.id}`} className="text-xs font-mono text-indigo-600 hover:underline">
                        #{o.id.slice(-8).toUpperCase()}
                      </Link>
                      {addr?.name && <p className="text-xs text-gray-400 mt-0.5">→ {addr.name}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-gray-600">{o._count.items} item{o._count.items !== 1 ? "s" : ""}</p>
                      {preview && <p className="text-xs text-gray-400 truncate max-w-[160px]">{preview}{o._count.items > 3 ? " …" : ""}</p>}
                    </td>
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
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_COLOR[o.status] ?? "bg-gray-100 text-gray-600"}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-400">
                      {new Date(o.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                    </td>
                    <td className="px-4 py-3">
                      <OrderStatusSelect orderId={o.id} current={o.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
