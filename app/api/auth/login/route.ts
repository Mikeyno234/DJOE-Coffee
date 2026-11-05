import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email dan Kata Sandi wajib diisi." },
        { status: 400 }
      );
    }

    const trimmedEmail = String(email).trim().toLowerCase();
    const trimmedPassword = String(password).trim();
    const hashedPassword = AuthService.hashPassword(trimmedPassword);

    let foundUser: any = null;

    // 1. Try querying Supabase m_users table first
    try {
      const { data: userFromSupabase } = await supabase
        .from("m_users")
        .select("*")
        .eq("email", trimmedEmail)
        .single();

      if (userFromSupabase) {
        foundUser = userFromSupabase;
      }
    } catch {
      // Supabase query fallback
    }

    if (foundUser) {
      // Strict password verification against Supabase m_users
      const passHash = foundUser.password_hash;
      const isValidPass =
        passHash === hashedPassword ||
        passHash === trimmedPassword;

      if (!isValidPass) {
        return NextResponse.json(
          { success: false, error: "Kata sandi yang Anda masukkan salah. Silakan coba lagi." },
          { status: 401 }
        );
      }

      const { password_hash, ...userWithoutPassword } = foundUser;
      // Generate HMAC-SHA256 cryptographically signed token
      const token = AuthService.signToken({
        id: String(foundUser.id),
        email: foundUser.email,
        role: foundUser.role,
        name: foundUser.name,
        permissions: foundUser.permissions,
      });

      const response = NextResponse.json({ success: true, user: userWithoutPassword, token });

      response.cookies.set({
        name: "refresh_token",
        value: token,
        httpOnly: true,
        path: "/",
        maxAge: 7 * 24 * 60 * 60,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });

      return response;
    }

    // 2. If not found in Supabase, verify against memory users via AuthService
    const memResult = AuthService.login(trimmedEmail, trimmedPassword);
    if (!memResult.success || !memResult.user || !memResult.token) {
      return NextResponse.json(
        { success: false, error: memResult.error || "Email atau kata sandi tidak cocok." },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: memResult.user,
      token: memResult.token,
    });

    response.cookies.set({
      name: "refresh_token",
      value: memResult.token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
