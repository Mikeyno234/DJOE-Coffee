import { db } from "@/lib/db/client";
import { Menu } from "@/lib/models/menu";

export class PosService {
  private static getNextSequenceNumber(): string {
    const count = db.transactions.orders.length + 1;
    const padded = String(count).padStart(4, "0");
    return `TRX-KOP_${padded}`;
  }

  static checkout(payload: {
    items: { menu_id: string; quantity: number; name?: string; menu_name?: string; hpp?: number; unit_hpp?: number; price?: number; unit_price?: number }[];
    cash_received: number;
    user_id?: string;
    cashier_name?: string;
  }) {
    if (!payload.items || payload.items.length === 0) {
      return { success: false, error: "Keranjang belanja kosong" };
    }

    let total = 0;
    const txItems: any[] = [];

    for (const item of payload.items) {
      let menu = db.master.menus.find((m: Menu) => m.id === item.menu_id);
      
      const menuName = menu?.name || item.name || item.menu_name || "Produk Kopi";
      const hppVal = menu?.hpp || item.hpp || item.unit_hpp || 0;
      const priceVal = menu?.selling_price || item.price || item.unit_price || 0;

      const subtotal = priceVal * item.quantity;
      total += subtotal;
      txItems.push({
        id: `txi-${Date.now()}-${Math.random()}`,
        menu_id: item.menu_id,
        menu_name: menuName,
        unit_hpp: hppVal,
        unit_price: priceVal,
        quantity: item.quantity,
        subtotal,
      });
    }

    if (payload.cash_received < total) {
      return { success: false, error: "Uang diterima kurang dari total belanja" };
    }

    const change_amount = payload.cash_received - total;
    const transaction_no = this.getNextSequenceNumber();

    const transaction = {
      id: `tx-${Date.now()}`,
      transaction_no,
      total_amount: total,
      cash_received: payload.cash_received,
      change_amount,
      payment_method: "CASH",
      user_id: payload.user_id,
      cashier_name: payload.cashier_name || "Kasir Kedai",
      items: txItems,
      created_at: new Date(),
    };

    db.transactions.orders.unshift(transaction as any);
    return { success: true, transaction };
  }
}
