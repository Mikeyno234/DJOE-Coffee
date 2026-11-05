"use client";

import React, { useState } from "react";
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
  const [localStartDate, setLocalStartDate] = useState(startDate);
  const [localEndDate, setLocalEndDate] = useState(endDate);

  const salesTrend = analytics?.daily_recap || [];
  const topPerformers = analytics?.top_menus || [];
  const maxRevenue = Math.max(...salesTrend.map((d: any) => d.revenue || 0), 100000);

  const presets = [
    { label: "Hari Ini", val: "today" },
    { label: "7 Hari", val: "7d" },
    { label: "30 Hari", val: "30d" },
    { label: "Bulan Ini", val: "this_month" },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Date Filter & Preset Controls */}
      <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-100 pb-3">
          <div>
            <h2 className="text-base font-black text-[#1A120B]">Filter Rentang Waktu</h2>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              Pantau tren omset kotor, modal COGS, dan laba bersih kasir
            </p>
          </div>

          {/* Quick Range Presets */}
          <div className="flex items-center gap-1.5 bg-stone-100 p-1 rounded-xl text-xs font-bold">
            {presets.map((p) => (
              <button
                key={p.val}
                onClick={() => onRangeChange && onRangeChange(p.val)}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  selectedRange === p.val
                    ? "bg-[#1A120B] text-white shadow-xs"
                    : "text-stone-600 hover:text-stone-900"
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Start & End Date Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 items-end pt-1">
          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Dari Tanggal (Mulai)</label>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1A120B] outline-none cursor-pointer bg-stone-50/50 hover:bg-white transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1">Sampai Tanggal (Selesai)</label>
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
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1A120B] outline-none cursor-pointer bg-stone-50/50 hover:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Omset Penjualan Kotor</p>
            <h3 className="text-2xl font-black text-[#1A120B] mt-2 tabular-nums">
              {formatIDR(analytics?.total_gross_revenue || 0)}
            </h3>
          </div>
          <p className="text-xs text-stone-500 font-semibold mt-3">Transaksi tercatat</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Total COGS (Modal Terjual)</p>
            <h3 className="text-2xl font-black text-stone-800 mt-2 tabular-nums">
              {formatIDR(analytics?.total_cogs || 0)}
            </h3>
          </div>
          <p className="text-xs text-stone-400 font-medium mt-3">Biaya bahan baku & overhead</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Laba Bersih (Net Profit)</p>
            <h3 className="text-2xl font-black text-emerald-700 mt-2 tabular-nums">
              {formatIDR(analytics?.total_net_profit || 0)}
            </h3>
          </div>
          <p className="text-xs text-emerald-700 font-semibold mt-3">Omset dikurangi COGS</p>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-stone-200/70 shadow-xs flex flex-col justify-between">
          <div>
            <p className="text-xs font-bold text-stone-500 uppercase tracking-wider">Rata-rata Margin Profit</p>
            <h3 className="text-2xl font-black text-[#1A120B] mt-2 tabular-nums">{analytics?.avg_margin || 0}%</h3>
          </div>
          <p className="text-xs text-stone-500 font-medium mt-3">{menusCount} menu terdaftar</p>
        </div>
      </div>

      {/* Analytics Visual Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Profit Trend Bar Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-stone-200/70 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
            <h3 className="font-black text-sm text-[#1A120B]">Grafik Tren Penjualan & Profit Harian</h3>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#1A120B]"></span> Omset
              </span>
              <span className="flex items-center gap-1.5 text-stone-700">
                <span className="w-2.5 h-2.5 rounded-full bg-[#C89B3C]"></span> Profit
              </span>
            </div>
          </div>
          <p className="text-xs text-stone-500 font-medium">Perbandingan Omset Kotor vs Keuntungan Bersih</p>

          <div className="overflow-x-auto pb-2 -mx-2 px-2 scrollbar-thin">
            <div className="h-56 min-w-[480px] flex items-end justify-between gap-2 sm:gap-4 pt-8 pb-2 border-b border-stone-100">
              {salesTrend.length === 0 ? (
                <div className="w-full h-full flex items-center justify-center text-xs text-stone-400 font-semibold">
                  Belum ada data penjualan pada rentang waktu ini
                </div>
              ) : (
                salesTrend.map((d: any, idx: number) => {
                  const revHeight = d.revenue > 0 ? Math.max((d.revenue / maxRevenue) * 100, 6) : 0;
                  const profHeight = d.profit > 0 ? Math.max((d.profit / maxRevenue) * 100, 6) : 0;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 group relative min-w-[36px]">
                      <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-40">
                        {/* Bar 1: Omset */}
                        <div
                          style={{ height: `${revHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-[#1A120B] rounded-t-md transition-all duration-200 hover:bg-[#2A1D13] relative group/bar cursor-pointer"
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                            <div className="bg-[#1A120B] text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-xl shadow-xl whitespace-nowrap border border-stone-700 text-center">
                              <p className="text-[#C89B3C] font-bold text-[9px] mb-0.5">{d.day} (Omset)</p>
                              <p className="font-bold text-white tabular-nums">{formatIDR(d.revenue)}</p>
                            </div>
                            <div className="w-2 h-2 bg-[#1A120B] rotate-45 -mt-1"></div>
                          </div>
                        </div>

                        {/* Bar 2: Profit */}
                        <div
                          style={{ height: `${profHeight}%` }}
                          className="w-2.5 sm:w-3.5 bg-[#C89B3C] rounded-t-md transition-all duration-200 hover:bg-[#B78A2E] relative group/bar cursor-pointer"
                        >
                          <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none transition-all duration-200">
                            <div className="bg-[#1A120B] text-white text-[10px] font-semibold py-1.5 px-2.5 rounded-xl shadow-xl whitespace-nowrap border border-stone-700 text-center">
                              <p className="text-stone-300 font-bold text-[9px] mb-0.5">{d.day} (Profit)</p>
                              <p className="font-bold text-emerald-400 tabular-nums">{formatIDR(d.profit)}</p>
                            </div>
                            <div className="w-2 h-2 bg-[#1A120B] rotate-45 -mt-1"></div>
                          </div>
                        </div>
                      </div>

                      <span className="text-[9px] sm:text-[10px] font-bold text-stone-600 truncate max-w-full text-center">
                        {d.day}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Top 5 High Margin Menu Performers */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200/70 shadow-xs space-y-4">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-black text-sm text-[#1A120B]">Top Menu Margin Profit</h3>
            <p className="text-xs text-stone-500 mt-0.5 font-medium">Persentase keuntungan tertinggi per porsi</p>
          </div>

          <div className="space-y-3.5">
            {topPerformers.length === 0 ? (
              <p className="text-xs text-stone-400 text-center py-8 font-medium">Belum ada data performa menu</p>
            ) : (
              topPerformers.map((item: any, idx: number) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-stone-900 truncate max-w-[170px]">{item.name}</span>
                    <span className="text-emerald-700 font-bold tabular-nums">+{item.margin}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${Math.min(item.margin / 3, 100)}%` }}
                      className="h-full bg-[#1A120B] rounded-full"
                    ></div>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-stone-500 font-medium tabular-nums">
                    <span>HPP: {formatIDR(item.hpp)}</span>
                    <span>Jual: {formatIDR(item.price)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
