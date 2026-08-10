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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#543A14]/85 backdrop-blur-md animate-fade-in overflow-y-auto">

      <div className="bg-[#FFF0DC] rounded-3xl shadow-2xl border border-[#F0BB78]/40 max-w-md w-full overflow-hidden animate-scale-in max-h-[90vh] overflow-y-auto my-auto">

        {/* Header Banner */}
        <div className="bg-[#543A14] p-6 text-white text-center relative overflow-hidden">
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-[#6e4b1b] rounded-full blur-xl opacity-50"></div>
          <div className="absolute -left-8 -top-8 w-32 h-32 bg-[#F0BB78] rounded-full blur-2xl opacity-20"></div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-16 h-16 rounded-2xl bg-white p-1 border-2 border-[#F0BB78] shadow-lg mb-3 flex items-center justify-center shrink-0 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/images/logo.jpeg"
                alt="DJOE COFFEE Logo"
                className="w-full h-full object-contain rounded-xl"
              />
            </div>
            <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
              DJOE <span className="text-[#F0BB78]">COFFEE</span>
            </h2>
            <p className="text-xs text-amber-200/90 mt-1">Otentikasi Sandi & Sistem Hak Akses Pengguna</p>
          </div>
        </div>

        <div className="p-6 space-y-5">
          {/* Form Credentials */}
          <form onSubmit={handleLogin} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-slide-up">
                ⚠️ {errorMsg}
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-[#131010] mb-1">Email Pengguna</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <UserIcon className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Masukkan email terdaftar"
                  className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-amber-900/20 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#F0BB78] focus:border-transparent outline-none transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#131010] mb-1">Kata Sandi (Password)</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-stone-400">
                  <KeyIcon className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan kata sandi"
                  className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-amber-900/20 bg-white text-xs font-semibold focus:ring-2 focus:ring-[#F0BB78] focus:border-transparent outline-none transition-all"
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
              className="w-full py-3 rounded-2xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-black text-xs uppercase tracking-wider shadow-lg shadow-[#543A14]/20 hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {loading ? (
                <span>Memverifikasi Kata Sandi...</span>
              ) : (
                <>
                  <span>Masuk ke Aplikasi</span>
                  <ArrowRightIcon className="w-4 h-4 text-[#F0BB78]" />
                </>
              )}
            </button>
          </form>

          {/* Footer security note */}
          <div className="pt-2 text-center text-[10px] text-stone-500 flex items-center justify-center gap-1 font-medium">
            <LockClosedIcon className="w-3.5 h-3.5 text-amber-700" />
            <span>Hak akses otomatis ditentukan dari akun terdaftar</span>
          </div>
        </div>
      </div>
    </div>
  );
};

