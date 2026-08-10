"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CalculatorIcon,
  ListBulletIcon,
  TagIcon,
  UserGroupIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
  XMarkIcon,
  EnvelopeIcon,
  PencilSquareIcon,
  KeyIcon,
} from "@heroicons/react/24/solid";
import { TabPermission } from "@/lib/models/user";

interface SidebarNavProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
    permissions: TabPermission[];
  };
  activeTab?: TabPermission;
  setActiveTab?: (tab: TabPermission) => void;
  onLogout: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const pathname = usePathname();
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // Self Profile Form State
  const [editName, setEditName] = useState(currentUser.name);
  const [editPassword, setEditPassword] = useState("");
  const [saveStatus, setSaveStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const hasPermission = (tabKey: TabPermission) => {
    if (!currentUser.permissions) return true;
    return currentUser.permissions.includes(tabKey);
  };

  const navItems = [
    { key: "pos" as TabPermission, href: "/pos", label: "Kasir POS", icon: ShoppingBagIcon },
    { key: "dash" as TabPermission, href: "/dashboard", label: "Dashboard", icon: ChartBarIcon },
    { key: "calc" as TabPermission, href: "/calculator", label: "Hitung HPP", icon: CalculatorIcon },
    { key: "list" as TabPermission, href: "/menu", label: "Daftar Menu", icon: ListBulletIcon },
    { key: "categories" as TabPermission, href: "/categories", label: "Master Kategori", icon: TagIcon },
    { key: "users" as TabPermission, href: "/users", label: "Users", icon: UserGroupIcon },
  ];


  const handleNavClick = (e: React.MouseEvent, item: typeof navItems[0]) => {
    if (setActiveTab) {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", item.href);
      }
      setActiveTab(item.key);
    }
  };

  const handleSaveSelfProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveStatus("");

    try {
      const res = await fetch("/api/auth/me", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: currentUser.id,
          name: editName,
          ...(editPassword ? { password: editPassword } : {}),
        }),
      });

      const json = await res.json();
      if (json.success && json.user) {
        currentUser.name = json.user.name;
        setSaveStatus("✓ Profil Anda berhasil diperbarui!");
        setTimeout(() => {
          setIsEditingProfile(false);
          setSaveStatus("");
        }, 1200);
      } else {
        setSaveStatus(`⚠️ ${json.error || "Gagal menyimpan profil."}`);
      }
    } catch {
      setSaveStatus("⚠️ Terjadi kesalahan koneksi server.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* 1. Mobile Top Header Bar (lg:hidden) */}

      <header className="no-print lg:hidden bg-[#543A14] text-white sticky top-0 z-40 border-b border-[#F0BB78]/20 px-4 py-2.5 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 border-2 border-[#F0BB78] shadow-md flex items-center justify-center shrink-0">
            <img
              src="/images/logo.jpeg"
              alt="DJOE COFFEE"
              className="w-full h-full object-contain rounded-full"
            />
          </div>


          <div>
            <h1 className="font-black text-xs leading-none text-white tracking-wide">DJOE COFFEE</h1>
            <span className="text-[9px] text-[#F0BB78] font-extrabold uppercase">{currentUser.role}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditName(currentUser.name);
              setIsEditingProfile(false);
              setProfileModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#6e4b1b] hover:bg-[#543A14] px-2.5 py-1 rounded-xl text-[11px] font-bold border border-amber-500/30 cursor-pointer active:scale-95 transition-all"
          >
            <UserIcon className="w-3.5 h-3.5 text-amber-300" />
            <span className="truncate max-w-[90px]">{currentUser.name.split(" ")[0]}</span>
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-xl bg-rose-900/60 hover:bg-rose-800 text-rose-100 cursor-pointer"
            title="Keluar"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* 2. Mobile Bottom Navigation Bar */}
      <div className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#543A14] border-t border-[#F0BB78]/30 flex items-center justify-around py-2 px-1 shadow-2xl backdrop-blur-md">
        {navItems.map((item) => {
          if (!hasPermission(item.key)) return null;
          const Icon = item.icon;
          const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
          const isActive = activeTab ? activeTab === item.key : currentPath === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-[#F0BB78] font-black scale-105" : "text-amber-200/70 hover:text-white"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#F0BB78]" : "text-amber-300/80"}`} />
              <span className="text-[9px] truncate max-w-[64px] font-bold">{item.label}</span>
            </Link>
          );
        })}
      </div>

      {/* 3. Desktop & Tablet Left Sidebar */}
      <aside className="no-print hidden lg:flex bg-[#543A14] text-white w-64 flex-col justify-between z-40 border-r border-[#F0BB78]/20 h-screen sticky top-0 shadow-xl">
        <div className="p-5 space-y-5">
          {/* Brand Header Centered */}
          <div className="flex flex-col items-center text-center pb-4 border-b border-amber-900/60 space-y-2">
            <div className="w-20 h-20 rounded-full bg-white p-1.5 border-2 border-[#F0BB78] shadow-2xl flex items-center justify-center shrink-0 transform hover:scale-105 transition-transform duration-300">
              <img
                src="/images/logo.jpeg"
                alt="DJOE COFFEE"
                className="w-full h-full object-contain rounded-full"
              />
            </div>
            <div>
              <h1 className="font-black text-lg leading-tight tracking-tight text-white flex items-center justify-center gap-1.5">
                DJOE <span className="text-[#F0BB78]">COFFEE</span>
              </h1>
              <p className="text-[10px] text-amber-200/90 font-bold uppercase tracking-wider text-center mt-0.5">
                HPP & Retail OS
              </p>

            </div>
          </div>



          {/* User Profile Card (Navigates to /profile?id=usr-xxx page route) */}
          <Link
            href={`/profile?id=${currentUser.id}`}
            onClick={(e) => {
              if (setActiveTab) {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", `/profile?id=${currentUser.id}`);
                }
                setActiveTab("profile");
              }
            }}
            className={`p-3 border rounded-2xl cursor-pointer transition-all duration-200 shadow-md group transform hover:-translate-y-0.5 block ${
              pathname.startsWith("/profile") || activeTab === "profile"
                ? "bg-[#F0BB78] border-[#F0BB78] text-[#543A14]"
                : "bg-[#6e4b1b]/60 hover:bg-[#6e4b1b] border-amber-500/40"
            }`}
            title="Klik untuk membuka Halaman Profil Saya"
          >
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-[#543A14] group-hover:bg-[#3d2a0e] flex items-center justify-center text-amber-200 border border-amber-400/40 shadow-sm transition-colors">
                <UserIcon className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black truncate leading-tight group-hover:text-amber-200 transition-colors">
                  {currentUser.name}
                </p>
                <span
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[8px] font-black tracking-wider uppercase mt-1 ${
                    currentUser.role === "SUPER_ADMIN"
                      ? "bg-[#3d2a0e] text-[#F0BB78]"
                      : currentUser.role === "ADMIN"
                      ? "bg-amber-800 text-white"
                      : "bg-amber-600 text-white"
                  }`}
                >
                  <ShieldCheckIcon className="w-2.5 h-2.5" />
                  {currentUser.role}
                </span>
              </div>
            </div>
          </Link>

          {/* Sidebar Navigation Links */}
          <nav className="space-y-1.5 pt-1">
            <p className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300/60 px-3 mb-2">
              Menu Utama
            </p>
            {navItems.map((item) => {
              if (!hasPermission(item.key)) return null;
              const Icon = item.icon;
              const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
              const isActive = activeTab ? activeTab === item.key : currentPath === item.href;
              return (
                <Link
                  key={item.key}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item)}
                  className={`w-full px-4 py-3 rounded-2xl text-xs font-extrabold transition-all duration-200 flex items-center gap-3 cursor-pointer ${
                    isActive
                      ? "bg-[#F0BB78] text-[#543A14] shadow-lg shadow-amber-900/30 transform translate-x-1"
                      : "text-amber-100 hover:text-white hover:bg-[#6e4b1b]/70"
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? "text-[#543A14]" : "text-amber-300"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Logout Action */}

        <div className="p-4 border-t border-emerald-800/80 m-3">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-2xl text-xs font-extrabold bg-rose-900/60 hover:bg-rose-800 transition-all text-rose-100 border border-rose-500/30 cursor-pointer active:scale-95 flex items-center justify-center gap-2 shadow-sm"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-200" />
            <span>Keluar Akun</span>
          </button>
        </div>
      </aside>

      {/* Interactive User Profile & Self-Edit Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] bg-[#1E3932]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in no-print overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl space-y-4 border border-[#cba258]/30 animate-scale-in relative max-h-[90vh] overflow-y-auto my-auto">

            <div className="flex justify-between items-center border-b border-stone-200 pb-3 sticky top-0 bg-white z-10">

              <h3 className="font-black text-sm text-[#1E3932] flex items-center gap-2">
                <UserIcon className="w-4 h-4 text-[#006241]" />
                <span>Profil Saya & Pengaturan Akun</span>
              </h3>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            {saveStatus && (
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[11px] font-bold animate-slide-up">
                {saveStatus}
              </div>
            )}

            {!isEditingProfile ? (
              /* View Profile Mode */
              <div className="space-y-4">
                <div className="text-center space-y-2 pt-1">
                  <div className="w-16 h-16 rounded-2xl bg-[#006241] text-amber-300 flex items-center justify-center mx-auto shadow-md border-2 border-[#cba258]">
                    <UserIcon className="w-9 h-9" />
                  </div>
                  <div>
                    <h4 className="font-black text-base text-[#1E3932]">{currentUser.name}</h4>
                    <p className="text-xs text-stone-500 font-medium flex items-center justify-center gap-1">
                      <EnvelopeIcon className="w-3.5 h-3.5 text-stone-400" />
                      <span>{currentUser.email}</span>
                    </p>
                  </div>
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wider uppercase border shadow-2xs ${
                        currentUser.role === "SUPER_ADMIN"
                          ? "bg-[#cba258] text-[#1E3932] border-[#cba258]"
                          : currentUser.role === "ADMIN"
                          ? "bg-[#006241] text-white border-[#006241]"
                          : "bg-amber-700 text-white border-amber-800"
                      }`}
                    >
                      <ShieldCheckIcon className="w-4 h-4" />
                      {currentUser.role}
                    </span>
                  </div>
                </div>

                <div className="bg-stone-50 p-3 rounded-2xl border border-stone-200 space-y-1.5">
                  <p className="text-[10px] font-extrabold uppercase tracking-widest text-stone-400">
                    Akses Halaman Terdaftar:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {navItems.map((item) => {
                      const allowed = hasPermission(item.key);
                      const Icon = item.icon;
                      return (
                        <span
                          key={item.key}
                          className={`px-2 py-0.5 rounded-lg text-[10px] font-extrabold flex items-center gap-1 ${
                            allowed
                              ? "bg-emerald-100 text-[#006241] border border-emerald-300"
                              : "bg-stone-200 text-stone-400 line-through opacity-50"
                          }`}
                        >
                          <Icon className="w-3 h-3" />
                          <span>{item.label}</span>
                        </span>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="w-full py-2.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-extrabold text-xs rounded-2xl border border-stone-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <PencilSquareIcon className="w-4 h-4 text-[#006241]" />
                  <span>Edit Nama & Kata Sandi Saya</span>
                </button>
              </div>
            ) : (
              /* Self-Edit Form Mode */
              <form onSubmit={handleSaveSelfProfile} className="space-y-3.5 animate-slide-up">
                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1">Nama Lengkap Anda</label>
                  <input
                    type="text"
                    required
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#006241] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-700 mb-1 flex items-center gap-1">
                    <KeyIcon className="w-3.5 h-3.5 text-stone-400" />
                    <span>Kata Sandi Baru (Opsional)</span>
                  </label>
                  <input
                    type="password"
                    value={editPassword}
                    onChange={(e) => setEditPassword(e.target.value)}
                    placeholder="Kosongkan jika tidak diubah"
                    className="w-full px-3.5 py-2.5 border border-stone-300 rounded-xl text-xs font-semibold focus:ring-2 focus:ring-[#006241] outline-none"
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditingProfile(false)}
                    className="flex-1 py-2.5 border border-stone-300 rounded-2xl font-bold text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 bg-[#006241] hover:bg-[#1E3932] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all active:scale-95 disabled:opacity-50"
                  >
                    {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
                  </button>
                </div>
              </form>
            )}

            {/* Modal Footer */}
            {!isEditingProfile && (
              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2.5 border border-stone-300 rounded-2xl font-bold text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Tutup
                </button>
                <button
                  onClick={() => {
                    setProfileModalOpen(false);
                    onLogout();
                  }}
                  className="flex-1 py-2.5 bg-rose-700 hover:bg-rose-800 text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <ArrowRightOnRectangleIcon className="w-4 h-4" />
                  <span>Keluar Akun</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
};
