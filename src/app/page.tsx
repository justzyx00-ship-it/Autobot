import { Prisma } from "@prisma/client";
import { FlashMessage } from "@/components/flash-message";
import { ProductCard } from "@/components/product-card";
import { StatCard } from "@/components/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { SHOP } from "@/lib/constants";
import { prisma } from "@/lib/prisma";

type HomePageProps = {
  searchParams: Promise<{
    q?: string;
    category?: string;
    error?: string;
    notice?: string;
  }>;
};

export default async function Home({ searchParams }: HomePageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();

  const query = params.q?.trim() ?? "";
  const category = params.category?.trim() ?? "all";

  const where: Prisma.ProductWhereInput = {
    isActive: true,
    ...(query
      ? {
          OR: [
            { name: { contains: query } },
            { shortDescription: { contains: query } },
            { category: { contains: query } },
          ],
        }
      : {}),
    ...(category !== "all" ? { category } : {}),
  };

  const [products, categories, reviews, totalSold, totalUsers, totalOrders] =
    await Promise.all([
      prisma.product.findMany({
        where,
        orderBy: [{ isHot: "desc" }, { soldCount: "desc" }],
      }),
      prisma.product.findMany({
        where: { isActive: true },
        select: { category: true },
        distinct: ["category"],
        orderBy: { category: "asc" },
      }),
      prisma.review.findMany({
        where: { isFeatured: true },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.product.aggregate({ _sum: { soldCount: true } }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.order.count(),
    ]);

  const avgRatingRaw =
    reviews.length === 0
      ? 5
      : reviews.reduce((acc, item) => acc + item.rating, 0) / reviews.length;
  const avgRating = avgRatingRaw.toFixed(1);

  return (
    <div className="pb-16">
      <section className="container-main pt-8 sm:pt-10">
        <FlashMessage error={params.error} notice={params.notice} />
      </section>

      <section className="container-main pt-6 sm:pt-8">
        <div className="overflow-hidden rounded-[2rem] border border-zinc-200 bg-gradient-to-br from-zinc-900 via-indigo-950 to-indigo-900 px-6 py-10 shadow-xl dark:border-zinc-800 sm:px-10 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="mb-3 inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-medium uppercase tracking-wide text-indigo-100">
                satikey.store
              </p>
              <h1 className="text-3xl font-bold leading-tight text-white sm:text-5xl">
                Dich vu so nhanh, gon, uy tin
              </h1>
              <p className="mt-4 max-w-xl text-sm text-indigo-100 sm:text-base">
                Nen tang mua dich vu so cho Discord user, streamer, creator va nguoi
                dung cong cu AI. Giao nhanh, theo doi don ro rang, ho tro lien tuc.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a
                  href="#products"
                  className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 shadow-sm hover:-translate-y-0.5 hover:shadow-md"
                >
                  Xem san pham
                </a>
                {!user && (
                  <a
                    href="/register"
                    className="rounded-2xl border border-white/30 bg-transparent px-4 py-2 text-sm font-semibold text-white hover:bg-white/10"
                  >
                    Tao tai khoan
                  </a>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <StatCard
                title="Danh gia trung binh"
                value={`${avgRating}/5`}
                subtitle="Do uy tin tu khach hang"
              />
              <StatCard
                title="Don da ban"
                value={`${(totalSold._sum.soldCount ?? 0).toLocaleString("vi-VN")}+`}
                subtitle="San pham da giao"
              />
              <StatCard
                title="Nguoi dung"
                value={`${totalUsers.toLocaleString("vi-VN")}+`}
                subtitle="Tai khoan dang hoat dong"
              />
              <StatCard
                title="Tong don"
                value={`${totalOrders.toLocaleString("vi-VN")}+`}
                subtitle="Van hanh on dinh hang ngay"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="container-main pt-8 sm:pt-10" id="products">
        <div className="mb-4">
          <h2 className="section-title">Danh muc dich vu</h2>
          <p className="section-subtitle">
            Discord Nitro, AI tools, streaming va entertainment. Tim nhanh, loc nhanh,
            dat hang nhanh.
          </p>
        </div>

        <form className="soft-card mb-6 grid gap-3 p-4 sm:grid-cols-[1fr_auto_auto]">
          <input
            name="q"
            defaultValue={query}
            placeholder="Tim san pham, vi du: chatgpt, nitro, spotify..."
          />
          <select name="category" defaultValue={category}>
            <option value="all">Tat ca danh muc</option>
            {categories.map((item) => (
              <option key={item.category} value={item.category}>
                {item.category}
              </option>
            ))}
          </select>
          <button className="rounded-xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            Tim
          </button>
        </form>

        {products.length === 0 ? (
          <div className="soft-card p-6 text-sm text-zinc-600 dark:text-zinc-300">
            Khong co san pham phu hop bo loc hien tai.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} isLoggedIn={Boolean(user)} />
            ))}
          </div>
        )}
      </section>

      <section className="container-main pt-10">
        <div className="mb-4">
          <h2 className="section-title">Khach hang noi gi ve SatiKey</h2>
          <p className="section-subtitle">
            Danh gia thuc te tu nguoi da mua dich vu tren he thong.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {reviews.map((review) => (
            <div
              key={review.id}
              className="soft-card rounded-3xl p-5 transition hover:-translate-y-1 hover:shadow-md"
            >
              <p className="text-base text-zinc-800 dark:text-zinc-100">"{review.content}"</p>
              <p className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {review.customer}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {review.service} · {review.rating}/5
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-main pt-10">
        <div className="soft-card overflow-hidden rounded-[2rem] bg-zinc-900 px-6 py-8 text-zinc-100 dark:bg-indigo-950 sm:px-8">
          <h2 className="text-2xl font-bold">San sang de tang toc cong viec voi dich vu so?</h2>
          <p className="mt-2 text-sm text-zinc-300">
            Tao tai khoan, nap vi va mua ngay dich vu phu hop. Ho tro qua Discord, Telegram,
            Facebook va email.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/dashboard"
              className="rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-zinc-900 hover:-translate-y-0.5"
            >
              Vao dashboard
            </a>
            <a
              href="/contact"
              className="rounded-2xl border border-zinc-500 px-4 py-2 text-sm font-semibold text-zinc-100 hover:bg-zinc-800"
            >
              Lien he ho tro
            </a>
          </div>
          <p className="mt-4 text-xs text-zinc-400">Thuong hieu: {SHOP.name}</p>
        </div>
      </section>
    </div>
  );
}
