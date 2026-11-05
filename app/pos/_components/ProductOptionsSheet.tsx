"use client";

import { useState } from "react";
import { MinusIcon, PlusIcon } from "@heroicons/react/24/outline";
import { formatIDR } from "@/lib/utils/currency";
import type { CatalogModifierGroup, CatalogProduct } from "@/lib/models/catalog";
import type { PosModifier } from "@/lib/stores/usePosStore";
import { Sheet } from "./Sheet";

export interface OptionsSelection {
  variant?: { id: number; name: string; price_adjustment: number };
  modifiers: PosModifier[];
  notes: string;
  qty: number;
}

interface ProductOptionsSheetProps {
  product: CatalogProduct | null;
  onClose: () => void;
  onAdd: (product: CatalogProduct, selection: OptionsSelection) => void;
}

const MAX_QTY = 99; // matches the checkout procedure's per-line limit

const requiredCount = (g: CatalogModifierGroup) => Math.max(g.min_selection, g.is_required ? 1 : 0);

function groupHint(g: CatalogModifierGroup) {
  const min = requiredCount(g);
  if (g.max_selection === 1) return min === 1 ? "Pilih 1" : "Opsional";
  return min > 0 ? `Pilih ${min} sampai ${g.max_selection}` : `Opsional, maksimal ${g.max_selection}`;
}

const chipClass = (selected: boolean) =>
  `min-h-12 rounded-lg border px-4 py-2 text-left text-base font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40 ${
    selected ? "border-espresso bg-espresso text-white" : "border-stone-300 bg-surface text-ink hover:bg-stone-100"
  }`;

function OptionsForm({ product, onAdd }: { product: CatalogProduct; onAdd: ProductOptionsSheetProps["onAdd"] }) {
  const [variantId, setVariantId] = useState<number | undefined>(product.variants[0]?.id);
  // Required single-choice groups start on their first option so the common order is one tap.
  const [picked, setPicked] = useState<Record<number, number[]>>(() =>
    Object.fromEntries(
      product.modifier_groups.map((g) => [
        g.id,
        g.is_required && g.max_selection === 1 && g.options[0] ? [g.options[0].id] : [],
      ])
    )
  );
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState("");

  const toggle = (group: CatalogModifierGroup, optionId: number) =>
    setPicked((current) => {
      const selected = current[group.id] ?? [];
      if (selected.includes(optionId)) return { ...current, [group.id]: selected.filter((id) => id !== optionId) };
      if (group.max_selection === 1) return { ...current, [group.id]: [optionId] };
      if (selected.length >= group.max_selection) return current;
      return { ...current, [group.id]: [...selected, optionId] };
    });

  const variant = product.variants.find((v) => v.id === variantId);
  const chosenModifiers: PosModifier[] = product.modifier_groups.flatMap((g) =>
    g.options.filter((o) => (picked[g.id] ?? []).includes(o.id)).map((o) => ({ id: o.id, name: o.name, price: o.price_adjustment }))
  );
  const unitPrice = product.base_price + (variant?.price_adjustment ?? 0) + chosenModifiers.reduce((s, m) => s + m.price, 0);

  const incomplete = product.modifier_groups.find((g) => (picked[g.id] ?? []).length < requiredCount(g));

  return (
    <form
      className="flex flex-col"
      onSubmit={(event) => {
        event.preventDefault();
        if (incomplete) return;
        onAdd(product, { variant, modifiers: chosenModifiers, notes: notes.trim(), qty });
      }}
    >
      <div className="space-y-5 px-5 py-4">
        {product.variants.length > 0 && (
          <fieldset className="space-y-2">
            <legend className="text-base font-semibold">
              Ukuran <span className="text-sm font-normal text-ink-muted">Pilih 1</span>
            </legend>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  aria-pressed={variantId === v.id}
                  onClick={() => setVariantId(v.id)}
                  className={chipClass(variantId === v.id)}
                >
                  {v.name}
                  {v.price_adjustment !== 0 && (
                    <span className="ml-2 tabular-nums opacity-80">
                      {v.price_adjustment > 0 ? "+" : "-"}
                      {formatIDR(Math.abs(v.price_adjustment))}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </fieldset>
        )}

        {product.modifier_groups.map((group) => {
          const selected = picked[group.id] ?? [];
          return (
            <fieldset key={group.id} className="space-y-2">
              <legend className="text-base font-semibold">
                {group.name} <span className="text-sm font-normal text-ink-muted">{groupHint(group)}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {group.options.map((option) => {
                  const isSelected = selected.includes(option.id);
                  const atLimit = group.max_selection > 1 && !isSelected && selected.length >= group.max_selection;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      aria-pressed={isSelected}
                      disabled={atLimit}
                      onClick={() => toggle(group, option.id)}
                      className={chipClass(isSelected)}
                    >
                      {option.name}
                      {option.price_adjustment > 0 && (
                        <span className="ml-2 tabular-nums opacity-80">+{formatIDR(option.price_adjustment)}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          );
        })}

        <label className="block space-y-2">
          <span className="text-base font-semibold">Catatan</span>
          <input
            type="text"
            value={notes}
            maxLength={255}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Misalnya: es sedikit"
            className="h-12 w-full rounded-lg border border-stone-300 px-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-espresso"
          />
        </label>
      </div>

      <div className="sticky bottom-0 space-y-2 border-t border-stone-200 bg-surface px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-base font-semibold">Jumlah</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Kurangi jumlah"
              disabled={qty <= 1}
              onClick={() => setQty((q) => q - 1)}
              className="flex size-12 items-center justify-center rounded-lg border border-stone-300 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
            >
              <MinusIcon className="size-5" aria-hidden="true" />
            </button>
            <output aria-live="polite" className="w-12 text-center text-xl font-bold tabular-nums">
              {qty}
            </output>
            <button
              type="button"
              aria-label="Tambah jumlah"
              disabled={qty >= MAX_QTY}
              onClick={() => setQty((q) => q + 1)}
              className="flex size-12 items-center justify-center rounded-lg border border-stone-300 hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
            >
              <PlusIcon className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>
        {incomplete && (
          <p role="status" className="text-sm text-ink-muted">
            Pilih {incomplete.name.toLowerCase()} dulu.
          </p>
        )}
        <button
          type="submit"
          disabled={Boolean(incomplete)}
          className="h-14 w-full rounded-xl bg-espresso text-lg font-bold text-white transition-transform duration-100 active:scale-[0.98] hover:bg-espresso-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso disabled:opacity-40"
        >
          Tambah ke pesanan, {formatIDR(unitPrice * qty)}
        </button>
      </div>
    </form>
  );
}

export function ProductOptionsSheet({ product, onClose, onAdd }: ProductOptionsSheetProps) {
  return (
    <Sheet open={product !== null} title={product?.name ?? ""} onClose={onClose}>
      {product && <OptionsForm key={product.id} product={product} onAdd={onAdd} />}
    </Sheet>
  );
}
