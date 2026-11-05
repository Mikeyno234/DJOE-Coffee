"use client";

import { formatIDR } from "@/lib/utils/currency";
import type { PosHeldOrder } from "@/lib/stores/usePosStore";
import { Sheet } from "./Sheet";

interface HeldOrdersSheetProps {
  open: boolean;
  heldOrders: PosHeldOrder[];
  /** Resuming replaces the cart, so it is only allowed while the cart is empty. */
  cartIsEmpty: boolean;
  onResume: (id: string) => void;
  onDelete: (id: string) => void;
  onClose: () => void;
}

const buttonClass =
  "h-12 rounded-lg border px-4 text-base font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40";

export function HeldOrdersSheet({ open, heldOrders, cartIsEmpty, onResume, onDelete, onClose }: HeldOrdersSheetProps) {
  return (
    <Sheet open={open} title="Pesanan ditahan" onClose={onClose}>
      {heldOrders.length === 0 ? (
        <p className="px-5 py-8 text-center text-base text-ink-muted">Tidak ada pesanan yang ditahan.</p>
      ) : (
        <>
          {!cartIsEmpty && (
            <p role="status" className="border-b border-stone-200 bg-crema-light px-5 py-3 text-sm">
              Tahan atau kosongkan pesanan yang sedang dibuat sebelum melanjutkan pesanan lain.
            </p>
          )}
          <ul className="divide-y divide-stone-200">
            {heldOrders.map((held) => {
              const itemCount = held.items.reduce((sum, line) => sum + line.qty, 0);
              const label = held.customer_name || (held.table_number ? `Meja ${held.table_number}` : "Tanpa nama");
              return (
                <li key={held.id} className="flex items-center justify-between gap-3 px-5 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-base font-semibold">{label}</p>
                    <p className="text-sm text-ink-muted tabular-nums">
                      {held.timestamp}, {itemCount} item, {formatIDR(held.total_amount)}
                    </p>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button
                      type="button"
                      disabled={!cartIsEmpty}
                      onClick={() => onResume(held.id)}
                      className={`${buttonClass} border-espresso bg-espresso text-white hover:bg-espresso-hover`}
                    >
                      Lanjutkan
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(held.id)}
                      aria-label={`Hapus pesanan ${label}`}
                      className={`${buttonClass} border-stone-300 bg-surface hover:bg-stone-100`}
                    >
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </>
      )}
    </Sheet>
  );
}
