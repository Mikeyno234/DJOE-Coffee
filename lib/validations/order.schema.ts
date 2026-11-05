import { z } from "zod";
import { identifierSchema } from "@/lib/validations/identifier.schema";

export const orderTypeSchema = z.enum(["dine_in", "takeaway", "delivery"]);

export const orderItemModifierInputSchema = identifierSchema;

export const orderItemInputSchema = z.object({
  product_id: identifierSchema,
  variant_id: identifierSchema.optional().nullable(),
  quantity: z.number().int().min(1, "Minimal 1 porsi"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional().default(""),
  modifiers: z
    .array(orderItemModifierInputSchema)
    .max(20, "Terlalu banyak modifier")
    .refine((ids) => new Set(ids).size === ids.length, "Modifier tidak boleh duplikat")
    .optional()
    .default([]),
});

export const createOrderSchema = z.object({
  store_id: identifierSchema,
  shift_id: identifierSchema.optional().nullable(),
  order_type: orderTypeSchema.default("dine_in"),
  customer_name: z.string().max(100).optional().default(""),
  table_number: z.string().max(30).optional().default(""),
  discount_amount: z.number().int().min(0, "Diskon tidak boleh negatif").optional().default(0),
  items: z.array(orderItemInputSchema).min(1, "Keranjang pesanan tidak boleh kosong"),
  payment: z.object({
    method: z.enum(["cash", "qris", "debit"]),
    cash_received: z.number().int().min(0, "Uang diterima tidak boleh negatif").optional().default(0),
    // Free text proof (last digits, EDC approval code) for QRIS and debit confirmed by the cashier.
    reference: z.string().trim().max(50, "Referensi maksimal 50 karakter").optional().default(""),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type OrderItemInput = z.infer<typeof orderItemInputSchema>;
