# ☕ DJOE COFFEE — Architectural Improvement & Execution Blueprint
<!-- Acuan Utama: CAFE_POS_BLUEPRINT.md & Apple Design Fluid Principles (WWDC) -->
<!-- Standar Kepatuhan: Zero-Trust Security, ACID PostgreSQL, Apple Human Interface Guidelines -->

Dokumen ini adalah **Rencana Eksekusi dan Spesifikasi Teknis Perbaikan Komprehensif** untuk mentransformasi sistem **DJOE COFFEE (`kedai-kopi-hpp`)** dari prototype hybrid in-memory menjadi sistem kasir POS, kalkulator HPP, dan manajemen operasional kafe kelas enterprise yang tangguh, aman, dan memiliki pengalaman pengguna bertaraf dunia (*Apple-grade fluid interface*).

---

## 🏛️ Bagian I: Rekapitulasi Masalah & Target Arsitektur

Berdasarkan audit komparatif mendalam oleh **Google Gemini Web 4 Argon (Thinking: HIGH)** terhadap seluruh 71 berkas kode, berikut adalah transformasi inti yang harus ditegakkan:

```
┌────────────────────────────────────────────────────────────────────────┐
│                   TRANSFORMASI ARSITEKTUR UTAMA                        │
├───────────────────────────────────┬────────────────────────────────────┤
│ KONDISI LAMA (kedai-kopi-hpp)     │ STANDAR BARU (Blueprint + Apple)   │
├───────────────────────────────────┼────────────────────────────────────┤
│ • RLS dinonaktifkan di Supabase   │ • RLS 100% aktif dengan tenant RLS │
│ • NEXT_PUBLIC_ anon key di client │ • Server-only Service Role di API  │
│ • Password SHA-256 tanpa salt     │ • Supabase Auth / Scrypt bergaram  │
│ • Order & Payment dicampur        │ • Order != Payment state machine   │
│ • Fallback RAM serverless rawan   │ • Zero Data Loss (DB atomik + sync)│
│ • SPA monolitik (AppContainer)    │ • App Router Route Groups mandiri  │
│ • Web UI standar tanpa spring     │ • Apple Fluid Design (spring, blur)│
└───────────────────────────────────┴────────────────────────────────────┘
```

---

## 🎨 Bagian II: Standar Desain Apple (/apple-design) untuk POS Kafe

Operasional kasir kafe saat jam ramai (*rush hour*) membutuhkan kecepatan, ketepatan, dan keandalan sensorik. Mengadopsi prinsip **Apple Fluid Interfaces (WWDC)**:

### 1. Respon Instan (Kill Latency)
- **Feedback pada `pointerdown`, bukan `click`:** Kartu menu, tombol kuantitas `[+]`/`[-]`, dan tombol pecahan uang cepat langsung bereaksi seketika jari menyentuh layar.
- **Efek Tekan Taktil (*Tactile Press Feedback*):**
  ```css
  /* Sentuhan terasa hidup dan langsung */
  .pos-touch-btn:active {
    transform: scale(0.96);
    transition: transform 80ms cubic-bezier(0.2, 0, 1, 1);
  }
  ```
- **Ukuran Target Sentuh (Touch Targets):** Minimal tinggi `48px` (`h-12`) dengan jarak antar tombol minimal `8px` (`gap-2`) untuk mencegah salah pencet (*fat-finger error*).

### 2. Material, Kedalaman, & Translusensi (*Apple Vibrancy*)
- **Floating Chrome Bar:** Header navigasi dan ringkasan pembayaran menggunakan material translusen mengambang:
  ```css
  .apple-glass-chrome {
    background: rgba(255, 255, 255, 0.75);
    backdrop-filter: blur(20px) saturate(180%);
    -webkit-backdrop-filter: blur(20px) saturate(180%);
    border-top: 1px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 8px 32px 0 rgba(16, 42, 34, 0.08);
  }
  ```
- **Elevasi & Hirarki:** Elemen modal dan panel keranjang mengapung dengan bayangan kontekstual lembut (*soft directional diffusion*), bukan garis pembatas kaku (*hard 1px border*).

### 3. Fisika Pegas (*Spring Physics*) & Interuptibilitas
- Transisi buka-tutup keranjang dan modal kalkulator resep wajib menggunakan pegas *critically damped* (tidak memantul sembarangan):
  - **Default Modal/Sheet:** `damping: 1.0`, `response: 0.35s` (cepat, stabil, presisi).
  - **Flick/Swipe Dismiss:** `damping: 0.8`, `response: 0.30s` (mengikuti momentum lemparan jari kasir).
- **Interuptibel:** Jika kasir menutup modal lalu berubah pikiran dan menyentuhnya kembali saat sedang bergerak, animasi harus langsung mengikuti jari kasir tanpa jeda.

### 4. Tipografi Optikal Moneter (*Optical Currency Typography*)
- Angka total belanjaan kasir harus terbaca jelas dari jarak 1 meter di meja kasir:
  ```css
  .currency-hero {
    font-size: clamp(2rem, 3.5vw, 3rem);
    line-height: 1.05;
    letter-spacing: -0.03em; /* Tracking negatif rapat untuk teks display besar */
    font-feature-settings: "tnum" 1, "cv05" 1; /* Tabular numbers agar angka tidak goyang saat bertambah */
  }
  ```

---

## 🗄️ Bagian III: Spesifikasi Skema Database Baru (PostgreSQL / Supabase)

### File Migrasi: `supabase/migrations/20261026000001_cafe_pos_core.sql`

```sql
-- AKTIFKAN EKSTENSI UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ORGANISASI & STORES
CREATE TABLE cafes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    address TEXT,
    phone VARCHAR(50),
    receipt_footer TEXT DEFAULT 'Terima kasih atas kunjungan Anda @djoecoffee',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PROFIL PENGGUNA TERHUBUNG DENGAN SUPABASE AUTH (auth.users)
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    cafe_id UUID NOT NULL REFERENCES cafes(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(30) NOT NULL CHECK (role IN ('owner', 'manager', 'cashier', 'barista', 'inventory_staff')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. SHIFTS & CASH MOVEMENTS
CREATE TABLE shifts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    cashier_id UUID NOT NULL REFERENCES profiles(id),
    start_time TIMESTAMPTZ DEFAULT NOW(),
    end_time TIMESTAMPTZ,
    starting_cash INTEGER NOT NULL DEFAULT 0,
    expected_cash INTEGER DEFAULT 0,
    actual_cash INTEGER,
    difference INTEGER,
    notes TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed'))
);

CREATE TABLE cash_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    shift_id UUID NOT NULL REFERENCES shifts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('cash_in', 'cash_out')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    created_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. KATALOG, VARIAN & MODIFIERS
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(30),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    image_url TEXT,
    base_price INTEGER NOT NULL DEFAULT 0,
    base_hpp INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE product_variants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Regular", "Large"
    price_adjustment INTEGER NOT NULL DEFAULT 0,
    hpp_adjustment INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE modifier_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Level Gula", "Suhu", "Ekstra"
    is_required BOOLEAN DEFAULT FALSE,
    min_selection INT DEFAULT 0,
    max_selection INT DEFAULT 1
);

CREATE TABLE modifier_options (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL, -- "Less Sugar", "Extra Shot"
    price_adjustment INTEGER NOT NULL DEFAULT 0,
    hpp_adjustment INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE product_modifier_groups (
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    modifier_group_id UUID NOT NULL REFERENCES modifier_groups(id) ON DELETE CASCADE,
    PRIMARY KEY (product_id, modifier_group_id)
);

-- 4. ORDERS & ORDER ITEMS (ORDER STATE MACHINE)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    shift_id UUID REFERENCES shifts(id) ON DELETE SET NULL,
    order_no VARCHAR(50) UNIQUE NOT NULL,
    order_type VARCHAR(20) NOT NULL DEFAULT 'dine_in' CHECK (order_type IN ('dine_in', 'takeaway', 'delivery')),
    table_number VARCHAR(30),
    customer_name VARCHAR(100),
    status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN (
        'draft', 'pending_payment', 'confirmed', 'in_preparation', 'ready', 'completed', 'cancelled'
    )),
    subtotal_amount INTEGER NOT NULL DEFAULT 0,
    discount_amount INTEGER NOT NULL DEFAULT 0,
    total_amount INTEGER NOT NULL DEFAULT 0,
    total_hpp_snapshot INTEGER NOT NULL DEFAULT 0,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    variant_id UUID REFERENCES product_variants(id) ON DELETE SET NULL,
    product_name VARCHAR(150) NOT NULL,
    variant_name VARCHAR(100),
    unit_price INTEGER NOT NULL,
    unit_hpp INTEGER NOT NULL,
    quantity INT NOT NULL CHECK (quantity > 0),
    subtotal INTEGER NOT NULL,
    notes TEXT
);

CREATE TABLE order_item_modifiers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_item_id UUID NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    modifier_option_id UUID REFERENCES modifier_options(id) ON DELETE SET NULL,
    modifier_name VARCHAR(100) NOT NULL,
    unit_price INTEGER NOT NULL DEFAULT 0,
    unit_hpp INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE kitchen_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    ticket_no VARCHAR(30) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'ready')),
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    assigned_to UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. PAYMENTS & GATEWAY EVENTS (PAYMENT STATE MACHINE)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('cash', 'qris', 'debit')),
    amount INTEGER NOT NULL CHECK (amount > 0),
    status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN (
        'pending', 'succeeded', 'failed', 'expired', 'cancelled', 'refunded'
    )),
    cash_received INTEGER,
    change_amount INTEGER,
    gateway_provider VARCHAR(50),
    gateway_transaction_id VARCHAR(100),
    gateway_qr_string TEXT,
    gateway_expired_at TIMESTAMPTZ,
    idempotency_key VARCHAR(100) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE payment_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id) ON DELETE RESTRICT,
    amount INTEGER NOT NULL CHECK (amount > 0),
    reason TEXT NOT NULL,
    authorized_by UUID NOT NULL REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INVENTARIS & MASTER RESEP HPP
CREATE TABLE inventory_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    unit VARCHAR(20) NOT NULL,
    current_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
    minimum_stock NUMERIC(12, 3) NOT NULL DEFAULT 0,
    cost_per_unit INTEGER NOT NULL DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    variant_id UUID REFERENCES product_variants(id) ON DELETE CASCADE,
    overhead_cost INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE recipe_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recipe_id UUID NOT NULL REFERENCES recipes(id) ON DELETE CASCADE,
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    usage_amount NUMERIC(12, 3) NOT NULL
);

CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    inventory_item_id UUID NOT NULL REFERENCES inventory_items(id) ON DELETE RESTRICT,
    type VARCHAR(30) NOT NULL CHECK (type IN ('order_deduction', 'waste', 'restock', 'adjustment')),
    amount NUMERIC(12, 3) NOT NULL,
    reference_id UUID,
    created_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE cafes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE cash_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE modifier_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_item_modifiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE kitchen_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipe_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory_movements ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION get_user_cafe_id()
RETURNS UUID LANGUAGE sql STABLE SECURITY DEFINER AS $$
    SELECT cafe_id FROM profiles WHERE id = auth.uid();
$$;

CREATE POLICY "Staff can view store orders" ON orders
    FOR SELECT USING (
        store_id IN (SELECT id FROM stores WHERE cafe_id = get_user_cafe_id())
    );

CREATE POLICY "Cashiers can insert store orders" ON orders
    FOR INSERT WITH CHECK (
        store_id IN (SELECT id FROM stores WHERE cafe_id = get_user_cafe_id())
    );
```

---

## 🔒 Bagian IV: Database Stored Procedure (Atomic Zero-Trust Checkout)

```sql
CREATE SEQUENCE IF NOT EXISTS trx_order_seq START 1;

CREATE OR REPLACE FUNCTION process_pos_checkout(
    p_store_id UUID,
    p_shift_id UUID,
    p_cashier_id UUID,
    p_order_type VARCHAR,
    p_customer_name VARCHAR,
    p_table_number VARCHAR,
    p_payment_method VARCHAR,
    p_cash_received INTEGER,
    p_items JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_order_id UUID;
    v_payment_id UUID;
    v_ticket_id UUID;
    v_order_no TEXT;
    v_total_amount INTEGER := 0;
    v_total_hpp INTEGER := 0;
    v_change_amount INTEGER := 0;
    v_item RECORD;
    v_product RECORD;
    v_item_subtotal INTEGER;
    v_item_hpp INTEGER;
    v_order_item_id UUID;
    v_mod_id JSONB;
    v_mod RECORD;
BEGIN
    -- 1. Format Nomor Order: TRX-YYYYMMDD-0001
    v_order_no := 'TRX-' || to_char(NOW() AT TIME ZONE 'Asia/Jakarta', 'YYYYMMDD') || '-' || LPAD(nextval('trx_order_seq')::TEXT, 4, '0');

    -- 2. Buat Record Order Utama
    INSERT INTO orders (store_id, shift_id, order_no, order_type, customer_name, table_number, status, created_by)
    VALUES (p_store_id, p_shift_id, v_order_no, p_order_type, p_customer_name, p_table_number, 'pending_payment', p_cashier_id)
    RETURNING id INTO v_order_id;

    -- 3. Hitung Ulang Harga di Server (Zero-Trust) & Simpan Items
    FOR v_item IN SELECT * FROM jsonb_to_recordset(p_items) AS x(
        product_id UUID, variant_id UUID, quantity INT, notes TEXT, modifiers JSONB
    ) LOOP
        SELECT id, name, base_price, base_hpp INTO v_product
        FROM products WHERE id = v_item.product_id;

        IF NOT FOUND THEN
            RAISE EXCEPTION 'Produk tidak ditemukan';
        END IF;

        v_item_subtotal := v_product.base_price * v_item.quantity;
        v_item_hpp := v_product.base_hpp * v_item.quantity;

        INSERT INTO order_items (order_id, product_id, variant_id, product_name, unit_price, unit_hpp, quantity, subtotal, notes)
        VALUES (v_order_id, v_product.id, v_item.variant_id, v_product.name, v_product.base_price, v_product.base_hpp, v_item.quantity, v_item_subtotal, v_item.notes)
        RETURNING id INTO v_order_item_id;

        -- Tambah Modifiers jika ada
        IF v_item.modifiers IS NOT NULL THEN
            FOR v_mod_id IN SELECT * FROM jsonb_array_elements(v_item.modifiers) LOOP
                SELECT id, name, price_adjustment, hpp_adjustment INTO v_mod
                FROM modifier_options WHERE id = (v_mod_id->>0)::UUID;

                IF FOUND THEN
                    INSERT INTO order_item_modifiers (order_item_id, modifier_option_id, modifier_name, unit_price, unit_hpp)
                    VALUES (v_order_item_id, v_mod.id, v_mod.name, v_mod.price_adjustment, v_mod.hpp_adjustment);

                    v_item_subtotal := v_item_subtotal + (v_mod.price_adjustment * v_item.quantity);
                END IF;
            END LOOP;
        END IF;

        v_total_amount := v_total_amount + v_item_subtotal;
        v_total_hpp := v_total_hpp + v_item_hpp;
    END LOOP;

    -- Update Total pada Order
    UPDATE orders SET total_amount = v_total_amount, subtotal_amount = v_total_amount, total_hpp_snapshot = v_total_hpp WHERE id = v_order_id;

    -- 4. Proses Pembayaran
    IF p_payment_method = 'cash' THEN
        IF p_cash_received < v_total_amount THEN
            RAISE EXCEPTION 'Uang tunai kurang dari total belanja';
        END IF;
        v_change_amount := p_cash_received - v_total_amount;

        INSERT INTO payments (order_id, payment_method, amount, status, cash_received, change_amount)
        VALUES (v_order_id, 'cash', v_total_amount, 'succeeded', p_cash_received, v_change_amount)
        RETURNING id INTO v_payment_id;

        UPDATE orders SET status = 'confirmed' WHERE id = v_order_id;

        -- Kirim Tiket ke KDS
        INSERT INTO kitchen_tickets (order_id, store_id, ticket_no, status)
        VALUES (v_order_id, p_store_id, v_order_no, 'new')
        RETURNING id INTO v_ticket_id;
    ELSE
        -- QRIS / DEBIT (Pending Payment)
        INSERT INTO payments (order_id, payment_method, amount, status)
        VALUES (v_order_id, p_payment_method, v_total_amount, 'pending')
        RETURNING id INTO v_payment_id;
    END IF;

    RETURN jsonb_build_object(
        'order_id', v_order_id,
        'order_no', v_order_no,
        'total_amount', v_total_amount,
        'change_amount', v_change_amount,
        'payment_status', CASE WHEN p_payment_method = 'cash' THEN 'succeeded' ELSE 'pending' END
    );
END;
$$;
```

---

## 🛠️ Bagian V: Skema Validasi Zod (`lib/validations/`)

### 1. `lib/validations/order.schema.ts`
```typescript
import { z } from "zod";

export const createOrderSchema = z.object({
  store_id: z.string().uuid("Store ID tidak valid"),
  shift_id: z.string().uuid("Shift ID tidak valid").optional(),
  order_type: z.enum(["dine_in", "takeaway", "delivery"]),
  customer_name: z.string().max(100).optional(),
  table_number: z.string().max(30).optional(),
  items: z.array(
    z.object({
      product_id: z.string().uuid("Product ID wajib UUID"),
      variant_id: z.string().uuid().optional(),
      quantity: z.number().int().min(1, "Minimal 1 porsi"),
      notes: z.string().max(255).optional(),
      modifiers: z.array(z.string().uuid()).optional(),
    })
  ).min(1, "Keranjang pesanan tidak boleh kosong"),
  payment: z.object({
    method: z.enum(["cash", "qris", "debit"]),
    cash_received: z.number().int().min(0).optional(),
  }),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
```

### 2. `lib/validations/shift.schema.ts`
```typescript
import { z } from "zod";

export const openShiftSchema = z.object({
  store_id: z.string().uuid(),
  starting_cash: z.number().int().min(0, "Modal awal tidak boleh negatif"),
  notes: z.string().max(255).optional(),
});

export const closeShiftSchema = z.object({
  shift_id: z.string().uuid(),
  actual_cash: z.number().int().min(0, "Kas fisik aktual wajib diisi"),
  notes: z.string().max(500).optional(),
});
```

---

## 💻 Bagian VI: Struktur Route Next.js App Router Baru

```
app/
├── (auth)/
│   └── login/
│       └── page.tsx            # Apple Minimal Login Screen
├── (pos)/
│   └── pos/
│       ├── layout.tsx          # POS Layout (Full Width, No Admin Sidebar, Touch-Optimized)
│       └── page.tsx            # Grid Produk + Cart Samping + Fast Cash Pad
├── (kitchen)/
│   └── kitchen/
│       ├── layout.tsx          # KDS Dark Theme Layout
│       └── page.tsx            # Real-time Barista Queue (Baru, Sedang Dibuat, Siap)
├── (admin)/
│   └── admin/
│       ├── layout.tsx          # Admin Translucent SidebarNav Layout
│       ├── page.tsx            # Overview KPI (Gross, Net Profit, Order Count)
│       ├── products/page.tsx   # Kelola Produk, Varian & Modifier Groups
│       ├── categories/page.tsx # Kelola Kategori
│       ├── recipes/page.tsx    # Kalkulator HPP & Simulasi Resep
│       ├── inventory/page.tsx  # Stok Bahan Baku & Kartu Stok
│       ├── shifts/page.tsx     # Riwayat Shift Kasir & Mutasi Kas
│       ├── reports/page.tsx    # Laporan Penjualan & Ekspor CSV
│       └── staff/page.tsx      # Manajemen Staf & Role RBAC
└── api/
    ├── orders/route.ts         # POST Checkout via RPC Stored Procedure
    ├── payments/qris/route.ts  # Inisiasi Dynamic QRIS Gateway
    ├── shifts/route.ts         # Buka / Tutup Shift Kasir
    └── webhooks/payment/route.ts # Webhook Gateway Idempotent
```

---

## 🚀 Bagian VII: Roadmap Eksekusi Bertahap (Zero-Downtime)

1. **Fase 1 (Database & Validasi Fondasi):**
   - Buat migrasi `supabase/migrations/20261026000001_cafe_pos_core.sql` dan stored procedure `process_pos_checkout`.
   - Buat folder `lib/validations/` dengan skema Zod.
   - Perbaiki [supabaseClient.ts](file:///c:/Users/Omen/Documents/Hanif/Coding/kedai-kopi/kedai-kopi-hpp/lib/db/supabaseClient.ts) ke `server-only`.

2. **Fase 2 (Isolasi State & Desain Apple Kasir):**
   - Buat `lib/stores/usePosStore.ts` (Zustand + `localStorage`) untuk keranjang belanja kasir.
   - Implementasikan sentuhan taktil Apple Design (`scale(0.96)` pada `:active`, tinggi tombol `48px`, tipografi optikal uang `currency-hero`).
   - Buat route `app/(pos)/pos/page.tsx` mandiri.

3. **Fase 3 (KDS Barista & Pemisahan Admin):**
   - Buat halaman `app/(kitchen)/kitchen/page.tsx` dengan kartu pesanan besar dan Supabase Realtime subscription.
   - Pindahkan modul Dashboard, Menu, Kalkulator HPP, dan Users ke dalam grup `app/(admin)/admin/*`.

Dokumen ini menjadi cetak biru implementasi teknis resmi pendamping [CAFE_POS_BLUEPRINT.md](file:///c:/Users/Omen/Documents/Hanif/Coding/kedai-kopi/kedai-kopi-hpp/CAFE_POS_BLUEPRINT.md).
