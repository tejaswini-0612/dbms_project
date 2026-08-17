-- Insert 4 service types
INSERT INTO service_type (name, description, base_price, estimated_minutes) VALUES
('Oil Change', 'Standard synthetic oil and filter change', 1500.00, 45),
('Brake Repair', 'Replace brake pads and check rotors', 3500.00, 120),
('Battery Replacement', 'Install new battery and check alternator', 4000.00, 30),
('General Service', 'Comprehensive vehicle check and tune-up', 5000.00, 180);

-- Insert 1 customer (password: password123)
-- bcrypt hash for password123: $2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW
INSERT INTO customer (name, email, phone, password_hash, address) VALUES
('John Doe', 'john@example.com', '1234567890', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', '123 Main St, City');

-- Insert 2 vehicles for the customer
INSERT INTO vehicle (customer_id, registration_number, make, model, year) VALUES
(1, 'MH-12-AB-1234', 'Honda', 'City', 2020),
(1, 'MH-14-XY-9876', 'Hyundai', 'i20', 2022);

-- Insert 1 mechanic (password: password123)
INSERT INTO mechanic (name, email, phone, password_hash, specialization) VALUES
('Mike Smith', 'mike@vsms.com', '0987654321', '$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW', 'General Repairs');
