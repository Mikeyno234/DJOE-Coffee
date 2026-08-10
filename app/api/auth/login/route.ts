import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ success: false, error: "Email dan Kata Sandi wajib diisi." }, { status: 400 });
    }

    const hashedPassword = AuthService.hashPassword(password);

    // Query user credentials from Supabase m_users table
    let dbUser: any = null;
    try {
      const { data: userFromSupabase } = await supabase
        .from("m_users")
        .select("*")
        .eq("email", email)
        .single();

      if (userFromSupabase) {
        if (
          userFromSupabase.password_hash === hashedPassword ||
          userFromSupabase.password_hash === password
        ) {
          dbUser = userFromSupabase;
        }
      }
    } catch {
      // fallback
    }

    // Fallback to memory if Supabase user is not found
    if (!dbUser) {
      const result = AuthService.login(email, password);
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 401 });
      }
      dbUser = result.user;
    }

    const { password_hash, ...userWithoutPassword } = dbUser;
    const token = `token-${Date.now()}-${dbUser.id}`;

    const response = NextResponse.json({ success: true, user: userWithoutPassword });

    response.cookies.set({
      name: "refresh_token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
      sameSite: "strict",
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
