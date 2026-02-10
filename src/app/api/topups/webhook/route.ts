import { TopupStatus, WalletTransactionType } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { addWalletTransaction } from "@/lib/wallet";

const payloadSchema = z.object({
  referenceCode: z.string().min(5).max(100),
  status: z.enum(["success", "failed"]),
  note: z.string().max(200).optional(),
});

export async function POST(request: Request) {
  const webhookSecret = process.env.WEBHOOK_TOPUP_SECRET;
  const sentSecret = request.headers.get("x-webhook-secret");

  if (!webhookSecret || !sentSecret || sentSecret !== webhookSecret) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rawBody = await request.json().catch(() => null);
  const parsed = payloadSchema.safeParse(rawBody);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const { referenceCode, status, note } = parsed.data;

  const topup = await prisma.topup.findFirst({
    where: { referenceCode },
  });

  if (!topup) {
    return NextResponse.json({ error: "Topup not found" }, { status: 404 });
  }

  if (topup.status !== TopupStatus.PROCESSING) {
    return NextResponse.json({ ok: true, message: "Already processed" });
  }

  await prisma.$transaction(async (tx) => {
    if (status === "failed") {
      await tx.topup.update({
        where: { id: topup.id },
        data: {
          status: TopupStatus.FAILED,
          processedAt: new Date(),
          note: note ?? "Lenh nap that bai tu gateway",
        },
      });

      await tx.notification.create({
        data: {
          userId: topup.userId,
          title: "Nap tien that bai",
          message: `Lenh nap ${referenceCode} khong thanh cong, vui long kiem tra lai.`,
        },
      });
      return;
    }

    const updated = await tx.topup.update({
      where: { id: topup.id },
      data: {
        status: TopupStatus.SUCCESS,
        processedAt: new Date(),
        note: note ?? "Lenh nap doi soat thanh cong",
      },
    });

    await addWalletTransaction(tx, {
      userId: updated.userId,
      amount: updated.amount,
      type: WalletTransactionType.TOPUP,
      description: `Cong tien tu webhook ${updated.referenceCode ?? updated.id}`,
      referenceId: updated.id,
    });

    await tx.notification.create({
      data: {
        userId: updated.userId,
        title: "Nap tien thanh cong",
        message: `Lenh nap ${referenceCode} da duoc cong vao vi.`,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
