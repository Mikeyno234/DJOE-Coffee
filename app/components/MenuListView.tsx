"use client";

import React, { useState } from "react";
import { formatIDR, formatCurrencyNumber, parseCurrencyNumber } from "@/lib/utils/currency";

import {
  BookOpenIcon,
  DocumentChartBarIcon,
  PencilSquareIcon,
  TrashIcon,
  PlusIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ConfirmModal } from "./ConfirmModal";

interface MenuListViewProps {
  menus: any[];
  onAddNewMenu: () => void;
  onUpdateMenu?: (updatedMenu: any) => void;
  onDeleteMenu?: (menuId: string | number) => void;
  onPrintCatalogue?: () => void;
  onPrintHppReport?: () => void;
  onShowToast?: (type: "success" | "error" | "info", text: string) => void;
}

export const MenuListView: React.FC<MenuListViewProps> = ({
  menus,
  onAddNewMenu,
  onUpdateMenu,
  onDeleteMenu,
  onPrintCatalogue,
  onPrintHppReport,
  onShowToast,
}) => {
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetMenu, setTargetMenu] = useState<any>(null);

  // Edit Menu Modal State
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [editName, setEditName] = useState("");
  const [editCategory, setEditCategory] = useState("Minuman");
  const [editHpp, setEditHpp] = useState<number>(0);
  const [editSellingPrice, setEditSellingPrice] = useState<number>(0);
  const [editImageUrl, setEditImageUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Add New Menu Modal State
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [addName, setAddName] = useState("");
  const [addCategory, setAddCategory] = useState("Minuman");
  const [addHpp, setAddHpp] = useState<number>(0);
  const [addSellingPrice, setAddSellingPrice] = useState<number>(0);
  const [addImageUrl, setAddImageUrl] = useState("");
  const [addUploading, setAddUploading] = useState(false);
  const [addSaving, setAddSaving] = useState(false);

  const handleOpenEdit = (menu: any) => {
    setEditingId(menu.id);
    setEditName(menu.name || "");
    setEditCategory(menu.category || menu.category_name || "Minuman");
    setEditHpp(menu.hpp || 0);
    setEditSellingPrice(menu.selling_price || 0);
    setEditImageUrl(menu.image_url || "");
    setEditModalOpen(true);
  };

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

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

      if (json.success && uploadedUrl) {
        setEditImageUrl(uploadedUrl);
        if (onShowToast) onShowToast("success", "Foto menu berhasil diunggah!");
      } else {
        if (onShowToast) onShowToast("error", "Gagal meng-upload foto menu.");
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi saat meng-upload.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingId) return;

    setSaving(true);
    const margin = editHpp > 0 ? Math.round(((editSellingPrice - editHpp) / editHpp) * 100) : 0;
    const payload = {
      id: editingId,
      name: editName,
      category_name: editCategory,
      hpp: editHpp,
      selling_price: editSellingPrice,
      margin_percent: margin,
      image_url: editImageUrl,
    };

    try {
      const res = await fetch(`/api/menus/${editingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        if (onUpdateMenu) onUpdateMenu(json.data || payload);
        if (onShowToast) onShowToast("success", `Menu "${editName}" berhasil diperbarui!`);
        setEditModalOpen(false);
      } else {
        if (onShowToast) onShowToast("error", json.error || "Gagal memperbarui menu.");
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi ke server.");
    } finally {
      setSaving(false);
    }
  };
  const handleAddImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAddUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const uploadedUrl = json.image_url || json.url;

      if (json.success && uploadedUrl) {
        setAddImageUrl(uploadedUrl);
        if (onShowToast) onShowToast("success", "Foto menu berhasil diunggah!");
      } else {
        if (onShowToast) onShowToast("error", "Gagal meng-upload foto menu.");
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi saat meng-upload.");
    } finally {
      setAddUploading(false);
    }
  };

  const handleOpenAddModal = () => {
    setAddName("");
    setAddCategory("Minuman");
    setAddHpp(0);
    setAddSellingPrice(0);
    setAddImageUrl("");
    setAddModalOpen(true);
  };

  const handleSaveAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addName.trim()) return;

    setAddSaving(true);
    const margin = addHpp > 0 ? Math.round(((addSellingPrice - addHpp) / addHpp) * 100) : 0;
    const payload = {
      name: addName,
      category_name: addCategory,
      category: addCategory,
      hpp: addHpp,
      selling_price: addSellingPrice,
      margin_percent: margin,
      image_url: addImageUrl,
    };

    try {
      const res = await fetch("/api/menus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        if (onUpdateMenu) onUpdateMenu(json.data || payload);
        if (onShowToast) onShowToast("success", `Menu baru "${addName}" berhasil ditambahkan!`);
        setAddModalOpen(false);
      } else {
        if (onShowToast) onShowToast("error", json.error || "Gagal menambah menu.");
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi ke server.");
    } finally {
      setAddSaving(false);
    }
  };

  const categoriesList = ["Minuman", "Makanan", "Snack", "Lainnya"];

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Top Action Control Buttons */}
      <div className="flex flex-wrap justify-end gap-2">
        <button
          onClick={onPrintCatalogue}
          className="px-3 py-2 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 border border-stone-300 shadow-2xs"
          title="Cetak Daftar Harga Pelanggan"
        >
          <BookOpenIcon className="w-3.5 h-3.5 text-stone-600" />
          <span>Export Menu</span>
        </button>

        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs active:scale-[0.98]"
        >
          <PlusIcon className="w-4 h-4 text-[#F0BB78]" />
          <span>Tambah Menu Baru</span>
        </button>
      </div>

      {/* Main Table Container*/}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Nama Menu</th>
                <th className="p-3.5">Kategori</th>
                <th className="p-3.5 text-right">Modal (HPP)</th>
                <th className="p-3.5 text-right">Harga Jual</th>
                <th className="p-3.5 text-center">Margin %</th>
                <th className="p-3.5 text-right">Profit / Porsi</th>
                <th className="p-3.5 pr-5 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-900">
              {menus.map((m) => (
                <tr key={m.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="p-3.5 pl-5">
                    <div className="flex items-center gap-3">
                      {m.image_url ? (
                        <img
                          src={m.image_url}
                          alt={m.name}
                          className="w-8 h-8 rounded-lg object-cover border border-stone-200 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-stone-100 border border-stone-200 flex items-center justify-center text-stone-400 text-xs shrink-0 font-bold">
                          ☕
                        </div>
                      )}
                      <span className="font-semibold text-stone-900">{m.name}</span>
                    </div>
                  </td>
                  <td className="p-3.5">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px] font-medium border border-stone-200">
                      {m.category || m.category_name || "Minuman"}
                    </span>
                  </td>
                  <td className="p-3.5 text-right text-stone-500">{formatIDR(m.hpp)}</td>
                  <td className="p-3.5 text-right font-bold text-stone-900">{formatIDR(m.selling_price)}</td>
                  <td className="p-3.5 text-center">
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                      +{m.margin_percent}%
                    </span>
                  </td>
                  <td className="p-3.5 text-right font-bold text-emerald-700">
                    +{formatIDR(m.selling_price - m.hpp)}
                  </td>
                  <td className="p-3.5 pr-5 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => handleOpenEdit(m)}
                        className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                        title="Edit Menu & Harga Jual"
                      >
                        <PencilSquareIcon className="w-4 h-4" />
                      </button>
                      {onDeleteMenu && (
                        <button
                          onClick={() => handlePromptDelete(m)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Menu"
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
      </div>

      {/* Dedicated Edit Menu Pop-up Modal */}
      {editModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f07]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto my-auto space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Edit Menu & Harga Jual</h3>
              <button
                onClick={() => setEditModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Menu</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">HPP Modal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formatCurrencyNumber(editHpp)}
                    onChange={(e) => setEditHpp(parseCurrencyNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formatCurrencyNumber(editSellingPrice)}
                    onChange={(e) => setEditSellingPrice(parseCurrencyNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                  />
                </div>
              </div>


              {/* Photo upload field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Foto Menu</label>
                {editImageUrl && (
                  <div className="mb-2 relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 shadow-2xs">
                    <img
                      src={editImageUrl}
                      alt="Preview Foto Menu"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setEditImageUrl("")}
                      className="absolute top-1 right-1 p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                      title="Hapus Foto"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-800 hover:file:bg-stone-200 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setEditModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={saving || uploading}
                  className="px-4 py-2 rounded-xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-bold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {saving ? "Menyimpan..." : "Simpan Perubahan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dedicated Add New Menu Pop-up Modal */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f07]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto my-auto space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">Tambah Menu Baru</h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveAdd} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  value={addName}
                  onChange={(e) => setAddName(e.target.value)}
                  placeholder="Contoh: Kopi Susu Gula Aren"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Kategori Menu</label>
                <select
                  value={addCategory}
                  onChange={(e) => setAddCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                >
                  {categoriesList.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">HPP Modal (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formatCurrencyNumber(addHpp)}
                    onChange={(e) => setAddHpp(parseCurrencyNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Harga Jual (Rp)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    required
                    value={formatCurrencyNumber(addSellingPrice)}
                    onChange={(e) => setAddSellingPrice(parseCurrencyNumber(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                  />
                </div>
              </div>

              {/* Photo upload field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">Foto Menu</label>
                {addImageUrl && (
                  <div className="mb-2 relative w-24 h-24 rounded-xl overflow-hidden border border-stone-200 shadow-2xs">
                    <img
                      src={addImageUrl}
                      alt="Preview Foto Menu"
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => setAddImageUrl("")}
                      className="absolute top-1 right-1 p-1 bg-rose-600/80 hover:bg-rose-600 text-white rounded-md transition-colors cursor-pointer"
                      title="Hapus Foto"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAddImageUpload}
                  className="text-xs text-stone-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-stone-100 file:text-stone-800 hover:file:bg-stone-200 cursor-pointer"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={addSaving || addUploading}
                  className="px-4 py-2 rounded-xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-bold cursor-pointer transition-all active:scale-[0.98] disabled:opacity-50"
                >
                  {addSaving ? "Menyimpan..." : "Tambah Menu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
