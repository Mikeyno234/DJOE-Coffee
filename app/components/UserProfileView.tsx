"use client";

import React, { useState } from "react";
import {
  UserIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  KeyIcon,
  CheckCircleIcon,
  ArrowRightOnRectangleIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  IdentificationIcon,
  PhotoIcon,
  ArrowUpTrayIcon,
} from "@heroicons/react/24/solid";


interface UserProfileViewProps {
  currentUser: any;
  onLogout: () => void;
  onShowToast?: (type: "success" | "error" | "info", text: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ currentUser, onLogout, onShowToast }) => {
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editPassword, setEditPassword] = useState("");
  const [editAvatarUrl, setEditAvatarUrl] = useState(currentUser?.avatar_url || "");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  const userId = currentUser?.id || "usr-0";

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
        setEditAvatarUrl(uploadedUrl);
        if (onShowToast) {
          onShowToast("success", "Foto profil berhasil diunggah! Klik 'Simpan Profil Saya' untuk menyimpan.");
        }
      } else {
        const errMsg = "Gagal meng-upload foto profil: " + (json.error || "Terjadi kesalahan");
        if (onShowToast) onShowToast("error", errMsg);
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi saat meng-upload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: editName,
          avatar_url: editAvatarUrl,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });

      const json = await res.json();
      if (json.success && json.user) {
        currentUser.name = json.user.name;
        currentUser.avatar_url = json.user.avatar_url;
        if (onShowToast) {
          onShowToast("success", "Profil & Foto Akun Anda berhasil diperbarui!");
        }
        setEditPassword("");
      } else {
        if (onShowToast) {
          onShowToast("error", json.error || "Gagal memperbarui profil.");
        }
      }
    } catch {
      if (onShowToast) onShowToast("error", "Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 animate-fade-in">
      {/*  Profile Container */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-xs border border-stone-200/80 space-y-6">
        <div className="border-b border-stone-100 pb-4">
          <h2 className="text-lg font-bold text-stone-900 tracking-tight">
            Pengaturan Profil Akun
          </h2>
          <p className="text-xs text-stone-500 mt-1">
            Kelola nama akun, foto profil avatar, dan kata sandi Anda.
          </p>
        </div>


        <form onSubmit={handleSaveProfile} className="space-y-5">
          {/* Avatar Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-2">
              Foto Profil (Avatar)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                {editAvatarUrl ? (
                  <img src={editAvatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-extrabold text-[#543A14]">
                    {currentUser?.name?.charAt(0)?.toUpperCase() || "U"}
                  </span>
                )}
              </div>

              <div className="space-y-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl cursor-pointer transition-all border border-stone-300 shadow-2xs active:scale-95">
                  <ArrowUpTrayIcon className="w-4 h-4 text-stone-600" />
                  <span>{uploading ? "Mengunggah..." : "Pilih Foto Baru"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploading}
                    className="hidden"
                  />
                </label>
                <p className="text-[10px] text-stone-400 font-normal">Format: JPG, PNG (Maks 5MB)</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Nama Lengkap Tampilan
            </label>
            <input
              type="text"
              required
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              Kata Sandi Baru <span className="text-stone-400 font-normal">(Kosongkan jika tidak ingin diubah)</span>
            </label>
            <input
              type="password"
              value={editPassword}
              onChange={(e) => setEditPassword(e.target.value)}
              placeholder="Masukkan kata sandi baru"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


