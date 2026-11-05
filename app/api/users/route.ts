import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";
import { requireAuth } from "@/lib/utils/authGuard";

export async function GET(request: Request) {
  const auth = requireAuth(request, ["SUPER_ADMIN", "ADMIN"]);
  if (!auth.authenticated || !auth.user) {
    return auth.errorResponse!;
  }

  try {
    const { data, error } = await supabase
      .from("m_users")
      .select("id, name, email, role, permissions, avatar_url, created_at, created_by")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase m_users fetch error:", error.message);
    } else if (data && data.length > 0) {
      return NextResponse.json({ success: true, data });
    }
  } catch (err: any) {
    console.error("Supabase exception:", err.message);
  }

  // Fallback only if database connection fails
  const users = AuthService.getAllUsers();
  return NextResponse.json({ success: true, data: users });
}

export async function POST(request: Request) {
  try {
    const auth = requireAuth(request, ["SUPER_ADMIN"]);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const hashedPassword = AuthService.hashPassword(body.password || "123456");
    const numericUserId = Number(auth.user.id);
    const validCreatedBy = isNaN(numericUserId) ? 1 : numericUserId;

    // Insert directly into Supabase m_users
    try {
      const { data, error } = await supabase
        .from("m_users")
        .insert([
          {
            name: body.name,
            email: body.email,
            password_hash: hashedPassword,
            role: body.role || "CASHIER",
            permissions: body.permissions || ["pos"],
            avatar_url: body.avatar_url || null,
            created_by: validCreatedBy,
          },
        ])
        .select()
        .single();

      if (!error && data) {
        AuthService.createUser(body);
        return NextResponse.json({ success: true, user: data });
      }
    } catch {
      // Supabase insert fallback
    }

    const result = AuthService.createUser(body);
    return NextResponse.json({ success: result.success, user: result.user, error: result.error });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const auth = requireAuth(request, ["SUPER_ADMIN"]);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse!;
    }

    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID Pengguna wajib diisi." }, { status: 400 });

    const numericId = Number(id);
    const numericUserId = Number(auth.user.id);
    const validUpdatedBy = isNaN(numericUserId) ? 1 : numericUserId;

    const updatePayload: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
      ...(data.avatar_url ? { avatar_url: data.avatar_url } : {}),
      updated_by: validUpdatedBy,
      updated_at: new Date().toISOString(),
    };

    if (data.password && data.password.trim() !== "") {
      updatePayload.password_hash = AuthService.hashPassword(data.password.trim());
    }

    // Update in Supabase m_users
    try {
      const { data: updatedUser, error } = await supabase
        .from("m_users")
        .update(updatePayload)
        .eq("id", isNaN(numericId) ? id : numericId)
        .select()
        .single();

      if (!error && updatedUser) {
        AuthService.updateUser(id, data);
        return NextResponse.json({ success: true, user: updatedUser });
      }
    } catch {
      // fallback
    }

    const memRes = AuthService.updateUser(id, data);
    return NextResponse.json({ success: memRes.success, user: memRes.user, error: memRes.error });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const auth = requireAuth(request, ["SUPER_ADMIN"]);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse!;
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID Pengguna wajib diisi." }, { status: 400 });

    if (String(id) === String(auth.user.id)) {
      return NextResponse.json(
        { success: false, error: "Anda tidak dapat menghapus akun Anda sendiri!" },
        { status: 400 }
      );
    }

    const numericId = Number(id);
    try {
      await supabase
        .from("m_users")
        .delete()
        .eq("id", isNaN(numericId) ? id : numericId);
    } catch {
      // fallback
    }

    const memRes = AuthService.deleteUser(id);
    return NextResponse.json({ success: memRes.success, error: memRes.error });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
