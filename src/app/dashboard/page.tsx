import { OrderStatus, TopupMethod, TopupStatus, WalletTransactionType } from "@prisma/client";
import {
  changePasswordAction,
  changeThemeAction,
  createOrderAction,
  createTopupAction,
  payOrderAction,
  updateProfileAction,
} from "@/actions/user-actions";
import { FlashMessage } from "@/components/flash-message";
import { StatCard } from "@/components/stat-card";
import { requireUser } from "@/lib/auth";
import { formatCurrency, formatDate } from "@/lib/format";
import { prisma } from "@/lib/prisma";

type DashboardPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
  }>;
};

function getOrderBadge(status: OrderStatus) {
  if (status === OrderStatus.PENDING_PAYMENT) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  if (status === OrderStatus.PROCESSING) {
    return "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300";
  }
  return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
}

function getTopupBadge(status: TopupStatus) {
  if (status === TopupStatus.PROCESSING) {
    return "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  }
  if (status === TopupStatus.SUCCESS) {
    return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300";
  }
  return "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300";
}

export const metadata = {
  title: "Dashboard",
};

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const params = await searchParams;
  const user = await requireUser("/login?next=/dashboard");

  const [
    products,
    orders,
    topups,
    walletTransactions,
    notifications,
    totalSpentAggregate,
    totalTopupAggregate,
  ] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isHot: "desc" }, { name: "asc" }],
      select: { id: true, name: true, price: true, category: true },
    }),
    prisma.order.findMany({
      where: { userId: user.id },
      include: { product: true },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.topup.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.walletTransaction.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 12,
    }),
    prisma.notification.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.walletTransaction.aggregate({
      where: { userId: user.id, type: WalletTransactionType.PURCHASE },
      _sum: { amount: true },
    }),
    prisma.walletTransaction.aggregate({
      where: { userId: user.id, type: WalletTransactionType.TOPUP },
      _sum: { amount: true },
    }),
  ]);

  const completedOrders = orders.filter((item) => item.status === OrderStatus.COMPLETED).length;
  const pendingOrders = orders.filter(
    (item) => item.status === OrderStatus.PENDING_PAYMENT,
  ).length;
  const totalSpent = totalSpentAggregate._sum.amount?.abs() ?? 0;
  const totalTopup = totalTopupAggregate._sum.amount ?? 0;

  return (
    <div className="container-main py-8">
      <h1 className="section-title">Dashboard tai khoan</h1>
      <p className="section-subtitle">
        Xin chao {user.fullName ?? user.username}, quan ly don hang, so du va thong tin ca nhan.
      </p>

      <FlashMessage error={params.error} notice={params.notice} className="mt-5" />

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard title="So du hien tai" value={formatCurrency(user.balance)} />
        <StatCard title="Tong don hang" value={`${orders.length}`} subtitle={`${completedOrders} da hoan thanh`} />
        <StatCard
          title="Tong nap thanh cong"
          value={formatCurrency(totalTopup)}
          subtitle={`${topups.filter((item) => item.status === TopupStatus.SUCCESS).length} giao dich`}
        />
        <StatCard
          title="Tong chi tieu"
          value={formatCurrency(totalSpent)}
          subtitle={`${pendingOrders} don cho thanh toan`}
        />
      </section>

      <section className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <div className="space-y-5">
          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Dat don nhanh
            </h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Don du so du se thanh toan ngay. Don chua du so du se o trang thai cho thanh toan.
            </p>
            <form action={createOrderAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
              <select name="productId" required className="w-full">
                <option value="">Chon san pham</option>
                {products.map((product) => (
                  <option key={product.id} value={product.id}>
                    {product.name} - {formatCurrency(product.price)} ({product.category})
                  </option>
                ))}
              </select>
              <button className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                Tao don
              </button>
            </form>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Lich su don hang
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-900/60">
                  <tr>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">San pham</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">So tien</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Trang thai</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Thoi gian</th>
                    <th className="px-4 py-3 text-left font-medium text-zinc-500">Hanh dong</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {orders.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-6 text-center text-zinc-500">
                        Ban chua co don hang nao.
                      </td>
                    </tr>
                  )}
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        <p className="font-medium">{order.product.name}</p>
                        {order.deliveryData && (
                          <p className="mt-1 max-w-xs whitespace-pre-wrap text-xs text-zinc-500 dark:text-zinc-400">
                            {order.deliveryData}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-700 dark:text-zinc-200">
                        {formatCurrency(order.amount)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getOrderBadge(order.status)}`}
                        >
                          {order.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-500 dark:text-zinc-400">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3">
                        {order.status === OrderStatus.PENDING_PAYMENT ? (
                          <form action={payOrderAction}>
                            <input type="hidden" name="orderId" value={order.id} />
                            <button className="rounded-xl bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                              Thanh toan
                            </button>
                          </form>
                        ) : (
                          <span className="text-xs text-zinc-500">Hoan tat</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Bien dong vi tien
              </h2>
            </div>
            <div className="max-h-[340px] overflow-auto p-4">
              {walletTransactions.length === 0 ? (
                <p className="text-sm text-zinc-500">Chua co giao dich vi.</p>
              ) : (
                <div className="space-y-3">
                  {walletTransactions.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-zinc-800 dark:text-zinc-100">
                          {item.description}
                        </p>
                        <p
                          className={`text-sm font-semibold ${
                            item.amount.isNegative()
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {item.amount.isNegative() ? "-" : "+"}
                          {formatCurrency(item.amount.abs())}
                        </p>
                      </div>
                      <div className="mt-1 flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                        <span>{item.type}</span>
                        <span>{formatDate(item.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Nap tien</h2>
            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
              Ho tro nap qua QR ngan hang va the cao. The cao duoc cong vi tu dong.
            </p>
            <div className="mt-3 rounded-2xl border border-dashed border-indigo-300 bg-indigo-50/70 p-3 text-xs text-indigo-700 dark:border-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-300">
              QR ngan hang, STK 0987654321, Chu TK SATIKEY STORE.
              <br />
              Vui long ghi dung noi dung theo ma tham chieu sau khi tao lenh nap.
            </div>
            <form action={createTopupAction} className="mt-4 space-y-3">
              <select name="method" required>
                <option value={TopupMethod.BANK_QR}>Nap qua ngan hang QR</option>
                <option value={TopupMethod.CARD}>Nap the cao tu dong</option>
              </select>
              <input name="amount" type="number" min={10000} step={1000} placeholder="So tien nap" required />
              <input name="provider" placeholder="Nha mang (chi dung cho the cao)" />
              <textarea name="note" rows={3} placeholder="Ghi chu giao dich (tuy chon)" />
              <button className="w-full rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
                Tao lenh nap
              </button>
            </form>
          </div>

          <div className="soft-card overflow-hidden">
            <div className="border-b border-zinc-200 px-5 py-4 dark:border-zinc-800">
              <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
                Lich su nap tien
              </h2>
            </div>
            <div className="max-h-[280px] overflow-auto p-4">
              {topups.length === 0 ? (
                <p className="text-sm text-zinc-500">Chua co giao dich nap tien.</p>
              ) : (
                <div className="space-y-3">
                  {topups.map((topup) => (
                    <div
                      key={topup.id}
                      className="rounded-2xl border border-zinc-200 p-3 text-sm dark:border-zinc-800"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <p className="font-medium text-zinc-800 dark:text-zinc-100">
                          {topup.method === TopupMethod.BANK_QR ? "BANK QR" : "CARD"} ·{" "}
                          {formatCurrency(topup.amount)}
                        </p>
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${getTopupBadge(topup.status)}`}
                        >
                          {topup.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                        Ref: {topup.referenceCode ?? topup.id}
                      </p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        {formatDate(topup.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Thong tin tai khoan
            </h2>
            <form action={updateProfileAction} className="mt-4 space-y-3">
              <input name="fullName" defaultValue={user.fullName ?? ""} placeholder="Ho va ten" required />
              <button className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                Cap nhat thong tin
              </button>
            </form>
            <form action={changeThemeAction} className="mt-3 space-y-3">
              <select name="theme" defaultValue={user.theme === "LIGHT" ? "light" : "dark"}>
                <option value="dark">Dark mode</option>
                <option value="light">Light mode</option>
              </select>
              <button className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                Luu giao dien
              </button>
            </form>
            <form action={changePasswordAction} className="mt-3 space-y-3">
              <input
                type="password"
                name="currentPassword"
                placeholder="Mat khau hien tai"
                required
              />
              <input type="password" name="newPassword" placeholder="Mat khau moi" required />
              <button className="w-full rounded-2xl border border-zinc-300 bg-white px-4 py-2 text-sm font-semibold text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800">
                Doi mat khau
              </button>
            </form>
          </div>

          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Thong bao</h2>
            <div className="mt-4 space-y-3">
              {notifications.length === 0 ? (
                <p className="text-sm text-zinc-500">Khong co thong bao moi.</p>
              ) : (
                notifications.map((item) => (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-zinc-200 p-3 dark:border-zinc-800"
                  >
                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                      {item.title}
                    </p>
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                      {item.message}
                    </p>
                    <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                      {formatDate(item.createdAt)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
