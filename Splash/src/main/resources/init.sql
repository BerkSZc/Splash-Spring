DROP TYPE IF EXISTS public.unit_status CASCADE;
CREATE TYPE public.unit_status AS ENUM ('KG', 'ADET', 'M');

DROP TYPE IF EXISTS public.currency_status CASCADE;
CREATE TYPE public.currency_status AS ENUM ('TRY', 'EUR', 'USD');

DROP TYPE IF EXISTS public.invoice_status CASCADE;
CREATE TYPE public.invoice_status AS ENUM ('PURCHASE', 'SALES', 'UNKNOWN');

DROP TYPE IF EXISTS public.payroll_model_enum CASCADE;
CREATE TYPE public.payroll_model_enum AS ENUM ('INPUT', 'OUTPUT', 'UNKNOWN');

DROP TYPE IF EXISTS public.payroll_type_enum CASCADE;
CREATE TYPE public.payroll_type_enum AS ENUM ('CHEQUE', 'BOND', 'UNKNOWN');

CREATE CAST (varchar AS public.currency_status) WITH INOUT AS IMPLICIT;
CREATE CAST (varchar AS public.unit_status) WITH INOUT AS IMPLICIT;
CREATE CAST (varchar AS public.invoice_status) WITH INOUT AS IMPLICIT;
CREATE CAST (varchar AS public.payroll_model_enum) WITH INOUT AS IMPLICIT;
CREATE CAST (varchar AS public.payroll_type_enum) WITH INOUT AS IMPLICIT;

CREATE TABLE IF NOT EXISTS customer (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    address VARCHAR(255),
    country VARCHAR(100),
    local VARCHAR(100),
    district VARCHAR(100),
    vd_no VARCHAR(50),
    customer_code VARCHAR(255),
    archived BOOLEAN NOT NULL DEFAULT FALSE
);

-- ---------------------------
-- 2. MALZEME TABLOSU
-- ---------------------------

  CREATE TABLE IF NOT EXISTS material (
      id BIGSERIAL PRIMARY KEY ,
      code VARCHAR(50) NOT NULL,
      comment VARCHAR(255),
      unit public.unit_status NOT NULL,
      purchase_price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
      sales_price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
      purchase_currency public.currency_status NOT NULL DEFAULT 'TRY',
      sales_currency public.currency_status NOT NULL DEFAULT 'TRY'
  );

-- ---------------------------
-- 3. ŞİRKET TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS company (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(255),
schema_name VARCHAR(255),
description VARCHAR(255)
);

-- 4. Kullanıcı Tablosu
CREATE TABLE IF NOT EXISTS app_user(
id BIGSERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL
);

-- ---------------------------
-- 5. DÖVİZ KURU TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS currency_rate (
    id SERIAL PRIMARY KEY,
    currency VARCHAR(255),
    buying_rate DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    selling_rate DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    last_updated DATE
);

-- ---------------------------
-- 6. SATIN ALMA FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS purchase_invoice (
    id BIGSERIAL PRIMARY KEY ,
    file_no VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    company_id BIGINT,
    total_price DECIMAL(15,2) DEFAULT 0,
    kdv_toplam DECIMAL(15,2) DEFAULT 0,
    eur_selling_rate DECIMAL(18, 4) DEFAULT 0.0000,
    usd_selling_rate DECIMAL(18, 4) DEFAULT 0.0000,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (company_id) REFERENCES company(id)
);

-- ---------------------------
-- 7. SATIN ALMA FATURA KALEMLERİ
-- ---------------------------
CREATE TABLE IF NOT EXISTS purchase_invoice_item (
    id BIGSERIAL PRIMARY KEY ,
    purchase_invoice_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    kdv DECIMAL(5,2) DEFAULT 20,
    kdv_tutar DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (purchase_invoice_id) REFERENCES purchase_invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES material(id)
);

-- ---------------------------
-- 8. SATIŞ FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS sales_invoice (
    id BIGSERIAL PRIMARY KEY ,
    file_no VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    company_id BIGINT,
    total_price DECIMAL(15,2) DEFAULT 0,
    kdv_toplam DECIMAL(15,2) DEFAULT 0,
    eur_selling_rate DECIMAL(15, 4) DEFAULT 0.0000,
    usd_selling_rate DECIMAL(15, 4) DEFAULT 0.0000,
    FOREIGN KEY (customer_id) REFERENCES customer(id),
    FOREIGN KEY (company_id) REFERENCES company(id)
);

-- ---------------------------
-- 9. SATIŞ FATURA KALEMLERİ
-- ---------------------------
CREATE TABLE IF NOT EXISTS sales_invoice_item (
    id BIGSERIAL PRIMARY KEY ,
    sales_invoice_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    kdv DECIMAL(5,2) DEFAULT 18,
    kdv_tutar DECIMAL(15,2) DEFAULT 20,
    FOREIGN KEY (sales_invoice_id) REFERENCES sales_invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES material(id)
);

-- ---------------------------
-- 10. MALZEME FİYAT GEÇMİŞİ
-- ---------------------------

CREATE TABLE material_price_history (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT,
    invoice_type public.invoice_status,
    invoice_id BIGINT,
    price DECIMAL(18,2),
    date DATE,
    customer_name VARCHAR(255),
    quantity DECIMAL(18, 2),
    customer_id BIGINT,

    CONSTRAINT cutomer_price
        FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_material_price_history_material
        FOREIGN KEY (material_id) REFERENCES material(id)
);


-- ---------------------------
-- 11. TAHSİLAT TABLOSU
-- ---------------------------

CREATE TABLE IF NOT EXISTS received_collection (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    customer_name VARCHAR(255),
    file_no VARCHAR(255),
    CONSTRAINT fk_received_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_received_company FOREIGN KEY (company_id) REFERENCES company(id)
);


-- ---------------------------
-- 12. FİRMAYA ÖDEME TABLOSU
-- ---------------------------

CREATE TABLE IF NOT EXISTS payment_company (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    customer_name VARCHAR(255),
    file_no VARCHAR(255),
    CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES customer(id),
    CONSTRAINT fk_payment_company FOREIGN KEY (company_id) REFERENCES company(id)
);

-- ---------------------------
-- 13. BORDRO İŞLEMLERİ TABLOSU
-- ---------------------------

-- Bordro İşlemleri (Çek-Senet İşlemleri)
CREATE TABLE IF NOT EXISTS payroll (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    expired_date DATE,
    payroll_model public.payroll_model_enum NOT NULL,
    payroll_type public.payroll_type_enum NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    file_no VARCHAR(100),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_payroll_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(id) ON DELETE CASCADE,
         CONSTRAINT fk_payroll_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
);

-- ---------------------------
-- 14. AÇILIŞ BAKİYESİ TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS opening_voucher (
    id SERIAL PRIMARY KEY,
    customer_id BIGINT,
    company_id BIGINT,
    customer_name VARCHAR(255),
    file_no VARCHAR(255),
    description VARCHAR(255),
    date DATE,
    debit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    credit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    final_balance DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    yearly_credit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    yearly_debit DECIMAL(18, 2) NOT NULL DEFAULT 0.00,

        CONSTRAINT voucher_customer
        FOREIGN KEY (customer_id)
        REFERENCES customer(id) ON DELETE CASCADE,
        CONSTRAINT voucher_company
        FOREIGN KEY (company_id)
        REFERENCES company(id)
);

-- ---------------------------
-- 15. MALİ YIL TABLOSU
-- ---------------------------

CREATE TABLE IF NOT EXISTS fiscal_year(
    id SERIAL PRIMARY KEY,
    year_value INTEGER,
    company_id BIGINT,

    CONSTRAINT fk_company_year
    FOREIGN KEY (company_id)
    REFERENCES company(id) ON DELETE CASCADE
);

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_pur_inv_company_date
ON purchase_invoice (company_id, date);

CREATE INDEX IF NOT EXISTS idx_sales_inv_company_date
ON sales_invoice (company_id, date);

CREATE INDEX IF NOT EXISTS idx_payroll_date_file_no
ON payroll (transaction_date, file_no);