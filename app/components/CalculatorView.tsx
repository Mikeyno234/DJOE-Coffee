"use client";

import React, { useState } from "react";
import { formatIDR, formatCurrencyNumber, parseCurrencyNumber } from "@/lib/utils/currency";

import {
  PlusIcon,
  TrashIcon,
  CheckIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";

interface IngredientItem {
  name: string;
  price: number;
  capacity: number;
  usage: number;
}

interface OperationalItem {
  name: string;
  cost: number;
}

interface CalculatorViewProps {
  formMenuName: string;
  setFormMenuName: (val: string) => void;
  formCategory: string;
  setFormCategory: (val: string) => void;
  formMargin: number;
  setFormMargin: (val: number) => void;
  formManualPrice: string;
  setFormManualPrice: (val: string) => void;
  formImageUrl?: string;
  setFormImageUrl?: (val: string) => void;
  categoriesList?: string[];
  ingredients: IngredientItem[];
  setIngredients: (items: IngredientItem[]) => void;
  operational: OperationalItem[];
  setOperational: (items: OperationalItem[]) => void;
  computedHpp: number;
  calculatedPrice: number;
  computedMargin: number;
  handleSaveMenu: (e: React.FormEvent) => void;
  onShowToast?: (type: "success" | "error" | "info", text: string) => void;
}

export const CalculatorView: React.FC<CalculatorViewProps> = ({
  formMenuName,
  setFormMenuName,
  formCategory,
  setFormCategory,
  formMargin,
  setFormMargin,
  formManualPrice,
  setFormManualPrice,
  formImageUrl,
  setFormImageUrl,
  categoriesList = [
    "Milk Based",
    "Signature Menu",
    "Non - Coffee",
    "Classic and Manual Brew",
    "Snack",
    "Lainnya",
  ],
  ingredients,
  setIngredients,
  operational,
  setOperational,
  computedHpp,
  calculatedPrice,
  computedMargin,
  handleSaveMenu,
  onShowToast,
}) => {
  const [uploading, setUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const uploadedUrl = json.image_url || json.url;

      if (json.success && uploadedUrl && setFormImageUrl) {
        setFormImageUrl(uploadedUrl);
        if (onShowToast) onShowToast("success", "Foto menu berhasil diunggah!");
      } else {
        const errMsg = "Gagal meng-upload gambar: " + (json.error || "Terjadi kesalahan");
        if (onShowToast) onShowToast("error", errMsg);
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi saat meng-upload gambar.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSaveMenu}
      className="bg-white p-6 sm:p-8 rounded-2xl border border-stone-200/80 shadow-xs space-y-6 max-w-4xl mx-auto animate-fade-in"
    >
      {/* Title Banner */}
      <div className="border-b border-stone-100 pb-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Kalkulator HPP & Recipe Builder
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Hitung HPP otomatis dari bahan baku & packaging, upload foto produk, serta tentukan margin profit target.
          </p>
        </div>
      </div>

      {/* Main Details & Image Upload */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-3">
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Nama Menu Kopi / Kuliner</label>
            <input
              type="text"
              required
              value={formMenuName}
              onChange={(e) => setFormMenuName(e.target.value)}
              placeholder="Contoh: Kopi Susu Gula Aren"
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-stone-700 block mb-1">Kategori Menu</label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
            >
              {categoriesList.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Image Upload Box */}
        <div className="flex flex-col justify-center items-center border border-dashed border-stone-300 rounded-xl p-3 bg-stone-50/50 hover:bg-stone-50 transition-all text-center relative min-h-[110px]">
          {formImageUrl ? (
            <div className="relative group w-full h-24 rounded-lg overflow-hidden border border-stone-200">
              <img src={formImageUrl} alt="Preview Menu" className="w-full h-full object-cover" />
              {setFormImageUrl && (
                <button
                  type="button"
                  onClick={() => setFormImageUrl("")}
                  className="absolute top-1 right-1 p-1 bg-rose-600 text-white rounded-md shadow-xs hover:bg-rose-700 transition-colors cursor-pointer"
                  title="Hapus Foto"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          ) : (
            <label className="cursor-pointer flex flex-col items-center justify-center space-y-1 w-full h-full p-2">
              <PhotoIcon className="w-6 h-6 text-[#543A14]" />
              <span className="text-[11px] font-semibold text-stone-700 flex items-center gap-1">
                <ArrowUpTrayIcon className="w-3 h-3 text-[#543A14]" />
                Upload Foto Menu (WebP)
              </span>
              <span className="text-[9px] text-stone-400 font-medium">Klik pilih gambar (JPG, PNG, WebP)</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          )}
          {uploading && (
            <span className="text-[10px] text-amber-700 font-bold animate-pulse mt-1">Mengunggah gambar...</span>
          )}
        </div>
      </div>

      {/* Recipe Ingredients Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
            1. Rincian Bahan Baku (Recipe Ingredients)
          </h4>
          <button
            type="button"
            onClick={() => setIngredients([...ingredients, { name: "", price: 0, capacity: 1000, usage: 0 }])}
            className="text-xs font-bold text-[#543A14] hover:text-[#3d2a0e] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-[#543A14]" />
            <span>Tambah Bahan</span>
          </button>
        </div>

        {ingredients.map((ing, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs"
          >
            <input
              type="text"
              placeholder="Nama Bahan (ex: Espresso)"
              value={ing.name}
              onChange={(e) => {
                const copy = [...ingredients];
                copy[idx].name = e.target.value;
                setIngredients(copy);
              }}
              className="col-span-4 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Harga Kemasan (Rp)"
              value={formatCurrencyNumber(ing.price)}
              onChange={(e) => {
                const copy = [...ingredients];
                copy[idx].price = parseCurrencyNumber(e.target.value);
                setIngredients(copy);
              }}
              className="col-span-3 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <input
              type="number"
              placeholder="Total (gr/ml)"
              value={ing.capacity || ""}
              onChange={(e) => {
                const copy = [...ingredients];
                copy[idx].capacity = parseFloat(e.target.value) || 0;
                setIngredients(copy);
              }}
              className="col-span-2 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <input
              type="number"
              placeholder="Pakai (gr/ml)"
              value={ing.usage || ""}
              onChange={(e) => {
                const copy = [...ingredients];
                copy[idx].usage = parseFloat(e.target.value) || 0;
                setIngredients(copy);
              }}
              className="col-span-2 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <div className="col-span-1 text-center">
              {ingredients.length > 1 && (
                <button
                  type="button"
                  onClick={() => setIngredients(ingredients.filter((_, i) => i !== idx))}
                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Operational Overheads Section */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800">
            2. Biaya Kemasan & Overhead Operasional
          </h4>
          <button
            type="button"
            onClick={() => setOperational([...operational, { name: "", cost: 0 }])}
            className="text-xs font-bold text-[#543A14] hover:text-[#3d2a0e] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <PlusIcon className="w-4 h-4 text-[#543A14]" />
            <span>Tambah Overhead</span>
          </button>
        </div>

        {operational.map((op, idx) => (
          <div
            key={idx}
            className="grid grid-cols-12 gap-2 items-center bg-stone-50 p-2.5 rounded-xl border border-stone-200/80 text-xs"
          >
            <input
              type="text"
              placeholder="Biaya Kemasan (ex: Cup)"
              value={op.name}
              onChange={(e) => {
                const copy = [...operational];
                copy[idx].name = e.target.value;
                setOperational(copy);
              }}
              className="col-span-7 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <input
              type="text"
              inputMode="numeric"
              placeholder="Biaya per Porsi (Rp)"
              value={formatCurrencyNumber(op.cost)}
              onChange={(e) => {
                const copy = [...operational];
                copy[idx].cost = parseCurrencyNumber(e.target.value);
                setOperational(copy);
              }}
              className="col-span-4 px-3 py-1.5 bg-white border border-stone-300 rounded-lg font-medium focus:ring-2 focus:ring-[#543A14] outline-none"
            />
            <div className="col-span-1 text-center">
              {operational.length > 1 && (
                <button
                  type="button"
                  onClick={() => setOperational(operational.filter((_, i) => i !== idx))}
                  className="p-1 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                >
                  <TrashIcon className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Box */}
      <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
          <div className="bg-white p-3 rounded-lg border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-500 block uppercase">Total Modal (HPP)</span>
            <span className="text-base font-bold text-stone-900">{formatIDR(computedHpp)}</span>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-500 block uppercase">Target Margin Profit</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <input
                type="number"
                value={formMargin}
                onChange={(e) => setFormMargin(parseFloat(e.target.value) || 0)}
                className="w-16 px-1.5 py-0.5 border border-stone-300 rounded text-center text-xs font-bold focus:ring-2 focus:ring-[#543A14] outline-none"
              />
              <span className="text-xs font-bold text-stone-700">%</span>
            </div>
          </div>

          <div className="bg-white p-3 rounded-lg border border-stone-200/80">
            <span className="text-[10px] font-semibold text-stone-500 block uppercase">Rekomendasi Harga Jual</span>
            <span className="text-base font-bold text-[#543A14]">{formatIDR(calculatedPrice)}</span>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-stone-700 block mb-1">
            Override Harga Jual Manual (Rp) - Optional
          </label>
          <input
            type="text"
            inputMode="numeric"
            value={formatCurrencyNumber(formManualPrice)}
            onChange={(e) => setFormManualPrice(e.target.value ? String(parseCurrencyNumber(e.target.value)) : "")}
            placeholder={`Biarkan kosong jika mengikuti rekomendasi (${formatIDR(calculatedPrice)})`}
            className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#543A14] outline-none"
          />
        </div>
      </div>


      {/* Save Button */}
      <div className="pt-2 flex justify-end">
        <button
          type="submit"
          className="px-6 py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
        >
          <CheckIcon className="w-4 h-4 text-[#F0BB78]" />
          <span>Simpan Menu & Resep HPP</span>
        </button>
      </div>
    </form>
  );
};
