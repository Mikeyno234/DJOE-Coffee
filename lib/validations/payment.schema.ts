import { z } from "zod";
import { identifierSchema } from "@/lib/validations/identifier.schema";

export const paymentMethodSchema = z.enum(["cash", "qris", "debit"]);
export const paymentStatusSchema = z.enum([
  "pending",
  "succeeded",
  "failed",
  "expired",
  "cancelled",
  "refunded",
]);

export const cashPaymentSchema = z.object({
  order_id: identifierSchema,
  cash_received: z.number().int().min(1, "Nominal uang diterima harus lebih dari 0"),
});

export const qrisInitSchema = z.object({
  order_id: identifierSchema,
  idempotency_key: z.string().min(10, "Idempotency key wajib diisi").max(100),
});

export const paymentWebhookPayloadSchema = z.object({
  order_id: z.string(),
  transaction_status: z.string(),
  gross_amount: z.string(),
  signature_key: z.string(),
  payment_type: z.string().optional(),
  transaction_time: z.string().optional(),
});

export type CashPaymentInput = z.infer<typeof cashPaymentSchema>;
export type QrisInitInput = z.infer<typeof qrisInitSchema>;
export type PaymentWebhookPayload = z.infer<typeof paymentWebhookPayloadSchema>;
