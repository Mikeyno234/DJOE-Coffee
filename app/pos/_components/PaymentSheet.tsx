"use client";

import { useRef, useState } from "react";
import { formatCurrencyNumber, formatIDR, parseCurrencyNumber } from "@/lib/utils/currency";
import {
  submitCheckout,
  type CheckoutData,
  type CheckoutResult,
  type OrderType,
  type PaymentMethod,
} from "@/lib/pos/checkout-client";
import { usePosStore, type PosCartItem } from "@/lib/stores/usePosStore";
import { Sheet } from "./Sheet";

export interface PaidOrder {
  checkout: CheckoutData;
  items: PosCartItem[];
  orderType: OrderType;
  customerName: string;
  tableNumber: string;
  paymentMethod: PaymentMethod;
  cashReceived: number; // equals the total for non-cash methods, so the receipt balances
}

interface PaymentSheetProps {
  open: boolean;
  storeId: number;
  subtotal: number;
  onClose: () => void;
  onPaid: (order: PaidOrder) => void;
  onAuthExpired: () => void;
}

const ORDER_TYPES: { value: OrderType; label: string }[] = [
  { value: "dine_in", label: "Makan di tempat" },
  { value: "takeaway", label: "Bawa pulang" },
  { value: "delivery", label: "Antar" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cash", label: "Tunai" },
  { value: "qris", label: "QRIS" },
  { value: "debit", label: "Debit" },
];

// Rupiah banknote steps in circulation; rounding the total up to each gives the
// bills a customer is most likely to hand over.
const BANKNOTE_STEPS = [10_000, 50_000, 100_000];
const DISCOUNT_SHORTCUT_PERCENTS = [5, 10];

const ceilTo = (value: number, step: number) => Math.ceil(value / step) * step;

function cashSuggestions(total: number): number[] {
  return [...new Set(BANKNOTE_STEPS.map((step) => ceilTo(total, step)))].filter((v) => v > total).slice(0, 3);
}

const fieldClass =
  "h-12 w-full rounded-lg border border-stone-300 bg-surface px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-espresso disabled:bg-stone-100";
const quickButton =
  "h-12 rounded-lg border border-stone-300 bg-surface px-4 text-base font-semibold tabular-nums hover:bg-stone-100 active:scale-[0.97] transition-transform duration-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40";

function PaymentForm({
  storeId,
  subtotal,
  onPaid,
  onAuthExpired,
  setBusy,
}: Omit<PaymentSheetProps, "open" | "onClose"> & { setBusy: (busy: boolean) => void }) {
  const { cart, orderType, customerName, tableNumber, setOrderType, setCustomerName, setTableNumber } = usePosStore();

  // One key per opening of the sheet: a retry after a lost response replays the same order
  // on the server instead of creating a second one (RFC 9110 section 9.2.2).
  const idempotencyKey = useRef(crypto.randomUUID());

  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [reference, setReference] = useState("");
  const [cashInput, setCashInput] = useState("");
  const [discountInput, setDiscountInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Extract<CheckoutResult, { ok: false }> | null>(null);

  const discount = parseCurrencyNumber(discountInput);
  const cash = parseCurrencyNumber(cashInput);
  const discountInvalid = discount >= subtotal;
  const total = subtotal - (discountInvalid ? 0 : discount);
  const shortfall = total - cash;
  const isCash = method === "cash";
  const canPay = !discountInvalid && total > 0 && (!isCash || cash >= total);

  // After a lost response the order may already exist; changing any field would make the
  // retry replay an order that no longer matches what is on screen.
  const locked = submitting || failure?.kind === "uncertain";

  const pay = async () => {
    if (!canPay || submitting) return;
    setSubmitting(true);
    setBusy(true);
    setFailure(null);
    const result = await submitCheckout(
      {
        storeId,
        orderType,
        customerName: customerName.trim(),
        tableNumber: tableNumber.trim(),
        discountAmount: discount,
        paymentMethod: method,
        cashReceived: isCash ? cash : 0,
        paymentReference: isCash ? "" : reference.trim(),
        items: cart,
      },
      idempotencyKey.current
    );
    setSubmitting(false);
    setBusy(false);
    if (result.ok) {
      onPaid({
        checkout: result.data,
        items: cart,
        orderType,
        customerName: customerName.trim(),
        tableNumber: tableNumber.trim(),
        paymentMethod: method,
        cashReceived: isCash ? cash : result.data.total_amount,
      });
    } else if (result.kind === "auth") {
      onAuthExpired();
    } else {
      setFailure(result);
    }
  };

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        void pay();
      }}
    >
      <div className="space-y-5 px-5 py-4">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">Total bayar</span>
          <span className="text-4xl font-extrabold tracking-tight tabular-nums">{formatIDR(total)}</span>
        </div>

        <fieldset className="space-y-2" disabled={locked}>
          <legend className="text-base font-semibold">Jenis pesanan</legend>
          <div className="grid grid-cols-3 gap-2">
            {ORDER_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                aria-pressed={orderType === type.value}
                onClick={() => setOrderType(type.value)}
                className={`min-h-12 rounded-lg border px-2 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-60 ${
                  orderType === type.value ? "border-espresso bg-espresso text-white" : "border-stone-300 bg-surface hover:bg-stone-100"
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2" disabled={locked}>
          <legend className="text-base font-semibold">Metode pembayaran</legend>
          <div className="grid grid-cols-3 gap-2">
            {PAYMENT_METHODS.map((option) => (
              <button
                key={option.value}
                type="button"
                aria-pressed={method === option.value}
                onClick={() => setMethod(option.value)}
                className={`h-12 rounded-lg border text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-60 ${
                  method === option.value ? "border-espresso bg-espresso text-white" : "border-stone-300 bg-surface hover:bg-stone-100"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </fieldset>

        {isCash ? (
        <fieldset className="space-y-2" disabled={locked}>
          <legend className="text-base font-semibold">Tunai diterima</legend>
          <input
            inputMode="numeric"
            autoComplete="off"
            aria-label="Uang tunai diterima"
            placeholder="Rp 0"
            value={cashInput ? `Rp ${formatCurrencyNumber(cashInput)}` : ""}
            onChange={(event) => setCashInput(event.target.value)}
            className={`${fieldClass} text-xl font-bold tabular-nums`}
          />
          <div className="flex flex-wrap gap-2">
            <button type="button" className={quickButton} onClick={() => setCashInput(String(total))}>
              Uang pas
            </button>
            {cashSuggestions(total).map((amount) => (
              <button key={amount} type="button" className={quickButton} onClick={() => setCashInput(String(amount))}>
                {formatIDR(amount)}
              </button>
            ))}
          </div>
          <p role="status" className="min-h-6 text-base font-semibold tabular-nums">
            {cashInput === "" ? "" : shortfall > 0 ? `Kurang ${formatIDR(shortfall)}` : `Kembalian ${formatIDR(-shortfall)}`}
          </p>
        </fieldset>
        ) : (
          <fieldset className="space-y-2" disabled={locked}>
            <legend className="text-base font-semibold">Konfirmasi pembayaran</legend>
            <p className="text-base">
              Lihat bukti {method === "qris" ? "transfer QRIS di ponsel pelanggan" : "persetujuan di mesin EDC"} dan pastikan
              jumlahnya {formatIDR(total)} sebelum menekan tombol di bawah.
            </p>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Nomor referensi (opsional)</span>
              <input
                className={fieldClass}
                maxLength={50}
                autoComplete="off"
                value={reference}
                onChange={(event) => setReference(event.target.value)}
                placeholder="Mis. 4 digit akhir atau kode persetujuan"
              />
            </label>
          </fieldset>
        )}

        <details className="rounded-lg border border-stone-200">
          <summary className="flex min-h-12 cursor-pointer items-center px-3 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso">
            Meja, nama, dan diskon
          </summary>
          <fieldset className="space-y-3 border-t border-stone-200 p-3" disabled={locked}>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Nomor meja</span>
              <input className={fieldClass} maxLength={30} value={tableNumber} onChange={(e) => setTableNumber(e.target.value)} />
            </label>
            <label className="block space-y-1">
              <span className="text-sm font-semibold">Nama pelanggan</span>
              <input className={fieldClass} maxLength={100} value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
            </label>
            <div className="space-y-1">
              <label htmlFor="discount" className="text-sm font-semibold">
                Diskon (Rupiah)
              </label>
              <input
                id="discount"
                inputMode="numeric"
                autoComplete="off"
                className={`${fieldClass} tabular-nums`}
                value={discountInput ? `Rp ${formatCurrencyNumber(discountInput)}` : ""}
                onChange={(e) => setDiscountInput(e.target.value)}
                aria-invalid={discountInvalid}
                aria-describedby={discountInvalid ? "discount-error" : undefined}
              />
              {discountInvalid && (
                <p id="discount-error" className="text-sm font-semibold text-red-700">
                  Diskon harus lebih kecil dari subtotal {formatIDR(subtotal)}.
                </p>
              )}
              <div className="flex gap-2 pt-1">
                {DISCOUNT_SHORTCUT_PERCENTS.map((percent) => (
                  <button
                    key={percent}
                    type="button"
                    className={quickButton}
                    onClick={() => setDiscountInput(String(Math.round((subtotal * percent) / 100)))}
                  >
                    {percent}%
                  </button>
                ))}
                <button type="button" className={quickButton} onClick={() => setDiscountInput("")}>
                  Tanpa diskon
                </button>
              </div>
            </div>
          </fieldset>
        </details>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-stone-200 bg-surface px-5 py-3">
        {failure && (
          <p role="alert" className="rounded-lg border border-red-700 bg-red-50 px-3 py-2 text-base text-red-900">
            {failure.message}
          </p>
        )}
        <button
          type="submit"
          disabled={!canPay || submitting}
          aria-busy={submitting}
          className="h-14 w-full rounded-xl bg-espresso text-lg font-bold text-white transition-transform duration-100 active:scale-[0.98] hover:bg-espresso-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
        >
          {submitting
            ? "Memproses..."
            : failure
              ? `Coba lagi, ${formatIDR(total)}`
              : isCash
                ? `Selesaikan, ${formatIDR(total)}`
                : `Sudah dibayar lewat ${method === "qris" ? "QRIS" : "debit"}, ${formatIDR(total)}`}
        </button>
      </div>
    </form>
  );
}

export function PaymentSheet({ open, onClose, ...formProps }: PaymentSheetProps) {
  const [busy, setBusy] = useState(false);
  return (
    <Sheet open={open} title="Pembayaran" onClose={onClose} locked={busy}>
      <PaymentForm {...formProps} setBusy={setBusy} />
    </Sheet>
  );
}
