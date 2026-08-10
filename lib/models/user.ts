export type Role = "SUPER_ADMIN" | "ADMIN" | "CASHIER";

export type TabPermission = "dash" | "pos" | "calc" | "list" | "categories" | "users" | "profile";

export interface User {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  role: Role;
  permissions: TabPermission[];
  created_at: Date;
  created_by?: string;
  updated_at?: Date;
  updated_by?: string;
}

export interface RefreshToken {
  id: string;
  user_id: string;
  token_hash: string;
  expires_at: Date;
  revoked: boolean;
  created_at?: Date;
}
