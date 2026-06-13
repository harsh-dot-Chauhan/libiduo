export const dynamic = "force-dynamic";

import { db } from "@/lib/db";
import { ShoppingBag, Package, Users, TrendingUp } from "lucide-react";

async function getStats() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    todayOrders,
    totalProducts,
    totalUsers,
    revenueResult,
    todayRevenueResult,
    recentOrders,
  ] = await Promise.all([
    db.order.count(),
    db.order.count({ where: { createdAt: { gte: today } } }),
    db.product.count({ where: { deletedAt: null } }),
    db.user.count({ where: { deletedAt: null } }),
    db.order.aggregate({ _sum: { total: true }, where: { status: { not: "CANCELLED" } } }),
    db.order.aggregate({ _sum: { total: true }, where: { createdAt: { gte: today }, status: { not: "CANCELLED" } } }),
    db.order.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        status: true,
        total: true,
        createdAt: true,
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  return {
    totalOrders,
    todayOrders,
    totalProducts,
    totalUsers,
    totalRevenue: parseFloat(revenueResult._sum.total?.toString() ?? "0"),
    todayRevenue: parseFloat(todayRevenueResult._sum.total?.toString() ?? "0"),
    recentOrders,
  };
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  SHIPPED: "bg-purple-100 text-purple-700",
  DELIVERED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-600",
  RETURNED: "bg-gray-100 text-gray-600",
};

export default async function AdminDashboardPage() {
  const { totalOrders, todayOrders, totalProducts, totalUsers, totalRevenue, todayRevenue, recentOrders } =
    await getStats();

  const stats = [
    { label: "Total Revenue", value: `₹${totalRevenue.toLocaleString("en-IN")}`, sub: `₹${todayRevenue.toLocaleString("en-IN")} today`, icon: TrendingUp, color: "text-green-600 bg-green-50" },
    { label: "Orders", value: totalOrders, sub: `${todayOrders} today`, icon: ShoppingBag, color: "text-blue-600 bg-blue-50" },
    { label: "Products", value: totalProducts, sub: "active in store", icon: Package, color: "text-indigo-600 bg-indigo-50" },
    { label: "Customers", value: totalUsers, sub: "registered users", icon: Users, color: "text-purple-600 bg-purple-50" },
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 space-y-3">
            <div className={`inline-flex rounded-lg p-2 ${color}`}>
              <Icon size={18} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{value}</p>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <h2 className="text-sm font-semibold text-gray-900">Recent Orders</h2>
          <a href="/admin/orders" className="text-xs text-indigo-600 hover:underline">View all</a>
        </div>
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50">
            <tr>
              {["Order ID", "Customer", "Amount", "Status", "Date"].map((h) => (
                <th key={h} className="px-5 py-3 text-left text-xs font-medium uppercase tracking-wide text-gray-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {recentOrders.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-5 py-3 text-xs font-mono text-gray-600">#{o.id.slice(-8).toUpperCase()}</td>
                <td className="px-5 py-3 text-sm text-gray-700">{o.user.name ?? o.user.email}</td>
                <td className="px-5 py-3 text-sm font-medium text-gray-900">₹{parseFloat(o.total.toString()).toLocaleString("en-IN")}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[o.status] ?? ""}`}>
                    {o.status.charAt(0) + o.status.slice(1).toLowerCase()}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-gray-400">{new Date(o.createdAt).toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
            {recentOrders.length === 0 && (
              <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-gray-400">No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
