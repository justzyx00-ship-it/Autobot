import { SHOP } from "@/lib/constants";

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-zinc-200/70 bg-white dark:border-zinc-800/80 dark:bg-zinc-950">
      <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            {SHOP.name}
          </p>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
            Dich vu so nhanh, gon, uy tin cho Discord user, streamer va content creator.
          </p>
          <p className="mt-3 text-sm text-zinc-500 dark:text-zinc-400">
            Domain: {SHOP.domain}
          </p>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Danh muc hot
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>Discord Nitro</li>
            <li>ChatGPT Plus</li>
            <li>CapCut Pro</li>
            <li>Spotify Premium</li>
          </ul>
        </div>

        <div>
          <p className="text-sm font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            Ho tro
          </p>
          <ul className="mt-3 space-y-2 text-sm text-zinc-700 dark:text-zinc-300">
            <li>
              <a href={SHOP.support.discord} className="hover:underline">
                Discord
              </a>
            </li>
            <li>
              <a href={SHOP.support.telegram} className="hover:underline">
                Telegram
              </a>
            </li>
            <li>
              <a href={SHOP.support.facebook} className="hover:underline">
                Facebook
              </a>
            </li>
            <li>
              <a href={`mailto:${SHOP.support.email}`} className="hover:underline">
                {SHOP.support.email}
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
