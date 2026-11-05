import { z } from "zod";
import { identifierSchema } from "@/lib/validations/identifier.schema";

export const openShiftSchema = z.object({
  store_id: identifierSchema,
  starting_cash: z.number().int().min(0, "Modal awal tidak boleh negatif"),
  notes: z.string().max(255, "Catatan maksimal 255 karakter").optional().default(""),
});

export const closeShiftSchema = z.object({
  shift_id: identifierSchema,
  actual_cash: z.number().int().min(0, "Kas fisik aktual wajib diisi"),
  notes: z.string().max(500, "Catatan maksimal 500 karakter").optional().default(""),
});

export const recordCashMovementSchema = z.object({
  shift_id: identifierSchema,
  type: z.enum(["cash_in", "cash_out"]),
  amount: z.number().int().min(1, "Nominal harus lebih dari 0"),
  reason: z.string().min(3, "Alasan mutasi kas wajib dijelaskan").max(255),
});

export type OpenShiftInput = z.infer<typeof openShiftSchema>;
export type CloseShiftInput = z.infer<typeof closeShiftSchema>;
export type RecordCashMovementInput = z.infer<typeof recordCashMovementSchema>;
