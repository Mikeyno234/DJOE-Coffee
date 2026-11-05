import crypto from "crypto";
import { db } from "@/lib/db/client";
import { User, Role, TabPermission } from "@/lib/models/user";

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: Role;
  name: string;
  permissions?: TabPermission[];
  exp: number;
}

export class AuthService {
  private static getSecret(): string {
    const secret = process.env.JWT_SECRET;
    // NIST SP 800-107r1 section 5.3.4: HMAC-SHA256 keys need at least 128 bits of entropy.
    // A secret committed to source would let anyone mint valid session tokens.
    if (!secret || secret.length < 32) {
      throw new Error("JWT_SECRET wajib diatur dan minimal 32 karakter.");
    }
    return secret;
  }

  // Salted scrypt key-derivation for strong password hashing
  static hashPasswordScrypt(password: string): string {
    if (!password) return "";
    const salt = crypto.randomBytes(16).toString("hex");
    const derivedKey = crypto.scryptSync(password.trim(), salt, 64).toString("hex");
    return `${salt}:${derivedKey}`;
  }

  // Legacy SHA-256 (retained for backward-compatible verification and tests)
  static hashPassword(password: string): string {
    if (!password) return "";
    return crypto.createHash("sha256").update(password.trim()).digest("hex");
  }

  // Constant-time password verification supporting scrypt and legacy SHA-256
  // Plaintext password matching is strictly prohibited
  static verifyPassword(password: string, storedHash: string): boolean {
    if (!password || !storedHash) return false;
    const trimmed = password.trim();

    // 1. Check if stored in scrypt format: salt:derivedKey
    if (storedHash.includes(":")) {
      const [salt, key] = storedHash.split(":");
      if (!salt || !key) return false;

      try {
        const keyBuffer = Buffer.from(key, "hex");
        const derivedKey = crypto.scryptSync(trimmed, salt, 64);
        if (keyBuffer.length !== derivedKey.length) return false;
        return crypto.timingSafeEqual(keyBuffer, derivedKey);
      } catch {
        return false;
      }
    }

    // 2. Legacy SHA-256 verification (64 hex characters)
    if (storedHash.length === 64) {
      try {
        const expectedHash = crypto.createHash("sha256").update(trimmed).digest("hex");
        const storedBuf = Buffer.from(storedHash, "utf8");
        const expectedBuf = Buffer.from(expectedHash, "utf8");
        if (storedBuf.length !== expectedBuf.length) return false;
        return crypto.timingSafeEqual(storedBuf, expectedBuf);
      } catch {
        return false;
      }
    }

    return false;
  }

  // Cryptographic HMAC-SHA256 Token Signer
  static signToken(
    user: { id: string; email: string; role: Role; name: string; permissions?: TabPermission[] },
    expiresInMs: number = 7 * 24 * 60 * 60 * 1000
  ): string {
    const payload: AuthTokenPayload = {
      id: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
      exp: Date.now() + expiresInMs,
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64url");
    const secret = this.getSecret();
    const signature = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

    return `${encodedPayload}.${signature}`;
  }

  // Cryptographic HMAC-SHA256 Token Verifier with Constant-Time Check
  static verifyToken(token: string): AuthTokenPayload | null {
    if (!token || typeof token !== "string") return null;
    const parts = token.split(".");
    if (parts.length !== 2) return null;

    const [encodedPayload, signature] = parts;
    const secret = this.getSecret();
    const expectedSig = crypto.createHmac("sha256", secret).update(encodedPayload).digest("base64url");

    try {
      const sigBuf = Buffer.from(signature);
      const expectedBuf = Buffer.from(expectedSig);
      if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
        return null;
      }

      const payload: AuthTokenPayload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8"));
      if (!payload.exp || Date.now() > payload.exp) {
        return null; // Expired
      }
      return payload;
    } catch {
      return null;
    }
  }

  // Password-based Login Verification with Zero-Plaintext Rule
  static login(email: string, password: string) {
    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();

    const user = db.auth.users.find(
      (u: User) =>
        u.email.toLowerCase() === trimmedEmail &&
        this.verifyPassword(trimmedPassword, u.password_hash)
    );

    if (!user) {
      return { success: false, error: "Email atau kata sandi tidak cocok." };
    }

    const token = this.signToken({
      id: String(user.id),
      email: user.email,
      role: user.role,
      name: user.name,
      permissions: user.permissions,
    });

    const { password_hash, ...userWithoutPassword } = user;
    return { success: true, user: userWithoutPassword, token };
  }

  // Authenticate user from signed token
  static getCurrentUser(token: string): Omit<User, "password_hash"> | null {
    const verified = this.verifyToken(token);
    if (!verified) return null;

    const user = db.auth.users.find((u: User) => String(u.id) === String(verified.id));
    if (user) {
      const { password_hash, ...userWithoutPassword } = user;
      return userWithoutPassword;
    }

    return {
      id: verified.id,
      name: verified.name,
      email: verified.email,
      role: verified.role,
      permissions: verified.permissions || (verified.role === "SUPER_ADMIN" ? ["dash", "pos", "calc", "list", "users", "profile"] : ["pos", "profile"]),
      created_at: new Date(),
    };
  }

  // User Management
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
    const existing = db.auth.users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      return { success: false, error: "Email sudah terdaftar." };
    }

    const newUser: User = {
      id: String(db.auth.users.length + 1),
      name: data.name,
      email: data.email,
      password_hash: this.hashPasswordScrypt(data.password),
      role: data.role,
      permissions:
        data.permissions ||
        (data.role === "SUPER_ADMIN"
          ? ["dash", "pos", "calc", "list", "categories", "users", "profile"]
          : data.role === "ADMIN"
          ? ["dash", "pos", "calc", "list", "categories", "profile"]
          : ["pos", "profile"]),
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
      const emailExists = db.auth.users.some(
        (u) => String(u.id) !== String(id) && u.email.toLowerCase() === data.email!.toLowerCase()
      );
      if (emailExists) return { success: false, error: "Email sudah digunakan pengguna lain." };
    }

    db.auth.users[idx] = {
      ...current,
      name: data.name ?? current.name,
      email: data.email ?? current.email,
      password_hash: data.password ? this.hashPasswordScrypt(data.password) : current.password_hash,
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
