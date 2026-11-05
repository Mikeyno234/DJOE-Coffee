-- ============================================================================
-- SUPABASE SEED DATA: supabase/seed.sql
-- Description: Safe Development Seed Data for DJOE COFFEE
-- Standard Reference: CAFE_POS_BLUEPRINT.md
-- ============================================================================

-- 1. SEED CAFE & STORE
INSERT INTO cafes (id, name)
VALUES (1, 'DJOE COFFEE')
ON CONFLICT (id) DO NOTHING;

INSERT INTO stores (id, cafe_id, name, address, phone, receipt_footer)
VALUES (
    2,
    1,
    'DJOE COFFEE - Outlet Pusat',
    'Jl. KH. Abu Bakar, Patebon Kauman, Kendal, Jawa Tengah 51351',
    '08950000000',
    'Open: 9:00 AM - 10:00 PM @djoecoffee'
)
ON CONFLICT (id) DO NOTHING;

-- 2. SEED KATEGORI MENU
INSERT INTO categories (id, store_id, name, icon, sort_order)
VALUES
    (1, 2, 'Milk Based', 'beaker', 1),
    (2, 2, 'Signature Menu', 'sparkles', 2),
    (3, 2, 'Non - Coffee', 'cup', 3),
    (4, 2, 'Classic and Manual Brew', 'fire', 4),
    (5, 2, 'Snack', 'gift', 5),
    (6, 2, 'Lainnya', 'cube', 6)
ON CONFLICT (id) DO NOTHING;

-- 3. SEED PRODUK (INTEGER RUPIAH)
INSERT INTO products (id, store_id, category_id, name, description, image_url, base_price, base_hpp, is_active)
VALUES
    (1, 2, 1, 'Kopi Susu Gula Aren', 'Espresso, susu segar, dan gula aren murni', '/images/kopi_susu.png', 15000, 6800, TRUE),
    (2, 2, 1, 'Roasted Almond', 'Kopi susu dengan sirup almond panggang', NULL, 16000, 7000, TRUE),
    (3, 2, 1, 'Hazelnut Latte', 'Perpaduan lembut hazelnut dan kopi susu', NULL, 16000, 7000, TRUE),
    (4, 2, 2, 'Apex Grape Tonic', 'Mocktail kopi dingin dengan aroma anggur menyegarkan', NULL, 20000, 7500, TRUE),
    (5, 2, 3, 'Matcha Latte', 'Pure matcha Jepang dengan susu lembut', NULL, 15000, 6000, TRUE),
    (6, 2, 4, 'Ice Americano', 'Double shot espresso dengan air dingin segar', '/images/americano.png', 10000, 3500, TRUE),
    (7, 2, 4, 'V60 / Pour Over', 'Single origin coffee diseduh manual', NULL, 20000, 7000, TRUE),
    (8, 2, 5, 'Mix Platter', 'Sosis, kentang, dan nugget goreng renyah', NULL, 17000, 6500, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 4. SEED MODIFIER GROUPS (TINGKAT GULA & SUHU)
INSERT INTO modifier_groups (id, store_id, name, is_required, min_selection, max_selection)
VALUES
    (1, 2, 'Tingkat Gula', TRUE, 1, 1),
    (2, 2, 'Suhu', TRUE, 1, 1),
    (3, 2, 'Ekstra Tambahan', FALSE, 0, 3)
ON CONFLICT (id) DO NOTHING;

INSERT INTO modifier_options (id, group_id, name, price_adjustment, hpp_adjustment)
VALUES
    (1, 1, 'Normal Sugar (100%)', 0, 0),
    (2, 1, 'Less Sugar (50%)', 0, 0),
    (3, 1, 'No Sugar (0%)', 0, 0),
    (4, 2, 'Iced (Dingin)', 0, 0),
    (5, 2, 'Hot (Panas)', 0, 0),
    (6, 3, 'Extra Espresso Shot', 3000, 1500),
    (7, 3, 'Oat Milk Substitution', 5000, 2500)
ON CONFLICT (id) DO NOTHING;

-- 5. HUBUNGKAN MODIFIER KE PRODUK MINUMAN (checkout menolak modifier yang tidak terhubung)
INSERT INTO product_modifier_groups (product_id, modifier_group_id)
SELECT p.id, g.id
FROM products p
CROSS JOIN modifier_groups g
WHERE p.store_id = 2
  AND p.category_id <> 5
ON CONFLICT DO NOTHING;

-- 6. SINKRONKAN SEQUENCE IDENTITY (seed memakai ID eksplisit)
SELECT setval(pg_get_serial_sequence('cafes', 'id'), (SELECT MAX(id) FROM cafes));
SELECT setval(pg_get_serial_sequence('stores', 'id'), (SELECT MAX(id) FROM stores));
SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories));
SELECT setval(pg_get_serial_sequence('products', 'id'), (SELECT MAX(id) FROM products));
SELECT setval(pg_get_serial_sequence('modifier_groups', 'id'), (SELECT MAX(id) FROM modifier_groups));
SELECT setval(pg_get_serial_sequence('modifier_options', 'id'), (SELECT MAX(id) FROM modifier_options));
