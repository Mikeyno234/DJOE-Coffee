"use client";

import React from "react";
import { formatIDR } from "@/lib/utils/currency";
import {
  Square3Stack3DIcon,
  CalculatorIcon,
  BanknotesIcon,
  ChartPieIcon,
  SparklesIcon,
  BookOpenIcon,
  DocumentChartBarIcon,
  ArrowTrendingUpIcon,
  FireIcon,
} from "@heroicons/react/24/solid";

interface DashboardViewProps {
  analytics: any;
  menusCount: number;
  onPrintCatalogue?: () => void;
  onPrintHppReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  menusCount,
  onPrintCatalogue,
  onPrintHppReport,
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
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Total Menu Aktif</p>
            <span className="p-2 rounded-xl bg-amber-100/80 text-[#543A14]">
              <Square3Stack3DIcon className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#543A14] mt-2">{analytics?.total_menu || menusCount || 0}</h3>
          <p className="text-xs text-[#543A14] mt-2 font-bold flex items-center gap-1">
            <span>✓ Siap Dijual di Kasir</span>
          </p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Rata-rata HPP</p>
            <span className="p-2 rounded-xl bg-amber-50 text-amber-900">
              <CalculatorIcon className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#543A14] mt-2">{formatIDR(analytics?.avg_hpp || 0)}</h3>
          <p className="text-xs text-stone-500 mt-2 font-medium">Modal Dasar per Porsi</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Rata-rata Harga Jual</p>
            <span className="p-2 rounded-xl bg-amber-100/80 text-[#543A14]">
              <BanknotesIcon className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#543A14] mt-2">{formatIDR(analytics?.avg_selling_price || 0)}</h3>
          <p className="text-xs text-amber-900 mt-2 font-bold">Rounding Rp 1.000</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-extrabold text-stone-400 uppercase tracking-wider">Rata-rata Margin Profit</p>
            <span className="p-2 rounded-xl bg-amber-200/80 text-[#543A14]">
              <ChartPieIcon className="w-5 h-5" />
            </span>
          </div>
          <h3 className="text-3xl font-black text-[#543A14] mt-2">{analytics?.avg_margin || 0}%</h3>
          <p className="text-xs text-[#543A14] mt-2 font-bold">Profitability Sehat</p>
        </div>
      </div>

      {/* Analytics Visual Charts Section (Zero Bloat Pure SVG / CSS Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Daily Omset & Profit Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#543A14] flex items-center gap-2">
              <ArrowTrendingUpIcon className="w-5 h-5 text-[#543A14]" />
              <span>Grafik Tren Penjualan & Profit Harian</span>
            </h3>
            <div className="flex items-center gap-3 text-xs font-bold">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#543A14]"></span> Omset
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 rounded-full bg-[#F0BB78]"></span> Profit
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-400 font-medium">Perbandingan Omset Kotor vs Keuntungan Bersih</p>

          <div className="h-48 flex items-end justify-around gap-2 pt-6 pb-2 border-b border-stone-100">
            {salesTrend.length === 0 ? (
              <div className="w-full text-center text-xs text-stone-400 py-16">Belum ada data transaksi harian</div>
            ) : (
              salesTrend.map((day: any, idx: number) => {
                const maxVal = Math.max(...salesTrend.map((d: any) => d.revenue || 1));
                const omsetHeight = Math.round(((day.revenue || 0) / maxVal) * 100);
                const profitHeight = Math.round(((day.profit || 0) / maxVal) * 100);
                return (
                  <div key={idx} className="flex flex-col items-center flex-1 group relative">
                    <div className="flex items-end gap-1 h-36">
                      <div
                        style={{ height: `${Math.max(8, omsetHeight)}%` }}
                        className="w-full max-w-[18px] bg-[#543A14] rounded-t-lg group-hover:bg-[#3d2a0e] transition-all duration-300 relative"
                      ></div>
                      <div
                        style={{ height: `${Math.max(8, profitHeight)}%` }}
                        className="w-full max-w-[18px] bg-[#F0BB78] rounded-t-lg group-hover:bg-[#e2a862] transition-all duration-300 relative"
                      ></div>
                    </div>
                    <span className="text-[10px] text-stone-500 font-bold mt-2 truncate max-w-[50px]">{day.day || day.date_label}</span>
                  </div>
                );
              })
            )}
          </div>

        </div>

        {/* Chart 2: Top Profit Margin Leaderboard */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-extrabold text-sm text-[#543A14] flex items-center gap-2">
              <FireIcon className="w-5 h-5 text-amber-600" />
              <span>Top Menu Margin Profit</span>
            </h3>
            <p className="text-[11px] text-stone-400 font-medium">Persentase keuntungan tertinggi per porsi</p>
          </div>

          <div className="space-y-3.5">
            {topPerformers.map((menu: any, idx: number) => {
              const maxMargin = 300;
              const barWidth = Math.min(100, Math.round((menu.margin / maxMargin) * 100));
              return (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-extrabold">
                    <span className="text-stone-800 truncate">{menu.name}</span>
                    <span className="text-[#543A14]">+{menu.margin}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-stone-100 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${barWidth}%` }}
                      className="bg-gradient-to-r from-[#543A14] to-[#F0BB78] rounded-full transition-all duration-500"
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-400 font-semibold">
                    <span>HPP: {formatIDR(menu.hpp)}</span>
                    <span>Jual: {formatIDR(menu.price)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

