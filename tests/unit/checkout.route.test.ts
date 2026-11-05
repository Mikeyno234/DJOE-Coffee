import { describe, it, expect, vi, beforeEach } from "vitest";
import { AuthService } from "@/lib/services/auth.service";

const rpc = vi.fn();
vi.mock("@/lib/db/supabaseClient", () => ({
  getSupabaseAdmin: () => ({
    rpc: (...args: unknown[]) => ({
      abortSignal: () => rpc(...args),
    }),
  }),
}));

import { POST } from "@/app/api/checkout/route";

const STORE_ID = 2;
const PRODUCT_ID = 1;

function token() {
  return AuthService.signToken({ id: "1", email: "k@x.id", role: "CASHIER" as never, name: "Kasir" });
}

function makeRequest(opts: { body?: unknown; key?: string | null; auth?: boolean } = {}) {
  const headers: Record<string, string> = { "content-type": "application/json" };
  if (opts.auth !== false) headers.authorization = `Bearer ${token()}`;
  if (opts.key !== null) headers["idempotency-key"] = opts.key ?? "key-12345678";
  return new Request("http://test/api/checkout", {
    method: "POST",
    headers,
    body: JSON.stringify(
      opts.body ?? {
        store_id: STORE_ID,
        order_type: "dine_in",
        items: [{ product_id: PRODUCT_ID, quantity: 2 }],
        payment: { method: "cash", cash_received: 50000 },
      }
    ),
  });
}

describe("POST /api/checkout", () => {
  beforeEach(() => {
    rpc.mockReset();
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("rejects unauthenticated callers before touching the database", async () => {
    const res = await POST(makeRequest({ auth: false }));
    expect(res.status).toBe(401);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("requires an Idempotency-Key", async () => {
    const res = await POST(makeRequest({ key: null }));
    expect(res.status).toBe(400);
    expect(rpc).not.toHaveBeenCalled();
  });

  it("rejects an invalid body with field details", async () => {
    const res = await POST(makeRequest({ body: { store_id: "x", items: [] } }));
    expect(res.status).toBe(422);
    expect((await res.json()).code).toBe("VALIDATION_FAILED");
  });

  it("never forwards client-supplied prices to the database", async () => {
    rpc.mockResolvedValue({ data: { order_no: "TRX-1" }, error: null });
    await POST(
      makeRequest({
        body: {
          store_id: STORE_ID,
          items: [{ product_id: PRODUCT_ID, quantity: 1, unit_price: 1, price: 1 }],
          payment: { method: "cash", cash_received: 1 },
        },
      })
    );
    const params = rpc.mock.calls[0][1] as { p_items: Record<string, unknown>[] };
    const forwarded = Object.keys(params.p_items[0]);
    expect(forwarded).not.toContain("unit_price");
    expect(forwarded).not.toContain("price");
    expect(forwarded).toEqual(expect.arrayContaining(["product_id", "quantity"]));
  });

  it("returns the RPC result on success", async () => {
    rpc.mockResolvedValue({ data: { order_no: "TRX-20261105-0001", total_amount: 30000 }, error: null });
    const res = await POST(makeRequest());
    expect(res.status).toBe(200);
    expect((await res.json()).data.total_amount).toBe(30000);
  });

  it("surfaces business rule errors as 422 and never fabricates a success", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "P0001", message: "Uang tunai kurang dari total belanja" } });
    const res = await POST(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(422);
    expect(json.success).toBe(false);
    expect(json.error).toContain("Uang tunai kurang");
  });

  it("hides internal database errors behind a generic 502", async () => {
    rpc.mockResolvedValue({ data: null, error: { code: "42P01", message: 'relation "orders" does not exist' } });
    const res = await POST(makeRequest());
    const json = await res.json();
    expect(res.status).toBe(502);
    expect(JSON.stringify(json)).not.toContain("relation");
  });

  it("reports an unreachable database as 503 instead of falling back to memory", async () => {
    rpc.mockRejectedValue(new Error("network down"));
    const res = await POST(makeRequest());
    expect(res.status).toBe(503);
    expect((await res.json()).success).toBe(false);
  });

  it("forwards a QRIS payment with its reference and no cash amount", async () => {
    rpc.mockResolvedValue({ data: { order_no: "TRX-1", payment_status: "succeeded" }, error: null });
    const res = await POST(
      makeRequest({
        body: {
          store_id: STORE_ID,
          items: [{ product_id: PRODUCT_ID, quantity: 1 }],
          payment: { method: "qris", reference: "  4821  " },
        },
      })
    );
    expect(res.status).toBe(200);
    const params = rpc.mock.calls[0][1] as Record<string, unknown>;
    expect(params.p_payment_method).toBe("qris");
    expect(params.p_payment_reference).toBe("4821");
    expect(params.p_cash_received).toBe(0);
  });

  it("rejects an unknown payment method and an oversized reference", async () => {
    const unknownMethod = await POST(
      makeRequest({
        body: { store_id: STORE_ID, items: [{ product_id: PRODUCT_ID, quantity: 1 }], payment: { method: "crypto" } },
      })
    );
    expect(unknownMethod.status).toBe(422);

    const longReference = await POST(
      makeRequest({
        body: {
          store_id: STORE_ID,
          items: [{ product_id: PRODUCT_ID, quantity: 1 }],
          payment: { method: "debit", reference: "x".repeat(51) },
        },
      })
    );
    expect(longReference.status).toBe(422);
    expect(rpc).not.toHaveBeenCalled();
  });
});
