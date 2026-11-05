import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";
import { requireAuth } from "@/lib/utils/authGuard";

export async function GET(request: Request) {
  const auth = requireAuth(request);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  // Look up full user profile from memory or Supabase
  const user = AuthService.getCurrentUser(
    (request.headers.get("cookie") || "").match(/refresh_token=([^;]+)/)?.[1] || ""
  );

  return NextResponse.json({
    success: true,
    user: user || {
      id: auth.user.id,
      name: auth.user.name,
      email: auth.user.email,
      role: auth.user.role,
      permissions: auth.user.permissions,
    },
  });
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    // Enforce updating only own profile to prevent IDOR
    const userId = String(auth.user.id);

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

    // Update in Supabase m_users
    try {
      await supabase
        .from("m_users")
        .update(updatePayload)
        .eq("id", isNaN(numericId) ? userId : numericId);
    } catch {
      // Supabase update fallback
    }

    return NextResponse.json({ success: true, user: res.user });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
