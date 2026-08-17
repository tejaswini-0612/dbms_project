CREATE TYPE service_status AS ENUM ('Pending', 'In Progress', 'Completed', 'Closed');
CREATE TYPE payment_method AS ENUM ('Cash', 'Card', 'UPI');
CREATE TYPE payment_status AS ENUM ('Pending', 'Success', 'Failed');
CREATE TYPE invoice_status AS ENUM ('Unpaid', 'Paid');

CREATE TABLE customer (
    customer_id     SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(15) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    address         TEXT,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE mechanic (
    mechanic_id     SERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) UNIQUE NOT NULL,
    phone           VARCHAR(15) UNIQUE NOT NULL,
    password_hash   VARCHAR(255) NOT NULL,
    specialization  VARCHAR(100),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE vehicle (
    vehicle_id           SERIAL PRIMARY KEY,
    customer_id          INTEGER NOT NULL REFERENCES customer(customer_id) ON DELETE CASCADE,
    registration_number  VARCHAR(20) UNIQUE NOT NULL,
    make                 VARCHAR(50) NOT NULL,
    model                VARCHAR(50) NOT NULL,
    year                 SMALLINT CHECK (year BETWEEN 1980 AND 2100),
    created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE service_type (
    service_type_id    SERIAL PRIMARY KEY,
    name                VARCHAR(80) UNIQUE NOT NULL,
    description         TEXT,
    base_price          NUMERIC(10,2) NOT NULL CHECK (base_price >= 0),
    estimated_minutes   INTEGER
);

CREATE TABLE service_request (
    request_id       SERIAL PRIMARY KEY,
    vehicle_id        INTEGER NOT NULL REFERENCES vehicle(vehicle_id) ON DELETE CASCADE,
    service_type_id   INTEGER NOT NULL REFERENCES service_type(service_type_id),
    mechanic_id       INTEGER REFERENCES mechanic(mechanic_id),
    status            service_status NOT NULL DEFAULT 'Pending',
    requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    completed_at      TIMESTAMPTZ,
    closed_reason     TEXT
);

CREATE TABLE invoice (
    invoice_id     SERIAL PRIMARY KEY,
    request_id     INTEGER UNIQUE NOT NULL REFERENCES service_request(request_id) ON DELETE CASCADE,
    amount         NUMERIC(10,2) NOT NULL,
    tax            NUMERIC(10,2) NOT NULL DEFAULT 0,
    total_amount   NUMERIC(10,2) NOT NULL,
    status         invoice_status NOT NULL DEFAULT 'Unpaid',
    generated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payment (
    payment_id   SERIAL PRIMARY KEY,
    invoice_id   INTEGER NOT NULL REFERENCES invoice(invoice_id) ON DELETE CASCADE,
    amount       NUMERIC(10,2) NOT NULL,
    method       payment_method NOT NULL,
    status       payment_status NOT NULL DEFAULT 'Success',
    paid_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_vehicle_customer   ON vehicle(customer_id);
CREATE INDEX idx_request_vehicle    ON service_request(vehicle_id);
CREATE INDEX idx_request_status     ON service_request(status);
CREATE INDEX idx_request_mechanic   ON service_request(mechanic_id);

-- View: permanent service history (completed/closed requests only)
CREATE VIEW service_history AS
SELECT sr.request_id, c.customer_id, c.name AS customer_name,
       v.vehicle_id, v.registration_number, st.name AS service_name,
       m.name AS mechanic_name, sr.status, sr.requested_at, sr.completed_at,
       i.total_amount, i.status AS invoice_status
FROM service_request sr
JOIN vehicle v      ON v.vehicle_id = sr.vehicle_id
JOIN customer c     ON c.customer_id = v.customer_id
JOIN service_type st ON st.service_type_id = sr.service_type_id
LEFT JOIN mechanic m ON m.mechanic_id = sr.mechanic_id
LEFT JOIN invoice i  ON i.request_id = sr.request_id
WHERE sr.status IN ('Completed', 'Closed');

-- Trigger: auto-generate invoice the moment a request becomes Completed
CREATE OR REPLACE FUNCTION fn_generate_invoice()
RETURNS TRIGGER AS $$
DECLARE v_price NUMERIC(10,2);
BEGIN
    IF NEW.status = 'Completed' AND OLD.status IS DISTINCT FROM 'Completed' THEN
        NEW.completed_at := now();
        SELECT base_price INTO v_price FROM service_type WHERE service_type_id = NEW.service_type_id;
        INSERT INTO invoice (request_id, amount, tax, total_amount)
        VALUES (NEW.request_id, v_price, ROUND(v_price * 0.18, 2), ROUND(v_price * 1.18, 2))
        ON CONFLICT (request_id) DO NOTHING;
    END IF;
    RETURN NEW;
END; $$ LANGUAGE plpgsql;

CREATE TRIGGER trg_service_completed
BEFORE UPDATE ON service_request
FOR EACH ROW EXECUTE FUNCTION fn_generate_invoice();

-- Stored procedure: cancel/close a request (atomic, the "failure path")
CREATE OR REPLACE PROCEDURE sp_close_service_request(p_request_id INT, p_reason TEXT)
LANGUAGE plpgsql AS $$
BEGIN
    UPDATE service_request SET status = 'Closed', closed_reason = p_reason, updated_at = now()
    WHERE request_id = p_request_id AND status != 'Completed';
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Request % not found or already completed', p_request_id;
    END IF;
END; $$;

-- Stored procedure: record a payment and mark invoice paid (atomic)
CREATE OR REPLACE PROCEDURE sp_record_payment(p_invoice_id INT, p_amount NUMERIC, p_method payment_method)
LANGUAGE plpgsql AS $$
BEGIN
    INSERT INTO payment (invoice_id, amount, method, status) VALUES (p_invoice_id, p_amount, p_method, 'Success');
    UPDATE invoice SET status = 'Paid' WHERE invoice_id = p_invoice_id;
END; $$;
