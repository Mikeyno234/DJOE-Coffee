import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    const fileExt = file.name.split(".").pop();
    const fileName = `menu-${Date.now()}.${fileExt}`;
    const filePath = `menus/${fileName}`;

    // Upload to Supabase Storage Bucket 'menu-images'
    const { data, error } = await supabase.storage.from("menu-images").upload(filePath, file, {
      cacheControl: "3600",
      upsert: true,
    });

    if (error) {
      // Fallback: If bucket is not setup yet, return local object URL
      return NextResponse.json({
        success: true,
        image_url: `/images/${file.name}`,
        warning: "Supabase Storage bucket 'menu-images' belum publik, menggunakan fallback URL.",
      });
    }

    // Get Public URL from Supabase
    const { data: publicUrlData } = supabase.storage.from("menu-images").getPublicUrl(filePath);

    return NextResponse.json({
      success: true,
      image_url: publicUrlData.publicUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
