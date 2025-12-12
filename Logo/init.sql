CREATE SCHEMA IF NOT EXISTS logo;

ALTER ROLE postgres SET search_path TO logo, public;

CREATE TABLE IF NOT EXISTS customer (
    id BIGSERIAL PRIMARY KEY ,
    name VARCHAR(255) NOT NULL,
    balance DECIMAL(15,2) DEFAULT 0,
    address VARCHAR(255),
    country VARCHAR(100),
    local VARCHAR(100),
    district VARCHAR(100),
    vdNo VARCHAR(50)
);

-- Örnek müşteriler
INSERT INTO customer (name, balance, address, country, local, district, vdNo)
VALUES
('Müşteri A', 1000.00, 'Adres 1', 'Türkiye', 'İstanbul', 'Kadıköy', '1234567890'),
('Müşteri B', 500.00, 'Adres 2', 'Türkiye', 'Ankara', 'Çankaya', '0987654321');

-- ---------------------------
-- 2. MALZEME TABLOSU
-- ---------------------------


CREATE TYPE unit_status AS ENUM ('KG', 'ADET', 'M');


CREATE TABLE IF NOT EXISTS material (
    id BIGSERIAL PRIMARY KEY ,
    code VARCHAR(50) NOT NULL,
    comment VARCHAR(255),
    unit unit_status NOT NULL
);

-- Örnek malzemeler
INSERT INTO material (code, comment, unit)
VALUES
('M001', 'Malzeme 1', 'ADET'),
('M002', 'Malzeme 2', 'KG');

-- ---------------------------
-- 3. SATIN ALMA FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS purchase_invoice (
    id BIGSERIAL PRIMARY KEY ,
    fileNo VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer BIGINT NOT NULL,
    totalPrice DECIMAL(15,2) DEFAULT 0,
    kdvToplam DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (customer) REFERENCES customer(id)
);

-- ---------------------------
-- 4. SATIN ALMA FATURA KALEMLERİ
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
-- 5. SATIŞ FATURASI TABLOSU
-- ---------------------------
CREATE TABLE IF NOT EXISTS sales_invoice (
    id BIGSERIAL PRIMARY KEY ,
    fileNo VARCHAR(50) NOT NULL,
    date DATE NOT NULL,
    customer BIGINT NOT NULL,
    totalPrice DECIMAL(15,2) DEFAULT 0,
    kdvToplam DECIMAL(15,2) DEFAULT 0,
    FOREIGN KEY (customer) REFERENCES customer(id)
);

-- ---------------------------
-- 6. SATIŞ FATURA KALEMLERİ
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

CREATE TYPE invoice_status AS ENUM ('PURCHASE', 'SALES');

CREATE TABLE material_price_history (
    id BIGSERIAL PRIMARY KEY,
    material_id BIGINT,
    fatura_tipi invoice_status,
    fiyat DECIMAL(19,2),
    tarih DATE,
    customer_name VARCHAR(255),
    CONSTRAINT fk_material_price_history_material
        FOREIGN KEY (material_id) REFERENCES material(id)
);



-- ---------------------------
-- Örnek Satın Alma Faturası
-- ---------------------------
INSERT INTO purchase_invoice (fileNo, date, customer, totalPrice, kdvToplam)
VALUES ('PA-001', '2025-12-01', 1, 200, 36);

INSERT INTO purchase_invoice_item (purchase_invoice_id, material_id, unit_price, quantity, line_total, kdv)
VALUES (1, 1, 100, 2, 200, 36);

-- ---------------------------
-- Örnek Satış Faturası
-- ---------------------------
INSERT INTO sales_invoice (fileNo, date, customer, totalPrice, kdvToplam)
VALUES ('SA-001', '2025-12-01', 2, 300, 54);

INSERT INTO sales_invoice_item (sales_invoice_id, material_id, unit_price, quantity, line_total, kdv)
VALUES (1, 2, 150, 2, 300, 54);


-- Şirketten Ödeme Alma Tablosu

CREATE TABLE IF NOT EXISTS received_collection (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    CONSTRAINT fk_received_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);


-- Şirkete Ödeme Tablosu

CREATE TABLE IF NOT EXISTS payment_company (
    id BIGSERIAL PRIMARY KEY ,
    date DATE NOT NULL,
    comment VARCHAR(255),
    price DECIMAL(15,2) NOT NULL,
    customer_id BIGINT,
    customer_name VARCHAR(255),
    CONSTRAINT fk_payment_customer FOREIGN KEY (customer_id) REFERENCES customer(id)
);

-- Kullanıcı Tablosu
CREATE TABLE IF NOT EXISTS logo_user(
id BIGSERIAL PRIMARY KEY,
username VARCHAR(255) NOT NULL,
password VARCHAR(255) NOT NULL
)
