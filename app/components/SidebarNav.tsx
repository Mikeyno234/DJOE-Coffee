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
  ArrowRightOnRectangleIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
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

interface NavItem {
  key: TabPermission;
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavGroup {
  id: string;
  title: string;
  items: NavItem[];
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

  // Structured declarative navigation groups
  const navGroups: NavGroup[] = [
    {
      id: "pos",
      title: "Operasional Kasir",
      items: [
        {
          key: "pos",
          href: "/pos",
          label: "Kasir POS",
          icon: ShoppingBagIcon,
          badge: "Utama",
        },
      ],
    },
    {
      id: "catalog",
      title: "Katalog & Resep",
      items: [
        {
          key: "list",
          href: "/menu",
          label: "Daftar Menu",
          icon: ListBulletIcon,
        },
        {
          key: "calc",
          href: "/calculator",
          label: "Kalkulator HPP",
          icon: CalculatorIcon,
        },
        {
          key: "categories",
          href: "/categories",
          label: "Kategori Produk",
          icon: TagIcon,
        },
      ],
    },
    {
      id: "admin",
      title: "Laporan & Manajemen",
      items: [
        {
          key: "dash",
          href: "/dashboard",
          label: "Laporan & COGS",
          icon: ChartBarIcon,
        },
        {
          key: "users",
          href: "/users",
          label: "Kelola Pengguna",
          icon: UserGroupIcon,
        },
      ],
    },
  ];

  // Flattened items for mobile navigation
  const allPermittedItems = navGroups
    .flatMap((group) => group.items)
    .filter((item) => hasPermission(item.key));

  const handleNavClick = (e: React.MouseEvent, item: NavItem) => {
    if (setActiveTab) {
      e.preventDefault();
      if (typeof window !== "undefined") {
        window.history.pushState({}, "", item.href);
      }
      setActiveTab(item.key);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return "Super Admin";
      case "ADMIN":
        return "Administrator";
      case "CASHIER":
        return "Kasir";
      default:
        return role;
    }
  };

  return (
    <>
      {/* Mobile Top Header */}
      <header className="no-print lg:hidden bg-[#1A120B] text-white sticky top-0 z-40 border-b border-stone-800/90 px-4 py-2.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#2D1F15] p-1 border border-[#C89B3C]/30 flex items-center justify-center shrink-0">
            <img
              src="/images/Logo/logo.png"
              alt="DJOE COFFEE"
              className="w-full h-full object-contain rounded"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="font-extrabold text-xs text-white tracking-wide">DJOE COFFEE</h1>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            </div>
            <span className="text-[9px] text-[#C89B3C] font-semibold tracking-wider uppercase block">
              {getRoleLabel(currentUser.role)}
            </span>
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
            className="flex items-center gap-1.5 bg-stone-900/90 hover:bg-stone-800 px-2.5 py-1.5 rounded-xl text-[11px] font-semibold cursor-pointer active:scale-95 transition-all text-stone-200 border border-stone-800"
            title="Profil Saya"
          >
            <div className="w-5 h-5 rounded-full bg-[#C89B3C] text-[#1A120B] flex items-center justify-center font-bold text-[10px] overflow-hidden shrink-0">
              {currentUser.avatar_url ? (
                <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
              ) : (
                <span>{currentUser.name.charAt(0).toUpperCase()}</span>
              )}
            </div>
            <span className="truncate max-w-[80px]">{currentUser.name.split(" ")[0]}</span>
          </button>
          <button
            onClick={onLogout}
            className="p-1.5 rounded-xl bg-rose-950/50 hover:bg-rose-900/70 text-rose-300 border border-rose-900/40 cursor-pointer transition-colors"
            title="Keluar"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="no-print lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#1A120B]/95 backdrop-blur-md border-t border-stone-800/90 flex items-center justify-around py-2 px-1 shadow-2xl">
        {allPermittedItems.map((item) => {
          const Icon = item.icon;
          const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
          const isActive = activeTab ? activeTab === item.key : currentPath === item.href;
          return (
            <Link
              key={item.key}
              href={item.href}
              onClick={(e) => handleNavClick(e, item)}
              className={`flex flex-col items-center justify-center flex-1 py-1 px-1 rounded-xl transition-all cursor-pointer ${
                isActive ? "text-[#C89B3C] font-bold scale-105" : "text-stone-400 hover:text-stone-200"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-[#C89B3C]" : "text-stone-400"}`} />
              <span className="text-[9px] truncate max-w-[56px] tracking-tight">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Desktop Sidebar Navigation */}
      <aside className="no-print hidden lg:flex bg-[#1A120B] text-stone-200 w-64 flex-col justify-between z-40 border-r border-stone-800/80 h-screen sticky top-0 shadow-xl">
        <div className="p-4 space-y-6 flex-1 overflow-y-auto">
          {/* Modern Horizontal Brand Header */}
          <div className="flex items-center gap-3 px-2 py-2.5 rounded-2xl bg-[#2D1F15]/40 border border-stone-800/60">
            <div className="w-10 h-10 rounded-xl bg-white p-1 border border-[#C89B3C]/40 shadow-xs flex items-center justify-center shrink-0">
              <img
                src="/images/Logo/logo.png"
                alt="DJOE COFFEE"
                className="w-full h-full object-contain rounded-lg"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <h1 className="font-extrabold text-sm tracking-tight text-white truncate">
                  DJOE <span className="text-[#C89B3C]">COFFEE</span>
                </h1>
                <span className="w-2 h-2 rounded-full bg-emerald-400 shrink-0" title="Sistem Online" />
              </div>
              <p className="text-[10px] text-stone-400 font-medium tracking-wide uppercase truncate mt-0.5">
                POS & HPP Studio
              </p>
            </div>
          </div>

          {/* Declarative Clean Navigation Groups */}
          <nav className="space-y-5">
            {navGroups.map((group) => {
              const visibleItems = group.items.filter((item) => hasPermission(item.key));
              if (visibleItems.length === 0) return null;

              return (
                <div key={group.id} className="space-y-1.5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500 px-3 select-none">
                    {group.title}
                  </p>
                  <div className="space-y-0.5">
                    {visibleItems.map((item) => {
                      const Icon = item.icon;
                      const currentPath = typeof window !== "undefined" ? window.location.pathname : pathname;
                      const isActive = activeTab ? activeTab === item.key : currentPath === item.href;

                      return (
                        <Link
                          key={item.key}
                          href={item.href}
                          onClick={(e) => handleNavClick(e, item)}
                          className={`w-full px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-150 flex items-center justify-between cursor-pointer group ${
                            isActive
                              ? "bg-[#C89B3C]/15 text-white border border-[#C89B3C]/30 shadow-xs"
                              : "text-stone-400 hover:text-stone-100 hover:bg-stone-800/50 border border-transparent"
                          }`}
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Icon
                              className={`w-4 h-4 shrink-0 transition-colors ${
                                isActive
                                  ? "text-[#C89B3C]"
                                  : "text-stone-500 group-hover:text-stone-300"
                              }`}
                            />
                            <span className="truncate">{item.label}</span>
                          </div>

                          {item.badge && (
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
                                isActive
                                  ? "bg-[#C89B3C] text-[#1A120B]"
                                  : "bg-stone-800 text-stone-400"
                              }`}
                            >
                              {item.badge}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Session Footer */}
        <div className="p-3 border-t border-stone-800/80 bg-stone-950/60 shrink-0">
          <div className="flex items-center justify-between gap-2 p-1.5 rounded-xl bg-stone-900/40 border border-stone-800/40">
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
              title="Kelola Profil Akun"
            >
              <div className="w-8 h-8 rounded-lg bg-[#2D1F15] text-[#C89B3C] border border-[#C89B3C]/30 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden shadow-xs">
                {currentUser.avatar_url ? (
                  <img src={currentUser.avatar_url} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span>{currentUser.name.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="min-w-0 flex-1 text-left">
                <p className="text-xs font-bold text-white group-hover:text-[#C89B3C] transition-colors truncate leading-tight">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[10px] text-stone-400 font-medium truncate leading-tight">
                    {getRoleLabel(currentUser.role)}
                  </span>
                </div>
              </div>
            </Link>

            <button
              onClick={onLogout}
              className="p-2 rounded-lg text-stone-400 hover:text-rose-300 hover:bg-rose-950/60 transition-colors cursor-pointer shrink-0 border border-transparent hover:border-rose-900/50"
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
