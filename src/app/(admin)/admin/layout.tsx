import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { LayoutDashboard, Package, ShoppingBag, Tag, LogOut } from "lucide-react";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-56 shrink-0 border-r border-gray-200 bg-white lg:flex lg:flex-col">
        <div className="flex h-14 items-center border-b px-5">
          <Link href="/" className="text-lg font-bold text-indigo-600">libiduo</Link>
          <span className="ml-2 rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase">Admin</span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900"
            >
              <Icon size={16} />
              {label}
            </Link>
          ))}
        </nav>
        <div className="border-t px-3 py-3">
          <div className="px-3 py-2 text-xs text-gray-500 truncate">{session.user.email}</div>
          <Link href="/api/auth/signout" className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-red-500 hover:bg-red-50">
            <LogOut size={16} />
            Sign out
          </Link>
        </div>
      </aside>

      <div className="flex flex-1 flex-col min-w-0">
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-4 lg:hidden">
          <Link href="/" className="text-lg font-bold text-indigo-600 mr-2">libiduo</Link>
          <span className="rounded bg-indigo-100 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700 uppercase">Admin</span>
          <nav className="ml-auto flex gap-1">
            {NAV.map(({ href, icon: Icon }) => (
              <Link key={href} href={href} className="rounded-md p-2 text-gray-500 hover:text-gray-900">
                <Icon size={18} />
              </Link>
            ))}
          </nav>
        </header>
        <main className="flex-1 overflow-auto bg-gray-50">{children}</main>
      </div>
    </div>
  );
}
