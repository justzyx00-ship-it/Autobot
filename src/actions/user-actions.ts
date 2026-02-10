"use server";

import {
  OrderStatus,
  Prisma,
  ThemeMode,
  TopupMethod,
  TopupStatus,
  WalletTransactionType,
} from "@prisma/client";
import { redirect } from "next/navigation";
import {
  getCurrentUser,
  hashPassword,
  setThemeCookie,
  themeStringToMode,
  verifyPassword,
} from "@/lib/auth";
import { markOrderAsProcessed } from "@/lib/order";
import { prisma } from "@/lib/prisma";
import {
  changePasswordSchema,
  createOrderSchema,
  createTopupSchema,
  payOrderSchema,
  supportTicketSchema,
  updateProfileSchema,
  updateThemeSchema,
} from "@/lib/validators";
import { addWalletTransaction } from "@/lib/wallet";

function withMessage(path: string, key: "error" | "notice", value: string) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

function randomRef(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 100000)}`;
}

export async function createOrderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = createOrderSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Khong tim thay san pham"));
  }

  let result: { paid: boolean; autoDone: boolean };
  try {
    result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: parsed.data.productId },
      });

      if (!product || !product.isActive) {
        throw new Error("Product not available");
      }

      const order = await tx.order.create({
        data: {
          userId: user.id,
          productId: product.id,
          price: product.price,
          amount: product.price,
          status: OrderStatus.PENDING_PAYMENT,
        },
      });

      const dbUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      if (!dbUser) {
        throw new Error("User not found");
      }

      if (dbUser.balance.greaterThanOrEqualTo(product.price)) {
        await addWalletTransaction(tx, {
          userId: user.id,
          amount: product.price.negated(),
          type: WalletTransactionType.PURCHASE,
          description: `Thanh toan don hang ${product.name}`,
          referenceId: order.id,
        });

        const processedOrder = await markOrderAsProcessed(tx, order.id, product);

        await tx.product.update({
          where: { id: product.id },
          data: { soldCount: { increment: 1 } },
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            title:
              processedOrder.status === OrderStatus.COMPLETED
                ? "Don hang da hoan thanh"
                : "Don hang dang xu ly",
            message:
              processedOrder.status === OrderStatus.COMPLETED
                ? `Don ${product.name} da giao xong, vui long vao lich su don hang de nhan thong tin.`
                : `Don ${product.name} dang duoc xu ly, he thong se thong bao ngay khi hoan tat.`,
          },
        });

        return { paid: true, autoDone: processedOrder.status === OrderStatus.COMPLETED };
      }

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Don hang cho thanh toan",
          message: `Don ${product.name} da tao. Vui long nap them tien de thanh toan.`,
        },
      });

      return { paid: false, autoDone: false };
    });
  } catch {
    redirect(withMessage("/dashboard", "error", "Khong the tao don hang"));
  }

  if (result.paid && result.autoDone) {
    redirect(withMessage("/dashboard", "notice", "Dat hang thanh cong, don da giao ngay"));
  }
  if (result.paid) {
    redirect(
      withMessage("/dashboard", "notice", "Dat hang thanh cong, don dang duoc xu ly"),
    );
  }
  redirect(
    withMessage("/dashboard", "notice", "Da tao don cho thanh toan, vui long nap them tien"),
  );
}

export async function payOrderAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = payOrderSchema.safeParse({
    orderId: formData.get("orderId"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Don hang khong hop le"));
  }

  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findFirst({
        where: {
          id: parsed.data.orderId,
          userId: user.id,
        },
        include: { product: true },
      });

      if (!order) {
        throw new Error("Order not found");
      }

      if (order.status !== OrderStatus.PENDING_PAYMENT) {
        throw new Error("Order cannot be paid");
      }

      const dbUser = await tx.user.findUnique({
        where: { id: user.id },
        select: { balance: true },
      });

      if (!dbUser) {
        throw new Error("User not found");
      }

      if (dbUser.balance.lessThan(order.amount)) {
        throw new Error("Insufficient balance");
      }

      await addWalletTransaction(tx, {
        userId: user.id,
        amount: order.amount.negated(),
        type: WalletTransactionType.PURCHASE,
        description: `Thanh toan don hang ${order.product.name}`,
        referenceId: order.id,
      });

      const processedOrder = await markOrderAsProcessed(tx, order.id, order.product);

      await tx.product.update({
        where: { id: order.productId },
        data: { soldCount: { increment: 1 } },
      });

      await tx.notification.create({
        data: {
          userId: user.id,
          title:
            processedOrder.status === OrderStatus.COMPLETED
              ? "Don hang da hoan thanh"
              : "Don hang dang xu ly",
          message: `Don ${order.product.name} da thanh toan thanh cong.`,
        },
      });
    });
  } catch {
    redirect(withMessage("/dashboard", "error", "Khong the thanh toan don hang"));
  }

  redirect(withMessage("/dashboard", "notice", "Thanh toan don hang thanh cong"));
}

export async function createTopupAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = createTopupSchema.safeParse({
    method: formData.get("method"),
    amount: formData.get("amount"),
    provider: formData.get("provider"),
    note: formData.get("note"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Thong tin nap tien khong hop le"));
  }

  const amount = new Prisma.Decimal(parsed.data.amount);
  const method = parsed.data.method;
  const provider = parsed.data.provider?.trim() || null;
  const note = parsed.data.note?.trim() || null;

  let result: {
    method: TopupMethod;
    status: TopupStatus;
    referenceCode: string | null;
  };

  try {
    result = await prisma.$transaction(async (tx) => {
      const topup = await tx.topup.create({
        data: {
          userId: user.id,
          method,
          amount,
          status: TopupStatus.PROCESSING,
          provider,
          note,
          referenceCode: randomRef(method === TopupMethod.CARD ? "CARD" : "BANK"),
        },
      });

      if (method === TopupMethod.CARD) {
        const updatedTopup = await tx.topup.update({
          where: { id: topup.id },
          data: {
            status: TopupStatus.SUCCESS,
            processedAt: new Date(),
            note: topup.note ? `${topup.note}. Nap the cao tu dong` : "Nap the cao tu dong",
          },
        });

        await addWalletTransaction(tx, {
          userId: user.id,
          amount: updatedTopup.amount,
          type: WalletTransactionType.TOPUP,
          description: `Nap tien tu the ${provider ?? "mobile card"}`,
          referenceId: updatedTopup.id,
        });

        await tx.notification.create({
          data: {
            userId: user.id,
            title: "Nap tien thanh cong",
            message: `So du da duoc cong ${updatedTopup.amount.toString()} VND.`,
          },
        });

        return {
          method,
          status: TopupStatus.SUCCESS,
          referenceCode: updatedTopup.referenceCode,
        };
      }

      await tx.notification.create({
        data: {
          userId: user.id,
          title: "Lenh nap QR dang xu ly",
          message: `Ma giao dich ${topup.referenceCode}. Vui long chuyen khoan dung noi dung de he thong doi soat.`,
        },
      });

      return { method, status: TopupStatus.PROCESSING, referenceCode: topup.referenceCode };
    });
  } catch {
    redirect(withMessage("/dashboard", "error", "Khong the tao lenh nap tien"));
  }

  if (result.status === TopupStatus.SUCCESS) {
    redirect(withMessage("/dashboard", "notice", "Nap tien tu dong thanh cong"));
  }
  redirect(
    withMessage(
      "/dashboard",
      "notice",
      `Lenh nap QR da tao, ma tham chieu ${result.referenceCode}`,
    ),
  );
}

export async function updateProfileAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = updateProfileSchema.safeParse({
    fullName: formData.get("fullName"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Thong tin ca nhan khong hop le"));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { fullName: parsed.data.fullName.trim() },
  });

  redirect(withMessage("/dashboard", "notice", "Cap nhat thong tin thanh cong"));
}

export async function changePasswordAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = changePasswordSchema.safeParse({
    currentPassword: formData.get("currentPassword"),
    newPassword: formData.get("newPassword"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Mat khau khong hop le"));
  }

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { passwordHash: true },
  });

  if (!dbUser) {
    redirect(withMessage("/dashboard", "error", "Khong tim thay tai khoan"));
  }

  const isValid = await verifyPassword(parsed.data.currentPassword, dbUser.passwordHash);
  if (!isValid) {
    redirect(withMessage("/dashboard", "error", "Mat khau hien tai khong dung"));
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash: await hashPassword(parsed.data.newPassword) },
  });

  redirect(withMessage("/dashboard", "notice", "Doi mat khau thanh cong"));
}

export async function changeThemeAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const parsed = updateThemeSchema.safeParse({
    theme: formData.get("theme"),
  });

  if (!parsed.success) {
    redirect(withMessage("/dashboard", "error", "Theme khong hop le"));
  }

  const theme = themeStringToMode(parsed.data.theme);
  await prisma.user.update({
    where: { id: user.id },
    data: { theme: theme as ThemeMode },
  });
  await setThemeCookie(theme);
  redirect(withMessage("/dashboard", "notice", "Da cap nhat giao dien"));
}

export async function submitSupportTicketAction(formData: FormData) {
  const sessionUser = await getCurrentUser();

  const parsed = supportTicketSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
  });

  if (!parsed.success) {
    redirect(withMessage("/contact", "error", "Noi dung ho tro khong hop le"));
  }

  await prisma.supportTicket.create({
    data: {
      userId: sessionUser?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      subject: parsed.data.subject,
      message: parsed.data.message,
    },
  });

  redirect(withMessage("/contact", "notice", "Da gui yeu cau ho tro thanh cong"));
}
