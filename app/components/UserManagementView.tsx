"use client";

import React, { useState, useEffect } from "react";
import {
  UserGroupIcon,
  UserPlusIcon,
  PencilSquareIcon,
  TrashIcon,
  XMarkIcon,
  CheckIcon,
  BuildingStorefrontIcon,
  CalculatorIcon,
  ListBulletIcon,
  ChartBarIcon,
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
  const [formAvatarUrl, setFormAvatarUrl] = useState("");
  const [uploading, setUploading] = useState(false);
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
    setFormAvatarUrl("");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleOpenEditModal = (user: User) => {
    setEditingUserId(String(user.id));
    setFormName(user.name);
    setFormEmail(user.email);
    setFormPassword("");
    setFormRole(user.role);
    setFormPermissions(user.permissions || ["pos"]);
    setFormAvatarUrl(user.avatar_url || "");
    setErrorMsg("");
    setModalOpen(true);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      const uploadedUrl = json.image_url || json.url;

      if (json.success && uploadedUrl) {
        setFormAvatarUrl(uploadedUrl);
        showToast("success", "Foto profil berhasil diunggah!");
      } else {
        setErrorMsg("Gagal meng-upload foto: " + (json.error || "Terjadi kesalahan"));
      }
    } catch {
      setErrorMsg("Terjadi kesalahan koneksi saat meng-upload foto.");
    } finally {
      setUploading(false);
    }
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
      id: editingUserId,
      name: formName,
      email: formEmail,
      role: formRole,
      permissions: formPermissions,
      avatar_url: formAvatarUrl,
      ...(formPassword ? { password: formPassword } : {}),
    };

    try {
      const url = editingUserId ? `/api/users/${editingUserId}` : "/api/users";
      const method = editingUserId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success) {
        showToast(
          "success",
          editingUserId
            ? `Pengguna "${formName}" berhasil diperbarui!`
            : `Pengguna baru "${formName}" berhasil ditambahkan!`
        );
        setModalOpen(false);
        fetchUsers();
      } else {
        setErrorMsg(json.error || "Gagal menyimpan data pengguna.");
      }
    } catch {
      setErrorMsg("Terjadi kesalahan sistem saat menyimpan.");
    }
  };

  const handlePromptDeleteUser = (userId: string, userName: string) => {
    setTargetUser({ id: userId, name: userName });
    setDeleteConfirmOpen(true);
  };

  const handleExecuteDeleteUser = async () => {
    if (!targetUser) return;
    const res = await fetch(`/api/users/${targetUser.id}`, { method: "DELETE" });
    const json = await res.json();
    if (json.success) {
      showToast("success", `Pengguna "${targetUser.name}" berhasil dihapus.`);
      fetchUsers();
    } else {
      showToast("error", `Gagal menghapus pengguna: ${json.error}`);
    }
    setDeleteConfirmOpen(false);
    setTargetUser(null);
  };

  return (
    <div className="space-y-4 animate-fade-in relative">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Action Header */}
      {currentUser.role === "SUPER_ADMIN" && (
        <div className="flex justify-end">
          <button
            onClick={handleOpenCreateModal}
            className="px-3.5 py-2 bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] font-bold text-xs rounded-xl shadow-2xs cursor-pointer transition-all flex items-center gap-1.5 active:scale-[0.98]"
          >
            <UserPlusIcon className="w-4 h-4 text-[#F0BB78]" />
            <span>TAMBAH PENGGUNA BARU</span>
          </button>
        </div>
      )}

      {/* Users Data Table */}
      <div className="bg-white rounded-2xl border border-stone-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-stone-50 border-b border-stone-200/80 text-stone-500 font-semibold uppercase tracking-wider">
                <th className="p-3.5 pl-5">Pengguna</th>
                <th className="p-3.5">Peran (Role)</th>
                <th className="p-3.5">Menu Akses Terdaftar</th>
                <th className="p-3.5 pr-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 font-medium text-stone-900">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400 font-semibold animate-pulse">
                    Memuat data pengguna dari Supabase...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-stone-400 font-medium">
                    Belum ada pengguna lain terdaftar.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="p-3.5 pl-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden">
                          {u.avatar_url ? (
                            <img src={u.avatar_url} alt={u.name} className="w-full h-full object-cover rounded-full" />
                          ) : (
                            u.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-stone-900">{u.name}</p>
                          <p className="text-[11px] text-stone-500 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-md text-[11px] font-semibold border ${
                          u.role === "SUPER_ADMIN"
                            ? "bg-amber-50 text-amber-900 border-amber-200"
                            : u.role === "ADMIN"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-200"
                            : "bg-stone-100 text-stone-700 border-stone-200"
                        }`}
                      >
                        {u.role === "SUPER_ADMIN" ? "Super Admin" : u.role === "ADMIN" ? "Admin" : "Kasir"}
                      </span>
                    </td>

                    <td className="p-3.5">
                      <div className="flex flex-wrap gap-1">
                        {u.permissions?.map((p) => (
                          <span
                            key={p}
                            className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium text-[10px] border border-stone-200"
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

                    <td className="p-3.5 pr-5 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(u)}
                          className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer"
                          title="Edit Pengguna & Hak Akses"
                        >
                          <PencilSquareIcon className="w-4 h-4" />
                        </button>

                        {currentUser.role === "SUPER_ADMIN" && u.id !== currentUser.id && (
                          <button
                            onClick={() => handlePromptDeleteUser(String(u.id), u.name)}
                            className="p-1.5 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#1a0f07]/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xs border border-stone-200/80 max-w-md w-full p-6 animate-scale-in max-h-[90vh] overflow-y-auto my-auto space-y-4">
            <div className="flex justify-between items-center border-b border-stone-100 pb-3">
              <h3 className="font-bold text-base text-stone-900">
                {editingUserId ? "Edit Pengguna & Hak Akses" : "Tambah Pengguna Baru"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-lg text-stone-400 hover:text-stone-700 cursor-pointer"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-4">
              {errorMsg && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                  {errorMsg}
                </div>
              )}

              {/* Avatar Photo Upload Field */}
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Foto Profil Pengguna (Avatar)
                </label>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center overflow-hidden shrink-0 shadow-2xs font-extrabold text-[#543A14] text-sm">
                    {formAvatarUrl ? (
                      <img src={formAvatarUrl} alt="Preview Avatar" className="w-full h-full object-cover" />
                    ) : (
                      <span>{formName ? formName.charAt(0).toUpperCase() : "U"}</span>
                    )}
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl cursor-pointer transition-all border border-stone-300 active:scale-95">
                      <span>{uploading ? "Mengunggah..." : "Pilih Foto"}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-stone-400 mt-0.5">JPG / PNG maks 5MB</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Nama Lengkap</label>
                <input
                  type="text"
                  required
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Budi Kasir"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={formEmail}
                  onChange={(e) => setFormEmail(e.target.value)}
                  placeholder="contoh: kasir@kedaikopi.com"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">
                  Kata Sandi {editingUserId ? "(Kosongkan jika tidak diubah)" : ""}
                </label>
                <input
                  type="password"
                  required={!editingUserId}
                  value={formPassword}
                  onChange={(e) => setFormPassword(e.target.value)}
                  placeholder="Minimal 6 karakter"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-stone-900 focus:ring-2 focus:ring-[#543A14] outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Peran Utama (Role)</label>
                <div className="grid grid-cols-3 gap-2">
                  {(["SUPER_ADMIN", "ADMIN", "CASHIER"] as Role[]).map((r) => (
                    <button
                      type="button"
                      key={r}
                      onClick={() => setFormRole(r)}
                      className={`py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                        formRole === r
                          ? "bg-[#543A14] text-[#F0BB78] border-[#543A14]"
                          : "bg-stone-100 text-stone-700 border-stone-200 hover:bg-stone-200"
                      }`}
                    >
                      {r === "SUPER_ADMIN" ? "Super Admin" : r === "ADMIN" ? "Admin" : "Kasir"}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                  Izinkan Akses Halaman Menu:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {AVAILABLE_PERMISSIONS.map((item) => {
                    const isChecked = formPermissions.includes(item.key);
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.key}
                        onClick={() => togglePermission(item.key)}
                        className={`p-2 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "bg-amber-50/80 border-[#543A14] text-[#543A14] font-bold"
                            : "bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 font-medium"
                        }`}
                      >
                        <div className="flex items-center gap-1.5 text-xs">
                          <Icon className="w-3.5 h-3.5" />
                          <span>{item.label}</span>
                        </div>
                        <div
                          className={`w-3.5 h-3.5 rounded-full flex items-center justify-center border text-white ${
                            isChecked ? "bg-[#543A14] border-[#543A14]" : "border-stone-300 bg-white"
                          }`}
                        >
                          {isChecked && <CheckIcon className="w-2.5 h-2.5 stroke-[3]" />}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#543A14] hover:bg-[#3d2a0e] text-[#F0BB78] text-xs font-bold cursor-pointer transition-all active:scale-[0.98]"
                >
                  Simpan Pengguna
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
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
    </div>
  );
};
