"use client";

import React, { useState } from "react";
import { formatIDR } from "@/lib/utils/currency";
import {
  ListBulletIcon,
  PlusIcon,
  TagIcon,
  BookOpenIcon,
  DocumentChartBarIcon,
  PencilSquareIcon,
  TrashIcon,
} from "@heroicons/react/24/solid";
import { ConfirmModal } from "./ConfirmModal";

interface MenuListViewProps {
  menus: any[];
  onAddNewMenu: () => void;
  onEditMenu?: (menu: any) => void;
  onDeleteMenu?: (menuId: string | number) => void;
  onPrintCatalogue?: () => void;
  onPrintHppReport?: () => void;
}

export const MenuListView: React.FC<MenuListViewProps> = ({
  menus,
  onAddNewMenu,
  onEditMenu,
  onDeleteMenu,
  onPrintCatalogue,
  onPrintHppReport,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetMenu, setTargetMenu] = useState<any>(null);

  const handlePromptDelete = (menu: any) => {
    setTargetMenu(menu);
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDelete = () => {
    if (targetMenu && onDeleteMenu) {
      onDeleteMenu(targetMenu.id);
    }
    setDeleteConfirmOpen(false);
    setTargetMenu(null);
  };

  return (
    <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden animate-fade-in space-y-0 relative">
      <div className="p-5 border-b border-stone-100 flex flex-wrap justify-between items-center gap-3 bg-stone-50/50">
        <h3 className="font-black text-base text-[#1E3932] flex items-center gap-2">
          <ListBulletIcon className="w-5 h-5 text-[#006241]" />
          <span>Daftar Master Menu & Analisis HPP</span>
        </h3>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={onPrintCatalogue}
            className="px-3 py-2 bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95"
            title="Cetak Daftar Harga untuk Pelanggan (Tanpa HPP)"
          >
            <BookOpenIcon className="w-4 h-4 text-[#006241]" />
            <span>Katalog Pelanggan</span>
          </button>

          <button
            onClick={onPrintHppReport}
            className="px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5 active:scale-95 border border-amber-300"
            title="Cetak Laporan Internal HPP & Margin Lengkap"
          >
            <DocumentChartBarIcon className="w-4 h-4 text-amber-800" />
            <span>Laporan Internal HPP</span>
          </button>

          <button
            onClick={onAddNewMenu}
            className="px-4 py-2 bg-[#543A14] text-[#F0BB78] text-xs font-bold rounded-2xl hover:bg-[#3d2a0e] transition-all cursor-pointer flex items-center gap-1.5 shadow-md active:scale-95 transform hover:-translate-y-0.5"
          >
            <PlusIcon className="w-4 h-4 text-[#F0BB78]" />
            <span>Tambah Menu Baru</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#543A14] text-amber-100 font-extrabold uppercase tracking-wider">

              <th className="p-3.5 pl-5">Nama Menu</th>
              <th className="p-3.5">Kategori</th>
              <th className="p-3.5">HPP (Modal)</th>
              <th className="p-3.5">Harga Jual</th>
              <th className="p-3.5">Margin Profit</th>
              <th className="p-3.5 text-right">Keuntungan / Item</th>
              <th className="p-3.5 pr-5 text-center">Aksi (Edit / Hapus)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {menus.map((m) => (
              <tr key={m.id} className="hover:bg-amber-50/40 transition-colors">
                <td className="p-3.5 pl-5 font-bold text-stone-800 flex items-center gap-2">
                  {m.image_url && (
                    <img
                      src={m.image_url}
                      alt={m.name}
                      className="w-8 h-8 rounded-lg object-cover border border-stone-200"
                    />
                  )}
                  <span>{m.name}</span>
                </td>
                <td className="p-3.5">
                  <span className="px-2.5 py-1 bg-amber-100/80 text-[#543A14] rounded-full font-bold text-[11px] border border-amber-300/60 inline-flex items-center gap-1">
                    <TagIcon className="w-3 h-3 text-[#543A14]" />
                    {m.category || m.category_name}
                  </span>
                </td>
                <td className="p-3.5 text-stone-500 font-medium">{formatIDR(m.hpp)}</td>
                <td className="p-3.5 font-black text-[#543A14] text-sm">{formatIDR(m.selling_price)}</td>
                <td className="p-3.5">
                  <span className="px-2.5 py-1 bg-amber-50 text-amber-900 rounded-full font-black text-[11px] border border-amber-200">
                    +{m.margin_percent}%
                  </span>
                </td>
                <td className="p-3.5 text-right font-black text-[#543A14] text-sm">
                  +{formatIDR(m.selling_price - m.hpp)}
                </td>

                <td className="p-3.5 pr-5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    {onEditMenu && (
                      <button
                        onClick={() => onEditMenu(m)}
                        className="p-1.5 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all cursor-pointer active:scale-95"
                        title="Edit Menu & Resep HPP"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                    )}
                    {onDeleteMenu && (
                      <button
                        onClick={() => handlePromptDelete(m)}
                        className="p-1.5 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all cursor-pointer active:scale-95"
                        title="Hapus Menu dari Supabase"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Konfirmasi Hapus Menu"
        message={
          targetMenu
            ? `Apakah Anda yakin ingin menghapus menu "${targetMenu.name}" dari database Supabase?`
            : "Apakah Anda yakin ingin menghapus menu ini?"
        }
        confirmText="Ya, Hapus Sekarang"
        cancelText="Batal"
        onConfirm={handleExecuteDelete}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTargetMenu(null);
        }}
      />
    </div>
  );
};
