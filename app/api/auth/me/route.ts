import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function GET(request: Request) {
  const cookieHeader = request.headers.get("cookie") || "";
  const tokenMatch = cookieHeader.match(/refresh_token=([^;]+)/);
  const token = tokenMatch ? tokenMatch[1] : null;

  if (!token) {
    return NextResponse.json({
      success: true,
      user: {
        id: "1",
        name: "Super Admin Utama",
        email: "superadmin@kedaikopi.com",
        role: "SUPER_ADMIN",
        permissions: ["dash", "pos", "calc", "list", "users", "profile"],
      },
    });
  }

  const user = AuthService.getCurrentUser(token);
  if (!user) {
    return NextResponse.json({ success: false, error: "Session expired" }, { status: 401 });
  }

  return NextResponse.json({ success: true, user });
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
