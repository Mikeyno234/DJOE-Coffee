import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { requireAuth } from "@/lib/utils/authGuard";

// GET /api/categories - Fetch all categories from Supabase m_categories
export async function GET() {
  try {
    const { data, error } = await supabase
      .from("m_categories")
      .select("*")
      .order("id", { ascending: true });

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST /api/categories - Create a new category in Supabase m_categories
export async function POST(req: Request) {
  try {
    const auth = requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
    if (!auth.authenticated || !auth.user) {
      return auth.errorResponse!;
    }

    const body = await req.json();
    const { name, icon = "beaker", bg_color = "#e8d5be", fg_color = "#6b3a1f" } = body;

    if (!name || String(name).trim() === "") {
      return NextResponse.json(
        { success: false, error: "Nama kategori wajib diisi" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("m_categories")
      .insert([
        {
          name: String(name).trim(),
          icon,
          bg_color,
          fg_color,
        },
      ])
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create category" },
      { status: 500 }
    );
  }
}
