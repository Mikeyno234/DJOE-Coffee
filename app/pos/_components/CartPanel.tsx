"use client";

import { useEffect, useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatIDR } from "@/lib/utils/currency";
import type { PosCartItem } from "@/lib/stores/usePosStore";

interface CartPanelProps {
  cart: PosCartItem[];
  total: number;
  onQty: (lineId: string, delta: number) => void;
  onPay: () => void;
  onHold: () => void;
  onClear: () => void;
}

// A slip should not empty a full cart, but a modal for it would slow the common path.
// Two taps within this window confirm instead.
const CLEAR_CONFIRM_WINDOW_MS = 3_000;

const stepperButton =
  "flex size-12 items-center justify-center rounded-lg border border-stone-300 bg-surface hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso active:scale-95 transition-transform duration-100";

const lineDetail = (line: PosCartItem) =>
  [line.variant_name, ...line.modifiers.map((m) => m.name), line.notes].filter(Boolean).join(", ");

export function CartPanel({ cart, total, onQty, onPay, onHold, onClear }: CartPanelProps) {
  const [confirmingClear, setConfirmingClear] = useState(false);

  useEffect(() => {
    if (!confirmingClear) return;
    const timer = setTimeout(() => setConfirmingClear(false), CLEAR_CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [confirmingClear]);

  const itemCount = cart.reduce((sum, line) => sum + line.qty, 0);

  return (
    <section aria-label="Pesanan" className="flex h-full min-h-0 flex-col bg-surface">
      <header className="flex items-baseline justify-between border-b border-stone-200 px-4 py-3">
        <h2 className="text-lg font-bold">Pesanan</h2>
        <span className="text-sm text-ink-muted tabular-nums">{itemCount} item</span>
      </header>

      {cart.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-1 p-6 text-center">
          <p className="text-base font-semibold">Belum ada pesanan</p>
          <p className="text-sm text-ink-muted">Ketuk menu di sebelah kiri untuk menambahkan.</p>
        </div>
      ) : (
        <ul className="flex-1 divide-y divide-stone-200 overflow-y-auto">
          {cart.map((line) => (
            <li key={line.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold leading-snug">{line.name}</p>
                {lineDetail(line) && <p className="text-sm text-ink-muted">{lineDetail(line)}</p>}
                <p className="text-sm tabular-nums text-ink-muted">{formatIDR(line.unit_price)}</p>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  aria-label={`Kurangi ${line.name}`}
                  onClick={() => onQty(line.id, -1)}
                  className={stepperButton}
                >
                  <MinusIcon className="size-5" aria-hidden="true" />
                </button>
                <output aria-label={`Jumlah ${line.name}`} className="w-9 text-center text-lg font-bold tabular-nums">
                  {line.qty}
                </output>
                <button
                  type="button"
                  aria-label={`Tambah ${line.name}`}
                  onClick={() => onQty(line.id, 1)}
                  className={stepperButton}
                >
                  <PlusIcon className="size-5" aria-hidden="true" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <footer className="space-y-3 border-t border-stone-200 p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-base font-semibold">Total</span>
          <span className="text-3xl font-extrabold tracking-tight tabular-nums" aria-live="polite">
            {formatIDR(total)}
          </span>
        </div>
        <button
          type="button"
          disabled={cart.length === 0}
          onClick={onPay}
          className="h-14 w-full rounded-xl bg-espresso text-lg font-bold text-white transition-transform duration-100 active:scale-[0.98] hover:bg-espresso-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
        >
          {cart.length === 0 ? "Pilih menu dulu" : `Bayar ${formatIDR(total)}`}
        </button>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={onHold}
            className="h-12 rounded-lg border border-stone-300 bg-surface text-base font-semibold hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
          >
            Tahan pesanan
          </button>
          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => {
              if (confirmingClear) {
                setConfirmingClear(false);
                onClear();
              } else {
                setConfirmingClear(true);
              }
            }}
            className={`h-12 rounded-lg border text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40 ${
              confirmingClear
                ? "border-red-700 bg-red-700 text-white"
                : "border-stone-300 bg-surface hover:bg-stone-100"
            }`}
          >
            {confirmingClear ? "Ketuk lagi untuk kosongkan" : "Kosongkan"}
          </button>
        </div>
      </footer>
    </section>
  );
}
