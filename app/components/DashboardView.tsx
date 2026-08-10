"use client";

import React from "react";
import { formatIDR } from "@/lib/utils/currency";

interface DashboardViewProps {
  analytics: any;
  menusCount: number;
  onPrintCatalogue?: () => void;
  onPrintHppReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  menusCount,
}) => {
  // Sample analytics sales trend data
  const salesTrend = analytics?.daily_recap || [
    { day: "Senin", revenue: 450000, profit: 290000 },
    { day: "Selasa", revenue: 620000, profit: 410000 },
    { day: "Rabu", revenue: 580000, profit: 380000 },
    { day: "Kamis", revenue: 750000, profit: 490000 },
    { day: "Jumat", revenue: 980000, profit: 640000 },
    { day: "Sabtu", revenue: 1450000, profit: 950000 },
    { day: "Minggu", revenue: 1680000, profit: 1100000 },
  ];

  const topPerformers = analytics?.top_menus || [
    { name: "Americano", hpp: 4200, price: 15000, margin: 257.1 },
    { name: "Kopi Susu Gula Aren", hpp: 6800, price: 20000, margin: 194.1 },
    { name: "Matcha Latte", hpp: 7500, price: 22000, margin: 193.3 },
    { name: "Croissant Butter", hpp: 8000, price: 23000, margin: 187.5 },
  ];

  const maxRevenue = Math.max(...salesTrend.map((d: any) => d.revenue), 100000);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards (Clean Human-Designed SaaS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Total Menu Aktif</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">{analytics?.total_menu || menusCount || 0}</h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">✓ Siap Dijual di Kasir</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rata-rata HPP</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">{formatIDR(analytics?.avg_hpp || 0)}</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-3">Modal Dasar per Porsi</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rata-rata Harga Jual</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">{formatIDR(analytics?.avg_selling_price || 0)}</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-3">Rounding Rp 1.000</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rata-rata Margin Profit</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">{analytics?.avg_margin || 0}%</h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">Profitability Sehat</p>
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Daily Omset & Profit Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900">Grafik Tren Penjualan & Profit Harian</h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#543A14]"></span> Omset
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#c9a87c]"></span> Profit
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-500 font-medium">Perbandingan Omset Kotor vs Keuntungan Bersih</p>

          <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2">
            {salesTrend.map((d: any, idx: number) => {
              const revHeight = (d.revenue / maxRevenue) * 100;
              const profHeight = (d.profit / maxRevenue) * 100;

              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="w-full flex items-end justify-center gap-1 h-36">
                    <div
                      style={{ height: `${revHeight}%` }}
                      className="w-2.5 bg-[#543A14] rounded-t-sm transition-all duration-300 group-hover:opacity-90"
                    ></div>
                    <div
                      style={{ height: `${profHeight}%` }}
                      className="w-2.5 bg-[#c9a87c] rounded-t-sm transition-all duration-300 group-hover:opacity-90"
                    ></div>
                  </div>
                  <span className="text-[10px] font-semibold text-stone-600 truncate max-w-full">{d.day}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 5 High Margin Menu Performers */}
        <div className="bg-white p-6 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-bold text-sm text-stone-900">Top Menu Margin Profit</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Persentase keuntungan tertinggi per porsi</p>
          </div>

          <div className="space-y-3.5">
            {topPerformers.map((item: any, idx: number) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between items-center text-xs font-semibold">
                  <span className="text-stone-900">{item.name}</span>
                  <span className="text-emerald-700 font-bold">+{item.margin}%</span>
                </div>
                <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${Math.min(item.margin / 3, 100)}%` }}
                    className="h-full bg-[#543A14] rounded-full"
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium">
                  <span>HPP: {formatIDR(item.hpp)}</span>
                  <span>Jual: {formatIDR(item.price)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
