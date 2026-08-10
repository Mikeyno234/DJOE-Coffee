import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { db } from "@/lib/db/client";
import { MenuService } from "@/lib/services/menu.service";
import { RecipeIngredient, OperationalCost } from "@/lib/models/menu";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: menuId } = await params;
  const numericId = Number(menuId);

  try {
    const { data: menuData, error: menuErr } = await supabase
      .from("m_menus")
      .select("*")
      .eq("id", isNaN(numericId) ? menuId : numericId)
      .single();

    if (!menuErr && menuData) {
      const { data: ingredients } = await supabase
        .from("m_recipe_ingredients")
        .select("*")
        .eq("menu_id", isNaN(numericId) ? menuId : numericId);

      const { data: operational } = await supabase
        .from("m_operational_costs")
        .select("*")
        .eq("menu_id", isNaN(numericId) ? menuId : numericId);

      return NextResponse.json({
        success: true,
        data: {
          ...menuData,
          ingredients: ingredients || [],
          operational_costs: operational || [],
        },
      });
    }
  } catch {
    // fallback
  }

  // Memory fallback
  const menu = db.master.menus.find((m) => String(m.id) === String(menuId));
  if (!menu) {
    return NextResponse.json({ success: false, error: "Menu tidak ditemukan" }, { status: 404 });
  }

  const ingredients = db.master.ingredients.filter((i: RecipeIngredient) => String(i.menu_id) === String(menuId));
  const operational = db.master.operationalCosts.filter((o: OperationalCost) => String(o.menu_id) === String(menuId));

  return NextResponse.json({
    success: true,
    data: {
      ...menu,
      ingredients,
      operational_costs: operational,
    },
  });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuId } = await params;
    const body = await request.json();
    const result = MenuService.saveMenu({ ...body, id: menuId });

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 400 });
    }

    const numericId = Number(menuId);
    await supabase
      .from("m_menus")
      .update({
        name: body.name,
        category_name: body.category_name,
        hpp: body.hpp,
        selling_price: body.selling_price,
        margin_percent: body.margin_percent,
        image_url: body.image_url,
        updated_by: 1,
        updated_at: new Date().toISOString(),
      })
      .eq("id", isNaN(numericId) ? menuId : numericId);

    return NextResponse.json({ success: true, data: result.menu });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: menuId } = await params;
    const numericId = Number(menuId);

    // Delete menu from Supabase m_menus table (cascade deletes ingredients & costs)
    const { error } = await supabase
      .from("m_menus")
      .delete()
      .eq("id", isNaN(numericId) ? menuId : numericId);

    // Also update in-memory
    const index = db.master.menus.findIndex((m) => String(m.id) === String(menuId));
    if (index !== -1) {
      db.master.menus.splice(index, 1);
    }

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: "Menu berhasil dihapus dari Supabase" });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
