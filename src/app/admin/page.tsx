import { OrderStatus, TopupStatus } from "@prisma/client";
import {
  completeOrderAction,
  createProductAction,
  processTopupAction,
  toggleProductStatusAction,
} from "@/actions/admin-actions";
import { FlashMessage } from "@/components/flash-message";
import { StatCard } from "@/components/stat-card";
import { requireAdmin } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type AdminPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
  }>;
};

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isSameMonth(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
}

export const metadata = {
  title: "Admin Dashboard",
};

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const params = await searchParams;
  await requireAdmin();

  const now = new Date();

  const [orders, usersCount, topups, products, purchaseTransactions, supportTickets] =
    await Promise.all([
      prisma.order.findMany({
        include: { user: true, product: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.user.count({ where: { role: "USER" } }),
      prisma.topup.findMany({
        include: { user: true },
        orderBy: { createdAt: "desc" },
        take: 20,
      }),
      prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      }),
      prisma.walletTransaction.findMany({
        where: { type: "PURCHASE" },
        orderBy: { createdAt: "desc" },
      }),
      prisma.supportTicket.findMany({
        orderBy: { createdAt: "desc" },
        take: 12,
      }),
    ]);

  const revenueToday = purchaseTransactions
    .filter((item) => isSameDay(item.createdAt, now))
    .reduce((acc, item) => acc + Number(item.amount.abs()), 0);

  const revenueMonth = purchaseTransactions
    .filter((item) => isSameMonth(item.createdAt, now))
    .reduce((acc, item) => acc + Number(item.amount.abs()), 0);

  const totalTopupSuccess = topups
    .filter((item) => item.status === TopupStatus.SUCCESS)
    .reduce((acc, item) => acc + Number(item.amount), 0);

  const processingOrders = orders.filter((item) => item.status === OrderStatus.PROCESSING);
  const pendingTopups = topups.filter((item) => item.status === TopupStatus.PROCESSING);

  return (
    <div className="container-main py-8">
      <h1 className="section-title">Admin dashboard</h1>
      <p className="section-subtitle">
        Quan tri san pham, don hang, nguoi dung, nap tien va ticket ho tro.
      </p>

      <FlashMessage error={params.error} notice={params.notice} className="mt-5" />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Doanh thu hom nay" value={formatCurrency(revenueToday)} />
        <StatCard title="Doanh thu thang nay" value={formatCurrency(revenueMonth)} />
        <StatCard title="Tong don hang" value={`${orders.length}`} />
        <StatCard
          title="Nguoi dung"
          value={`${usersCount}`}
          subtitle={`Nap thanh cong ${formatCurrency(totalTopupSuccess)}`}
        />
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Tao san pham moi
            </h2>
            <form action={createProductAction} className="mt-4 grid gap-3 sm:grid-cols-2">
              <input name="name" placeholder="Ten san pham" required />
              <input name="slug" placeholder="slug-khong-dau" required />
              <input name="category" placeholder="Category" required />
              <input name="duration" placeholder="1 thang / 3 thang" required />
              <input name="price" type="number" min={1} placeholder="Gia VND" required />
              <input name="icon" placeholder="Icon emoji, VD: 🔥" required />
              <input
                name="shortDescription"
                className="sm:col-span-2"
                placeholder="Mo ta ngan"
                required
              />
              <textarea
                name="description"
                rows={4}
                className="sm:col-span-2"
                placeholder="Mo ta chi tiet"
                required
              />
              <input
                name="deliveryTemplate"
                className="sm:col-span-2"
                placeholder="Noi dung giao tu dong (neu co)"
              />
              <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" name="isHot" className="h-4 w-4" />
                Danh dau hot
              </label>
              <label className="inline-flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
                <input type="checkbox" name="autoDelivery" className="h-4 w-4" defaultChecked />
                Tu dong giao don
              </label>
              <button className="sm:col-span-2 rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                Tao san pham
              </button>
            </form>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Quan ly san pham
              </h2>
            </div>
            <div className="max-h-[340px] overflow-auto p-4">
              <div className="space-y-3">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">
                          {product.icon} {product.name}
                        </p>
                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                          {product.category} · {formatCurrency(product.price)} · {product.duration}
                        </p>
                      </div>
                      <form action={toggleProductStatusAction}>
                        <input type="hidden" name="productId" value={product.id} />
                        <button className="rounded-xl border border-zinc-300 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                          {product.isActive ? "Tam dung ban" : "Bat lai"}
                        </button>
                      </form>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Don hang dang xu ly
              </h2>
            </div>
            <div className="max-h-[380px] overflow-auto p-4">
              <div className="space-y-3">
                {processingOrders.length === 0 ? (
                  <p className="text-sm text-zinc-500">Khong co don cho xu ly.</p>
                ) : (
                  processingOrders.map((order) => (
                    <div
                      key={order.id}
                      className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {order.product.name} · {order.user.username}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {formatCurrency(order.amount)} · {formatDate(order.createdAt)}
                      </p>
                      <form action={completeOrderAction} className="mt-2 space-y-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <textarea
                          name="deliveryData"
                          rows={3}
                          placeholder="Noi dung giao don: key, account, huong dan..."
                          required
                        />
                        <button className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                          Danh dau hoan thanh
                        </button>
                      </form>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Lenh nap cho doi soat
              </h2>
            </div>
            <div className="max-h-[320px] overflow-auto p-4">
              {pendingTopups.length === 0 ? (
                <p className="text-sm text-zinc-500">Khong co lenh nap dang cho.</p>
              ) : (
                <div className="space-y-3">
                  {pendingTopups.map((topup) => (
                    <div
                      key={topup.id}
                      className="rounded-2xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                    >
                      <p className="font-medium text-zinc-900 dark:text-zinc-100">
                        {topup.user.username} · {formatCurrency(topup.amount)}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Ref: {topup.referenceCode ?? topup.id}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(topup.createdAt)}
                      </p>
                      <div className="mt-2 flex gap-2">
                        <form action={processTopupAction}>
                          <input type="hidden" name="topupId" value={topup.id} />
                          <input type="hidden" name="action" value="approve" />
                          <button className="rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-500">
                            Duyet
                          </button>
                        </form>
                        <form action={processTopupAction}>
                          <input type="hidden" name="topupId" value={topup.id} />
                          <input type="hidden" name="action" value="reject" />
                          <button className="rounded-xl bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-500">
                            Tu choi
                          </button>
                        </form>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Ticket ho tro
              </h2>
            </div>
            <div className="max-h-[320px] overflow-auto p-4">
              {supportTickets.length === 0 ? (
                <p className="text-sm text-zinc-500">Chua co ticket ho tro.</p>
              ) : (
                <div className="space-y-3">
                  {supportTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">
                        {ticket.subject}
                      </p>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        {ticket.name} · {ticket.email} · {ticket.status}
                      </p>
                      <p className="mt-1 line-clamp-3 text-sm text-zinc-600 dark:text-zinc-300">
                        {ticket.message}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
