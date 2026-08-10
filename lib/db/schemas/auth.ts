import { User, RefreshToken } from "@/lib/models/user";

export const initialUsers: User[] = [
  {
    id: "1",
    name: "Super Admin Utama",
    email: "superadmin@kedaikopi.com",
    password_hash: "super123",
    role: "SUPER_ADMIN",
    permissions: ["dash", "pos", "calc", "list", "users", "profile"],
    created_at: new Date(),
  },
  {
    id: "2",
    name: "Admin Kedai",
    email: "admin@kedaikopi.com",
    password_hash: "admin123",
    role: "ADMIN",
    permissions: ["dash", "pos", "calc", "list", "profile"],
    created_at: new Date(),
  },
  {
    id: "3",
    name: "Kasir Shift Pagi",
    email: "kasir@kedaikopi.com",
    password_hash: "kasir123",
    role: "CASHIER",
    permissions: ["pos", "profile"],
    created_at: new Date(),
  },
];

export const initialRefreshTokens: RefreshToken[] = [];
