import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import { db } from "@/lib/db/client";
import { MenuService } from "@/lib/services/menu.service";
import { Menu } from "@/lib/models/menu";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort");

  try {
    let query = supabase.from("m_menus").select("*");

    if (category && category !== "Semua") {
      query = query.ilike("category_name", `%${category}%`);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    if (sort === "margin_desc") {
      query = query.order("margin_percent", { ascending: false });
    } else if (sort === "margin_asc") {
      query = query.order("margin_percent", { ascending: true });
    } else if (sort === "price_desc") {
      query = query.order("selling_price", { ascending: false });
    } else if (sort === "price_asc") {
      query = query.order("selling_price", { ascending: true });
    } else if (sort === "name") {
      query = query.order("name", { ascending: true });
    }

    const { data, error } = await query;

    if (!error && data && data.length > 0) {
      return NextResponse.json({ success: true, count: data.length, data });
    }
  } catch {
    // fallback to db
  }

  // Fallback memory data
  let menus = [...db.master.menus];
  if (category && category !== "Semua") {
    menus = menus.filter((m: Menu) => (m.category_name || "").toLowerCase().includes(category.toLowerCase()));
  }
  if (search) {
    menus = menus.filter((m: Menu) => m.name.toLowerCase().includes(search.toLowerCase()));
  }

  return NextResponse.json({ success: true, count: menus.length, data: menus });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const safeBody = {
      ...body,
      category_id: body.category_id || "cat-1",
      ingredients: body.ingredients || [],
      operational_costs: body.operational_costs || [],
      target_margin_percent: body.target_margin_percent || body.margin_percent || 0,
      manual_selling_price: body.manual_selling_price || body.selling_price || 0,
    };

    const result = MenuService.saveMenu(safeBody);

    const hppVal = body.hpp !== undefined ? body.hpp : (result.menu?.hpp || 0);
    const priceVal = body.selling_price !== undefined ? body.selling_price : (result.menu?.selling_price || 0);
    const marginVal = body.margin_percent !== undefined ? body.margin_percent : (result.menu?.margin_percent || 0);

    const newMenuData = {
      name: body.name,
      category_name: body.category_name || "Minuman",
      hpp: hppVal,
      selling_price: priceVal,
      margin_percent: marginVal,
      image_url: body.image_url || "",
      created_by: 1
    };

    // Insert into Supabase m_menus
    try {
      await supabase.from("m_menus").insert([newMenuData]);
    } catch {
      // Supabase insert fallback
    }

    return NextResponse.json({
      success: true,
      data: result.menu || { id: `menu-${Date.now()}`, ...newMenuData }
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
