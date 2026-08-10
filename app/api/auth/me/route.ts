import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/refresh_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return NextResponse.json({ success: false, error: "Tidak ada sesi login aktif." }, { status: 401 });
  }

  const user = AuthService.getCurrentUser(token);
  if (user) {
    return NextResponse.json({ success: true, user });
  }

  // Fallback: Check token format or Supabase user
  if (token.startsWith("token-")) {
    const parts = token.split("-");
    const userId = parts[parts.length - 1];
    const foundUser = AuthService.getAllUsers().find((u) => String(u.id) === String(userId));
    if (foundUser) {
      return NextResponse.json({ success: true, user: foundUser });
    }
  }

  return NextResponse.json({ success: false, error: "Sesi telah berakhir." }, { status: 401 });
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const cookieHeader = request.headers.get("cookie") || "";
    const tokenMatch = cookieHeader.match(/refresh_token=([^;]+)/);
    const token = tokenMatch ? tokenMatch[1] : null;

    const user = token ? AuthService.getCurrentUser(token) : null;
    const userId = user?.id || body.id || "1";

    const res = AuthService.updateUser(userId, {
      name: body.name,
      password: body.password,
      avatar_url: body.avatar_url,
    });

    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    const numericId = Number(userId);
    const updatePayload: any = {
      name: body.name,
      avatar_url: body.avatar_url,
      updated_by: isNaN(numericId) ? 1 : numericId,
      updated_at: new Date().toISOString(),
    };

    if (body.password && body.password.trim() !== "") {
      updatePayload.password_hash = AuthService.hashPassword(body.password.trim());
    }

    // Update password_hash & avatar_url in Supabase m_users
    await supabase
      .from("m_users")
      .update(updatePayload)
      .eq("id", isNaN(numericId) ? userId : numericId);

    return NextResponse.json({ success: true, user: res.user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
