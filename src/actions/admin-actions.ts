"use server";

import {
  OrderStatus,
  Prisma,
  TopupStatus,
  WalletTransactionType,
} from "@prisma/client";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  createProductSchema,
  processTopupSchema,
  toggleProductSchema,
  updateOrderStatusSchema,
} from "@/lib/validators";
import { addWalletTransaction } from "@/lib/wallet";

function withMessage(path: string, key: "error" | "notice", value: string) {
  const [pathname, queryString] = path.split("?");
  const params = new URLSearchParams(queryString ?? "");
  params.set(key, value);
  return `${pathname}?${params.toString()}`;
}

export async function createProductAction(formData: FormData) {
  await requireAdmin();

  const parsed = createProductSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    category: formData.get("category"),
    duration: formData.get("duration"),
    price: formData.get("price"),
    shortDescription: formData.get("shortDescription"),
    description: formData.get("description"),
    icon: formData.get("icon"),
    isHot: formData.get("isHot"),
    autoDelivery: formData.get("autoDelivery"),
    deliveryTemplate: formData.get("deliveryTemplate"),
  });

  if (!parsed.success) {
    redirect(withMessage("/admin", "error", "Du lieu san pham khong hop le"));
  }

  const existed = await prisma.product.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true },
  });

  if (existed) {
    redirect(withMessage("/admin", "error", "Slug san pham da ton tai"));
  }

  await prisma.product.create({
    data: {
      name: parsed.data.name,
      slug: parsed.data.slug,
      category: parsed.data.category,
      duration: parsed.data.duration,
      price: new Prisma.Decimal(parsed.data.price),
      shortDescription: parsed.data.shortDescription,
      description: parsed.data.description,
      icon: parsed.data.icon,
      isHot: Boolean(parsed.data.isHot),
      autoDelivery: Boolean(parsed.data.autoDelivery),
      deliveryTemplate: parsed.data.deliveryTemplate || null,
      isActive: true,
    },
  });

  redirect(withMessage("/admin", "notice", "Da tao san pham moi"));
}

export async function toggleProductStatusAction(formData: FormData) {
  await requireAdmin();

  const parsed = toggleProductSchema.safeParse({
    productId: formData.get("productId"),
  });

  if (!parsed.success) {
    redirect(withMessage("/admin", "error", "San pham khong hop le"));
  }

  const product = await prisma.product.findUnique({
    where: { id: parsed.data.productId },
    select: { id: true, isActive: true },
  });

  if (!product) {
    redirect(withMessage("/admin", "error", "Khong tim thay san pham"));
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { isActive: !product.isActive },
  });

  redirect(withMessage("/admin", "notice", "Da cap nhat trang thai san pham"));
}

export async function completeOrderAction(formData: FormData) {
  await requireAdmin();

  const parsed = updateOrderStatusSchema.safeParse({
    orderId: formData.get("orderId"),
    deliveryData: formData.get("deliveryData"),
  });

  if (!parsed.success) {
    redirect(withMessage("/admin", "error", "Du lieu don hang khong hop le"));
  }

  const order = await prisma.order.findUnique({
    where: { id: parsed.data.orderId },
    include: { product: true },
  });

  if (!order) {
    redirect(withMessage("/admin", "error", "Khong tim thay don hang"));
  }

  if (order.status === OrderStatus.COMPLETED) {
    redirect(withMessage("/admin", "error", "Don hang da hoan thanh truoc do"));
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: order.id },
        data: {
          status: OrderStatus.COMPLETED,
          completedAt: new Date(),
          deliveryData: parsed.data.deliveryData,
        },
      });

      await tx.notification.create({
        data: {
          userId: order.userId,
          title: "Don hang da hoan thanh",
          message: `Don ${order.product.name} da duoc giao boi admin.`,
        },
      });
    });
  } catch {
    redirect(withMessage("/admin", "error", "Khong the cap nhat don hang"));
  }

  redirect(withMessage("/admin", "notice", "Da danh dau don hang hoan thanh"));
}

export async function processTopupAction(formData: FormData) {
  await requireAdmin();

  const parsed = processTopupSchema.safeParse({
    topupId: formData.get("topupId"),
    action: formData.get("action"),
  });

  if (!parsed.success) {
    redirect(withMessage("/admin", "error", "Du lieu nap tien khong hop le"));
  }

  try {
    await prisma.$transaction(async (tx) => {
      const topup = await tx.topup.findUnique({
        where: { id: parsed.data.topupId },
      });

      if (!topup) {
        throw new Error("Topup not found");
      }

      if (topup.status !== TopupStatus.PROCESSING) {
        throw new Error("Topup already processed");
      }

      if (parsed.data.action === "reject") {
        await tx.topup.update({
          where: { id: topup.id },
          data: {
            status: TopupStatus.FAILED,
            processedAt: new Date(),
            note: topup.note
              ? `${topup.note}. Tu choi boi admin`
              : "Tu choi boi admin",
          },
        });

        await tx.notification.create({
          data: {
            userId: topup.userId,
            title: "Lenh nap bi tu choi",
            message: `Lenh nap ${topup.referenceCode ?? topup.id} khong hop le.`,
          },
        });
        return;
      }

      const updated = await tx.topup.update({
        where: { id: topup.id },
        data: {
          status: TopupStatus.SUCCESS,
          processedAt: new Date(),
          note: topup.note
            ? `${topup.note}. Doi soat thanh cong`
            : "Doi soat thanh cong",
        },
      });

      await addWalletTransaction(tx, {
        userId: updated.userId,
        amount: updated.amount,
        type: WalletTransactionType.TOPUP,
        description: `Cong tien lenh nap ${updated.referenceCode ?? updated.id}`,
        referenceId: updated.id,
      });

      await tx.notification.create({
        data: {
          userId: updated.userId,
          title: "Nap tien thanh cong",
          message: `Lenh nap ${updated.referenceCode ?? updated.id} da duoc cong vi.`,
        },
      });
    });
  } catch {
    redirect(withMessage("/admin", "error", "Khong the xu ly lenh nap tien"));
  }

  redirect(withMessage("/admin", "notice", "Da xu ly lenh nap tien"));
}
