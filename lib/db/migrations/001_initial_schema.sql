-- Migration Script: 001_initial_schema.sql (MySQL Compatible)
-- Description: Creates master data (m_*), transaction data (t_*), auth tables, and analytical views for Kedai Kopi HPP & POS

-- 1. MASTER DATA TABLES

CREATE TABLE IF NOT EXISTS m_roles (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description VARCHAR(255),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS m_users (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'CASHIER',
    permissions JSON NULL COMMENT 'Array of granted tab keys e.g. ["dash","pos","calc","list","users"]',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS m_categories (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    icon VARCHAR(10),
    bg_color VARCHAR(20),
    fg_color VARCHAR(20),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS m_menus (
    id VARCHAR(64) PRIMARY KEY,
    category_id VARCHAR(64),
    name VARCHAR(150) NOT NULL,
    hpp DECIMAL(12, 2) NOT NULL DEFAULT 0,
    selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    margin_percent DECIMAL(6, 2) NOT NULL DEFAULT 0,
    is_manual_price BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES m_categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS m_recipe_ingredients (
    id VARCHAR(64) PRIMARY KEY,
    menu_id VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    package_price DECIMAL(12, 2) NOT NULL DEFAULT 0,
    package_capacity DECIMAL(12, 2) NOT NULL DEFAULT 1,
    usage_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    unit_cost DECIMAL(12, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (menu_id) REFERENCES m_menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS m_operational_costs (
    id VARCHAR(64) PRIMARY KEY,
    menu_id VARCHAR(64) NOT NULL,
    name VARCHAR(150) NOT NULL,
    cost_amount DECIMAL(12, 2) NOT NULL DEFAULT 0,
    FOREIGN KEY (menu_id) REFERENCES m_menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. TRANSACTION & AUTH TABLES

CREATE TABLE IF NOT EXISTS t_refresh_tokens (
    id VARCHAR(64) PRIMARY KEY,
    user_id VARCHAR(64) NOT NULL,
    token_hash VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES m_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS t_menu_price_hist (
    id VARCHAR(64) PRIMARY KEY,
    menu_id VARCHAR(64) NOT NULL,
    hpp DECIMAL(12, 2) NOT NULL,
    selling_price DECIMAL(12, 2) NOT NULL,
    margin_percent DECIMAL(6, 2) NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (menu_id) REFERENCES m_menus(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS t_transactions (
    id VARCHAR(64) PRIMARY KEY,
    transaction_no VARCHAR(50) UNIQUE NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    cash_received DECIMAL(12, 2) NOT NULL,
    change_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(30) DEFAULT 'CASH',
    user_id VARCHAR(64),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES m_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS t_transaction_items (
    id VARCHAR(64) PRIMARY KEY,
    transaction_id VARCHAR(64) NOT NULL,
    menu_id VARCHAR(64),
    menu_name VARCHAR(150) NOT NULL,
    unit_hpp DECIMAL(12, 2) NOT NULL,
    unit_price DECIMAL(12, 2) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    subtotal DECIMAL(12, 2) NOT NULL,
    FOREIGN KEY (transaction_id) REFERENCES t_transactions(id) ON DELETE CASCADE,
    FOREIGN KEY (menu_id) REFERENCES m_menus(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. ANALYTICAL VIEWS

CREATE OR REPLACE VIEW v_menu_hpp_summary AS
SELECT 
    m.id AS menu_id,
    m.name AS menu_name,
    c.name AS category_name,
    m.hpp,
    m.selling_price,
    m.margin_percent,
    (m.selling_price - m.hpp) AS net_profit_per_unit
FROM m_menus m
LEFT JOIN m_categories c ON m.category_id = c.id;

-- 4. SEED DATA

INSERT IGNORE INTO m_roles (id, name, description) VALUES
('role-0', 'SUPER_ADMIN', 'Pemilik / Super Admin dengan akses User Management & izin menu penuh'),
('role-1', 'ADMIN', 'Admin Toko dengan akses Dashboard, POS, HPP, & Menu'),
('role-2', 'CASHIER', 'Kasir Kasir POS untuk transaksi harian');

INSERT IGNORE INTO m_categories (id, name, icon, bg_color, fg_color) VALUES
('cat-1', 'Minuman', '☕', '#e8d5be', '#6b3a1f'),
('cat-2', 'Makanan', '🍰', '#fde2cf', '#b5651d'),
('cat-3', 'Snack', '🍪', '#fdf0c8', '#9a7b0a'),
('cat-4', 'Lainnya', '📦', '#e3e3e3', '#555555');

INSERT IGNORE INTO m_users (id, name, email, password_hash, role, permissions) VALUES
('usr-0', 'Super Admin Utama', 'superadmin@kedaikopi.com', 'super123', 'SUPER_ADMIN', '["dash", "pos", "calc", "list", "users"]'),
('usr-1', 'Barista Admin', 'admin@kedaikopi.com', 'admin123', 'ADMIN', '["dash", "pos", "calc", "list"]'),
('usr-2', 'Kasir Shift Pagi', 'kasir@kedaikopi.com', 'kasir123', 'CASHIER', '["pos"]');
