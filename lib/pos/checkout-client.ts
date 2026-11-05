import type { PosCartItem } from "@/lib/stores/usePosStore";

export type OrderType = "dine_in" | "takeaway" | "delivery";
export type PaymentMethod = "cash" | "qris" | "debit";

export interface CheckoutRequest {
  storeId: number;
  orderType: OrderType;
  customerName: string;
  tableNumber: string;
  discountAmount: number;
  paymentMethod: PaymentMethod;
  cashReceived: number; // ignored by the server for non-cash methods
  paymentReference: string;
  items: PosCartItem[];
}

export interface CheckoutData {
  order_id: number;
  order_no: string;
  subtotal_amount?: number;
  discount_amount?: number;
  total_amount: number;
  change_amount: number;
  payment_status: string;
  replayed: boolean;
}

// kind drives the screen: "auth" re-opens login, "uncertain" locks the form so the retry
// reuses the same order, "rule" and "server" are rolled back and safe to edit and resend.
export type CheckoutResult =
  | { ok: true; data: CheckoutData }
  | { ok: false; kind: "auth" | "rule" | "validation" | "server" | "uncertain"; message: string };

// Longer than the server's 8s cut so the server's own answer arrives first.
const CLIENT_TIMEOUT_MS = 10_000;

export async function submitCheckout(req: CheckoutRequest, idempotencyKey: string): Promise<CheckoutResult> {
  let res: Response;
  try {
    res = await fetch("/api/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idempotencyKey },
      signal: AbortSignal.timeout(CLIENT_TIMEOUT_MS),
      body: JSON.stringify({
        store_id: req.storeId,
        order_type: req.orderType,
        customer_name: req.customerName,
        table_number: req.tableNumber,
        discount_amount: req.discountAmount,
        items: req.items.map((i) => ({
          product_id: i.product_id,
          variant_id: i.variant_id ?? null,
          quantity: i.qty,
          notes: i.notes,
          modifiers: i.modifiers.map((m) => m.id),
        })),
        payment: { method: req.paymentMethod, cash_received: req.cashReceived, reference: req.paymentReference },
      }),
    });
  } catch {
    return {
      ok: false,
      kind: "uncertain",
      message:
        "Koneksi terputus, status transaksi belum pasti. Tekan Coba lagi tanpa mengubah data; sistem tidak akan membuat pesanan ganda.",
    };
  }

  let json: { success?: boolean; data?: CheckoutData; error?: string; code?: string } = {};
  try {
    json = await res.json();
  } catch {
    // Non-JSON body (proxy error page); handled by status below.
  }

  if (res.ok && json.success && json.data) return { ok: true, data: json.data };
  if (res.status === 401) {
    return { ok: false, kind: "auth", message: "Sesi berakhir. Masuk kembali, pesanan di keranjang tetap tersimpan." };
  }
  if (res.status === 422) {
    return {
      ok: false,
      kind: json.code === "VALIDATION_FAILED" ? "validation" : "rule",
      message: json.error ?? "Pesanan ditolak.",
    };
  }
  if (res.status === 503) {
    return {
      ok: false,
      kind: "uncertain",
      message: json.error ?? "Status transaksi belum pasti. Tekan Coba lagi tanpa mengubah data.",
    };
  }
  return { ok: false, kind: "server", message: json.error ?? "Transaksi gagal disimpan. Silakan coba lagi." };
}
