"use client";

import React from "react";
import {
  ChartBarIcon,
  ShoppingBagIcon,
  CalculatorIcon,
  ListBulletIcon,
  UserGroupIcon,
  UserIcon,
  ArrowRightOnRectangleIcon,
  ShieldCheckIcon,
  SparklesIcon,
  BuildingStorefrontIcon,
} from "@heroicons/react/24/solid";
import { TabPermission } from "@/lib/models/user";

interface HeaderNavProps {
  currentUser: {
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
    permissions: TabPermission[];
    avatar_url?: string;
  };

  activeTab: "dash" | "pos" | "calc" | "list" | "users";
  setActiveTab: (tab: "dash" | "pos" | "calc" | "list" | "users") => void;
  onLogout: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentUser,
  activeTab,
  setActiveTab,
  onLogout,
}) => {
  const hasPermission = (tabKey: TabPermission) => {
    if (!currentUser.permissions) return true;
    return currentUser.permissions.includes(tabKey);
  };

  return (
    <header className="no-print bg-[#543A14] text-white shadow-lg sticky top-0 z-40 border-b border-[#F0BB78]/20">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-white p-1 border border-[#F0BB78]/60 shadow-md flex items-center justify-center shrink-0 transform hover:scale-105 transition-transform duration-300">
            <img
              src="/images/logo.jpeg"
              alt="DJOE COFFEE Logo"
              className="w-full h-full object-contain rounded-xl"
            />
          </div>

          <div>
            <h1 className="font-extrabold text-base leading-tight tracking-tight text-white flex items-center gap-2">
              DJOE COFFEE{" "}
              <span className="text-[#543A14] text-[10px] px-2 py-0.5 rounded-full bg-[#F0BB78] font-extrabold border border-amber-300/40 uppercase tracking-wider">
                Full POS & HPP
              </span>

            </h1>
            <p className="text-[11px] text-amber-200/80 font-medium">RBAC System • Super Admin Edition</p>
          </div>
        </div>

        {/* User Badge, Role Indicator & Logout Button */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 bg-[#6e4b1b]/70 px-3 py-1.5 rounded-2xl text-xs shadow-inner">
            {currentUser.avatar_url ? (
              <img
                src={currentUser.avatar_url}
                alt={currentUser.name}
                className="w-5 h-5 rounded-full object-cover border border-amber-300/60"
              />
            ) : (
              <UserIcon className="w-4 h-4 text-amber-300" />
            )}
            <span className="font-semibold text-amber-50">{currentUser.name}</span>

            <span
              className={`px-2 py-0.5 rounded-lg text-[10px] font-black tracking-wider uppercase flex items-center gap-1 shadow-sm ${
                currentUser.role === "SUPER_ADMIN"
                  ? "bg-[#F0BB78] text-[#543A14]"
                  : currentUser.role === "ADMIN"
                  ? "bg-amber-800 text-white"
                  : "bg-amber-600 text-white"
              }`}
            >
              <ShieldCheckIcon className="w-3 h-3" />
              {currentUser.role}
            </span>
          </div>

          <button
            onClick={onLogout}
            className="p-1.5 sm:px-3 sm:py-1.5 rounded-xl text-xs font-bold bg-rose-900/60 hover:bg-rose-800 transition-all text-rose-100 border border-rose-500/30 cursor-pointer active:scale-95 flex items-center gap-1.5 shadow-sm"
            title="Keluar Akun"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4 text-rose-200" />
            <span className="hidden sm:inline">Keluar</span>
          </button>
        </div>

        {/* Dynamic Permission-based Navigation Tabs */}
        <nav className="flex space-x-1.5 bg-[#3d2a0e] p-1 rounded-2xl border border-amber-500/30 w-full sm:w-auto justify-center">
          {hasPermission("dash") && (
            <button
              onClick={() => setActiveTab("dash")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "dash"
                  ? "bg-[#F0BB78] text-[#543A14] shadow-md transform scale-105"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <ChartBarIcon className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          )}

          {hasPermission("pos") && (
            <button
              onClick={() => setActiveTab("pos")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "pos"
                  ? "bg-[#F0BB78] text-[#543A14] shadow-md transform scale-105"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <ShoppingBagIcon className="w-4 h-4" />
              <span>Kasir POS</span>
            </button>
          )}

          {hasPermission("calc") && (
            <button
              onClick={() => setActiveTab("calc")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "calc"
                  ? "bg-[#F0BB78] text-[#543A14] shadow-md transform scale-105"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <CalculatorIcon className="w-4 h-4" />
              <span>Hitung HPP</span>
            </button>
          )}

          {hasPermission("list") && (
            <button
              onClick={() => setActiveTab("list")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "list"
                  ? "bg-[#F0BB78] text-[#543A14] shadow-md transform scale-105"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
              <span>Daftar Menu</span>
            </button>
          )}

          {hasPermission("users") && (
            <button
              onClick={() => setActiveTab("users")}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all duration-200 flex items-center gap-1.5 cursor-pointer active:scale-95 ${
                activeTab === "users"
                  ? "bg-[#F0BB78] text-[#543A14] shadow-md transform scale-105"
                  : "text-amber-100 hover:text-white hover:bg-white/10"
              }`}
            >
              <UserGroupIcon className="w-4 h-4" />
              <span>Users</span>
            </button>
          )}
        </nav>

      </div>
    </header>
  );
};
