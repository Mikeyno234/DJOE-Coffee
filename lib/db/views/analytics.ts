import { Menu } from "@/lib/models/menu";

export interface MenuHppSummaryView {
  id: string;
  name: string;
  category_name: string;
  hpp: number;
  selling_price: number;
  margin_percent: number;
}

export interface DailySalesRecapView {
  date: string;
  total_transactions: number;
  gross_revenue: number;
  total_hpp: number;
  net_profit: number;
}

export function computeMenuHppViews(menus: Menu[]): MenuHppSummaryView[] {
  return menus.map((m) => ({
    id: m.id,
    name: m.name,
    category_name: m.category_name || "Uncategorized",
    hpp: m.hpp,
    selling_price: m.selling_price,
    margin_percent: m.margin_percent,
  }));
}

export function computeDailySalesRecap(transactions: any[]): DailySalesRecapView[] {
  const recapMap: Record<string, DailySalesRecapView> = {};

  transactions.forEach((tx) => {
    const dateStr = new Date(tx.created_at).toISOString().split("T")[0];
    if (!recapMap[dateStr]) {
      recapMap[dateStr] = {
        date: dateStr,
        total_transactions: 0,
        gross_revenue: 0,
        total_hpp: 0,
        net_profit: 0,
      };
    }

    recapMap[dateStr].total_transactions += 1;
    recapMap[dateStr].gross_revenue += tx.total_amount || 0;

    let hppSum = 0;
    if (tx.items) {
      tx.items.forEach((item: any) => {
        hppSum += (item.unit_hpp || 0) * (item.quantity || 1);
      });
    }

    recapMap[dateStr].total_hpp += hppSum;
    recapMap[dateStr].net_profit += tx.total_amount - hppSum;
  });

  return Object.values(recapMap);
}
