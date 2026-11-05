"use client";

import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { formatIDR } from "@/lib/utils/currency";
import type { CatalogCategory, CatalogProduct } from "@/lib/models/catalog";

interface ProductGridProps {
  categories: CatalogCategory[];
  products: CatalogProduct[];
  selectedCategory: number | null;
  searchQuery: string;
  onSelectCategory: (id: number | null) => void;
  onSearch: (query: string) => void;
  onPick: (product: CatalogProduct) => void;
}

const hasChoices = (p: CatalogProduct) => p.variants.length > 0 || p.modifier_groups.length > 0;

export function ProductGrid({
  categories,
  products,
  selectedCategory,
  searchQuery,
  onSelectCategory,
  onSearch,
  onPick,
}: ProductGridProps) {
  const query = searchQuery.trim().toLowerCase();
  const visible = products.filter(
    (p) =>
      (selectedCategory === null || p.category_id === selectedCategory) &&
      (query === "" || p.name.toLowerCase().includes(query))
  );

  return (
    <section aria-label="Daftar menu" className="flex min-h-0 flex-1 flex-col gap-3">
      <div className="relative">
        <MagnifyingGlassIcon
          className="pointer-events-none absolute left-3 top-1/2 size-5 -translate-y-1/2 text-ink-muted"
          aria-hidden="true"
        />
        <input
          type="search"
          value={searchQuery}
          onChange={(event) => onSearch(event.target.value)}
          placeholder="Cari menu"
          aria-label="Cari menu"
          className="h-12 w-full rounded-xl border border-stone-300 bg-surface pl-11 pr-3 text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-espresso"
        />
      </div>

      <div role="group" aria-label="Kategori" className="flex gap-2 overflow-x-auto pb-1">
        {[{ id: null, name: "Semua" }, ...categories].map((category) => {
          const active = selectedCategory === category.id;
          return (
            <button
              key={category.id ?? "all"}
              type="button"
              aria-pressed={active}
              onClick={() => onSelectCategory(category.id)}
              className={`h-11 shrink-0 rounded-lg px-4 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso ${
                active ? "bg-espresso text-white" : "border border-stone-300 bg-surface text-ink hover:bg-stone-100"
              }`}
            >
              {category.name}
            </button>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-stone-300 p-8 text-center">
          <p className="text-base font-semibold">
            {query ? `Tidak ada menu untuk "${searchQuery.trim()}"` : "Belum ada menu di kategori ini"}
          </p>
          {query && (
            <button
              type="button"
              onClick={() => onSearch("")}
              className="h-11 rounded-lg border border-stone-300 px-4 text-sm font-semibold hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
            >
              Hapus pencarian
            </button>
          )}
        </div>
      ) : (
        <ul className="grid min-h-0 flex-1 auto-rows-min grid-cols-2 gap-3 overflow-y-auto pb-24 sm:grid-cols-3 xl:grid-cols-4 md:pb-2">
          {visible.map((product) => (
            <li key={product.id}>
              <button
                type="button"
                onClick={() => onPick(product)}
                className="flex min-h-32 w-full flex-col justify-between gap-2 rounded-xl border border-stone-200 bg-surface p-3 text-left transition-transform duration-100 active:scale-[0.97] hover:border-crema focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
              >
                <span className="text-base font-semibold leading-snug">{product.name}</span>
                <span>
                  <span className="block text-lg font-bold tabular-nums">{formatIDR(product.base_price)}</span>
                  {hasChoices(product) && <span className="text-sm text-ink-muted">Ada pilihan</span>}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
