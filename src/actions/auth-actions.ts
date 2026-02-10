"use server";

import { Role, ThemeMode } from "@prisma/client";
import { redirect } from "next/navigation";
import {
  clearSessionCookie,
  createSessionCookie,
  hashPassword,
  verifyPassword,
} from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { loginSchema, registerSchema } from "@/lib/validators";

function getSafeNext(rawNext: FormDataEntryValue | null, fallback: string) {
  if (typeof rawNext !== "string" || !rawNext.startsWith("/")) {
    return fallback;
  }
  return rawNext;
}

function withMessage(path: string, key: "error" | "notice", value: string) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

export async function registerAction(formData: FormData) {
  const parsed = registerSchema.safeParse({
    email: formData.get("email"),
    username: formData.get("username"),
    fullName: formData.get("fullName"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    redirect(withMessage("/register", "error", "Du lieu dang ky khong hop le"));
  }

  const email = parsed.data.email.trim().toLowerCase();
  const username = parsed.data.username.trim().toLowerCase();

  const existed = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] },
    select: { id: true },
  });

  if (existed) {
    redirect(withMessage("/register", "error", "Email hoac username da ton tai"));
  }

  const user = await prisma.user.create({
    data: {
      email,
      username,
      fullName: parsed.data.fullName.trim(),
      passwordHash: await hashPassword(parsed.data.password),
      role: Role.USER,
      theme: ThemeMode.DARK,
    },
    select: {
      id: true,
      role: true,
      email: true,
      username: true,
      theme: true,
    },
  });

  await createSessionCookie(user);
  redirect(withMessage("/dashboard", "notice", "Dang ky thanh cong"));
}

export async function loginAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  const nextPath = getSafeNext(formData.get("next"), "/dashboard");

  if (!parsed.success) {
    redirect(withMessage("/login", "error", "Thong tin dang nhap khong hop le"));
  }

  const identifier = parsed.data.identifier.trim();
  const isEmail = identifier.includes("@");

  const user = await prisma.user.findFirst({
    where: isEmail
      ? { email: identifier.toLowerCase() }
      : { username: identifier.toLowerCase() },
    select: {
      id: true,
      role: true,
      email: true,
      username: true,
      passwordHash: true,
      theme: true,
    },
  });

  if (!user) {
    redirect(withMessage("/login", "error", "Sai tai khoan hoac mat khau"));
  }

  const isValidPassword = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!isValidPassword) {
    redirect(withMessage("/login", "error", "Sai tai khoan hoac mat khau"));
  }

  await createSessionCookie(user);
  redirect(withMessage(nextPath, "notice", "Dang nhap thanh cong"));
}

export async function logoutAction() {
  await clearSessionCookie();
  redirect(withMessage("/", "notice", "Da dang xuat"));
}
