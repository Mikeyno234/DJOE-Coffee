"use client";

import React, { useState, useEffect } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/solid";
import { ConfirmModal } from "./ConfirmModal";
import { Toast, ToastMessage } from "./Toast";

export interface CategoryItem {
  id: number;
  name: string;
  icon?: string;
  bg_color?: string;
  fg_color?: string;
  created_at?: string;
}

export const CategoryManagementView: React.FC = () => {
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [bgColor, setBgColor] = useState("#e8d5be");
  const [fgColor, setFgColor] = useState("#6b3a1f");

  // Confirm Delete Modal
  const [deleteTarget, setDeleteTarget] = useState<CategoryItem | null>(null);

  // Toast Notification State
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ id: String(Date.now()), type, text });
  };

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const json = await res.json();
      if (json.success) {
        setCategories(json.data || []);
      }
    } catch {
      showToast("error", "Gagal memuat daftar kategori.");
    } finally {
      setLoading(false);
    }

  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setName("");
    setBgColor("#e8d5be");
    setFgColor("#6b3a1f");
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cat: CategoryItem) => {
    setEditingId(cat.id);
    setName(cat.name);
    setBgColor(cat.bg_color || "#e8d5be");
    setFgColor(cat.fg_color || "#6b3a1f");
    setIsModalOpen(true);
  };

  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast("error", "Nama kategori wajib diisi.");
      return;
    }

    try {
      const payload = {
        name,
        bg_color: bgColor,
        fg_color: fgColor,
      };

      let res;
      if (editingId) {
        res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
      }

      const json = await res.json();
      if (json.success) {
        showToast(
          "success",
          editingId
            ? `Kategori "${name}" berhasil diperbarui.`
            : `Kategori baru "${name}" berhasil ditambahkan.`
        );
        setIsModalOpen(false);
        fetchCategories();
      } else {
        showToast("error", json.error || "Gagal menyimpan kategori.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan sistem saat menyimpan.");
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/categories/${deleteTarget.id}`, {
        method: "DELETE",
      });
      const json = await res.json();
      if (json.success) {
        showToast("success", `Kategori "${deleteTarget.name}" berhasil dihapus.`);
        fetchCategories();
      } else {
        showToast("error", json.error || "Gagal menghapus kategori.");
      }
    } catch {
      showToast("error", "Terjadi kesalahan sistem saat menghapus kategori.");
    } finally {
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4 animate-fade-in max-w-5xl mx-auto">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Action Header */}
      <div className="flex justify-end">
        <button
          onClick={handleOpenAddModal}
          className="px-3.5 py-2 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 active:scale-[0.98]"
        >
          <PlusIcon className="w-4 h-4 text-[#F0BB78]" />
          <span>TAMBAH KATEGORI BARU</span>
        </button>
      </div>

      {/* Categories Table Card */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-semibold text-stone-400 animate-pulse">
            Memuat data master kategori dari Supabase...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs font-medium text-stone-500">
            Belum ada data kategori menu. Klik tombol di atas untuk menambah kategori.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase tracking-wider">
                  <th className="p-3.5 pl-5">ID</th>
                  <th className="p-3.5">Nama Kategori</th>
                  <th className="p-3.5">Preview Badge</th>
                  <th className="p-3.5">Tanggal Dibuat</th>
                  <th className="p-3.5 text-center pr-5">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-900">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5 pl-5 font-mono text-stone-500">#{cat.id}</td>
                    <td className="p-3.5 font-bold text-stone-900">{cat.name}</td>
                    <td className="p-3.5">
                      <span
                        style={{
                          backgroundColor: cat.bg_color || "#e8d5be",
                          color: cat.fg_color || "#6b3a1f",
                        }}
                        className="px-2.5 py-1 rounded-md text-[11px] font-semibold inline-block border border-stone-200"
                      >
                        {cat.name}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-500">
                      {cat.created_at
                        ? new Date(cat.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="p-3.5 text-center pr-5">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Edit Kategori"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Hapus Kategori"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Category Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f07]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto my-auto space-y-5">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <h3 className="text-base font-bold text-stone-900">
                {editingId ? "Edit Kategori Menu" : "Tambah Kategori Baru"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Nama Kategori
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Cold Brew"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Warna Background
                  </label>
                  <input
                    type="color"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                    Warna Teks
                  </label>
                  <input
                    type="color"
                    value={fgColor}
                    onChange={(e) => setFgColor(e.target.value)}
                    className="w-full h-9 rounded-xl border border-stone-300 cursor-pointer p-0.5"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200/80 space-y-1">
                <span className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider block">
                  Preview Tampilan Badge
                </span>
                <span
                  style={{ backgroundColor: bgColor, color: fgColor }}
                  className="px-3 py-1 rounded-md text-xs font-bold inline-block"
                >
                  {name || "Preview Nama Kategori"}
                </span>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
                >
                  {editingId ? "Simpan Perubahan" : "Tambah Kategori"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Konfirmasi Hapus Kategori"
        message={
          deleteTarget
            ? `Apakah Anda yakin ingin menghapus kategori "${deleteTarget.name}"?`
            : ""
        }
        confirmText="Ya, Hapus Sekarang"
        cancelText="Batal"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
