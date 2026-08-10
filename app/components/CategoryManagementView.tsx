"use client";

import React, { useState, useEffect } from "react";
import {
  TagIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  SparklesIcon,
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
    if (!name.trim()) return showToast("error", "Nama kategori wajib diisi!");

    try {
      if (editingId) {
        // Edit category
        const res = await fetch(`/api/categories/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, bg_color: bgColor, fg_color: fgColor }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("success", `Kategori "${name}" berhasil diperbarui!`);
          setIsModalOpen(false);
          fetchCategories();
        } else {
          showToast("error", json.error || "Gagal memperbarui kategori.");
        }
      } else {
        // Add category
        const res = await fetch("/api/categories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, bg_color: bgColor, fg_color: fgColor }),
        });
        const json = await res.json();
        if (json.success) {
          showToast("success", `Kategori "${name}" berhasil ditambahkan!`);
          setIsModalOpen(false);
          fetchCategories();
        } else {
          showToast("error", json.error || "Gagal menambahkan kategori.");
        }
      }
    } catch {
      showToast("error", "Terjadi kesalahan sistem saat menyimpan kategori.");
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
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-xl flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#543A14] flex items-center gap-2">
            <TagIcon className="w-6 h-6 text-[#543A14]" />
            <span>Master Data Kategori Menu</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Kelola master kategori menu kopi & makanan yang terintegrasi dengan database Supabase m_categories.
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer transition-all flex items-center gap-2 active:scale-95 transform hover:-translate-y-0.5"
        >
          <PlusIcon className="w-4 h-4 text-[#F0BB78]" />
          <span>Tambah Kategori Baru</span>
        </button>
      </div>


      {/* Categories Table Card */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-xs font-bold text-stone-400 animate-pulse">
            Memuat data master kategori dari Supabase...
          </div>
        ) : categories.length === 0 ? (
          <div className="p-12 text-center text-xs font-semibold text-stone-500">
            Belum ada data kategori menu. Klik tombol di atas untuk menambah kategori.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#543A14] text-amber-100 font-extrabold uppercase tracking-wider text-[11px]">
                  <th className="p-4 rounded-tl-3xl">ID</th>
                  <th className="p-4">Nama Kategori</th>
                  <th className="p-4">Preview Badge</th>
                  <th className="p-4">Tanggal Dibuat</th>
                  <th className="p-4 text-center rounded-tr-3xl">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 font-medium text-stone-700">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-stone-50/80 transition-colors">
                    <td className="p-4 font-extrabold text-[#543A14]">#{cat.id}</td>
                    <td className="p-4 font-black text-stone-900 text-sm">{cat.name}</td>
                    <td className="p-4">
                      <span
                        className="px-3 py-1 rounded-full text-xs font-bold shadow-xs inline-flex items-center gap-1.5"
                        style={{
                          backgroundColor: cat.bg_color || "#e8d5be",
                          color: cat.fg_color || "#6b3a1f",
                        }}
                      >
                        <SparklesIcon className="w-3.5 h-3.5" />
                        <span>{cat.name}</span>
                      </span>
                    </td>
                    <td className="p-4 text-stone-500">
                      {cat.created_at
                        ? new Date(cat.created_at).toLocaleDateString("id-ID", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })
                        : "-"}
                    </td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 text-amber-900 hover:bg-amber-100 rounded-xl cursor-pointer transition-colors"
                          title="Edit Kategori"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(cat)}
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer transition-colors"
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
        <div className="fixed inset-0 z-50 bg-[#1E3932]/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#cba258]/30 animate-scale-in relative max-h-[90vh] overflow-y-auto my-auto">
            <h3 className="text-base font-black text-[#1E3932] flex items-center gap-2 border-b border-stone-100 pb-3">
              <TagIcon className="w-5 h-5 text-[#006241]" />
              <span>{editingId ? "Edit Kategori Menu" : "Tambah Kategori Baru"}</span>
            </h3>

            <form onSubmit={handleSaveCategory} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Nama Kategori</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Milk Based / Dessert"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl font-semibold focus:outline-none focus:ring-2 focus:ring-[#006241]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Warna Background</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg cursor-pointer border border-stone-300"
                    />
                    <input
                      type="text"
                      value={bgColor}
                      onChange={(e) => setBgColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Warna Teks</label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="color"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-9 h-9 p-0.5 rounded-lg cursor-pointer border border-stone-300"
                    />
                    <input
                      type="text"
                      value={fgColor}
                      onChange={(e) => setFgColor(e.target.value)}
                      className="w-full px-2.5 py-1.5 border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              </div>

              {/* Preview Badge */}
              <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200 space-y-1">
                <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
                  Preview Badge Tampilan
                </span>
                <span
                  className="px-3 py-1 rounded-full text-xs font-bold inline-flex items-center gap-1.5 shadow-xs"
                  style={{ backgroundColor: bgColor, color: fgColor }}
                >
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>{name || "Nama Kategori"}</span>
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-stone-300 rounded-xl font-bold text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#006241] hover:bg-[#1E3932] text-white rounded-xl font-black shadow-md cursor-pointer transition-all active:scale-95"
                >
                  Simpan Kategori
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTarget)}
        title="Hapus Kategori Menu?"
        message={`Apakah Anda yakin ingin menghapus kategori "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Kategori"
        onConfirm={handleDeleteConfirm}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
};
