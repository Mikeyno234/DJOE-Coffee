"use client";

import React from "react";
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
} from "@heroicons/react/24/solid";
import { TabPermission } from "@/lib/models/user";


interface SidebarNavProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
    permissions: TabPermission[];
    avatar_url?: string;
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

  return (
    <>
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
            onClick={(e) => {
              if (setActiveTab) {
                e.preventDefault();
                if (typeof window !== "undefined") {
                  window.history.pushState({}, "", `/profile?id=${currentUser.id}`);
                }
                setActiveTab("profile");
              }
            }}
            className="flex items-center gap-1.5 bg-[#3d2a0e] hover:bg-[#6e4b1b] px-2.5 py-1 rounded-xl text-[11px] font-bold cursor-pointer active:scale-95 transition-all text-white border border-amber-500/20"
            title="Profil Saya"
          >
            <div className="w-4 h-4 rounded-full bg-[#F0BB78] text-[#543A14] flex items-center justify-center font-black text-[9px] overflow-hidden shrink-0">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
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

      <aside className="no-print hidden lg:flex bg-[#543A14] text-white w-64 flex-col justify-between z-40 border-r border-[#F0BB78]/20 h-screen sticky top-0 shadow-xl">
        <div className="p-5 space-y-6 flex-1 overflow-y-auto">
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

          <nav className="space-y-1.5">
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

        <div className="p-3 border-t border-amber-900/60 bg-[#3d2a0e]/40 shrink-0">
          <div className="flex items-center justify-between gap-2 p-2 rounded-2xl hover:bg-white/10 transition-colors">
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
              className="flex items-center gap-2.5 min-w-0 flex-1 group cursor-pointer"
              title="Buka Profil Saya"
            >
              <div className="w-8 h-8 rounded-full bg-[#F0BB78] text-[#543A14] flex items-center justify-center font-black text-xs shrink-0 overflow-hidden shadow-sm">
                {currentUser.avatar_url ? (
                  <img
                    src={currentUser.avatar_url}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-white group-hover:text-[#F0BB78] transition-colors truncate leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-amber-200/70 font-medium truncate leading-tight mt-0.5">
                  {currentUser.role === "SUPER_ADMIN" ? "Super Admin" : currentUser.role === "ADMIN" ? "Admin" : "Kasir"}
                </p>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="p-2 rounded-xl text-amber-200/80 hover:text-white hover:bg-rose-900/50 transition-colors cursor-pointer shrink-0"
              title="Keluar Sesi Akun"
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>




    </>
  );
};

