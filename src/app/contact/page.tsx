import { submitSupportTicketAction } from "@/actions/user-actions";
import { FlashMessage } from "@/components/flash-message";
import { FAQ_ITEMS, SHOP } from "@/lib/constants";

type ContactPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
  }>;
};

export const metadata = {
  title: "Lien he va ho tro",
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const params = await searchParams;

  return (
    <div className="container-main py-10">
      <h1 className="section-title">Lien he va ho tro</h1>
      <p className="section-subtitle">
        Neu ban can ho tro don hang, nap tien hoac tai khoan, gui yeu cau tai day.
      </p>

      <FlashMessage error={params.error} notice={params.notice} className="mt-5" />

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.2fr_1fr]">
        <form action={submitSupportTicketAction} className="soft-card space-y-4 p-5">
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Gui yeu cau ho tro
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Ho ten
              </label>
              <input name="name" placeholder="Ho ten cua ban" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
                Email
              </label>
              <input type="email" name="email" placeholder="ban@email.com" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Chu de
            </label>
            <input name="subject" placeholder="Vi du: Don hang chua hoan thanh" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Noi dung
            </label>
            <textarea
              name="message"
              rows={6}
              placeholder="Mo ta van de cua ban, kem ma don neu co"
              required
            />
          </div>
          <button className="rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            Gui yeu cau
          </button>
        </form>

        <div className="space-y-5">
          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
              Kenh lien he nhanh
            </h2>
            <ul className="mt-4 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
              <li>
                Discord:{" "}
                <a href={SHOP.support.discord} className="text-indigo-500 hover:underline">
                  {SHOP.support.discord}
                </a>
              </li>
              <li>
                Telegram:{" "}
                <a href={SHOP.support.telegram} className="text-indigo-500 hover:underline">
                  {SHOP.support.telegram}
                </a>
              </li>
              <li>
                Facebook:{" "}
                <a href={SHOP.support.facebook} className="text-indigo-500 hover:underline">
                  {SHOP.support.facebook}
                </a>
              </li>
              <li>
                Email:{" "}
                <a
                  href={`mailto:${SHOP.support.email}`}
                  className="text-indigo-500 hover:underline"
                >
                  {SHOP.support.email}
                </a>
              </li>
            </ul>
          </div>

          <div className="soft-card p-5">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">FAQ</h2>
            <div className="mt-4 space-y-4">
              {FAQ_ITEMS.map((item) => (
                <div key={item.question}>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                    {item.question}
                  </p>
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                    {item.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
