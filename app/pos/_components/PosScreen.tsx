"use client";

import { useEffect, useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { ShoppingBagIcon } from "@heroicons/react/24/outline";
import { LoginModal } from "@/app/components/LoginModal";
import { ReceiptModal } from "@/app/components/ReceiptModal";
import { usePosStore } from "@/lib/stores/usePosStore";
import { formatIDR } from "@/lib/utils/currency";
import type { Catalog, CatalogProduct } from "@/lib/models/catalog";
import { CartPanel } from "./CartPanel";
import { HeldOrdersSheet } from "./HeldOrdersSheet";
import { PaymentSheet, type PaidOrder } from "./PaymentSheet";
import { ProductGrid } from "./ProductGrid";
import { ProductOptionsSheet, type OptionsSelection } from "./ProductOptionsSheet";
import { Sheet } from "./Sheet";

interface Cashier {
  id: string;
  name: string;
}

type SessionState = { status: "checking" } | { status: "anonymous" } | { status: "ready"; user: Cashier };
type CatalogState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; catalog: Catalog };

// Skeleton delay: a response faster than this should not flash placeholder blocks.
const SKELETON_DELAY_MS = 200;

function CatalogSkeleton() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), SKELETON_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);
  return (
    <div role="status" aria-label="Memuat menu" className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {visible && Array.from({ length: 8 }, (_, i) => <div key={i} className="h-32 animate-pulse rounded-xl bg-stone-200" />)}
    </div>
  );
}

export function PosScreen() {
  const store = usePosStore();
  const [session, setSession] = useState<SessionState>({ status: "checking" });
  const [catalogState, setCatalogState] = useState<CatalogState>({ status: "loading" });
  const [optionsFor, setOptionsFor] = useState<CatalogProduct | null>(null);
  const [paying, setPaying] = useState(false);
  const [showHeld, setShowHeld] = useState(false);
  const [showCartMobile, setShowCartMobile] = useState(false);
  const [receipt, setReceipt] = useState<Record<string, unknown> | null>(null);
  const [printSize, setPrintSize] = useState<"58" | "80" | "a4">("58");

  // The cart lives in localStorage, which does not exist during server prerender (persist is
  // undefined there). The server snapshot is false so the first client render matches the server.
  const hydrated = useSyncExternalStore(
    (onChange) => usePosStore.persist?.onFinishHydration(onChange) ?? (() => {}),
    () => usePosStore.persist?.hasHydrated() ?? false,
    () => false
  );

  const total = store.getCartTotal();

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/auth/me", { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.ok && json.success && json.user) {
          setSession({ status: "ready", user: { id: String(json.user.id), name: json.user.name } });
        } else {
          setSession({ status: "anonymous" });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setSession({ status: "anonymous" });
      });
    return () => controller.abort();
  }, []);

  // Bumping the token re-runs the fetch effect; the effect only sets state inside callbacks.
  const [catalogReload, setCatalogReload] = useState(0);
  const isReady = session.status === "ready";
  useEffect(() => {
    if (!isReady) return;
    const controller = new AbortController();
    fetch("/api/pos/catalog", { signal: controller.signal })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (res.status === 401) {
          setSession({ status: "anonymous" });
        } else if (res.ok && json.success) {
          setCatalogState({ status: "ready", catalog: json.data });
        } else {
          setCatalogState({ status: "error", message: json.error ?? "Menu tidak dapat dimuat." });
        }
      })
      .catch(() => {
        if (!controller.signal.aborted) setCatalogState({ status: "error", message: "Tidak dapat terhubung ke server." });
      });
    return () => controller.abort();
  }, [isReady, catalogReload]);

  const pickProduct = (product: CatalogProduct) => {
    if (product.variants.length === 0 && product.modifier_groups.length === 0) {
      store.addToCart({ product });
    } else {
      setOptionsFor(product);
    }
  };

  const addConfigured = (product: CatalogProduct, selection: OptionsSelection) => {
    store.addToCart({ product, ...selection });
    setOptionsFor(null);
  };

  const finishPayment = (paid: PaidOrder) => {
    if (catalogState.status !== "ready" || session.status !== "ready") return;
    const { checkout } = paid;
    // The server's figures are authoritative; the cart only supplies line descriptions.
    setReceipt({
      transaction_no: checkout.order_no,
      subtotal_amount: checkout.subtotal_amount ?? checkout.total_amount,
      discount_amount: checkout.discount_amount ?? 0,
      total_amount: checkout.total_amount,
      cash_received: paid.cashReceived,
      change_amount: checkout.change_amount,
      payment_method: paid.paymentMethod.toUpperCase(),
      order_type: paid.orderType === "takeaway" ? "TAKE_AWAY" : "DINE_IN",
      customer_name: paid.customerName,
      table_number: paid.tableNumber,
      cashier_name: session.user.name,
      items: paid.items.map((line) => ({
        menu_name: [line.name, line.variant_name].filter(Boolean).join(" "),
        quantity: line.qty,
        unit_price: line.unit_price,
        subtotal: line.subtotal,
        notes: [...line.modifiers.map((m) => m.name), line.notes].filter(Boolean).join(", "),
      })),
    });
    store.clearCart();
    setPaying(false);
    setShowCartMobile(false);
  };

  const storeConfig = useMemo(() => {
    if (catalogState.status !== "ready") return undefined;
    const s = catalogState.catalog.store;
    return {
      store_name: s.name,
      tagline: "",
      address: s.address ?? "",
      phone: s.phone ? `Telp: ${s.phone}` : "",
      receipt_footer: s.receipt_footer ?? "",
    };
  }, [catalogState]);

  if (session.status === "checking" || !hydrated) {
    return (
      <main className="flex min-h-dvh items-center justify-center" aria-busy="true">
        <p className="text-base text-ink-muted">Menyiapkan kasir...</p>
      </main>
    );
  }

  if (session.status === "anonymous") {
    return (
      <main className="min-h-dvh">
        <LoginModal
          onLoginSuccess={(user) => setSession({ status: "ready", user: { id: String(user.id), name: user.name } })}
        />
      </main>
    );
  }

  const cartPanel = (
    <CartPanel
      cart={store.cart}
      total={total}
      onQty={store.updateQty}
      onPay={() => setPaying(true)}
      onHold={() => {
        store.holdCurrentOrder();
        setShowCartMobile(false);
      }}
      onClear={store.clearCart}
    />
  );
  const itemCount = store.cart.reduce((sum, line) => sum + line.qty, 0);

  return (
    <div className="flex h-dvh flex-col bg-canvas">
      <header className="flex items-center justify-between gap-3 border-b border-stone-200 bg-surface px-4 py-2">
        <div className="flex min-w-0 items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/Logo/logo.png" alt="" className="size-10 shrink-0 rounded-full" />
          <div className="min-w-0">
            <h1 className="truncate text-base font-bold leading-tight">
              {catalogState.status === "ready" ? catalogState.catalog.store.name : "DJOE COFFEE"}
            </h1>
            <p className="truncate text-sm text-ink-muted">Kasir: {session.user.name}</p>
          </div>
        </div>
        <nav aria-label="Menu kasir" className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={() => setShowHeld(true)}
            className="h-11 rounded-lg border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            Ditahan ({store.heldOrders.length})
          </button>
          <Link
            href="/dashboard"
            className="flex h-11 items-center rounded-lg border border-stone-300 px-3 text-sm font-semibold hover:bg-stone-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
          >
            Admin
          </Link>
        </nav>
      </header>

      <div className="grid min-h-0 flex-1 md:grid-cols-[1fr_22rem] xl:grid-cols-[1fr_26rem]">
        <main className="flex min-h-0 flex-col p-3">
          {catalogState.status === "loading" && <CatalogSkeleton />}
          {catalogState.status === "error" && (
            <div role="alert" className="m-auto max-w-sm space-y-3 text-center">
              <p className="text-lg font-bold">Menu belum bisa dimuat</p>
              <p className="text-base text-ink-muted">{catalogState.message}</p>
              <button
                type="button"
                onClick={() => {
                  setCatalogState({ status: "loading" });
                  setCatalogReload((n) => n + 1);
                }}
                className="h-12 rounded-xl bg-espresso px-6 text-base font-bold text-white hover:bg-espresso-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
              >
                Coba lagi
              </button>
            </div>
          )}
          {catalogState.status === "ready" &&
            (catalogState.catalog.products.length === 0 ? (
              <div className="m-auto max-w-sm space-y-2 text-center">
                <p className="text-lg font-bold">Belum ada menu</p>
                <p className="text-base text-ink-muted">Tambahkan produk lewat halaman Admin, lalu muat ulang kasir.</p>
              </div>
            ) : (
              <ProductGrid
                categories={catalogState.catalog.categories}
                products={catalogState.catalog.products}
                selectedCategory={store.selectedCategory}
                searchQuery={store.searchQuery}
                onSelectCategory={store.setSelectedCategory}
                onSearch={store.setSearchQuery}
                onPick={pickProduct}
              />
            ))}
        </main>

        <aside className="hidden min-h-0 border-l border-stone-200 md:block">{cartPanel}</aside>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-stone-200 bg-surface p-3 md:hidden">
        <button
          type="button"
          onClick={() => setShowCartMobile(true)}
          className="flex h-14 w-full items-center justify-between rounded-xl bg-espresso px-4 text-lg font-bold text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-espresso"
        >
          <span className="flex items-center gap-2">
            <ShoppingBagIcon className="size-6" aria-hidden="true" />
            Pesanan ({itemCount})
          </span>
          <span className="tabular-nums">{formatIDR(total)}</span>
        </button>
      </div>

      <Sheet open={showCartMobile} title="Pesanan" onClose={() => setShowCartMobile(false)}>
        <div className="h-[70dvh]">{cartPanel}</div>
      </Sheet>

      <ProductOptionsSheet product={optionsFor} onClose={() => setOptionsFor(null)} onAdd={addConfigured} />

      <HeldOrdersSheet
        open={showHeld}
        heldOrders={store.heldOrders}
        cartIsEmpty={store.cart.length === 0}
        onResume={(id) => {
          store.resumeHeldOrder(id);
          setShowHeld(false);
        }}
        onDelete={store.deleteHeldOrder}
        onClose={() => setShowHeld(false)}
      />

      {catalogState.status === "ready" && (
        <PaymentSheet
          open={paying}
          storeId={catalogState.catalog.store.id}
          subtotal={total}
          onClose={() => setPaying(false)}
          onPaid={finishPayment}
          onAuthExpired={() => {
            setPaying(false);
            setSession({ status: "anonymous" });
          }}
        />
      )}

      {receipt && (
        <ReceiptModal
          receiptTx={receipt}
          storeConfig={storeConfig}
          printSize={printSize}
          setPrintSize={setPrintSize}
          onClose={() => setReceipt(null)}
        />
      )}
    </div>
  );
}
