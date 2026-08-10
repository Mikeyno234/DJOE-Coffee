import { NextResponse } from "next/server";
import { db } from "@/lib/db/client";
import { computeDailySalesRecap } from "@/lib/db/views/analytics";
import { Menu } from "@/lib/models/menu";

export async function GET() {
  const menus = db.master.menus;
  const transactions = db.transactions.orders;

  const totalMenu = menus.length;
  const avgHpp = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.hpp, 0) / totalMenu : 0;
  const avgJual = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.selling_price, 0) / totalMenu : 0;
  const avgMargin = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.margin_percent, 0) / totalMenu : 0;

  const topMargin = [...menus].sort((a: Menu, b: Menu) => b.margin_percent - a.margin_percent).slice(0, 5);

  const dailySalesRecap = computeDailySalesRecap(transactions);

  const formattedDailyRecap = dailySalesRecap.length > 0
    ? dailySalesRecap.map((r: any) => ({
        day: new Date(r.date).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" }),
        revenue: r.gross_revenue,
        profit: r.net_profit,
      }))
    : [
        { day: "Hari Ini", revenue: transactions.reduce((acc: number, t: any) => acc + (t.total_amount || 0), 0), profit: transactions.reduce((acc: number, t: any) => acc + (t.total_amount || 0) * 0.6, 0) }
      ];

  return NextResponse.json({
    success: true,
    data: {
      total_menu: totalMenu,
      avg_hpp: Math.round(avgHpp),
      avg_selling_price: Math.round(avgJual),
      avg_margin: Math.round(avgMargin),
      top_menus: topMargin.map((m: Menu) => ({
        name: m.name,
        hpp: m.hpp,
        price: m.selling_price,
        margin: m.margin_percent,
      })),
      daily_recap: formattedDailyRecap,
    },
  });
}
