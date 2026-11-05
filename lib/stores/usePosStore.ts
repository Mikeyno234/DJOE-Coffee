import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type PosOrderType = "dine_in" | "takeaway" | "delivery";

export interface PosModifier {
  id: number;
  name: string;
  price: number;
}

// Prices here are for display only; the server reprices every line at checkout.
export interface PosCartItem {
  id: string; // cart line identifier, not a database key
  product_id: number;
  name: string;
  unit_price: number; // base price + variant adjustment + modifier adjustments
  qty: number;
  notes: string;
  variant_id?: number;
  variant_name?: string;
  modifiers: PosModifier[];
  subtotal: number;
}

export interface PosHeldOrder {
  id: string;
  timestamp: string;
  order_type: PosOrderType;
  customer_name: string;
  table_number: string;
  items: PosCartItem[];
  total_amount: number;
}

interface PosState {
  cart: PosCartItem[];
  heldOrders: PosHeldOrder[];
  orderType: PosOrderType;
  customerName: string;
  tableNumber: string;
  selectedCategory: number | null; // null means every category
  searchQuery: string;

  addToCart: (params: {
    product: { id: number; name: string; base_price: number };
    variant?: { id: number; name: string; price_adjustment: number };
    modifiers?: PosModifier[];
    notes?: string;
    qty?: number;
  }) => void;
  updateQty: (itemId: string, delta: number) => void;
  removeFromCart: (itemId: string) => void;
  clearCart: () => void;
  holdCurrentOrder: () => boolean;
  resumeHeldOrder: (heldId: string) => void;
  deleteHeldOrder: (heldId: string) => void;
  setOrderType: (type: PosOrderType) => void;
  setCustomerName: (name: string) => void;
  setTableNumber: (table: string) => void;
  setSelectedCategory: (category: number | null) => void;
  setSearchQuery: (query: string) => void;
  getCartTotal: () => number;
}

const lineFingerprint = (item: Pick<PosCartItem, "product_id" | "variant_id" | "modifiers" | "notes">) =>
  [
    item.product_id,
    item.variant_id ?? "",
    item.modifiers.map((m) => m.id).sort((a, b) => a - b).join(","),
    item.notes.trim(),
  ].join("|");

// Bump when the persisted shape changes; older carts held string ids and cost fields.
const PERSIST_VERSION = 2;

export const usePosStore = create<PosState>()(
  persist(
    (set, get) => ({
      cart: [],
      heldOrders: [],
      orderType: "dine_in",
      customerName: "",
      tableNumber: "",
      selectedCategory: null,
      searchQuery: "",

      addToCart: ({ product, variant, modifiers = [], notes = "", qty = 1 }) => {
        const unit_price =
          product.base_price + (variant?.price_adjustment ?? 0) + modifiers.reduce((sum, m) => sum + m.price, 0);

        const candidate = {
          product_id: product.id,
          variant_id: variant?.id,
          modifiers,
          notes,
        };
        const fingerprint = lineFingerprint(candidate);

        set((state) => {
          const existing = state.cart.find((line) => lineFingerprint(line) === fingerprint);
          if (existing) {
            return {
              cart: state.cart.map((line) =>
                line.id === existing.id
                  ? { ...line, qty: line.qty + qty, subtotal: (line.qty + qty) * line.unit_price }
                  : line
              ),
            };
          }
          const line: PosCartItem = {
            id: crypto.randomUUID(),
            product_id: product.id,
            name: product.name,
            unit_price,
            qty,
            notes,
            variant_id: variant?.id,
            variant_name: variant?.name,
            modifiers,
            subtotal: unit_price * qty,
          };
          return { cart: [line, ...state.cart] };
        });
      },

      updateQty: (itemId, delta) =>
        set((state) => ({
          cart: state.cart.flatMap((line) => {
            if (line.id !== itemId) return [line];
            const qty = line.qty + delta;
            return qty <= 0 ? [] : [{ ...line, qty, subtotal: qty * line.unit_price }];
          }),
        })),

      removeFromCart: (itemId) => set((state) => ({ cart: state.cart.filter((line) => line.id !== itemId) })),

      clearCart: () => set({ cart: [], customerName: "", tableNumber: "" }),

      holdCurrentOrder: () => {
        const { cart, orderType, customerName, tableNumber, heldOrders } = get();
        if (cart.length === 0) return false;
        const held: PosHeldOrder = {
          id: crypto.randomUUID(),
          timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
          order_type: orderType,
          customer_name: customerName,
          table_number: tableNumber,
          items: cart,
          total_amount: get().getCartTotal(),
        };
        set({ heldOrders: [held, ...heldOrders], cart: [], customerName: "", tableNumber: "" });
        return true;
      },

      resumeHeldOrder: (heldId) => {
        const target = get().heldOrders.find((h) => h.id === heldId);
        if (!target) return;
        set({
          cart: target.items,
          orderType: target.order_type,
          customerName: target.customer_name,
          tableNumber: target.table_number,
          heldOrders: get().heldOrders.filter((h) => h.id !== heldId),
        });
      },

      deleteHeldOrder: (heldId) => set((state) => ({ heldOrders: state.heldOrders.filter((h) => h.id !== heldId) })),

      setOrderType: (orderType) => set({ orderType }),
      setCustomerName: (customerName) => set({ customerName }),
      setTableNumber: (tableNumber) => set({ tableNumber }),
      setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
      setSearchQuery: (searchQuery) => set({ searchQuery }),

      getCartTotal: () => get().cart.reduce((sum, line) => sum + line.subtotal, 0),
    }),
    {
      name: "djoe_coffee_pos_state",
      version: PERSIST_VERSION,
      // Old carts reference menu ids from the retired catalog; they cannot be priced, so drop them.
      migrate: () => ({ cart: [], heldOrders: [], orderType: "dine_in", customerName: "", tableNumber: "" }),
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        cart: state.cart,
        heldOrders: state.heldOrders,
        orderType: state.orderType,
        customerName: state.customerName,
        tableNumber: state.tableNumber,
      }),
    }
  )
);
