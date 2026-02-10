import { compare, hash } from "bcryptjs";
import { Role, ThemeMode } from "@prisma/client";
import { JWTPayload, jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE_NAME = "satikey_session";
const THEME_COOKIE_NAME = "satikey_theme";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;

type SessionPayload = JWTPayload & {
  userId: string;
  role: Role;
  email: string;
  username: string;
};

function getSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET is not configured");
  }
  return new TextEncoder().encode(secret);
}

export function themeModeToString(theme: ThemeMode) {
  return theme === ThemeMode.LIGHT ? "light" : "dark";
}

export function themeStringToMode(theme: string | null | undefined): ThemeMode {
  return theme?.toLowerCase() === "light" ? ThemeMode.LIGHT : ThemeMode.DARK;
}

export async function hashPassword(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

async function signSessionToken(payload: Omit<SessionPayload, keyof JWTPayload>) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_MAX_AGE}s`)
    .sign(getSecret());
}

async function verifySessionToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecret());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function createSessionCookie(user: {
  id: string;
  role: Role;
  email: string;
  username: string;
  theme: ThemeMode;
}) {
  const token = await signSessionToken({
    userId: user.id,
    role: user.role,
    email: user.email,
    username: user.username,
  });

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
  cookieStore.set(THEME_COOKIE_NAME, themeModeToString(user.theme), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function setThemeCookie(theme: ThemeMode) {
  const cookieStore = await cookies();
  cookieStore.set(THEME_COOKIE_NAME, themeModeToString(theme), {
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function getThemeCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(THEME_COOKIE_NAME)?.value ?? "dark";
}

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifySessionToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) {
    return null;
  }

  return prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      role: true,
      email: true,
      username: true,
      fullName: true,
      theme: true,
      balance: true,
      createdAt: true,
    },
  });
}

export async function requireUser(redirectTo = "/login") {
  const user = await getCurrentUser();
  if (!user) {
    redirect(redirectTo);
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireUser("/login?next=/admin");
  if (user.role !== Role.ADMIN) {
    redirect("/dashboard");
  }
  return user;
}
