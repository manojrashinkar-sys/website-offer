-- Migration 001: website promotion tables (PostgreSQL)
-- Apply with: psql "$DATABASE_URL" -f migrations/001_website_promotion.sql
-- (For local SQLite testing the app creates tables automatically on startup.)

BEGIN;

CREATE TABLE IF NOT EXISTS website_promotion_applications (
    id                       SERIAL PRIMARY KEY,
    reference_number         VARCHAR(24)  NOT NULL UNIQUE,
    owner_name               VARCHAR(120) NOT NULL,
    business_name            VARCHAR(160) NOT NULL,
    mobile_number            VARCHAR(16)  NOT NULL,
    whatsapp_number          VARCHAR(16)  NOT NULL,
    email                    VARCHAR(254) NOT NULL,
    business_category        VARCHAR(80)  NOT NULL,
    city                     VARCHAR(80)  NOT NULL,
    state                    VARCHAR(80)  NOT NULL,
    business_description     TEXT         NOT NULL,
    services_offered         TEXT         NOT NULL,
    existing_website_url     VARCHAR(500) NOT NULL DEFAULT '',
    social_media_links       TEXT         NOT NULL DEFAULT '',
    required_pages           TEXT         NOT NULL DEFAULT '',
    website_objective        VARCHAR(200) NOT NULL DEFAULT '',
    preferred_contact_method VARCHAR(30)  NOT NULL DEFAULT 'whatsapp',
    preferred_contact_time   VARCHAR(60)  NOT NULL DEFAULT '',
    expected_launch_timeline VARCHAR(60)  NOT NULL DEFAULT '',
    budget_range             VARCHAR(60)  NOT NULL DEFAULT '',
    has_domain               BOOLEAN      NOT NULL DEFAULT FALSE,
    has_hosting              BOOLEAN      NOT NULL DEFAULT FALSE,
    has_logo                 BOOLEAN      NOT NULL DEFAULT FALSE,
    content_ready            BOOLEAN      NOT NULL DEFAULT FALSE,
    images_ready             BOOLEAN      NOT NULL DEFAULT FALSE,
    additional_requirements  TEXT         NOT NULL DEFAULT '',
    portfolio_permission     BOOLEAN      NOT NULL DEFAULT FALSE,
    consent_to_contact       BOOLEAN      NOT NULL DEFAULT FALSE,
    privacy_policy_accepted  BOOLEAN      NOT NULL DEFAULT FALSE,
    source                   VARCHAR(60)  NOT NULL DEFAULT 'promo_page',
    status                   VARCHAR(30)  NOT NULL DEFAULT 'new',
    priority                 VARCHAR(10)  NOT NULL DEFAULT 'normal',
    admin_notes              TEXT         NOT NULL DEFAULT '',
    assigned_to              VARCHAR(80)  NOT NULL DEFAULT '',
    created_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    updated_at               TIMESTAMP    NOT NULL DEFAULT NOW(),
    contacted_at             TIMESTAMP,
    selected_at              TIMESTAMP,
    completed_at             TIMESTAMP
);

CREATE INDEX IF NOT EXISTS ix_wpa_reference_number ON website_promotion_applications (reference_number);
CREATE INDEX IF NOT EXISTS ix_wpa_email            ON website_promotion_applications (email);
CREATE INDEX IF NOT EXISTS ix_wpa_mobile_number    ON website_promotion_applications (mobile_number);
CREATE INDEX IF NOT EXISTS ix_wpa_status           ON website_promotion_applications (status);
CREATE INDEX IF NOT EXISTS ix_wpa_created_at       ON website_promotion_applications (created_at);

CREATE TABLE IF NOT EXISTS website_promotion_settings (
    id                            SERIAL PRIMARY KEY,
    promotion_enabled             BOOLEAN      NOT NULL DEFAULT TRUE,
    application_enabled           BOOLEAN      NOT NULL DEFAULT TRUE,
    whatsapp_enabled              BOOLEAN      NOT NULL DEFAULT TRUE,
    promotion_status              VARCHAR(40)  NOT NULL DEFAULT 'applications_open',
    headline                      VARCHAR(200) NOT NULL DEFAULT 'Introductory Website Development Programme',
    description                   TEXT         NOT NULL DEFAULT '',
    start_date                    TIMESTAMP,
    end_date                      TIMESTAMP,
    capacity_limit                INTEGER,
    capacity_display_enabled      BOOLEAN      NOT NULL DEFAULT FALSE,
    portfolio_permission_required BOOLEAN      NOT NULL DEFAULT FALSE,
    terms_text                    TEXT         NOT NULL DEFAULT '',
    maintenance_message           TEXT         NOT NULL DEFAULT '',
    updated_at                    TIMESTAMP    NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS website_promotion_demos (
    id          SERIAL PRIMARY KEY,
    category    VARCHAR(80)  NOT NULL,
    title       VARCHAR(120) NOT NULL,
    description TEXT         NOT NULL DEFAULT '',
    features    TEXT         NOT NULL DEFAULT '',
    demo_url    VARCHAR(500) NOT NULL DEFAULT '',
    image_url   VARCHAR(500) NOT NULL DEFAULT '',
    sort_order  INTEGER      NOT NULL DEFAULT 0,
    is_active   BOOLEAN      NOT NULL DEFAULT TRUE
);

-- Seed the singleton settings row if missing.
INSERT INTO website_promotion_settings (id)
SELECT 1
WHERE NOT EXISTS (SELECT 1 FROM website_promotion_settings WHERE id = 1);

COMMIT;
