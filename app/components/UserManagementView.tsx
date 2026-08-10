"use client";

import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  ShieldCheckIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  ListBulletIcon,
  ChartBarIcon,
  UserIcon,
} from "@heroicons/react/24/solid";
import { User, Role, TabPermission } from "@/lib/models/user";
import { ConfirmModal } from "./ConfirmModal";
import { Toast, ToastMessage } from "@/app/components/Toast";

interface UserManagementViewProps {
  currentUser: any;
}


const AVAILABLE_PERMISSIONS: { key: TabPermission; label: string; icon: any }[] = [
  { key: "dash", label: "Dashboard", icon: ChartBarIcon },
  { key: "pos", label: "Kasir POS", icon: BuildingStorefrontIcon },
  { key: "calc", label: "Hitung HPP", icon: CalculatorIcon },
  { key: "list", label: "Daftar Menu", icon: ListBulletIcon },
  { key: "users", label: "User Management", icon: UserGroupIcon },
];

export const UserManagementView: React.FC<UserManagementViewProps> = ({ currentUser }) => {
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const showToast = (type: "success" | "error" | "info", text: string) => {
    setToast({ id: String(Date.now()), type, text });
  };

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  // Form State
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formRole, setFormRole] = useState<Role>("CASHIER");
  const [formPermissions, setFormPermissions] = useState<TabPermission[]>(["pos"]);
  const [errorMsg, setErrorMsg] = useState("");

  // Custom Delete Modal State
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [targetUser, setTargetUser] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users");
      const json = await res.json();
      if (json.success) setUsers(json.data);
    } catch {
      // fallback
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingUserId(null);
    setFormName("");
    setFormEmail("");
    setFormPassword("");
    setFormRole("CASHIER");
    setFormPermissions(["pos"]);
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(user.id);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormPermissions(user.permissions || ["pos"]);
    setErrorMsg("");
    setModalOpen(true);
  };

  const togglePermission = (perm: TabPermission) => {
    if (formPermissions.includes(perm)) {
      setFormPermissions(formPermissions.filter((p) => p !== perm));
    } else {
      setFormPermissions([...formPermissions, perm]);
    }
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    const payload = {
      ...(editingUserId ? { id: editingUserId } : {}),
      name: formName,
      email: formEmail,
      ...(formPassword ? { password: formPassword } : {}),
      role: formRole,
      permissions: formPermissions,
    };

    const method = editingUserId ? "PUT" : "POST";
    const res = await fetch("/api/users", {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const json = await res.json();
    if (json.success) {
      setModalOpen(false);
      showToast(
        "success",
        editingUserId
          ? `Data pengguna "${formName}" berhasil diperbarui!`
          : `Pengguna baru "${formName}" berhasil ditambahkan ke Supabase!`
      );
      fetchUsers();
    } else {
      setErrorMsg(json.error || "Gagal menyimpan pengguna.");
      showToast("error", `Gagal menyimpan pengguna: ${json.error}`);
    }
  };

  const handlePromptDeleteUser = (id: string, name: string) => {
    setTargetUser({ id, name });
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDeleteUser = async () => {
    if (!targetUser) return;
    const res = await fetch(`/api/users?id=${targetUser.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("success", `Pengguna "${targetUser.name}" berhasil dihapus dari Supabase!`);
      fetchUsers();
    } else {
      showToast("error", `Gagal menghapus pengguna: ${json.error}`);
    }
    setDeleteConfirmOpen(false);
    setTargetUser(null);
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      {/* Title Header */}
      <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-md flex flex-wrap justify-between items-center gap-4">
        <div>
          <h2 className="text-xl font-black text-[#1E3932] flex items-center gap-2">
            <UserGroupIcon className="w-6 h-6 text-[#006241]" />
            <span>Manajemen Pengguna & Hak Akses Menu</span>
          </h2>
          <p className="text-xs text-stone-500 mt-1 font-medium">
            Super Admin Control Panel: Kelola staff, atur kata sandi, dan tentukan izin menu setiap pengguna.
          </p>
        </div>

        {currentUser.role === "SUPER_ADMIN" && (
          <button
            onClick={handleOpenCreateModal}
            className="px-4 py-2.5 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-black rounded-2xl transition-all cursor-pointer flex items-center gap-2 shadow-lg active:scale-95 transform hover:-translate-y-0.5"
          >
            <UserPlusIcon className="w-4 h-4 text-[#F0BB78]" />
            <span>TAMBAH PENGGUNA BARU</span>
          </button>
        )}
      </div>

      {/* Users Data Table */}
      <div className="bg-white rounded-3xl border border-stone-200 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#543A14] text-amber-100 font-extrabold uppercase tracking-wider">

                <th className="p-4 pl-6">Pengguna</th>
                <th className="p-4">Peran (Role)</th>
                <th className="p-4">Menu Akses Terdaftar</th>
                <th className="p-4 pr-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400 font-semibold">
                    Memuat data pengguna dari Supabase...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400 font-semibold">
                    Belum ada pengguna lain terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="p-4 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-2xl bg-[#006241]/10 text-[#006241] flex items-center justify-center font-black border border-[#006241]/20">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900 text-sm">{u.name}</p>
                          <p className="text-[11px] text-stone-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full font-black text-[10px] tracking-wider uppercase border inline-flex items-center gap-1 ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-amber-100 text-amber-900 border-amber-300"
                            : u.role === "ADMIN"
                            ? "bg-emerald-100 text-emerald-900 border-emerald-300"
                            : "bg-blue-100 text-blue-900 border-blue-300"
                        }`}
                      >
                        <ShieldCheckIcon className="w-3.5 h-3.5" />
                        {u.role === "SUPER_ADMIN" ? "Super Admin" : u.role === "ADMIN" ? "Admin" : "Kasir"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {u.permissions?.map((p) => (
                          <span
                            key={p}
                            className="px-2.5 py-0.5 rounded-lg bg-stone-100 text-stone-700 font-bold text-[10px] border border-stone-200"
                          >
                            {p === "dash"
                              ? "Dashboard"
                              : p === "pos"
                              ? "Kasir POS"
                              : p === "calc"
                              ? "Hitung HPP"
                              : p === "list"
                              ? "Daftar Menu"
                              : p === "users"
                              ? "User Management"
                              : p}
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="p-4 pr-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-2 rounded-xl bg-amber-100 text-amber-900 hover:bg-amber-200 transition-all cursor-pointer active:scale-95"
                          title="Edit Pengguna & Hak Akses"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        {currentUser.role === "SUPER_ADMIN" && u.id !== currentUser.id && (
                          <button
                            onClick={() => handlePromptDeleteUser(String(u.id), u.name)}
                            className="p-2 rounded-xl bg-rose-100 text-rose-700 hover:bg-rose-200 transition-all cursor-pointer active:scale-95"
                            title="Hapus Pengguna"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 top-0 left-0 w-screen h-screen z-[9999] bg-[#1E3932]/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5 animate-scale-in border border-[#cba258]/30 max-h-[90vh] overflow-y-auto my-auto relative">
            <div className="flex justify-between items-center border-b border-stone-200 pb-3 sticky top-0 bg-white z-10">
              <h3 className="font-black text-base text-[#1E3932] flex items-center gap-2">
                <UserPlusIcon className="w-5 h-5 text-[#006241]" />
                <span>{editingUserId ? "Edit Pengguna & Hak Akses" : "Tambah Pengguna Baru"}</span>
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-xl text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  ⚠️ {errorMsg}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Budi Kasir"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#006241] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Email Pengguna</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="kasir@kedaikopi.com"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#006241] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Kata Sandi {editingUserId && "(Kosongkan jika tidak ingin diubah)"}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs font-semibold focus:ring-2 focus:ring-[#006241] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">Peran Utama (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["SUPER_ADMIN", "ADMIN", "CASHIER"] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormRole(r)}
                      className={`py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formRole === r
                          ? "bg-[#006241] text-white border-[#006241] shadow-md"
                          : "bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100"
                      }`}
                    >
                      {r === "SUPER_ADMIN" ? "Super Admin" : r === "ADMIN" ? "Admin" : "Kasir"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-bold text-stone-700">Izinkan Akses Halaman Menu:</label>
                  <span className="text-[10px] text-emerald-800 font-extrabold uppercase bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    SUPER ADMIN CONFIG
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((item) => {
                    const isChecked = formPermissions.includes(item.key);
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        onClick={() => togglePermission(item.key)}
                        className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "bg-emerald-50 border-[#006241] text-[#006241] shadow-sm font-extrabold"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-semibold"
                        }`}
                      >
                        <div className="flex items-center gap-2 text-xs">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center border text-white ${
                            isChecked ? "bg-[#006241] border-[#006241]" : "border-stone-300 bg-white"
                          }`}
                        >
                          {isChecked && <CheckIcon className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="flex-1 py-3 border border-stone-300 rounded-2xl font-bold text-xs text-stone-600 hover:bg-stone-100 cursor-pointer"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-[#006241] hover:bg-[#1E3932] text-white rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg cursor-pointer transition-all active:scale-95"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Custom Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        title="Konfirmasi Hapus Pengguna"
        message={
          targetUser
            ? `Apakah Anda yakin ingin menghapus pengguna "${targetUser.name}" dari database Supabase?`
            : "Apakah Anda yakin ingin menghapus pengguna ini?"
        }
        confirmText="Ya, Hapus Sekarang"
        cancelText="Batal"
        onConfirm={handleExecuteDeleteUser}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setTargetUser(null);
        }}
      />

      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
};
