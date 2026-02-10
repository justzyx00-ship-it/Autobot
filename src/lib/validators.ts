import { TopupMethod } from "@prisma/client";
import { z } from "zod";
import { TOPUP_MIN_AMOUNT } from "@/lib/constants";

export const registerSchema = z.object({
  email: z.string().email().toLowerCase(),
  username: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[a-zA-Z0-9_.]+$/),
  fullName: z.string().trim().min(2).max(80),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  identifier: z.string().trim().min(3).max(100),
  password: z.string().min(8).max(128),
});

export const createOrderSchema = z.object({
  productId: z.string().trim().min(10).max(40),
});

export const payOrderSchema = z.object({
  orderId: z.string().trim().min(10).max(40),
});

export const createTopupSchema = z.object({
  method: z.nativeEnum(TopupMethod),
  amount: z.coerce.number().int().min(TOPUP_MIN_AMOUNT).max(50000000),
  provider: z.string().trim().max(30).optional().or(z.literal("")),
  note: z.string().trim().max(200).optional().or(z.literal("")),
});

export const updateProfileSchema = z.object({
  fullName: z.string().trim().min(2).max(80),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8).max(128),
  newPassword: z.string().min(8).max(128),
});

export const updateThemeSchema = z.object({
  theme: z.enum(["light", "dark"]),
});

export const supportTicketSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email(),
  subject: z.string().trim().min(3).max(120),
  message: z.string().trim().min(10).max(2000),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(3).max(120),
  slug: z
    .string()
    .trim()
    .min(3)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  category: z.string().trim().min(2).max(80),
  duration: z.string().trim().min(2).max(40),
  price: z.coerce.number().positive().max(100000000),
  shortDescription: z.string().trim().min(5).max(180),
  description: z.string().trim().min(10).max(500),
  icon: z.string().trim().min(1).max(10),
  isHot: z.enum(["on"]).optional(),
  autoDelivery: z.enum(["on"]).optional(),
  deliveryTemplate: z.string().trim().max(500).optional().or(z.literal("")),
});

export const toggleProductSchema = z.object({
  productId: z.string().trim().min(10).max(40),
});

export const updateOrderStatusSchema = z.object({
  orderId: z.string().trim().min(10).max(40),
  deliveryData: z.string().trim().min(10).max(2000),
});

export const processTopupSchema = z.object({
  topupId: z.string().trim().min(10).max(40),
  action: z.enum(["approve", "reject"]),
});
