import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const { data, error } = await supabase
      .from("m_users")
      .select("id, name, email, role, permissions, avatar_url, created_at, created_by")
      .eq("id", isNaN(numericId) ? id : numericId)
      .single();

    if (error || !data) {
      const user = AuthService.getAllUsers().find((u) => String(u.id) === String(id));
      if (!user) {
        return NextResponse.json({ success: false, error: "Pengguna tidak ditemukan." }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: user });
    }

    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const numericId = Number(id);

    const updatePayload: any = {
      name: body.name,
      email: body.email,
      role: body.role,
      permissions: body.permissions,
      updated_by: 1,
      updated_at: new Date().toISOString(),
    };

    if (body.password && body.password.trim() !== "") {
      updatePayload.password_hash = AuthService.hashPassword(body.password.trim());
    }

    const { data: updatedUser, error } = await supabase
      .from("m_users")
      .update(updatePayload)
      .eq("id", isNaN(numericId) ? id : numericId)
      .select()
      .single();

    if (error) {
      console.error("Supabase user update error:", error.message);
    }

    AuthService.updateUser(id, body);
    return NextResponse.json({ success: true, user: updatedUser || body });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const { error } = await supabase
      .from("m_users")
      .delete()
      .eq("id", isNaN(numericId) ? id : numericId);

    if (error) {
      console.error("Supabase user delete error:", error.message);
    }

    const res = AuthService.deleteUser(id);
    if (!res.success) {
      return NextResponse.json({ success: false, error: res.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
