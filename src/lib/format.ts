import { format } from "date-fns";
import { vi } from "date-fns/locale";

type NumericLike = number | string | { toString(): string };

export function formatCurrency(amount: NumericLike) {
  const value = typeof amount === "number" ? amount : Number(amount);
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(date: Date | string) {
  return format(new Date(date), "dd/MM/yyyy HH:mm", { locale: vi });
}
