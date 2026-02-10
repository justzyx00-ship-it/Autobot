import { Product } from "@prisma/client";
import Link from "next/link";
import { createOrderAction } from "@/actions/user-actions";
import { formatCurrency } from "@/lib/format";

type ProductCardProps = {
  product: Product;
  isLoggedIn: boolean;
};

export function ProductCard({ product, isLoggedIn }: ProductCardProps) {
  return (
    <article className="group relative overflow-hidden rounded-3xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-900">
      {product.isHot && (
        <span className="absolute right-4 top-4 rounded-full bg-rose-500 px-2.5 py-1 text-[11px] font-semibold text-white">
          Hot
        </span>
      )}
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zinc-100 text-2xl dark:bg-zinc-800">
          {product.icon}
        </div>
        <div>
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100">
            {product.name}
          </h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">{product.duration}</p>
        </div>
      </div>

      <p className="line-clamp-2 min-h-11 text-sm text-zinc-600 dark:text-zinc-300">
        {product.shortDescription}
      </p>

      <div className="mt-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-zinc-400">Gia</p>
          <p className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
            {formatCurrency(product.price)}
          </p>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Da ban {product.soldCount.toLocaleString("vi-VN")}
        </p>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {isLoggedIn ? (
          <form action={createOrderAction} className="w-full">
            <input type="hidden" name="productId" value={product.id} />
            <button className="w-full rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
              Mua ngay
            </button>
          </form>
        ) : (
          <Link
            href="/login?next=/dashboard"
            className="w-full rounded-2xl bg-zinc-900 px-4 py-2.5 text-center text-sm font-semibold text-white transition hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
          >
            Dang nhap de mua
          </Link>
        )}
      </div>
    </article>
  );
}
