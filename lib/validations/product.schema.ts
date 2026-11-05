import { z } from "zod";
import { identifierSchema } from "@/lib/validations/identifier.schema";

export const categorySchema = z.object({
  id: identifierSchema.optional(),
  store_id: identifierSchema,
  name: z.string().min(1, "Nama kategori wajib diisi").max(100),
  icon: z.string().max(30).optional().default("cube"),
  sort_order: z.number().int().default(0),
});

export const productVariantSchema = z.object({
  id: identifierSchema.optional(),
  name: z.string().min(1, "Nama varian wajib diisi").max(100),
  price_adjustment: z.number().int().default(0),
  hpp_adjustment: z.number().int().default(0),
  is_active: z.boolean().default(true),
});

export const modifierOptionSchema = z.object({
  id: identifierSchema.optional(),
  name: z.string().min(1, "Nama opsi modifier wajib diisi").max(100),
  price_adjustment: z.number().int().default(0),
  hpp_adjustment: z.number().int().default(0),
});

export const modifierGroupSchema = z.object({
  id: identifierSchema.optional(),
  store_id: identifierSchema,
  name: z.string().min(1, "Nama kelompok modifier wajib diisi").max(100),
  is_required: z.boolean().default(false),
  min_selection: z.number().int().min(0).default(0),
  max_selection: z.number().int().min(1).default(1),
  options: z.array(modifierOptionSchema).optional().default([]),
});

export const createProductSchema = z.object({
  store_id: identifierSchema,
  category_id: identifierSchema.optional().nullable(),
  name: z.string().min(2, "Nama produk minimal 2 karakter").max(150),
  description: z.string().max(500).optional().default(""),
  image_url: z.string().url("Format URL gambar tidak valid").or(z.string().startsWith("/")).optional().nullable(),
  base_price: z.number().int().min(0, "Harga jual dasar tidak boleh negatif"),
  base_hpp: z.number().int().min(0, "Harga pokok modal tidak boleh negatif"),
  is_active: z.boolean().default(true),
  variants: z.array(productVariantSchema).optional().default([]),
  modifier_group_ids: z.array(identifierSchema).optional().default([]),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type CategoryInput = z.infer<typeof categorySchema>;
export type ModifierGroupInput = z.infer<typeof modifierGroupSchema>;
