import { NextResponse } from "next/server";
import { supabase } from "@/lib/db/supabaseClient";
import fs from "fs";
import path from "path";
import sharp from "sharp";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ success: false, error: "File gambar tidak ditemukan." }, { status: 400 });
    }

    const inputBuffer = Buffer.from(await file.arrayBuffer());

    // Compress & Convert image to lightweight WebP format (Max 1200px, 80% Quality)
    let webpBuffer: Buffer;
    try {
      webpBuffer = await sharp(inputBuffer)
        .resize({ width: 1200, height: 1200, fit: "inside", withoutEnlargement: true })
        .webp({ quality: 80 })
        .toBuffer();
    } catch {
      // Fallback if image parsing fails
      webpBuffer = inputBuffer;
    }

    const fileName = `img-${Date.now()}.webp`;
    const filePath = `menus/${fileName}`;

    // Create Blob from WebP Buffer for Supabase Cloud Storage Upload
    const webpBlob = new Blob([new Uint8Array(webpBuffer)], { type: "image/webp" });

    // 1. Try uploading WebP image to Supabase Storage Bucket 'menu-images'
    try {
      const { data, error } = await supabase.storage.from("menu-images").upload(filePath, webpBlob, {
        cacheControl: "31536000",
        upsert: true,
        contentType: "image/webp",
      });

      if (!error && data) {
        const { data: publicUrlData } = supabase.storage.from("menu-images").getPublicUrl(filePath);
        if (publicUrlData?.publicUrl) {
          return NextResponse.json({
            success: true,
            image_url: publicUrlData.publicUrl,
            url: publicUrlData.publicUrl,
          });
        }
      }
    } catch {
      // Supabase storage bucket offline or uninitialized
    }

    // 2. Fallback: Save WebP file locally in public/uploads/
    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const localFilePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(localFilePath, webpBuffer);

    const localUrl = `/uploads/${fileName}`;
    return NextResponse.json({
      success: true,
      image_url: localUrl,
      url: localUrl,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
