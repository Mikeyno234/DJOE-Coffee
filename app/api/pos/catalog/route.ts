import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/db/supabaseClient";
import { requireAuth } from "@/lib/utils/authGuard";
import type { Catalog, CatalogProduct } from "@/lib/models/catalog";

// A catalog read that outlasts this is more likely a stalled connection than a slow query.
const CATALOG_TIMEOUT_MS = 8_000;

interface ProductRow {
  id: number;
  category_id: number | null;
  name: string;
  description: string | null;
  image_url: string | null;
  base_price: number;
  product_variants: { id: number; name: string; price_adjustment: number; is_active: boolean }[];
  product_modifier_groups: {
    modifier_groups: {
      id: number;
      name: string;
      is_required: boolean;
      min_selection: number;
      max_selection: number;
      modifier_options: { id: number; name: string; price_adjustment: number }[];
    } | null;
  }[];
}

function toCatalogProduct(row: ProductRow): CatalogProduct {
  return {
    id: row.id,
    category_id: row.category_id,
    name: row.name,
    description: row.description,
    image_url: row.image_url,
    base_price: row.base_price,
    variants: row.product_variants
      .filter((v) => v.is_active)
      .map(({ id, name, price_adjustment }) => ({ id, name, price_adjustment })),
    modifier_groups: row.product_modifier_groups.flatMap(({ modifier_groups: g }) =>
      g
        ? [
            {
              id: g.id,
              name: g.name,
              is_required: g.is_required,
              min_selection: g.min_selection,
              max_selection: g.max_selection,
              options: g.modifier_options,
            },
          ]
        : []
    ),
  };
}

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const db = getSupabaseAdmin();
    const signal = AbortSignal.timeout(CATALOG_TIMEOUT_MS);

    // One cafe, one store: the lowest id is the store until user-to-store mapping exists.
    const { data: store, error: storeError } = await db
      .from("stores")
      .select("id,name,address,phone,receipt_footer")
      .order("id")
      .limit(1)
      .abortSignal(signal)
      .maybeSingle();
    if (storeError) throw storeError;
    if (!store) {
      return NextResponse.json(
        { success: false, error: "Toko belum dibuat di database.", code: "STORE_NOT_FOUND" },
        { status: 404 }
      );
    }

    const [categories, products] = await Promise.all([
      db.from("categories").select("id,name,sort_order").eq("store_id", store.id).order("sort_order").abortSignal(signal),
      db
        .from("products")
        .select(
          "id,category_id,name,description,image_url,base_price," +
            "product_variants(id,name,price_adjustment,is_active)," +
            "product_modifier_groups(modifier_groups(id,name,is_required,min_selection,max_selection,modifier_options(id,name,price_adjustment)))"
        )
        .eq("store_id", store.id)
        .eq("is_active", true)
        .order("name")
        .abortSignal(signal)
        .overrideTypes<ProductRow[], { merge: false }>(),
    ]);
    if (categories.error) throw categories.error;
    if (products.error) throw products.error;

    const catalog: Catalog = {
      store,
      categories: categories.data ?? [],
      products: (products.data ?? []).map(toCatalogProduct),
    };
    return NextResponse.json({ success: true, data: catalog });
  } catch (err) {
    console.error("[catalog] read failed", { user: auth.user.id, err });
    return NextResponse.json(
      { success: false, error: "Menu tidak dapat dimuat dari database.", code: "CATALOG_UNAVAILABLE" },
      { status: 503 }
    );
  }
}
