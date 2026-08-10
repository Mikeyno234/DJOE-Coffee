-- Migration Script: 002_supabase_postgres_schema.sql (Pure INTEGER Primary & Foreign Keys)
-- Description: Production schema for Supabase / PostgreSQL including DJOE COFFEE Menu Categories & Sample Items.

-- DROP OLD TABLES FOR CLEAN MIGRATION
DROP TABLE IF EXISTS t_transaction_items CASCADE;
DROP TABLE IF EXISTS t_transactions CASCADE;
DROP TABLE IF EXISTS t_menu_price_hist CASCADE;
DROP TABLE IF EXISTS t_refresh_tokens CASCADE;
DROP TABLE IF EXISTS m_operational_costs CASCADE;
DROP TABLE IF EXISTS m_recipe_ingredients CASCADE;
DROP TABLE IF EXISTS m_menus CASCADE;
DROP TABLE IF EXISTS m_store_config CASCADE;
DROP TABLE IF EXISTS m_categories CASCADE;
DROP TABLE IF EXISTS m_users CASCADE;
DROP TABLE IF EXISTS m_roles CASCADE;

-- 1. MASTER DATA TABLES

CREATE TABLE m_roles (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE m_users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'CASHIER',
    permissions JSONB DEFAULT '["pos"]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT
);

CREATE TABLE m_categories (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    bg_color VARCHAR(20),
    fg_color VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE m_store_config (
    id BIGINT PRIMARY KEY DEFAULT 1,
    store_name VARCHAR(150) NOT NULL DEFAULT 'DJOE COFFEE',
    tagline VARCHAR(150) DEFAULT 'Slow-Brewed Coffee & Snacks',
    address TEXT DEFAULT 'Jl. KH Abu Bakar, Patebon Kauman',
    phone VARCHAR(50) DEFAULT '08950000000',
    receipt_footer TEXT DEFAULT 'Open: 9:00 AM - 10:00 PM @djoecoffee',
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE m_menus (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    category_id BIGINT REFERENCES m_categories(id) ON DELETE SET NULL,
    category_name VARCHAR(100),
    name VARCHAR(150) NOT NULL,
    hpp NUMERIC(12, 2) NOT NULL DEFAULT 0,
    selling_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    margin_percent NUMERIC(6, 2) NOT NULL DEFAULT 0,
    is_manual_price BOOLEAN DEFAULT FALSE,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    updated_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE m_recipe_ingredients (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES m_menus(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    package_price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    package_capacity NUMERIC(12, 2) NOT NULL DEFAULT 1,
    usage_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    unit_cost NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE m_operational_costs (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES m_menus(id) ON DELETE CASCADE,
    name VARCHAR(150) NOT NULL,
    cost_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

-- 2. TRANSACTION & AUTH TABLES

CREATE TABLE t_refresh_tokens (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES m_users(id) ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE t_menu_price_hist (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    menu_id BIGINT NOT NULL REFERENCES m_menus(id) ON DELETE CASCADE,
    hpp NUMERIC(12, 2) NOT NULL,
    selling_price NUMERIC(12, 2) NOT NULL,
    margin_percent NUMERIC(6, 2) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE t_transactions (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_no VARCHAR(50) UNIQUE NOT NULL,
    total_amount NUMERIC(12, 2) NOT NULL,
    cash_received NUMERIC(12, 2) NOT NULL,
    change_amount NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'CASH',
    user_id BIGINT REFERENCES m_users(id) ON DELETE SET NULL,
    cashier_name VARCHAR(100) DEFAULT 'Kasir Kedai',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    created_by BIGINT REFERENCES m_users(id) ON DELETE SET NULL
);

CREATE TABLE t_transaction_items (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    transaction_id BIGINT NOT NULL REFERENCES t_transactions(id) ON DELETE CASCADE,
    menu_id BIGINT REFERENCES m_menus(id) ON DELETE SET NULL,
    menu_name VARCHAR(150) NOT NULL,
    unit_hpp NUMERIC(12, 2) NOT NULL,
    unit_price NUMERIC(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal NUMERIC(12, 2) NOT NULL
);

-- DISABLE ROW LEVEL SECURITY (RLS) FOR ALL TABLES TO ALLOW FULL DATA API ACCESS
ALTER TABLE m_roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_store_config DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_menus DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_recipe_ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE m_operational_costs DISABLE ROW LEVEL SECURITY;
ALTER TABLE t_refresh_tokens DISABLE ROW LEVEL SECURITY;
ALTER TABLE t_menu_price_hist DISABLE ROW LEVEL SECURITY;
ALTER TABLE t_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE t_transaction_items DISABLE ROW LEVEL SECURITY;

-- 3. ANALYTICAL VIEWS FOR DASHBOARD

CREATE OR REPLACE VIEW v_menu_hpp_summary AS
SELECT 
    m.id AS menu_id,
    m.name AS menu_name,
    c.name AS category_name,
    m.hpp,
    m.selling_price,
    m.margin_percent,
    (m.selling_price - m.hpp) AS net_profit_per_unit,
    m.image_url,
    m.created_at,
    m.created_by,
    m.updated_at,
    m.updated_by
FROM m_menus m
LEFT JOIN m_categories c ON m.category_id = c.id;

CREATE OR REPLACE VIEW v_daily_sales_recap AS
SELECT 
    DATE(t.created_at) AS transaction_date,
    COUNT(t.id) AS total_orders,
    SUM(t.total_amount) AS gross_revenue,
    SUM(ti.total_hpp) AS net_hpp_cost,
    (SUM(t.total_amount) - SUM(ti.total_hpp)) AS gross_profit,
    ROUND(AVG(t.total_amount), 0) AS avg_basket_size
FROM t_transactions t
JOIN (
    SELECT transaction_id, SUM(unit_hpp * quantity) AS total_hpp
    FROM t_transaction_items
    GROUP BY transaction_id
) ti ON t.id = ti.transaction_id
GROUP BY DATE(t.created_at);

-- 4. INITIAL SEED DATA (DJOE COFFEE SEED MENU)

-- Roles Seed
INSERT INTO m_roles (name, description) VALUES
('SUPER_ADMIN', 'Super Admin / Owner dengan akses User Management & izin menu penuh'),
('ADMIN', 'Admin Toko dengan akses Dashboard, POS, HPP, & Menu'),
('CASHIER', 'Kasir Kasir POS untuk transaksi harian');

-- Users Seed (ID 1: Super Admin, ID 2: Admin, ID 3: Kasir)
INSERT INTO m_users (name, email, password_hash, role, permissions, created_by) VALUES
('Super Admin Utama', 'superadmin@kedaikopi.com', 'b50428d0889218d6e9ef0c0d16d123d1326c2bc4a8b7a63200929944a9569b32', 'SUPER_ADMIN', '["dash", "pos", "calc", "list", "users", "profile"]'::jsonb, NULL),
('Barista Admin', 'admin@kedaikopi.com', '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9', 'ADMIN', '["dash", "pos", "calc", "list", "profile"]'::jsonb, 1),
('Kasir Shift Pagi', 'kasir@kedaikopi.com', '8b29fa8c1875e5339d3fb1531e21b79f8b4d8d14876b509f61b07ec3f317b686', 'CASHIER', '["pos", "profile"]'::jsonb, 1);

-- Categories Seed (DJOE COFFEE CATEGORIES: Milk Based, Signature Menu, Non - Coffee, Classic and Manual Brew, Snack, Lainnya)
INSERT INTO m_categories (name, icon, bg_color, fg_color, created_by) VALUES
('Milk Based', 'beaker', '#e8d5be', '#6b3a1f', 1),
('Signature Menu', 'sparkles', '#fde2cf', '#b5651d', 1),
('Non - Coffee', 'cup', '#fdf0c8', '#9a7b0a', 1),
('Classic and Manual Brew', 'fire', '#e8d5be', '#3d1f0d', 1),
('Snack', 'gift', '#fdf0c8', '#9a7b0a', 1),
('Lainnya', 'cube', '#e3e3e3', '#555555', 1);

-- Store Config Seed (DJOE COFFEE)
INSERT INTO m_store_config (id, store_name, tagline, address, phone, receipt_footer, updated_by) VALUES
(1, 'DJOE COFFEE', 'Slow-Brewed Coffee & Snacks', 'Jl. KH. Abu Bakar, Pateban Kauman, Kebonharjo, Kec. Patebon, Kabupaten Kendal, Jawa Tengah 51351', '08950000000', 'Open: 9:00 AM - 10:00 PM @djoecoffee', 1)
ON CONFLICT (id) DO UPDATE SET
  store_name = EXCLUDED.store_name,
  address = EXCLUDED.address;


-- DJOE COFFEE MENUS SEED
INSERT INTO m_menus (category_id, category_name, name, hpp, selling_price, margin_percent, is_manual_price, created_by) VALUES
-- Milk Based (Category ID 1)
(1, 'Milk Based', 'Kopi Susu / Ice Latte', 5500.00, 15000.00, 172.70, FALSE, 1),
(1, 'Milk Based', 'Kopi Susu Gula Aren', 6800.00, 15000.00, 120.60, FALSE, 1),
(1, 'Milk Based', 'Roasted Almond', 7000.00, 16000.00, 128.60, FALSE, 1),
(1, 'Milk Based', 'Hazelnut Latte', 7000.00, 16000.00, 128.60, FALSE, 1),
(1, 'Milk Based', 'Butterscotch', 8000.00, 20000.00, 150.00, FALSE, 1),
(1, 'Milk Based', 'Salted Caramel', 8000.00, 20000.00, 150.00, FALSE, 1),

-- Signature Menu (Category ID 2)
(2, 'Signature Menu', 'Apex Grape Tonic', 7500.00, 20000.00, 166.70, FALSE, 1),
(2, 'Signature Menu', 'Lemon Breeze', 7500.00, 20000.00, 166.70, FALSE, 1),

-- Non - Coffee (Category ID 3)
(3, 'Non - Coffee', 'Matcha Latte', 6000.00, 15000.00, 150.00, FALSE, 1),
(3, 'Non - Coffee', 'Thai Tea', 4000.00, 10000.00, 150.00, FALSE, 1),
(3, 'Non - Coffee', 'Tea', 1500.00, 5000.00, 233.30, FALSE, 1),
(3, 'Non - Coffee', 'Mineral Water', 1000.00, 3000.00, 200.00, FALSE, 1),

-- Classic and Manual Brew (Category ID 4)
(4, 'Classic and Manual Brew', 'Ice Americano', 3500.00, 10000.00, 185.70, FALSE, 1),
(4, 'Classic and Manual Brew', 'Long Black', 5000.00, 15000.00, 200.00, FALSE, 1),
(4, 'Classic and Manual Brew', 'EXTRA ESPRESSO', 2000.00, 5000.00, 150.00, FALSE, 1),
(4, 'Classic and Manual Brew', 'Sunkissed Americano', 4500.00, 13000.00, 188.90, FALSE, 1),
(4, 'Classic and Manual Brew', 'V60 / POUR OVER', 7000.00, 20000.00, 185.70, FALSE, 1),
(4, 'Classic and Manual Brew', 'VIETNAM DRIP', 5500.00, 15000.00, 172.70, FALSE, 1),

-- Snack (Category ID 5)
(5, 'Snack', 'MIX PLATTER', 6500.00, 17000.00, 161.50, FALSE, 1),
(5, 'Snack', 'Kebab Mini', 8000.00, 20000.00, 150.00, FALSE, 1),
(5, 'Snack', 'Lumpia Coklat / Keju', 4500.00, 12000.00, 166.70, FALSE, 1),
(5, 'Snack', 'Piscok / Lumpia Nangka', 5500.00, 15000.00, 172.70, FALSE, 1),
(5, 'Snack', 'Lumpia Rebung', 5500.00, 15000.00, 172.70, FALSE, 1),
(5, 'Snack', 'Singkong Keju / Coklat', 5000.00, 13000.00, 160.00, FALSE, 1),
(5, 'Snack', 'Cireng Ayam', 5500.00, 15000.00, 172.70, FALSE, 1),
(5, 'Snack', 'Kentang Goreng', 5500.00, 15000.00, 172.70, FALSE, 1);
