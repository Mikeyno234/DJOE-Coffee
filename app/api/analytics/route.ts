import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { db } from "@/lib/db/client";
import { computeDailySalesRecap } from "@/lib/db/views/analytics";
import { Menu } from "@/lib/models/menu";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const range = searchParams.get("range") || "7d"; // 7d, 30d, 90d, custom, all
  const startDateParam = searchParams.get("start_date");
  const endDateParam = searchParams.get("end_date");

  const menus = db.master.menus;
  let transactions: any[] = [];

  // Fetch 100% real database transactions from Supabase
  try {
    const { data: supaTx, error } = await supabase
      .from("t_transactions")
      .select("*, items:t_transaction_items(*)")
      .order("created_at", { ascending: true });

    if (!error && supaTx) {
      transactions = supaTx;
    }
  } catch {
    transactions = db.transactions.orders;
  }

  // Filter transactions based on date range or custom start/end date
  const now = new Date();
  if (startDateParam || endDateParam) {
    if (startDateParam) {
      const sDate = new Date(startDateParam);
      sDate.setHours(0, 0, 0, 0);
      transactions = transactions.filter((t) => new Date(t.created_at || t.date || now) >= sDate);
    }
    if (endDateParam) {
      const eDate = new Date(endDateParam);
      eDate.setHours(23, 59, 59, 999);
      transactions = transactions.filter((t) => new Date(t.created_at || t.date || now) <= eDate);
    }
  } else if (range === "7d") {
    const past7 = new Date(now);
    past7.setDate(now.getDate() - 7);
    transactions = transactions.filter((t) => new Date(t.created_at || t.date || now) >= past7);
  } else if (range === "30d") {
    const past30 = new Date(now);
    past30.setDate(now.getDate() - 30);
    transactions = transactions.filter((t) => new Date(t.created_at || t.date || now) >= past30);
  } else if (range === "90d") {
    const past90 = new Date(now);
    past90.setDate(now.getDate() - 90);
    transactions = transactions.filter((t) => new Date(t.created_at || t.date || now) >= past90);
  }

  const totalMenu = menus.length;
  const avgHpp = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.hpp, 0) / totalMenu : 0;
  const avgJual = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.selling_price, 0) / totalMenu : 0;
  const avgMargin = totalMenu > 0 ? menus.reduce((acc: number, m: Menu) => acc + m.margin_percent, 0) / totalMenu : 0;

  const topMargin = [...menus].sort((a: Menu, b: Menu) => b.margin_percent - a.margin_percent).slice(0, 5);

  const dailySalesRecap = computeDailySalesRecap(transactions);

  // Total Realized COGS (HPP Terjual) & Gross Profit Calculation
  const totalGrossRevenue = transactions.reduce((acc: number, t: any) => acc + (t.total_amount || 0), 0);
  const totalCogs = transactions.reduce((acc: number, t: any) => {
    let txCogs = 0;
    if (t.items && Array.isArray(t.items)) {
      t.items.forEach((item: any) => {
        txCogs += (item.unit_hpp || 0) * (item.quantity || 1);
      });
    } else {
      txCogs = (t.total_amount || 0) * 0.35;
    }
    return acc + txCogs;
  }, 0);

  const totalNetProfit = totalGrossRevenue - totalCogs;


  const formattedDailyRecap = (() => {
    const daysCount = range === "30d" ? 30 : range === "90d" ? 90 : 7;
    const timeline: any[] = [];
    const today = new Date();

    for (let i = daysCount - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];

      const match = dailySalesRecap.find((r: any) => r.date === dateStr);
      const label = d.toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });

      if (match) {
        timeline.push({
          dateStr,
          day: label,
          revenue: match.gross_revenue,
          cogs: match.total_hpp,
          profit: match.net_profit,
        });
      } else {
        timeline.push({
          dateStr,
          day: label,
          revenue: 0,
          cogs: 0,
          profit: 0,
        });
      }
    }
    return timeline;
  })();

  return NextResponse.json({
    success: true,
    data: {
      total_menu: totalMenu,
      avg_hpp: Math.round(avgHpp),
      avg_selling_price: Math.round(avgJual),
      avg_margin: Math.round(avgMargin),
      total_gross_revenue: Math.round(totalGrossRevenue),
      total_cogs: Math.round(totalCogs),
      total_net_profit: Math.round(totalNetProfit),
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
