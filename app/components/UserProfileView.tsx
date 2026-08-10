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
} from "@heroicons/react/24/solid";

interface UserProfileViewProps {
  currentUser: any;
  onLogout: () => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ currentUser, onLogout }) => {
  const [editName, setEditName] = useState(currentUser?.name || "");
  const [editPassword, setEditPassword] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const userId = currentUser?.id || "usr-0";

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatusMsg("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: userId,
          name: editName,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });

      const json = await res.json();
      if (json.success && json.user) {
        currentUser.name = json.user.name;
        setStatusMsg("✓ Profil & Pengaturan akun Anda berhasil diperbarui!");
        setEditPassword("");
      } else {
        setStatusMsg(`⚠️ ${json.error || "Gagal memperbarui profil."}`);
      }
    } catch {
      setStatusMsg("⚠️ Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* Top Banner Header */}
      <div className="bg-[#1E3932] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-[#cba258]/30 relative overflow-hidden flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4 relative z-10">
          <div className="w-16 h-16 rounded-2xl bg-[#006241] text-amber-300 border-2 border-[#cba258] flex items-center justify-center shadow-lg">
            <UserIcon className="w-9 h-9" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-white">{currentUser?.name}</h2>
              <span className="px-2.5 py-0.5 rounded-lg bg-emerald-950/80 text-amber-300 text-[10px] font-mono font-extrabold border border-[#cba258]/40">
                m_users.id: {userId}
              </span>
            </div>
            <p className="text-xs text-emerald-200/90 flex items-center gap-1.5 mt-1 font-medium">
              <EnvelopeIcon className="w-4 h-4 text-emerald-400" />
              <span>{currentUser?.email}</span>
            </p>
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <span
            className={`px-4 py-1.5 rounded-full text-xs font-black tracking-wider uppercase flex items-center gap-1.5 shadow-md ${
              currentUser?.role === "SUPER_ADMIN"
                ? "bg-[#cba258] text-[#1E3932]"
                : currentUser?.role === "ADMIN"
                ? "bg-[#006241] text-white border border-emerald-400/40"
                : "bg-amber-700 text-white"
            }`}
          >
            <ShieldCheckIcon className="w-4 h-4" />
            {currentUser?.role}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Account Info Card */}
        <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md space-y-4 h-fit">
          <h3 className="font-extrabold text-sm text-[#1E3932] border-b border-stone-100 pb-3 flex items-center gap-2">
            <IdentificationIcon className="w-4 h-4 text-[#006241]" />
            <span>Informasi ID & Akun Staff</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-stone-50 rounded-2xl border border-stone-200">
              <p className="text-stone-400 font-bold uppercase text-[10px]">Database Primary Key (m_users.id)</p>
              <p className="font-mono font-black text-emerald-700 text-sm mt-0.5">{userId}</p>
            </div>

            <div>
              <p className="text-stone-400 font-bold uppercase text-[10px]">Email Terdaftar</p>
              <p className="font-semibold text-stone-800">{currentUser?.email}</p>
            </div>

            <div>
              <p className="text-stone-400 font-bold uppercase text-[10px]">Peran Akses Sistem</p>
              <p className="font-bold text-[#006241]">{currentUser?.role}</p>
            </div>

            <div>
              <p className="text-stone-400 font-bold uppercase text-[10px] mb-1">Status Sesi</p>
              <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-bold border border-emerald-200 inline-flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5 text-emerald-600" /> Aktif Terhubung
              </span>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-100">
            <button
              onClick={onLogout}
              className="w-full py-2.5 bg-rose-900/10 hover:bg-rose-900/20 text-rose-700 font-bold text-xs rounded-2xl transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-700" />
              <span>Keluar Sesi Akun</span>
            </button>
          </div>
        </div>

        {/* Right Side: Self Edit Form */}
        <div className="md:col-span-2 bg-white p-6 sm:p-8 rounded-3xl border border-stone-200 shadow-md space-y-5">
          <div className="border-b border-stone-100 pb-3">
            <h3 className="font-black text-base text-[#1E3932] flex items-center gap-2">
              <SparklesIcon className="w-5 h-5 text-[#006241]" />
              <span>Edit Profil & Kata Sandi (User ID: {userId})</span>
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Perbarui nama tampilan staf dan ubah kata sandi akun Anda secara langsung.
            </p>
          </div>

          {statusMsg && (
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-extrabold animate-slide-up">
              {statusMsg}
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Nama Lengkap Tampilan</label>
              <input
                type="text"
                required
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-[#006241] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5 flex items-center gap-1">
                <KeyIcon className="w-4 h-4 text-stone-400" />
                <span>Kata Sandi Baru (Kosongkan jika tidak ingin diubah)</span>
              </label>
              <input
                type="password"
                value={editPassword}
                onChange={(e) => setEditPassword(e.target.value)}
                placeholder="Masukkan kata sandi baru"
                className="w-full px-4 py-3 rounded-2xl border border-stone-300 text-xs font-bold focus:ring-2 focus:ring-[#006241] outline-none transition-all"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-[#006241] hover:bg-[#1E3932] text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
              >
                {loading ? "Menyimpan Perubahan..." : "Simpan Profil Saya"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
