import Link from "next/link";
import { logoutAction } from "@/actions/auth-actions";
import { ThemeToggle } from "@/components/theme-toggle";
import { getCurrentUser } from "@/lib/auth";
import { SHOP } from "@/lib/constants";
import { formatCurrency } from "@/lib/format";

export async function SiteHeader() {
  const user = await getCurrentUser();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/70 bg-white/90 backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/80">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-zinc-900 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            <span className="text-base">⚡</span>
            {SHOP.name}
          </Link>
          <nav className="hidden items-center gap-2 md:flex">
            <Link
              href="/"
              className="rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              Trang chu
            </Link>
            <Link
              href="/contact"
              className="rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
            >
              Lien he
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                Dashboard
              </Link>
            )}
            {user?.role === "ADMIN" && (
              <Link
                href="/admin"
                className="rounded-xl px-3 py-2 text-sm text-zinc-600 transition hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-900 dark:hover:text-zinc-100"
              >
                Admin
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />
          {user ? (
            <>
              <div className="hidden rounded-xl border border-zinc-200 bg-white px-3 py-2 text-right shadow-sm dark:border-zinc-800 dark:bg-zinc-900 sm:block">
                <p className="text-[11px] uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
                  So du
                </p>
                <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(user.balance)}
                </p>
              </div>
              <form action={logoutAction}>
                <button className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
                  Dang xuat
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-xl border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-700 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
              >
                Dang nhap
              </Link>
              <Link
                href="/register"
                className="rounded-xl bg-zinc-900 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
              >
                Dang ky
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
