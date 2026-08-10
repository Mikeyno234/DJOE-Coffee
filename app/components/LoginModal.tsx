"use client";

import React, { useState } from "react";
import {
  UserIcon,
  KeyIcon,
  ArrowRightIcon,
  LockClosedIcon,
  EyeIcon,
  EyeSlashIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";

interface LoginModalProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("superadmin@kedaikopi.com");
  const [password, setPassword] = useState("super123");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (json.success && json.user) {
        onLoginSuccess(json.user);
      } else {
        setErrorMsg(json.error || "Gagal masuk. Periksa kembali email dan kata sandi Anda.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi ke server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f07]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {/* Clean Human-Designed Login Modal */}
      <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 max-w-md w-full p-6 sm:p-8 animate-scale-in max-h-[90vh] overflow-y-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white p-1 border border-stone-200 shadow-xs mx-auto mb-3 flex items-center justify-center shrink-0">
            <img
              src="/images/logo.jpeg"
              alt="DJOE COFFEE Logo"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#543A14]">
            DJOE <span className="text-[#c9a87c]">COFFEE</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1">Sistem HPP & Kasir POS Terintegrasi</p>
        </div>

        {/* Form Credentials */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-slide-up">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Email Pengguna</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Masukkan email terdaftar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">Kata Sandi (Password)</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan kata sandi"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] focus:border-[#543A14] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi Sandi...</span>
            ) : (
              <>
                <span>Masuk ke Aplikasi</span>
                <ArrowRightIcon className="w-4 h-4 text-[#F0BB78]" />
              </>
            )}
          </button>
        </form>

        {/* Footer note */}
        <div className="text-center text-[11px] text-stone-400 font-normal">
          Hak akses otomatis ditentukan dari akun terdaftar
        </div>
      </div>
    </div>
  );
};

