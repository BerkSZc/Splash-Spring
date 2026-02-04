CREATE SCHEMA IF NOT EXISTS logo;

ALTER ROLE postgres SET search_path TO logo, public;

CREATE TABLE IF NOT EXISTS logo.customer (
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

-- Örnek müşteriler
INSERT INTO logo.customer (name, address, country, local, district, vd_no, customer_code)
VALUES
('Müşteri A', 'Adres 1', 'Türkiye', 'İstanbul', 'Kadıköy', '1234567890', 'K13'),
('Müşteri B', 'Adres 2', 'Türkiye', 'Ankara', 'Çankaya', '0987654321', 'T51');

-- ---------------------------
-- 2. MALZEME TABLOSU
-- ---------------------------


CREATE TYPE unit_status AS ENUM ('KG', 'ADET', 'M');
CREATE TYPE currency_status AS ENUM ('TRY', 'EUR', 'USD');

CREATE TABLE IF NOT EXISTS logo.material (
    id BIGSERIAL PRIMARY KEY ,
    code VARCHAR(50) NOT NULL,
    comment VARCHAR(255),
    unit unit_status NOT NULL,
    purchase_price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    sales_price DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    purchase_currency currency_status NOT NULL DEFAULT 'TRY',
    sales_currency currency_status NOT NULL DEFAULT 'TRY'
);

-- Örnek malzemeler
INSERT INTO logo.material (code, comment, unit, purchase_price, sales_price, purchase_currency, sales_currency)
VALUES
('M001', 'Malzeme 1', 'ADET', 2.00, 5.00, 'EUR', 'USD'),
('M002', 'Malzeme 2', 'KG', 3.00, 8.00, 'EUR', 'USD');

-- ---------------------------
-- 3. SATIN ALMA FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS logo.purchase_invoice (
    id BIGSERIAL PRIMARY KEY ,
    file_no VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    company_id BIGINT,
    total_price DECIMAL(15,2) DEFAULT 0,
    kdv_toplam DECIMAL(15,2) DEFAULT 0,
    eur_selling_rate DECIMAL(18, 4) DEFAULT 0.0000,
    usd_selling_rate DECIMAL(18, 4) DEFAULT 0.0000,
    FOREIGN KEY (customer_id) REFERENCES logo.customer(id),
    FOREIGN KEY (company_id) REFERENCES logo.company(id)
);

-- ---------------------------
-- 4. SATIN ALMA FATURA KALEMLERİ
-- ---------------------------
CREATE TABLE IF NOT EXISTS logo.purchase_invoice_item (
    id BIGSERIAL PRIMARY KEY ,
    purchase_invoice_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    kdv DECIMAL(5,2) DEFAULT 20,
    kdv_tutar DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (purchase_invoice_id) REFERENCES logo.purchase_invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES logo.material(id)
);

-- ---------------------------
-- 5. SATIŞ FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS logo.sales_invoice (
    id BIGSERIAL PRIMARY KEY ,
    file_no VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer_id BIGINT NOT NULL,
    company_id BIGINT,
    total_price DECIMAL(15,2) DEFAULT 0,
    kdv_toplam DECIMAL(15,2) DEFAULT 0,
    type INTEGER,
    eur_selling_rate DECIMAL(15, 4) DEFAULT 0.0000,
    usd_selling_rate DECIMAL(15, 4) DEFAULT 0.0000,
    FOREIGN KEY (customer_id) REFERENCES logo.customer(id),
    FOREIGN KEY (company_id) REFERENCES logo.company(id)
);

-- ---------------------------
-- 6. SATIŞ FATURA KALEMLERİ
-- ---------------------------
CREATE TABLE IF NOT EXISTS logo.sales_invoice_item (
    id BIGSERIAL PRIMARY KEY ,
    sales_invoice_id BIGINT NOT NULL,
    material_id BIGINT NOT NULL,
    unit_price DECIMAL(15,2) NOT NULL,
    quantity DECIMAL(15,2) NOT NULL,
    line_total DECIMAL(15,2) NOT NULL,
    kdv DECIMAL(5,2) DEFAULT 18,
    kdv_tutar DECIMAL(15,2) DEFAULT 20,
    FOREIGN KEY (sales_invoice_id) REFERENCES logo.sales_invoice(id) ON DELETE CASCADE,
    FOREIGN KEY (material_id) REFERENCES logo.material(id)
);

CREATE TYPE invoice_status AS ENUM ('PURCHASE', 'SALES');

CREATE TABLE logo.material_price_history (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT,
    invoice_type invoice_status,
    invoice_id BIGINT,
    price DECIMAL(18,2),
    date DATE,
    customer_name VARCHAR(255),
    quantity DECIMAL(18, 2),
    customer_id BIGINT,

    CONSTRAINT cutomer_price
        FOREIGN KEY (customer_id) REFERENCES logo.customer(id),
    CONSTRAINT fk_material_price_history_material
        FOREIGN KEY (material_id) REFERENCES logo.material(id)
);



-- ---------------------------
-- Örnek Satın Alma Faturası
-- ---------------------------
INSERT INTO logo.purchase_invoice (file_no, date, customer_id, company_id, total_price, kdv_toplam)
VALUES ('PA-001', '2025-12-01', 1, 2, 200, 36);

INSERT INTO logo.purchase_invoice_item (purchase_invoice_id, material_id, unit_price, quantity, line_total, kdv)
VALUES (1, 1, 100, 2, 200, 36);

-- ---------------------------
-- Örnek Satış Faturası
-- ---------------------------
INSERT INTO logo.sales_invoice (file_no, date, customer_id, company_id, total_price, kdv_toplam, type)
VALUES ('SA-001', '2025-12-01', 2, 3, 300, 54, 1);

INSERT INTO logo.sales_invoice_item (sales_invoice_id, material_id, unit_price, quantity, line_total, kdv)
VALUES (1, 2, 150, 2, 300, 54);


-- Şirketten Ödeme Alma Tablosu

CREATE TABLE IF NOT EXISTS logo.received_collection (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    customer_name VARCHAR(255),
    file_no VARCHAR(255),
    CONSTRAINT fk_received_customer FOREIGN KEY (customer_id) REFERENCES logo.customer(id),
    CONSTRAINT fk_received_company FOREIGN KEY (company_id) REFERENCES logo.company(id)
);


-- Şirkete Ödeme Tablosu

CREATE TABLE IF NOT EXISTS logo.payment_company (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    customer_name VARCHAR(255),
    file_no VARCHAR(255),
    CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES logo.customer(id),
    CONSTRAINT fk_payment_company FOREIGN KEY (company_id) REFERENCES logo.company(id)
);

-- Kullanıcı Tablosu
CREATE TABLE IF NOT EXISTS logo.app_user(
id BIGSERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL
);

-- Şirket Tablosu
CREATE TABLE IF NOT EXISTS logo.company (
id BIGSERIAL PRIMARY KEY,
name VARCHAR(255),
schema_name VARCHAR(255),
description VARCHAR(255)
);

CREATE TYPE payroll_model_enum AS ENUM ('INPUT', 'OUTPUT');
CREATE TYPE payroll_type_enum AS ENUM ('CHEQUE', 'BOND');

-- Bordro İşlemleri (Çek-Senet İşlemleri)
CREATE TABLE IF NOT EXISTS logo.payroll (
    id SERIAL PRIMARY KEY,
    transaction_date DATE NOT NULL,
    expired_date DATE,
    payroll_model payroll_model_enum NOT NULL,
    payroll_type payroll_type_enum NOT NULL,
    customer_id BIGINT,
    company_id BIGINT,
    file_no VARCHAR(100),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    amount DECIMAL(18, 2) NOT NULL DEFAULT 0.00,

    CONSTRAINT fk_payroll_customer
        FOREIGN KEY (customer_id)
        REFERENCES logo.customer(id) ON DELETE CASCADE,
         CONSTRAINT fk_payroll_company
        FOREIGN KEY (company_id)
        REFERENCES logo.company(id)
);

CREATE TABLE IF NOT EXISTS logo.currency_rate (
    id SERIAL PRIMARY KEY,
    currency VARCHAR(255),
    buying_rate DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    selling_rate DECIMAL(18, 2) NOT NULL DEFAULT 0.00,
    last_updated DATE
);

CREATE TABLE IF NOT EXISTS logo.opening_voucher (
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
        REFERENCES logo.customer(id) ON DELETE CASCADE,
        CONSTRAINT voucher_company
        FOREIGN KEY (company_id)
        REFERENCES logo.company(id)
);

CREATE TABLE IF NOT EXISTS logo.fiscal_year(
    id SERIAL PRIMARY KEY,
    year_value INTEGER,
    company_id BIGINT,

    CONSTRAINT fk_company_year
    FOREIGN KEY (company_id)
    REFERENCES logo.company(id) ON DELETE CASCADE
);