import Link from "next/link";
import { redirect } from "next/navigation";
import { registerAction } from "@/actions/auth-actions";
import { FlashMessage } from "@/components/flash-message";
import { getCurrentUser } from "@/lib/auth";

type RegisterPageProps = {
  searchParams: Promise<{
    error?: string;
    notice?: string;
  }>;
};

export const metadata = {
  title: "Dang ky",
};

export default async function RegisterPage({ searchParams }: RegisterPageProps) {
  const params = await searchParams;
  const user = await getCurrentUser();
  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="container-main py-10">
      <div className="mx-auto max-w-md">
        <h1 className="section-title text-center">Tao tai khoan moi</h1>
        <p className="section-subtitle text-center">
          Dang ky de mua nhanh dich vu so va theo doi lich su don hang.
        </p>

        <FlashMessage error={params.error} notice={params.notice} className="mt-5" />

        <form action={registerAction} className="soft-card mt-5 space-y-4 p-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Ho va ten
            </label>
            <input name="fullName" placeholder="Nguyen Van A" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Username
            </label>
            <input name="username" placeholder="satikey_user" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Email
            </label>
            <input type="email" name="email" placeholder="you@email.com" required />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">
              Mat khau
            </label>
            <input type="password" name="password" placeholder="it nhat 8 ky tu" required />
          </div>
          <button className="w-full rounded-2xl bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-zinc-700 dark:bg-indigo-500 dark:hover:bg-indigo-400">
            Dang ky
          </button>
          <p className="text-sm text-zinc-600 dark:text-zinc-300">
            Da co tai khoan,{" "}
            <Link href="/login" className="font-semibold text-indigo-500 hover:underline">
              dang nhap
            </Link>
            .
          </p>
        </form>
      </div>
    </div>
  );
}
