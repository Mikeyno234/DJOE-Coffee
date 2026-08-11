"use client";

import React from "react";
import { formatIDR } from "@/lib/utils/currency";

interface DashboardViewProps {
  analytics: any;
  menusCount: number;
  selectedRange?: string;
  startDate?: string;
  endDate?: string;
  onCustomFilterChange?: (startDate: string, endDate: string) => void;
  onRangeChange?: (range: string) => void;
  onPrintCatalogue?: () => void;
  onPrintHppReport?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  analytics,
  menusCount,
  selectedRange = "7d",
  startDate = "",
  endDate = "",
  onCustomFilterChange,
  onRangeChange,
}) => {
  const [localStartDate, setLocalStartDate] = React.useState(startDate);
  const [localEndDate, setLocalEndDate] = React.useState(endDate);

  const salesTrend = analytics?.daily_recap || [];

  const topPerformers = analytics?.top_menus || [];

  const maxRevenue = Math.max(...salesTrend.map((d: any) => d.revenue), 100000);

  return (
    <div className="space-y-6 animate-fade-in">
      {/*Custom Date Range Filter Box */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-base font-bold text-stone-900">Filter</h2>
            <p className="text-xs text-stone-500 font-medium">

            </p>
          </div>

          {/* Quick Preset Buttons */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl border border-stone-200 text-xs font-semibold">
          </div>
        </div>

        {/* Custom Start & End Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Dari Tanggal (Start Date)</label>
            <input
              type="date"
              value={localStartDate}
              onChange={(e) => {
                const val = e.target.value;
                setLocalStartDate(val);
                if (onCustomFilterChange) {
                  onCustomFilterChange(val, localEndDate);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none cursor-pointer bg-stone-50/50 hover:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">Sampai Tanggal (End Date)</label>
            <input
              type="date"
              value={localEndDate}
              onChange={(e) => {
                const val = e.target.value;
                setLocalEndDate(val);
                if (onCustomFilterChange) {
                  onCustomFilterChange(localStartDate, val);
                }
              }}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none cursor-pointer bg-stone-50/50 hover:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards  */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Omset Penjualan Kotor</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">
              {formatIDR(analytics?.total_gross_revenue || 0)}
            </h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">✓ Real-time dari Kasir</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider">Total COGS (HPP Terjual)</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">
              {formatIDR(analytics?.total_cogs || 0)}
            </h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-3">Modal Produk Terpakai</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Laba Bersih (Net Profit)</p>
            <h3 className="text-2xl font-bold text-emerald-700 mt-2">
              {formatIDR(analytics?.total_net_profit || 0)}
            </h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">✓ Omset - COGS Terjual</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-stone-500 uppercase tracking-wider">Rata-rata Margin Profit</p>
            <h3 className="text-2xl font-bold text-stone-900 mt-2">{analytics?.avg_margin || 0}%</h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">Rata-Rata Margin Katalog</p>
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

          {/* Responsive Scroll Container for Mobile/Tablet */}
          <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            <div className="h-56 min-w-[500px] flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-stone-100">
              {salesTrend.map((d: any, idx: number) => {
                const revHeight = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 6) : 0;
                const profHeight = d.profit > 0 ? Math.max((d.profit / maxRevenue) * 100, 6) : 0;

                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative min-w-[40px]">
                    {/* Chart Bars */}
                    <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-40">
                      {/* Bar 1: Omset Kotor */}
                      <div
                        style={{ height: `${revHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-[#543A14] rounded-t-md transition-all duration-200 hover:bg-[#3d2a0e] hover:scale-y-105 relative group/bar cursor-pointer"
                      >
                        {/* Individual Tooltip for Omset Bar */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                          <div className="bg-[#1a0f07] text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-amber-500/20 text-center">
                            <p className="text-[#F0BB78] font-bold text-[9px] mb-0.5">{d.day} (Omset)</p>
                            <p className="font-extrabold text-white">{formatIDR(d.revenue)}</p>
                          </div>
                          <div className="w-2 h-2 bg-[#1a0f07] rotate-45 -mt-1"></div>
                        </div>
                      </div>

                      {/* Bar 2: Profit Bersih */}
                      <div
                        style={{ height: `${profHeight}%` }}
                        className="w-2.5 sm:w-3.5 bg-[#F0BB78] rounded-t-md transition-all duration-200 hover:bg-[#d9a25f] hover:scale-y-105 relative group/bar cursor-pointer"
                      >
                        {/* Individual Tooltip for Profit Bar */}
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                          <div className="bg-[#1a0f07] text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-lg shadow-xl whitespace-nowrap border border-amber-500/20 text-center">
                            <p className="text-amber-200 font-bold text-[9px] mb-0.5">{d.day} (Profit)</p>
                            <p className="font-extrabold text-emerald-400">{formatIDR(d.profit)}</p>
                          </div>
                          <div className="w-2 h-2 bg-[#1a0f07] rotate-45 -mt-1"></div>
                        </div>
                      </div>
                    </div>

                    {/* Date Label */}
                    <span className="text-[9px] sm:text-[10px] font-bold text-stone-600 truncate max-w-full text-center">
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>
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
