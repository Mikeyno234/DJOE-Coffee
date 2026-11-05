import { createClient, SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://your-supabase-project.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "your-anon-key";

// Klien Browser Publik (Dibatasi oleh Row Level Security - RLS)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Klien Server Terpercaya (Menggunakan Service Role Key)
let _supabaseAdmin: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (typeof window !== "undefined") {
    throw new Error("CRITICAL SECURITY ERROR: getSupabaseAdmin() tidak boleh dipanggil dari browser client!");
  }

  if (!_supabaseAdmin) {
    // Tidak ada fallback ke anon key: tanpa service role, RLS akan menolak tulis
// secara diam-diam dan kasir melihat sukses palsu. Gagal keras lebih aman.
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceRoleKey) {
      throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diatur di environment server.");
    }
    _supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }

  return _supabaseAdmin;
}
