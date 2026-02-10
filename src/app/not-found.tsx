import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-main py-24 text-center">
      <p className="text-sm uppercase tracking-wide text-zinc-500">404</p>
      <h1 className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-100">
        Trang khong ton tai
      </h1>
      <p className="mt-2 text-zinc-600 dark:text-zinc-300">
        Link ban vua truy cap khong hop le hoac da duoc thay doi.
      </p>
      <Link
        href="/"
        className="mt-5 inline-flex rounded-2xl bg-zinc-900 px-4 py-2 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400"
      >
        Ve trang chu
      </Link>
    </div>
  );
}
