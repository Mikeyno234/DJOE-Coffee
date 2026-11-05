"use client";

import React, { useState } from "react";
import {
  ArrowRightIcon,
  EyeIcon,
  EyeSlashIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

interface LoginModalProps {
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ onLoginSuccess }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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

  const setDemoAccount = (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setErrorMsg("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl border border-stone-200/80 max-w-md w-full p-6 sm:p-8 animate-scale-in max-h-[92vh] overflow-y-auto my-auto space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-white p-1 border-2 border-[#C89B3C] shadow-sm mx-auto mb-3 flex items-center justify-center shrink-0">
            <img
              src="/images/Logo/logo.png"
              alt="DJOE COFFEE"
              className="w-full h-full object-contain rounded-full"
            />
          </div>
          <h2 className="text-xl font-black tracking-tight text-[#1A120B]">
            DJOE <span className="text-[#C89B3C]">COFFEE</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">Sistem Kasir POS & Manajemen HPP</p>
        </div>

        {/* Quick Demo Access Pills */}
        <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200/60 space-y-1.5">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
            Akses Cepat Pengguna:
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => setDemoAccount("superadmin@kedaikopi.com", "super123")}
              className="py-1 px-2 rounded-lg bg-white hover:bg-[#1A120B] hover:text-white border border-stone-200 text-[10px] font-bold text-stone-700 transition-all cursor-pointer text-center"
            >
              Super Admin
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount("admin@kedaikopi.com", "admin123")}
              className="py-1 px-2 rounded-lg bg-white hover:bg-[#1A120B] hover:text-white border border-stone-200 text-[10px] font-bold text-stone-700 transition-all cursor-pointer text-center"
            >
              Admin Kedai
            </button>
            <button
              type="button"
              onClick={() => setDemoAccount("kasir@kedaikopi.com", "kasir123")}
              className="py-1 px-2 rounded-lg bg-white hover:bg-[#1A120B] hover:text-white border border-stone-200 text-[10px] font-bold text-stone-700 transition-all cursor-pointer text-center"
            >
              Kasir Shift
            </button>
          </div>
        </div>

        {/* Form Credentials */}
        <form onSubmit={handleLogin} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-slide-up">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Email Pengguna</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nama@kedaikopi.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1A120B] focus:border-[#1A120B] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-stone-700 mb-1.5">Kata Sandi</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#1A120B] focus:border-[#1A120B] outline-none transition-all placeholder:font-normal placeholder:text-stone-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-stone-400 hover:text-stone-600 cursor-pointer"
                aria-label={showPassword ? "Sembunyikan sandi" : "Tampilkan sandi"}
              >
                {showPassword ? <EyeSlashIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-[#1A120B] hover:bg-[#2A1D13] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? (
              <span>Memverifikasi Sandi...</span>
            ) : (
              <>
                <span>Masuk ke Aplikasi</span>
                <ArrowRightIcon className="w-4 h-4 text-[#C89B3C]" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-stone-400 font-normal">
          Autentikasi diamankan dengan tanda tangan HMAC-SHA256
        </div>
      </div>
    </div>
  );
};
