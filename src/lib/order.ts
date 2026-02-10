import { OrderStatus, Prisma, Product } from "@prisma/client";

export function buildDeliveryData(product: Product, orderId: string) {
  if (product.deliveryTemplate) {
    return `${product.deliveryTemplate}\nMa don: ${orderId}`;
  }

  return `Don hang ${product.name} da duoc tiep nhan. Ma don: ${orderId}. Ho tro se lien he neu can bo sung thong tin.`;
}

export async function markOrderAsProcessed(
  tx: Prisma.TransactionClient,
  orderId: string,
  product: Product,
) {
  if (product.autoDelivery) {
    return tx.order.update({
      where: { id: orderId },
      data: {
        status: OrderStatus.COMPLETED,
        completedAt: new Date(),
        deliveryData: buildDeliveryData(product, orderId),
      },
    });
  }

  return tx.order.update({
    where: { id: orderId },
    data: { status: OrderStatus.PROCESSING },
  });
}
