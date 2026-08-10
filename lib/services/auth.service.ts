import crypto from "crypto";
import { db } from "@/lib/db/client";
import { User, Role, TabPermission } from "@/lib/models/user";

export class AuthService {
  // Pure SHA256 Password Hash Helper
  static hashPassword(password: string): string {
    if (!password) return "";
    return crypto.createHash("sha256").update(password).digest("hex");
  }

  // Password-based Login Verification (Supports SHA256 Hashing)
  static login(email: string, password: string) {
    const hashedPassword = this.hashPassword(password);
    const user = db.auth.users.find(
      (u: User) =>
        u.email === email &&
        (u.password_hash === hashedPassword || u.password_hash === password)
    );

    if (!user) {
      return { success: false, error: "Email atau kata sandi tidak cocok." };
    }

    const token = `token-${Date.now()}-${user.id}`;
    db.auth.refreshTokens.push({
      id: `rt-${Date.now()}`,
      user_id: String(user.id),
      token_hash: token,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      revoked: false,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword, token };
  }

  static getCurrentUser(token: string): Omit<User, "password_hash"> | null {
    const refreshToken = db.auth.refreshTokens.find(
      (t) => t.token_hash === token && !t.revoked && new Date(t.expires_at) > new Date()
    );
    if (!refreshToken) return null;

    const user = db.auth.users.find((u: User) => String(u.id) === String(refreshToken.user_id));
    if (!user) return null;

    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  // User Management (Super Admin)
  static getAllUsers(): Omit<User, "password_hash">[] {
    return db.auth.users.map(({ password_hash, ...u }) => u);
  }

  static createUser(data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    permissions?: TabPermission[];
    avatar_url?: string;
  }) {
    const existing = db.auth.users.find((u) => u.email === data.email);
    if (existing) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const newUser: User = {
      id: String(db.auth.users.length + 1),
      name: data.name,
      email: data.email,
      password_hash: this.hashPassword(data.password),
      role: data.role,
      permissions: data.permissions || (data.role === "SUPER_ADMIN" ? ["dash", "pos", "calc", "list", "users", "profile"] : data.role === "ADMIN" ? ["dash", "pos", "calc", "list", "profile"] : ["pos", "profile"]),
      avatar_url: data.avatar_url || "",
      created_at: new Date(),
    };

    db.auth.users.push(newUser);
    const { password_hash, ...userWithoutPassword } = newUser;
    return { success: true, user: userWithoutPassword };
  }

  static updateUser(
    id: string,
    data: {
      name?: string;
      email?: string;
      password?: string;
      role?: Role;
      permissions?: TabPermission[];
      avatar_url?: string;
    }
  ) {
    const idx = db.auth.users.findIndex((u) => String(u.id) === String(id));
    if (idx === -1) {
      return { success: false, error: "Pengguna tidak ditemukan." };
    }

    const current = db.auth.users[idx];
    if (data.email && data.email !== current.email) {
      const emailExists = db.auth.users.some((u) => String(u.id) !== String(id) && u.email === data.email);
      if (emailExists) return { success: false, error: "Email sudah digunakan pengguna lain." };
    }

    db.auth.users[idx] = {
      ...current,
      name: data.name ?? current.name,
      email: data.email ?? current.email,
      password_hash: data.password ? this.hashPassword(data.password) : current.password_hash,
      role: data.role ?? current.role,
      permissions: data.permissions ?? current.permissions,
      avatar_url: data.avatar_url ?? current.avatar_url,
    };

    const { password_hash, ...userWithoutPassword } = db.auth.users[idx];
    return { success: true, user: userWithoutPassword };
  }

  static deleteUser(id: string) {
    const idx = db.auth.users.findIndex((u) => String(u.id) === String(id));
    if (idx === -1) return { success: false, error: "Pengguna tidak ditemukan." };
    
    if (db.auth.users[idx].role === "SUPER_ADMIN") {
      const superAdminCount = db.auth.users.filter((u) => u.role === "SUPER_ADMIN").length;
      if (superAdminCount <= 1) {
        return { success: false, error: "Satu-satunya Super Admin tidak dapat dihapus!" };
      }
    }

    db.auth.users.splice(idx, 1);
    return { success: true };
  }
}
