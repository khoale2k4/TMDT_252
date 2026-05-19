-- CourtMate Database Initialization Script (PostgreSQL)
-- Author: Senior Frontend Engineer (for Backend synchronization)
-- Version: 1.0.0

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define Enums
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('customer', 'staff', 'manager', 'owner', 'admin');
    CREATE TYPE venue_status AS ENUM ('active', 'inactive', 'maintenance');
    CREATE TYPE court_status AS ENUM ('available', 'maintenance', 'hidden');
    CREATE TYPE slot_status AS ENUM ('available', 'locked', 'booked', 'maintenance');
    CREATE TYPE booking_status AS ENUM ('pending_payment', 'confirmed', 'cancelled', 'completed');
    CREATE TYPE payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    role user_role DEFAULT 'customer',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Venues Table
CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    owner_id UUID REFERENCES users(id),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    address TEXT NOT NULL,
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    amenities JSONB DEFAULT '[]', -- e.g., ["parking", "shower", "wifi"]
    sport_types JSONB DEFAULT '[]', -- e.g., ["pickleball", "badminton"]
    status venue_status DEFAULT 'active',
    rating_avg DECIMAL(3, 2) DEFAULT 0.0,
    total_reviews INT DEFAULT 0,
    cover_image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Courts Table
CREATE TABLE IF NOT EXISTS courts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    sport_type VARCHAR(50) NOT NULL,
    status court_status DEFAULT 'available',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Slots Table
CREATE TABLE IF NOT EXISTS slots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    court_id UUID REFERENCES courts(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price INT NOT NULL, -- VNĐ
    status slot_status DEFAULT 'available',
    version INT DEFAULT 1,
    locked_by UUID REFERENCES users(id),
    locked_until TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    venue_id UUID REFERENCES venues(id),
    total_amount INT NOT NULL,
    discount_amount INT DEFAULT 0,
    tax_amount INT DEFAULT 0,
    final_amount INT NOT NULL,
    status booking_status DEFAULT 'pending_payment',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Booking Items (Link Bookings to Slots)
CREATE TABLE IF NOT EXISTS booking_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    slot_id UUID REFERENCES slots(id),
    price INT NOT NULL
);

-- 7. Products Table (Add-ons like racket rental, drinks)
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL,
    stock INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Booking Products (Add-ons purchased during booking)
CREATE TABLE IF NOT EXISTS booking_products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id),
    quantity INT DEFAULT 1,
    price INT NOT NULL
);

-- 9. Pricing Rules (Dynamic Pricing)
CREATE TABLE IF NOT EXISTS pricing_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    rule_name VARCHAR(255) NOT NULL,
    description TEXT,
    priority INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    conditions JSONB NOT NULL, -- Logical rules for applying this price
    adjustments JSONB NOT NULL, -- Percentage or fixed amount changes
    valid_from DATE,
    valid_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venue_id UUID REFERENCES venues(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 11. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    method VARCHAR(50) NOT NULL, -- 'momo', 'zalopay', 'credit_card'
    amount INT NOT NULL,
    status payment_status DEFAULT 'pending',
    provider_transaction_id VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. Invoices (MISA Integration)
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id),
    misa_invoice_no VARCHAR(100),
    pdf_url TEXT,
    status VARCHAR(50) DEFAULT 'issued',
    issued_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. Audit Logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    entity_name VARCHAR(100) NOT NULL, -- e.g., 'slots', 'bookings'
    entity_id UUID NOT NULL,
    action VARCHAR(50) NOT NULL, -- 'create', 'update', 'delete', 'reschedule'
    old_value JSONB,
    new_value JSONB,
    reason TEXT,
    performed_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
CREATE TABLE IF NOT EXISTS refresh_token (
                               id BIGSERIAL PRIMARY KEY,
                               token VARCHAR(255) NOT NULL UNIQUE,
                               expiry_date TIMESTAMPTZ NOT NULL,
                               user_id BIGINT NOT NULL,
                               CONSTRAINT fk_user_refresh_token
                                   FOREIGN KEY (user_id)
                                       REFERENCES users(id)
                                       ON DELETE CASCADE
);
CREATE TABLE IF NOT EXISTS user_venue (
                            user_id UUID NOT NULL,
                            venue_id UUID NOT NULL,


    -- Khóa chính phức hợp (Composite Primary Key) đảm bảo 1 user không bị gán trùng 1 sân
                            PRIMARY KEY (user_id, venue_id),

    -- Khóa ngoại liên kết tới bảng users
                            CONSTRAINT fk_user_venue_user
                                FOREIGN KEY (user_id)
                                    REFERENCES users(id)
                                    ON DELETE CASCADE,

    -- Khóa ngoại liên kết tới bảng venues (giả định bảng của bạn tên là venues)
                            CONSTRAINT fk_user_venue_venue
                                FOREIGN KEY (venue_id)
                                    REFERENCES venues(id)
                                    ON DELETE CASCADE
);

-- Tạo Index để tìm kiếm token nhanh hơn
CREATE INDEX idx_refresh_token_value ON refresh_token(token);

-- Create Indexes
CREATE INDEX idx_venues_status ON venues(status);
CREATE INDEX idx_venues_coordinates ON venues(latitude, longitude);
CREATE INDEX idx_courts_venue_id ON courts(venue_id);
CREATE INDEX idx_slots_court_date ON slots(court_id, date);
CREATE INDEX idx_slots_status ON slots(status);
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_pricing_rules_venue ON pricing_rules(venue_id, is_active);
CREATE INDEX idx_payments_booking_id ON payments(booking_id);

-- Dummy Data
-- 1. Users
INSERT INTO users (id, email, password_hash, full_name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'admin@courtmate.vn', 'hashed_pass', 'System Admin', 'admin'),
('00000000-0000-0000-0000-000000000002', 'khoa.user@gmail.com', 'hashed_pass', 'Lê Khoa', 'customer');

-- 2. Venue
INSERT INTO venues (id, owner_id, name, address, latitude, longitude, sport_types, amenities) VALUES 
('10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'Sân Pickleball Quận 7 Arena', '123 Nguyễn Thị Thập, Quận 7, TP.HCM', 10.7769, 106.7009, '["pickleball", "badminton"]', '["parking", "shower", "locker"]');

-- 3. Court
INSERT INTO courts (id, venue_id, name, sport_type) VALUES 
('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'Sân A1', 'pickleball');

-- 4. Slots (Today)
INSERT INTO slots (court_id, date, start_time, end_time, price, status) VALUES 
('20000000-0000-0000-0000-000000000001', CURRENT_DATE, '08:00', '09:00', 120000, 'available'),
('20000000-0000-0000-0000-000000000001', CURRENT_DATE, '09:00', '10:00', 120000, 'available'),
('20000000-0000-0000-0000-000000000001', CURRENT_DATE, '10:00', '11:00', 150000, 'available');
