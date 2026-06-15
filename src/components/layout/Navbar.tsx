"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShoppingCart, User, Menu, X, Search } from "lucide-react";
import { useCartStore } from "@/store/cart-store";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { count } = useCartStore();
  const router = useRouter();
  const { data: session } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-bold text-indigo-600 tracking-tight">
          libiduo
        </Link>

        <nav className="hidden gap-6 md:flex">
          <Link href="/products" className="text-sm text-gray-600 hover:text-gray-900">Products</Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link href="/products" className="rounded-md p-2 text-gray-500 hover:text-gray-900 md:hidden">
            <Search size={20} />
          </Link>

          <button
            onClick={() => router.push("/cart")}
            className="relative rounded-md p-2 text-gray-500 hover:text-gray-900"
            aria-label="Open cart"
          >
            <ShoppingCart size={20} />
            {count > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-bold text-white">
                {count > 9 ? "9+" : count}
              </span>
            )}
          </button>

          {session ? (
            <div className="relative hidden md:block group">
              <button className="flex items-center gap-1.5 rounded-md px-2 py-1.5 text-sm text-gray-600 hover:text-gray-900">
                <User size={18} />
                <span className="max-w-[100px] truncate">{session.user.name ?? session.user.email}</span>
              </button>
              <div className="absolute right-0 top-full hidden w-40 rounded-md border border-gray-200 bg-white py-1 shadow-lg group-hover:block">
                <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Account</Link>
                <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Orders</Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Admin</Link>
                )}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="block w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-gray-50"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            <Link href="/login" className="hidden md:block rounded-md px-3 py-1.5 text-sm font-medium text-gray-700 hover:text-gray-900">
              Sign in
            </Link>
          )}

          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="rounded-md p-2 text-gray-500 hover:text-gray-900 md:hidden"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="border-t border-gray-100 bg-white px-4 py-3 md:hidden">
          <nav className="flex flex-col gap-3">
            <Link href="/products" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">Products</Link>
            {session ? (
              <>
                <Link href="/account" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">Account</Link>
                <Link href="/orders" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">Orders</Link>
                {session.user.role === "ADMIN" && (
                  <Link href="/admin" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">Admin</Link>
                )}
                <button onClick={() => signOut({ callbackUrl: "/" })} className="text-left text-sm text-red-600">Sign out</button>
              </>
            ) : (
              <Link href="/login" onClick={() => setMenuOpen(false)} className="text-sm text-gray-700">Sign in</Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
