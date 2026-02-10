import { Prisma, WalletTransactionType } from "@prisma/client";

export async function addWalletTransaction(
  tx: Prisma.TransactionClient,
  input: {
    userId: string;
    amount: Prisma.Decimal;
    type: WalletTransactionType;
    description: string;
    referenceId?: string;
  },
) {
  const user = await tx.user.findUnique({
    where: { id: input.userId },
    select: { balance: true },
  });

  if (!user) {
    throw new Error("User not found");
  }

  const balanceAfter = user.balance.plus(input.amount);
  if (balanceAfter.isNegative()) {
    throw new Error("Insufficient wallet balance");
  }

  await tx.user.update({
    where: { id: input.userId },
    data: { balance: balanceAfter },
  });

  return tx.walletTransaction.create({
    data: {
      userId: input.userId,
      amount: input.amount,
      balanceAfter,
      type: input.type,
      description: input.description,
      referenceId: input.referenceId,
    },
  });
}
