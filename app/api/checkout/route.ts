import { NextResponse } from "next/server";
import { createOrderSchema } from "@/lib/validations/order.schema";
import { getSupabaseAdmin } from "@/lib/db/supabaseClient";
import { requireAuth } from "@/lib/utils/authGuard";

// Cashier patience bound: beyond ~8s the cashier retries by hand, so the
// request is cut here and the retry reuses the same Idempotency-Key.
const CHECKOUT_TIMEOUT_MS = 8_000;

// SQLSTATE raised by process_pos_checkout for business-rule violations whose
// message is written for the cashier and is safe to show.
const BUSINESS_RULE_SQLSTATE = "P0001";

function failure(status: number, error: string, code: string, details?: unknown) {
  return NextResponse.json({ success: false, error, code, details }, { status });
}

export async function POST(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  const idempotencyKey = request.headers.get("idempotency-key");
  if (!idempotencyKey || idempotencyKey.length < 8 || idempotencyKey.length > 100) {
    return failure(400, "Header Idempotency-Key wajib diisi (8-100 karakter).", "IDEMPOTENCY_KEY_REQUIRED");
  }

  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return failure(400, "Body permintaan bukan JSON yang valid.", "INVALID_JSON");
  }

  const parsed = createOrderSchema.safeParse(rawBody);
  if (!parsed.success) {
    return failure(
      422,
      "Validasi data pesanan gagal.",
      "VALIDATION_FAILED",
      parsed.error.issues.map((i) => ({ field: i.path.join("."), message: i.message }))
    );
  }
  const order = parsed.data;

  try {
    const { data, error } = await getSupabaseAdmin()
      .rpc("process_pos_checkout", {
        p_store_id: order.store_id,
        p_shift_id: order.shift_id ?? null,
        // created_by references profiles(id); sessions still come from the
        // legacy user table, so the cashier is not attributed until auth moves
        // to Supabase Auth.
        p_cashier_id: null,
        p_order_type: order.order_type,
        p_customer_name: order.customer_name || "Pelanggan",
        p_table_number: order.table_number,
        p_payment_method: order.payment.method,
        p_cash_received: order.payment.cash_received,
        p_payment_reference: order.payment.reference,
        p_discount_amount: order.discount_amount,
        p_idempotency_key: idempotencyKey,
        p_items: order.items,
      })
      .abortSignal(AbortSignal.timeout(CHECKOUT_TIMEOUT_MS));

    if (error) {
      if (error.code === BUSINESS_RULE_SQLSTATE) {
        return failure(422, error.message, "BUSINESS_RULE_VIOLATION");
      }
      console.error("[checkout] rpc failed", { code: error.code, message: error.message, user: auth.user.id });
      return failure(502, "Transaksi gagal disimpan. Tidak ada pesanan yang dibuat, silakan coba lagi.", "STORAGE_FAILURE");
    }

    return NextResponse.json({ success: true, data });
  } catch (err) {
    console.error("[checkout] unexpected failure", { user: auth.user.id, err });
    return failure(503, "Status transaksi belum pasti karena koneksi terputus. Coba lagi; kunci idempotensi mencegah pesanan ganda.", "UPSTREAM_UNAVAILABLE");
  }
}
