import Link from "next/link";
import { redirect } from "next/navigation";
import { loginAction } from "@/actions/auth-actions";
import { FlashMessage } from "@/components/flash-message";
import { getCurrentUser } from "@/lib/auth";

type LoginPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
    next?: string;
  }>;
};

export const metadata = {
  title: "Dang nhap",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    redirect(params.next && params.next.startsWith("/") ? params.next : "/dashboard");
  }

  return (
    <div className="container-main py-10">
      <div className="mx-auto max-w-md">
        <h1 className="section-title text-center">Dang nhap tai khoan</h1>
        <p className="section-subtitle text-center">
          Quan ly don hang, vi tien va thong bao cua ban tai SatiKey.
        </p>

        <FlashMessage error={params.error} notice={params.notice} className="mt-5" />

        <form action={loginAction} className="soft-card mt-5 space-y-4 p-5">
          <input type="hidden" name="next" value={params.next ?? "/dashboard"} />
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Email hoac username
            </label>
            <input name="identifier" placeholder="demo@satikey.store" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Mat khau
            </label>
            <input type="password" name="password" placeholder="********" required />
          </div>
          <button className="w-full rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            Dang nhap
          </button>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Chua co tai khoan,{" "}
            <Link href="/register" className="font-semibold text-indigo-500 hover:underline">
              dang ky ngay
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
