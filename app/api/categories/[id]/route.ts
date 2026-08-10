import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";

// PUT /api/categories/[id] - Update a category
export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);
    const body = await req.json();

    const { data, error } = await supabase
      .from("m_categories")
      .update({
        name: body.name,
        icon: body.icon,
        bg_color: body.bg_color,
        fg_color: body.fg_color,
        updated_at: new Date().toISOString(),
      })
      .eq("id", numericId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE /api/categories/[id] - Delete a category
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numericId = Number(id);

    const { error } = await supabase
      .from("m_categories")
      .delete()
      .eq("id", numericId);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete category" },
      { status: 500 }
    );
  }
}
