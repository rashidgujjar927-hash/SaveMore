-- ============================================
-- SAVEMORE DATABASE
-- PostgreSQL Schema
-- ============================================


-- ============================================
-- 1. ADMINS
-- ============================================

CREATE TABLE IF NOT EXISTS admins (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT NOT NULL,

    role VARCHAR(30) NOT NULL DEFAULT 'admin',

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    last_login TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 2. USERS
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL UNIQUE,

    password_hash TEXT,

    avatar_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 3. CATEGORIES
-- ============================================

CREATE TABLE IF NOT EXISTS categories (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    slug VARCHAR(120) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    sort_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 4. STORES
-- ============================================

CREATE TABLE IF NOT EXISTS stores (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(150) NOT NULL,

    slug VARCHAR(180) NOT NULL UNIQUE,

    description TEXT,

    logo_url TEXT,

    website_url TEXT,

    affiliate_url TEXT,

    category_id BIGINT REFERENCES categories(id)
        ON DELETE SET NULL,

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    is_active BOOLEAN NOT NULL DEFAULT TRUE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 5. DEALS
-- ============================================

CREATE TABLE IF NOT EXISTS deals (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(280) NOT NULL UNIQUE,

    description TEXT,

    image_url TEXT,

    original_price NUMERIC(12,2),

    deal_price NUMERIC(12,2),

    discount_percentage INTEGER,

    deal_url TEXT,

    affiliate_url TEXT,

    store_id BIGINT REFERENCES stores(id)
        ON DELETE SET NULL,

    category_id BIGINT REFERENCES categories(id)
        ON DELETE SET NULL,

    submitted_by BIGINT REFERENCES users(id)
        ON DELETE SET NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'draft',

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    views INTEGER NOT NULL DEFAULT 0,

    votes_up INTEGER NOT NULL DEFAULT 0,

    votes_down INTEGER NOT NULL DEFAULT 0,

    starts_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 6. COUPONS
-- ============================================

CREATE TABLE IF NOT EXISTS coupons (
    id BIGSERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,

    slug VARCHAR(280) NOT NULL UNIQUE,

    description TEXT,

    coupon_code VARCHAR(100),

    discount_text VARCHAR(100),

    coupon_url TEXT,

    affiliate_url TEXT,

    store_id BIGINT REFERENCES stores(id)
        ON DELETE SET NULL,

    category_id BIGINT REFERENCES categories(id)
        ON DELETE SET NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'draft',

    is_verified BOOLEAN NOT NULL DEFAULT FALSE,

    is_featured BOOLEAN NOT NULL DEFAULT FALSE,

    clicks INTEGER NOT NULL DEFAULT 0,

    starts_at TIMESTAMPTZ,

    expires_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 7. USER FAVORITES
-- ============================================

CREATE TABLE IF NOT EXISTS favorites (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    deal_id BIGINT REFERENCES deals(id)
        ON DELETE CASCADE,

    coupon_id BIGINT REFERENCES coupons(id)
        ON DELETE CASCADE,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT favorite_target_check
    CHECK (
        deal_id IS NOT NULL
        OR coupon_id IS NOT NULL
    )
);


-- ============================================
-- 8. DEAL VOTES
-- ============================================

CREATE TABLE IF NOT EXISTS deal_votes (
    id BIGSERIAL PRIMARY KEY,

    user_id BIGINT NOT NULL REFERENCES users(id)
        ON DELETE CASCADE,

    deal_id BIGINT NOT NULL REFERENCES deals(id)
        ON DELETE CASCADE,

    vote SMALLINT NOT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT valid_vote
    CHECK (vote IN (-1, 1)),

    CONSTRAINT unique_user_deal_vote
    UNIQUE (user_id, deal_id)
);


-- ============================================
-- 9. CONTACT MESSAGES
-- ============================================

CREATE TABLE IF NOT EXISTS contact_messages (
    id BIGSERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(255) NOT NULL,

    subject VARCHAR(255),

    message TEXT NOT NULL,

    status VARCHAR(30) NOT NULL DEFAULT 'unread',

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- 10. WEBSITE SETTINGS
-- ============================================

CREATE TABLE IF NOT EXISTS settings (
    id BIGSERIAL PRIMARY KEY,

    setting_key VARCHAR(100) NOT NULL UNIQUE,

    setting_value TEXT,

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_deals_status
ON deals(status);

CREATE INDEX IF NOT EXISTS idx_deals_store
ON deals(store_id);

CREATE INDEX IF NOT EXISTS idx_deals_category
ON deals(category_id);

CREATE INDEX IF NOT EXISTS idx_deals_featured
ON deals(is_featured);

CREATE INDEX IF NOT EXISTS idx_deals_expires
ON deals(expires_at);


CREATE INDEX IF NOT EXISTS idx_coupons_status
ON coupons(status);

CREATE INDEX IF NOT EXISTS idx_coupons_store
ON coupons(store_id);

CREATE INDEX IF NOT EXISTS idx_coupons_category
ON coupons(category_id);

CREATE INDEX IF NOT EXISTS idx_coupons_featured
ON coupons(is_featured);

CREATE INDEX IF NOT EXISTS idx_coupons_expires
ON coupons(expires_at);


CREATE INDEX IF NOT EXISTS idx_stores_active
ON stores(is_active);

CREATE INDEX IF NOT EXISTS idx_categories_active
ON categories(is_active);

CREATE INDEX IF NOT EXISTS idx_users_active
ON users(is_active);

CREATE INDEX IF NOT EXISTS idx_messages_status
ON contact_messages(status);


-- ============================================
-- DEFAULT CATEGORIES
-- ============================================

INSERT INTO categories
    (name, slug, description, sort_order)
VALUES
    ('Electronics', 'electronics', 'Electronics and gadgets', 1),
    ('Fashion', 'fashion', 'Fashion, clothing and accessories', 2),
    ('Beauty', 'beauty', 'Beauty and personal care', 3),
    ('Home & Garden', 'home-garden', 'Home and garden products', 4),
    ('Food & Grocery', 'food-grocery', 'Food and grocery deals', 5),
    ('Travel', 'travel', 'Travel and hotel deals', 6),
    ('Sports', 'sports', 'Sports and fitness deals', 7),
    ('Entertainment', 'entertainment', 'Entertainment and lifestyle', 8)
ON CONFLICT (slug) DO NOTHING;


-- ============================================
-- DEFAULT WEBSITE SETTINGS
-- ============================================

INSERT INTO settings
    (setting_key, setting_value)
VALUES
    ('site_name', 'SaveMore'),
    ('site_tagline', 'Find the best deals, coupons & discounts'),
    ('site_email', 'hello@savemore.com'),
    ('currency', 'USD'),
    ('timezone', 'Asia/Karachi'),
    ('maintenance_mode', 'false'),
    ('user_registration', 'true'),
    ('deal_voting', 'true'),
    ('user_favorites', 'true')
ON CONFLICT (setting_key) DO NOTHING;
