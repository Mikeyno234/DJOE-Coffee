"use client";

import React, { useState, useEffect } from "react";
import { SidebarNav } from "./SidebarNav";
import { DashboardView } from "./DashboardView";
import { POSView } from "./POSView";
import { CalculatorView } from "./CalculatorView";
import { MenuListView } from "./MenuListView";
import { UserManagementView } from "./UserManagementView";
import { UserProfileView } from "./UserProfileView";
import { CategoryManagementView } from "./CategoryManagementView";


import { ReceiptModal } from "./ReceiptModal";
import { LoginModal } from "./LoginModal";
import { Toast, ToastMessage } from "./Toast";
import { TabPermission } from "@/lib/models/user";
import { formatIDR } from "@/lib/utils/currency";


interface AppContainerProps {
  activeRoute?: TabPermission;
}

export default function AppContainer({ activeRoute = "pos" }: AppContainerProps) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    const newToast: ToastMessage = { id: String(Date.now() + Math.random()), type, text };
    setToasts((prev) => [newToast, ...prev.slice(0, 4)]);
  };

  const handleCloseToast = (id?: string) => {
    if (id) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    } else {
      setToasts([]);
    }
  };


  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: "SUPER_ADMIN" | "ADMIN" | "CASHIER";
    permissions: TabPermission[];
  } | null>(null);

  const [activeTab, setActiveTab] = useState<TabPermission>(activeRoute);

  useEffect(() => {
    if (activeRoute) setActiveTab(activeRoute);
  }, [activeRoute]);


  const [menus, setMenus] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [cart, setCart] = useState<{ id: string; name: string; price: number; hpp: number; qty: number }[]>([]);
  const [cashInput, setCashInput] = useState<string>("");
  const [selectedCat, setSelectedCat] = useState<string>("Semua");

  const [formMenuName, setFormMenuName] = useState("");
  const [formCategory, setFormCategory] = useState("Minuman");
  const [formMargin, setFormMargin] = useState(70);
  const [formManualPrice, setFormManualPrice] = useState("");
  const [formImageUrl, setFormImageUrl] = useState("");
  const [ingredients, setIngredients] = useState([
    { name: "Espresso", price: 180000, capacity: 1000, usage: 18 },
  ]);

  const [operational, setOperational] = useState([
    { name: "Cup", cost: 800 },
    { name: "Tutup", cost: 300 },
  ]);

  const [receiptTx, setReceiptTx] = useState<any>(null);
  const [printSize, setPrintSize] = useState<"58" | "80" | "a4">("58");
  const [exportType, setExportType] = useState<"catalogue" | "hpp_report">("hpp_report");
  const [storeConfig, setStoreConfig] = useState<any>(null);



  useEffect(() => {
    fetchSession();
    fetchMenus();
    fetchAnalytics();
    fetchStoreConfig();
  }, []);

  const fetchStoreConfig = async () => {
    try {
      const res = await fetch("/api/store");
      const json = await res.json();
      if (json.success) setStoreConfig(json.data);
    } catch {
      // fallback
    }
  };

  const fetchSession = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const json = await res.json();
      if (json.success && json.user) {
        setCurrentUser(json.user);
        setIsAuthenticated(true);
        const perms: TabPermission[] = json.user.permissions || [];
        if (perms.length > 0 && !perms.includes(activeTab)) {
          setActiveTab(perms[0]);
        }
      } else {
        setIsAuthenticated(false);
        setCurrentUser(null);
      }
    } catch {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  };

  const handleLoginSuccess = (user: any) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    showToast("success", `Selamat datang kembali, ${user.name}!`);
    const perms: TabPermission[] = user.permissions || [];
    if (perms.length > 0) {
      setActiveTab(perms[0]);
    } else {
      setActiveTab("pos");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setCart([]);
    setCashInput("");
    showToast("info", "Anda telah berhasil keluar dari akun.");
  };

  const fetchMenus = async () => {
    try {
      const res = await fetch("/api/menus");
      const json = await res.json();
      if (json.success) setMenus(json.data);
    } catch {
      // fallback
    }
  };

  const [analyticsRange, setAnalyticsRange] = useState<string>("7d");
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");

  const fetchAnalytics = async (
    range: string = analyticsRange,
    sDate: string = startDate,
    eDate: string = endDate
  ) => {
    try {
      let query = `/api/analytics?range=${range}`;
      if (sDate) query += `&start_date=${sDate}`;
      if (eDate) query += `&end_date=${eDate}`;

      const res = await fetch(query);
      const json = await res.json();
      if (json.success) setAnalytics(json.data);
    } catch {
      // fallback
    }
  };

  // Cart operations
  const addToCart = (menu: any) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) {
        return prev.map((item) => (item.id === menu.id ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: menu.id, name: menu.name, price: menu.selling_price, hpp: menu.hpp, qty: 1 }];
    });
    showToast("success", `${menu.name} ditambahkan ke keranjang`);
  };

  const updateCartQty = (id: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as any
    );
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const cashNum = parseFloat(cashInput.replace(/\./g, "")) || 0;
  const changeNum = cashNum >= cartTotal ? cashNum - cartTotal : 0;

  // Checkout Handler
  const handleCheckout = async () => {
    if (cart.length === 0) return showToast("error", "Keranjang belanja masih kosong!");
    if (cashNum < cartTotal) return showToast("error", "Uang diterima kurang dari total belanja!");

    const res = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: cart.map((c) => ({
          menu_id: c.id,
          menu_name: c.name,
          unit_price: c.price,
          unit_hpp: c.hpp || 0,
          quantity: c.qty,
        })),
        cash_received: cashNum,
        user_id: currentUser?.id,
        cashier_name: currentUser?.name,
      }),
    });

    const json = await res.json();
    if (json.success) {
      setReceiptTx(json.data);
      setCart([]);
      setCashInput("");
      fetchAnalytics();
      showToast("success", "Transaksi berhasil! Struk telah dicetak.");
    } else {
      showToast("error", "Checkout gagal: " + (json.error || "Terjadi kesalahan"));
    }
  };

  // Export PDF Handlers
  const handlePrintCatalogue = () => {
    setExportType("catalogue");
    const origTitle = document.title;
    document.title = "Katalog_Menu_Kedai_Kopi";
    setTimeout(() => {
      window.print();
      document.title = origTitle;
    }, 100);
  };

  const handlePrintHppReport = () => {
    setExportType("hpp_report");
    const origTitle = document.title;
    document.title = "Laporan_Internal_HPP_Kedai_Kopi";
    setTimeout(() => {
      window.print();
      document.title = origTitle;
    }, 100);
  };

  // Live HPP Calculations
  const totalIngCost = ingredients.reduce((sum, ing) => {
    const unitCost = ing.capacity > 0 ? (ing.price / ing.capacity) * ing.usage : 0;
    return sum + unitCost;
  }, 0);
  const totalOpCost = operational.reduce((sum, op) => sum + (Number(op.cost) || 0), 0);
  const computedHpp = totalIngCost + totalOpCost;
  const calculatedPrice = Math.ceil((computedHpp * (1 + formMargin / 100)) / 1000) * 1000;
  const finalPrice = formManualPrice ? parseFloat(formManualPrice) || 0 : calculatedPrice;
  const computedMargin = finalPrice > 0 ? Math.round(((finalPrice - computedHpp) / computedHpp) * 100) : 0;

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formMenuName) return showToast("error", "Nama menu wajib diisi!");

    const payload = {
      name: formMenuName,
      category_id: formCategory === "Minuman" ? "1" : formCategory === "Makanan" ? "2" : "3",
      category: formCategory,
      selling_price: finalPrice,
      is_manual_price: Boolean(formManualPrice),
      margin_percent: computedMargin,
      image_url: formImageUrl,
      ingredients: ingredients.map((ing) => ({
        name: ing.name,
        package_price: ing.price,
        package_capacity: ing.capacity,
        usage_amount: ing.usage,
      })),
      operational_costs: operational.map((op) => ({
        name: op.name,
        cost_amount: op.cost,
      })),
    };

    const res = await fetch("/api/menus", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      showToast("success", `Data menu "${formMenuName}" berhasil disimpan ke Supabase!`);
      setFormMenuName("");
      setFormManualPrice("");
      setFormImageUrl("");
      fetchMenus();
      fetchAnalytics();
      setActiveTab("list");
    } else {
      showToast("error", `Gagal menyimpan menu: ${json.error}`);
    }
  };

  const categories = [
    "Semua",
    "Milk Based",
    "Signature Menu",
    "Non - Coffee",
    "Classic and Manual Brew",
    "Snack",
    "Lainnya",
  ];


  const hasAccess = (tab: TabPermission) => {
    if (!currentUser) return false;
    if (!currentUser.permissions) return true;
    return currentUser.permissions.includes(tab);
  };

  // Mandatory Authentication Wall
  if (!isAuthenticated || !currentUser) {
    return <LoginModal onLoginSuccess={handleLoginSuccess} />;
  }

  const currentDateStr = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleEditMenu = (menu: any) => {
    setFormMenuName(menu.name);
    setFormCategory(menu.category || menu.category_name || "Minuman");
    setFormMargin(menu.margin_percent || 150);
    setFormManualPrice(String(menu.selling_price || 0));
    setActiveTab("calc");
  };

  const handleDeleteMenu = async (menuId: string | number) => {
    try {
      const res = await fetch(`/api/menus/${menuId}`, { method: "DELETE" });
      const json = await res.json();
      if (json.success) {
        setMenus((prev) => prev.filter((m) => String(m.id) !== String(menuId)));
        showToast("success", "Menu berhasil dihapus dari Supabase!");
      } else {
        showToast("error", `Gagal menghapus menu: ${json.error}`);
      }
    } catch {
      showToast("error", "Terjadi kesalahan koneksi ke server.");
    }
  };


  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#f2f0eb] text-[#1a0f07]">
      <SidebarNav
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onLogout={handleLogout}
      />

      <main className="flex-1 w-full mx-auto p-4 md:p-6 lg:p-8 pb-20 lg:pb-8 space-y-6 overflow-x-hidden">
        {activeTab === "dash" && hasAccess("dash") && (
          <DashboardView
            analytics={analytics}
            menusCount={menus.length}
            selectedRange={analyticsRange}
            startDate={startDate}
            endDate={endDate}
            onCustomFilterChange={(sDate, eDate) => {
              setStartDate(sDate);
              setEndDate(eDate);
              fetchAnalytics("custom", sDate, eDate);
            }}
            onRangeChange={(range) => {
              setAnalyticsRange(range);
              setStartDate("");
              setEndDate("");
              fetchAnalytics(range, "", "");
            }}
            onPrintCatalogue={handlePrintCatalogue}
            onPrintHppReport={handlePrintHppReport}
          />
        )}

        {activeTab === "pos" && hasAccess("pos") && (
          <POSView
            menus={menus}
            categories={categories}
            selectedCat={selectedCat}
            setSelectedCat={setSelectedCat}
            cart={cart}
            addToCart={addToCart}
            updateCartQty={updateCartQty}
            clearCart={() => setCart([])}
            cartTotal={cartTotal}
            cashInput={cashInput}
            setCashInput={setCashInput}
            cashNum={cashNum}
            changeNum={changeNum}
            handleCheckout={handleCheckout}
          />
        )}

        {activeTab === "calc" && hasAccess("calc") && (
          <CalculatorView
            formMenuName={formMenuName}
            setFormMenuName={setFormMenuName}
            formCategory={formCategory}
            setFormCategory={setFormCategory}
            formMargin={formMargin}
            setFormMargin={setFormMargin}
            formManualPrice={formManualPrice}
            setFormManualPrice={setFormManualPrice}
            formImageUrl={formImageUrl}
            setFormImageUrl={setFormImageUrl}
            ingredients={ingredients}
            setIngredients={setIngredients}
            operational={operational}
            setOperational={setOperational}
            computedHpp={computedHpp}
            calculatedPrice={calculatedPrice}
            computedMargin={computedMargin}
            handleSaveMenu={handleSaveMenu}
            onPrintHppReport={handlePrintHppReport}
            onShowToast={showToast}
          />
        )}

        {activeTab === "list" && hasAccess("list") && (
          <MenuListView
            menus={menus}
            onAddNewMenu={() => setActiveTab("calc")}
            onAddMenu={(newMenu) => {
              setMenus((prev) => [newMenu, ...prev]);
              fetchMenus();
              fetchAnalytics();
            }}
            onUpdateMenu={(updated) => {
              setMenus((prev) => {
                const exists = prev.some((m) => String(m.id) === String(updated.id));
                if (exists) {
                  return prev.map((m) => (String(m.id) === String(updated.id) ? { ...m, ...updated } : m));
                }
                return [updated, ...prev];
              });
              fetchMenus();
              fetchAnalytics();
            }}
            onDeleteMenu={handleDeleteMenu}
            onPrintCatalogue={handlePrintCatalogue}
            onPrintHppReport={handlePrintHppReport}
            onShowToast={showToast}
          />
        )}

        {activeTab === "categories" && hasAccess("categories") && (
          <CategoryManagementView />
        )}

        {activeTab === "users" && hasAccess("users") && (
          <UserManagementView currentUser={currentUser} />
        )}

        {activeTab === "profile" && (
          <UserProfileView currentUser={currentUser} onLogout={handleLogout} onShowToast={showToast} />
        )}
      </main>

      <ReceiptModal
        receiptTx={receiptTx}
        storeConfig={storeConfig}
        printSize={printSize}
        setPrintSize={setPrintSize}
        onClose={() => setReceiptTx(null)}
      />

      {!receiptTx && (
        <div id="printArea-portal">
          <div id="printArea" className="hidden">
            {exportType === "catalogue" ? (
              <>
                <h2 style={{ marginBottom: "0.2rem", fontWeight: "bold", fontSize: "1.3rem" }}>
                  Katalog Menu & Daftar Harga - {storeConfig?.store_name || "Kedai Kopi"}
                </h2>
                <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {currentDateStr} • Silakan pesan menu favorit Anda
                </p>
                <table
                  border={1}
                  cellPadding={8}
                  cellSpacing={0}
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}
                >
                  <thead>
                    <tr style={{ background: "#006241", color: "#ffffff" }}>
                      <th style={{ textAlign: "center", width: "60px" }}>Foto</th>
                      <th style={{ textAlign: "left" }}>Nama Menu</th>
                      <th style={{ textAlign: "left" }}>Kategori</th>
                      <th style={{ textAlign: "right" }}>Harga Jual</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((m) => (
                      <tr key={m.id}>
                        <td style={{ textAlign: "center", verticalAlign: "middle" }}>
                          {m.image_url ? (
                            <img
                              src={m.image_url}
                              alt={m.name}
                              style={{
                                width: "44px",
                                height: "44px",
                                objectFit: "contain",
                                borderRadius: "8px",
                                display: "block",
                                margin: "0 auto",
                                mixBlendMode: "multiply",
                                filter: "contrast(1.05)",
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: "0.9rem", color: "#666" }}>Menu</div>
                          )}
                        </td>
                        <td style={{ fontWeight: "bold", verticalAlign: "middle" }}>{m.name}</td>
                        <td style={{ verticalAlign: "middle" }}>{m.category || m.category_name}</td>
                        <td style={{ textAlign: "right", fontWeight: "bold", verticalAlign: "middle", color: "#006241" }}>
                          {formatIDR(m.selling_price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            ) : (
              <>
                <h2 style={{ marginBottom: "0.2rem", fontWeight: "bold", fontSize: "1.3rem" }}>
                  Export Laporan Internal & Profitabilitas Menu - {storeConfig?.store_name || "Kedai Kopi"}
                </h2>

                <p style={{ color: "#666", fontSize: "0.85rem", marginBottom: "1rem" }}>
                  {currentDateStr} • Rahasia Internal • Dicetak oleh: {currentUser.name} ({currentUser.role})
                </p>
                <table
                  border={1}
                  cellPadding={8}
                  cellSpacing={0}
                  style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}
                >
                  <thead>
                    <tr style={{ background: "#f0e6d8" }}>
                      <th>Menu</th>
                      <th>Kategori</th>
                      <th>HPP (Modal)</th>
                      <th>Harga Jual</th>
                      <th>Margin (%)</th>
                      <th>Profit / Porsi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {menus.map((m) => (
                      <tr key={m.id}>
                        <td style={{ fontWeight: "bold" }}>{m.name}</td>
                        <td>{m.category || m.category_name}</td>
                        <td>{formatIDR(m.hpp)}</td>
                        <td style={{ fontWeight: "bold" }}>{formatIDR(m.selling_price)}</td>
                        <td>+{m.margin_percent}%</td>
                        <td style={{ fontWeight: "bold", color: "#2d6a4f" }}>+{formatIDR(m.selling_price - m.hpp)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
            )}
          </div>
        </div>
      )}


      <Toast toasts={toasts} onClose={handleCloseToast} />
    </div>
  );
}




