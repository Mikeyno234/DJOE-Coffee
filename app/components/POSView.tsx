"use client";

import React, { useState } from "react";
import { formatIDR, formatCurrencyNumber, parseCurrencyNumber } from "@/lib/utils/currency";

import {
  ShoppingBagIcon,
  MagnifyingGlassIcon,
  PlusIcon,
  MinusIcon,
  TrashIcon,
  BanknotesIcon,
  PrinterIcon,
  SparklesIcon,
  CheckCircleIcon,
  TagIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";


interface POSViewProps {
  menus: any[];
  categories: string[];
  selectedCat: string;
  setSelectedCat: (cat: string) => void;
  cart: { id: string; name: string; price: number; hpp: number; qty: number }[];
  addToCart: (menu: any) => void;
  updateCartQty: (id: string, delta: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cashInput: string;
  setCashInput: (val: string) => void;
  cashNum: number;
  changeNum: number;
  handleCheckout: () => void;
}

export const POSView: React.FC<POSViewProps> = ({
  menus,
  categories,
  selectedCat,
  setSelectedCat,
  cart,
  addToCart,
  updateCartQty,
  clearCart,
  cartTotal,
  cashInput,
  setCashInput,
  cashNum,
  changeNum,
  handleCheckout,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredMenus = menus.filter((m) => {
    const matchesCat =
      selectedCat === "Semua" ? true : m.category === selectedCat || m.category_name === selectedCat;
    const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
      {/* Menu Grid & Search Section */}
      <div className="lg:col-span-2 space-y-4">
        {/* Top Controls: Search Input & Clean Category Tabs */}
        <div className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-xs space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu kopi, makanan, atau snack..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all placeholder:text-stone-400"
            />
          </div>

          <div className="flex space-x-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all duration-150 cursor-pointer ${
                  selectedCat === cat
                    ? "bg-[#543A14] text-[#F0BB78] shadow-2xs"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid (Clean Square/Lightspeed POS Style) */}
        {filteredMenus.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200/80 text-center text-stone-400 text-xs shadow-xs">
            <ShoppingBagIcon className="w-10 h-10 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold text-stone-600">Tidak ada menu yang sesuai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                onClick={() => addToCart(menu)}
                className="bg-white p-4 rounded-xl border border-stone-200/80 hover:border-[#543A14] shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between group active:scale-[0.98]"
              >
                <div>
                  <h4 className="font-bold text-xs text-stone-900 group-hover:text-[#543A14] transition-colors line-clamp-2">
                    {menu.name}
                  </h4>
                  <p className="text-[10px] text-stone-400 mt-1 font-medium">HPP: {formatIDR(menu.hpp)}</p>
                </div>

                <div className="mt-4 flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-extrabold text-xs text-[#543A14]">{formatIDR(menu.selling_price)}</span>
                  <span className="px-2 py-1 rounded-lg bg-amber-50 text-[#543A14] text-[10px] font-bold border border-amber-200 group-hover:bg-[#543A14] group-hover:text-[#F0BB78] transition-colors">
                    + Tambah
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Cart & Cashier Terminal Panel */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs flex flex-col justify-between space-y-4">
        <div>
          <h3 className="font-bold text-sm text-[#543A14] flex items-center justify-between pb-3 border-b border-stone-100">
            <span>Keranjang Belanja POS</span>
            {cart.length > 0 && (
              <button
                onClick={clearCart}
                className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 transition-colors cursor-pointer"
              >
                Bersihkan
              </button>
            )}
          </h3>

          {/* Cart Items List */}
          <div className="divide-y divide-stone-100 max-h-[320px] overflow-y-auto my-2 pr-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs space-y-1">
                <p className="font-semibold text-stone-600">Keranjang Masih Kosong</p>
                <p className="text-stone-400 text-[11px]">Klik produk di menu sebelah kiri untuk menambahkan.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-2">
                    <p className="font-semibold text-stone-900">{item.name}</p>
                    <p className="text-stone-400 text-[11px] font-medium">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="font-bold text-stone-900 w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 rounded-md bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-bold text-[#543A14] pl-2">
                    {formatIDR(item.price * item.qty)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cash Counter & Checkout */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex justify-between items-center text-sm font-semibold text-stone-700">
            <span>Total Belanja:</span>
            <span className="text-lg font-bold text-[#543A14]">{formatIDR(cartTotal)}</span>
          </div>

          {/* Quick Cash Buttons */}
          <div>
            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              ⚡ Pas Uang Pecahan (Klik Cepat)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[cartTotal, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashInput(amt > 0 ? amt.toString() : "")}
                  className="py-1.5 bg-stone-100 hover:bg-[#543A14] hover:text-[#F0BB78] text-stone-800 rounded-lg text-xs font-semibold transition-all border border-stone-200/80 cursor-pointer active:scale-95"
                >
                  {amt === cartTotal ? "Uang Pas" : formatIDR(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block mb-1">
              Uang Diterima (Rp)
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={formatCurrencyNumber(cashInput)}
              onChange={(e) => setCashInput(String(parseCurrencyNumber(e.target.value)))}
              placeholder="Contoh: 50.000"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
            />

          </div>

          {cashNum > 0 && (
            <div className="p-2.5 rounded-xl bg-amber-50/80 border border-amber-200 flex justify-between items-center text-xs font-bold">
              <span className="text-stone-700">Kembalian:</span>
              <span className={changeNum < 0 ? "text-rose-600 font-extrabold" : "text-[#543A14] font-extrabold"}>
                {changeNum < 0 ? `Kurang ${formatIDR(Math.abs(changeNum))}` : formatIDR(changeNum)}
              </span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || cashNum < cartTotal}
            className="w-full py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <PrinterIcon className="w-4 h-4 text-[#F0BB78]" />
            <span>Bayar & Cetak Struk</span>
          </button>

        </div>
      </div>
    </div>
  );
};
