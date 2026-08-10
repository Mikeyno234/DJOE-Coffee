import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { AuthService } from "@/lib/services/auth.service";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("m_users")
      .select("id, name, email, role, permissions, created_at, created_by")
      .order("id", { ascending: true });

    if (error) {
      console.error("Supabase m_users fetch error:", error.message);
    } else if (data) {
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
    const body = await request.json();
    const hashedPassword = AuthService.hashPassword(body.password || "123456");

    // Insert directly into Supabase m_users
    const { data, error } = await supabase
      .from("m_users")
      .insert([
        {
          name: body.name,
          email: body.email,
          password_hash: hashedPassword,
          role: body.role || "CASHIER",
          permissions: body.permissions || ["pos"],
          created_by: 1,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Supabase user insert error:", error.message);
      const result = AuthService.createUser(body);
      return NextResponse.json({ success: result.success, user: result.user, error: result.error });
    }

    AuthService.createUser(body);
    return NextResponse.json({ success: true, user: data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...data } = body;
    if (!id) return NextResponse.json({ success: false, error: "ID Pengguna wajib diisi." }, { status: 400 });

    const numericId = Number(id);
    const updatePayload: any = {
      name: data.name,
      email: data.email,
      role: data.role,
      permissions: data.permissions,
      updated_by: 1,
      updated_at: new Date().toISOString(),
    };

    if (data.password && data.password.trim() !== "") {
      updatePayload.password_hash = AuthService.hashPassword(data.password.trim());
    }

    // Update in Supabase m_users
    const { data: updatedUser, error } = await supabase
      .from("m_users")
      .update(updatePayload)
      .eq("id", isNaN(numericId) ? id : numericId)
      .select()
      .single();

    if (error) {
      console.error("Supabase user update error:", error.message);
    }

    AuthService.updateUser(id, data);
    return NextResponse.json({ success: true, user: updatedUser || data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ success: false, error: "ID Pengguna wajib diisi." }, { status: 400 });

    const numericId = Number(id);
    const { error } = await supabase
      .from("m_users")
      .delete()
      .eq("id", isNaN(numericId) ? id : numericId);

    if (error) {
      console.error("Supabase user delete error:", error.message);
    }

    AuthService.deleteUser(id);
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
