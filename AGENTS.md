<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# CAFE POS ARCHITECTURAL DIRECTIVE

Semua AI coding agent (Antigravity, Claude, Argon, dll.) **WAJIB MEMBACA DAN MEMATUHI** [CAFE_POS_BLUEPRINT.md](./CAFE_POS_BLUEPRINT.md) sebagai acuan tunggal (*Single Source of Truth*) sebelum membaca, membuat, atau mengubah kode apa pun di repositori ini.

## Prinsip Inti yang Wajib Ditegakkan:
1. **Order != Payment**: State order (`draft`, `pending_payment`, `confirmed`, `in_preparation`, `ready`, `completed`, `cancelled`) dan state payment (`pending`, `succeeded`, `failed`, `expired`, `cancelled`, `refunded`) terpisah mutlak.
2. **Zero-Trust Pricing**: Backend dan database (RPC/Stored Procedure) adalah satu-satunya penentu kebenaran harga, varian, modifier, dan total belanja. Frontend tidak boleh dipercaya sebagai sumber kebenaran data finansial.
3. **Integritas Skema**: Semua entitas internal menggunakan `BIGINT` identity (satu-satunya pengecualian: `profiles.id` berupa `UUID` karena harus sama dengan `auth.users.id` milik Supabase Auth; lihat [ADR 0001](./docs/adr/0001-bigint-identifiers.md)). Pengenal yang dibaca manusia (`order_no`) terpisah dari kunci internal. Nilai nominal uang disimpan sebagai `INTEGER` (Rupiah penuh, bukan floating point).
4. **Row Level Security (RLS)**: RLS wajib aktif pada semua tabel Supabase dengan isolasi tenant per store.
5. **Pemisahan Antarmuka**: POS Kasir (`/pos`), Admin Dashboard (`/admin`), dan Kitchen Display System (`/kitchen`) memiliki layout dan fungsi yang independen, bukan satu dashboard generik.
