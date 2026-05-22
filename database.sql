-- 1. Create Tables

-- Users Table (Admin and Staff)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT CHECK (role IN ('admin', 'staff')) NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Categories Table
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    name TEXT NOT NULL,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Products Table
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    category_id UUID REFERENCES categories (id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    image_url TEXT,
    stock INTEGER DEFAULT 0,
    status TEXT CHECK (
        status IN ('available', 'out_of_stock')
    ) DEFAULT 'available',
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Orders Table
-- Orders Table (extended for Delivery & payments)
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    customer_name TEXT NOT NULL,
    order_number TEXT UNIQUE NOT NULL,
    order_type TEXT CHECK (
        order_type IN (
            'Pickup',
            'Dine-in',
            'Delivery'
        )
    ) DEFAULT 'Pickup',
    table_number TEXT,
    address TEXT,
    landmark TEXT,
    contact_number TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    delivery_fee DECIMAL(10, 2) DEFAULT 0,
    notes TEXT,
    status TEXT CHECK (
        status IN (
            'Pending',
            'Preparing',
            'Out for Delivery',
            'Delivered',
            'Completed',
            'Cancelled'
        )
    ) DEFAULT 'Pending',
    payment_method TEXT NOT NULL,
    payment_status TEXT CHECK (
        payment_status IN (
            'Pending Verification',
            'Paid',
            'Rejected'
        )
    ),
    payment_reference TEXT,
    payment_proof TEXT,
    created_at TIMESTAMP
    WITH
        TIME ZONE DEFAULT NOW()
);

-- Order Items Table
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    order_id UUID REFERENCES orders (id) ON DELETE CASCADE,
    product_id UUID REFERENCES products (id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL
);

-- 2. Enable Row Level Security (Optional but recommended)
-- For simplicity in this guide, we'll assume the user will handle RLS in Supabase dashboard.

-- 3. Seed Data

-- Categories
INSERT INTO
    categories (name)
VALUES ('Coffee'),
    ('Tea'),
    ('Cookies'),
    ('Snacks');

-- Products (Note: In a real setup, you'd need the category IDs from the previous insert)
-- For the sake of this script, we'll use a subquery to get category IDs.
INSERT INTO
    products (
        category_id,
        name,
        description,
        price,
        stock,
        status
    )
VALUES (
        (
            SELECT id
            FROM categories
            WHERE
                name = 'Coffee'
            LIMIT 1
        ),
        'Espresso',
        'Strong and bold',
        3.50,
        100,
        'available'
    ),
    (
        (
            SELECT id
            FROM categories
            WHERE
                name = 'Coffee'
            LIMIT 1
        ),
        'Cappuccino',
        'Creamy and smooth',
        4.50,
        100,
        'available'
    ),
    (
        (
            SELECT id
            FROM categories
            WHERE
                name = 'Tea'
            LIMIT 1
        ),
        'Green Tea',
        'Fresh and healthy',
        3.00,
        100,
        'available'
    ),
    (
        (
            SELECT id
            FROM categories
            WHERE
                name = 'Pastries'
            LIMIT 1
        ),
        'Croissant',
        'Buttery and flaky',
        2.50,
        50,
        'available'
    );

-- Admin User (Password: admin123 - hashed version below)
-- Note: You should generate a real hash using bcrypt for the actual setup.
-- This is just a placeholder. The setup guide will explain how to create the first admin.
INSERT INTO
    users (
        name,
        username,
        password,
        role
    )
VALUES (
        'Admin User',
        'jireh',
        '$2b$10$J2xFgumKfKYhxB3.Svrc1evZb8pKgFhpp615eID5wW0n8AAE.qaIm',
        'admin'
    );