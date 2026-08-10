"use client";

import React, { useState } from "react";
import { formatIDR } from "@/lib/utils/currency";
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
        {/* Top Controls: Search Input & Category Pills */}
        <div className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-sm space-y-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
              <MagnifyingGlassIcon className="w-4 h-4" />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari menu kopi, makanan, atau snack..."
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-stone-50 border border-stone-200 text-xs focus:ring-2 focus:ring-[#006241] focus:bg-white focus:outline-none transition-all"
            />
          </div>

          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCat(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold whitespace-nowrap transition-all duration-200 cursor-pointer flex items-center gap-1.5 active:scale-95 ${
                  selectedCat === cat
                    ? "bg-[#006241] text-white shadow-md transform scale-105"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200 hover:text-stone-900"
                }`}
              >
                <TagIcon className="w-3.5 h-3.5 opacity-80" />
                <span>{cat}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Menu Cards Grid */}
        {filteredMenus.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-stone-200 text-center text-stone-400 text-xs">
            <ShoppingBagIcon className="w-12 h-12 mx-auto mb-2 text-stone-300 animate-bounce" />
            <p className="font-semibold">Tidak ada menu yang sesuai.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                onClick={() => addToCart(menu)}
                className="bg-white p-4 rounded-2xl border border-stone-200/80 shadow-sm hover:shadow-xl hover:border-[#543A14] transition-all duration-300 cursor-pointer flex flex-col justify-between group relative overflow-hidden active:scale-95 transform hover:-translate-y-1"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 bg-amber-100/80 text-[#543A14] rounded-full border border-amber-300/60 uppercase tracking-wider">
                    {menu.category || "Menu"}
                  </span>
                  {menu.margin_percent && (
                    <span className="text-[10px] font-bold text-amber-900 bg-amber-100/60 px-1.5 py-0.5 rounded-full">
                      +{menu.margin_percent}%
                    </span>
                  )}
                </div>

                <div className="my-1">
                  <h4 className="font-bold text-sm text-[#543A14] group-hover:text-[#3d2a0e] transition-colors line-clamp-2">
                    {menu.name}
                  </h4>
                  <p className="text-[11px] text-stone-400 mt-0.5 font-medium">HPP: {formatIDR(menu.hpp)}</p>
                </div>

                <div className="mt-3 flex items-center justify-between pt-2.5 border-t border-stone-100">
                  <span className="font-extrabold text-sm text-[#543A14]">{formatIDR(menu.selling_price)}</span>
                  <span className="w-7 h-7 rounded-xl bg-amber-100 text-[#543A14] font-bold flex items-center justify-center group-hover:bg-[#543A14] group-hover:text-[#F0BB78] transition-all duration-200 shadow-sm">
                    <PlusIcon className="w-4 h-4" />
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shopping Cart & Cashier Panel */}
      <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-lg flex flex-col justify-between space-y-4 animate-scale-in">
        <div>
          <h3 className="font-extrabold text-sm text-[#543A14] flex items-center gap-2 pb-3 border-b border-stone-100">
            <ShoppingBagIcon className="w-4 h-4 text-[#543A14]" />
            <span>Keranjang Belanja POS</span>
          </h3>

          {/* Cart Items List */}
          <div className="divide-y divide-stone-100 max-h-[300px] overflow-y-auto my-2 pr-1 space-y-1">
            {cart.length === 0 ? (
              <div className="py-12 text-center text-stone-400 text-xs">
                <div className="w-12 h-12 rounded-full bg-amber-50 text-[#543A14] flex items-center justify-center mx-auto mb-2 font-bold text-xl shadow-xs">
                  🛒
                </div>
                <p className="font-bold text-stone-600 mb-0.5">Keranjang Masih Kosong</p>

                <p className="text-stone-400">Klik item di menu kiri untuk menambahkan.</p>
              </div>
            ) : (
              cart.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs animate-slide-up">
                  <div className="flex-1 pr-2">
                    <p className="font-bold text-stone-800">{item.name}</p>
                    <p className="text-stone-400 text-[11px] font-medium">{formatIDR(item.price)}</p>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => updateCartQty(item.id, -1)}
                      className="w-6 h-6 rounded-lg bg-stone-100 hover:bg-rose-100 hover:text-rose-700 text-stone-700 font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <MinusIcon className="w-3 h-3" />
                    </button>
                    <span className="font-extrabold text-stone-800 w-5 text-center">{item.qty}</span>
                    <button
                      onClick={() => updateCartQty(item.id, 1)}
                      className="w-6 h-6 rounded-lg bg-amber-100 hover:bg-amber-200 text-[#543A14] font-bold flex items-center justify-center cursor-pointer transition-all active:scale-95"
                    >
                      <PlusIcon className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="w-20 text-right font-black text-[#543A14] pl-2">
                    {formatIDR(item.price * item.qty)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cash Counter & Checkout */}
        <div className="pt-3 border-t border-stone-200 space-y-3">
          <div className="flex justify-between items-center text-sm font-bold text-stone-700">
            <span>Total Belanja:</span>
            <span className="text-xl font-black text-[#543A14]">{formatIDR(cartTotal)}</span>
          </div>

          {/* Quick Cash Buttons */}
          <div>
            <label className="text-[10px] font-extrabold text-stone-400 uppercase tracking-wider block mb-1">
              ⚡ Pas Uang Pecahan (Klik Cepat)
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              {[cartTotal, 50000, 100000].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setCashInput(amt > 0 ? amt.toString() : "")}
                  className="py-1.5 bg-stone-100 hover:bg-amber-100 hover:text-[#543A14] text-stone-700 rounded-xl text-[11px] font-bold transition-all border border-stone-200 cursor-pointer active:scale-95 shadow-2xs"
                >
                  {amt === cartTotal ? "Uang Pas" : formatIDR(amt)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-stone-700 uppercase tracking-wider block mb-1 flex items-center gap-1">
              <BanknotesIcon className="w-4 h-4 text-[#543A14]" />
              <span>Uang Diterima (Rp)</span>
            </label>
            <input
              type="number"
              value={cashInput}
              onChange={(e) => setCashInput(e.target.value)}
              placeholder="Contoh: 50000"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-sm font-extrabold focus:outline-none focus:ring-2 focus:ring-[#F0BB78] focus:border-transparent transition-all"
            />
          </div>

          {cashNum > 0 && (
            <div
              className={`flex justify-between items-center text-xs font-bold p-3 rounded-xl border transition-all animate-slide-up ${
                cashNum >= cartTotal
                  ? "bg-amber-50 text-[#543A14] border-amber-200"
                  : "bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <span>{cashNum >= cartTotal ? "Kembalian Pelanggan:" : "Uang Kurang:"}</span>
              <span className="text-base font-black">
                {cashNum >= cartTotal ? formatIDR(changeNum) : formatIDR(cartTotal - cashNum)}
              </span>
            </div>
          )}

          <button
            onClick={handleCheckout}
            disabled={cart.length === 0 || cashNum < cartTotal}
            className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-md flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
              cart.length > 0 && cashNum >= cartTotal
                ? "bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] shadow-amber-900/20 hover:shadow-lg transform hover:-translate-y-0.5"
                : "bg-stone-200 text-stone-400 cursor-not-allowed"
            }`}
          >
            <PrinterIcon className="w-4 h-4 text-[#F0BB78]" />
            <span>Bayar & Cetak Struk</span>
          </button>

        </div>
      </div>
    </div>
  );
};
