/*
  # E-Commerce Tables

  1. New Tables
    - `stores` - Seller stores
      - `id` (uuid, primary key)
      - `seller_id` (uuid, references users)
      - `name` (text)
      - `logo_url` (text)
      - `banner_url` (text)
      - `description` (text)
      - `rating` (numeric)
      - `followers_count` (integer)
      - `is_verified` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `products` - Product listings
      - `id` (uuid, primary key)
      - `store_id` (uuid)
      - `title` (text)
      - `description` (text)
      - `price` (numeric)
      - `discount_percent` (integer)
      - `category` (text)
      - `stock` (integer)
      - `rating` (numeric)
      - `review_count` (integer)
      - `shipping_time` (text)
      - `return_policy` (text)
      - `images` (text[])
      - `variants` (jsonb)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `product_reviews` - Product reviews
      - `id` (uuid, primary key)
      - `product_id` (uuid)
      - `user_id` (uuid)
      - `rating` (integer 1-5)
      - `comment` (text)
      - `created_at` (timestamp)
    
    - `orders` - Customer orders
      - `id` (uuid, primary key)
      - `buyer_id` (uuid)
      - `items` (jsonb)
      - `total_amount` (numeric)
      - `status` (text)
      - `shipping_address` (text)
      - `payment_method` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `payout_details` - Seller payout info
      - `id` (uuid, primary key)
      - `seller_id` (uuid)
      - `method` (text: 'upi', 'bank')
      - `upi_id` (text)
      - `account_number` (text)
      - `ifsc` (text)
      - `holder_name` (text)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on all tables
    - Products are publicly readable
    - Sellers can only manage their own products
    - Users can only see their own orders
*/

CREATE TABLE IF NOT EXISTS stores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  name text NOT NULL,
  logo_url text,
  banner_url text,
  description text,
  rating numeric DEFAULT 0,
  followers_count integer DEFAULT 0,
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES stores(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  price numeric NOT NULL,
  discount_percent integer DEFAULT 0,
  category text,
  stock integer DEFAULT 0,
  rating numeric DEFAULT 0,
  review_count integer DEFAULT 0,
  shipping_time text,
  return_policy text,
  images text[] DEFAULT '{}',
  variants jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(product_id, user_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  buyer_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  items jsonb NOT NULL,
  total_amount numeric NOT NULL,
  status text DEFAULT 'pending',
  shipping_address text,
  payment_method text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payout_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  seller_id uuid NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  method text NOT NULL,
  upi_id text,
  account_number text,
  ifsc text,
  holder_name text,
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payout_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read stores"
  ON stores FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can create stores"
  ON stores FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update own stores"
  ON stores FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Anyone can read products"
  ON products FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Sellers can create products in own store"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can update own products"
  ON products FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Sellers can delete own products"
  ON products FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM stores
      WHERE stores.id = products.store_id
      AND stores.seller_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can read product reviews"
  ON product_reviews FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can create product reviews"
  ON product_reviews FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own reviews"
  ON product_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own reviews"
  ON product_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can read own orders"
  ON orders FOR SELECT
  TO authenticated
  USING (auth.uid() = buyer_id);

CREATE POLICY "Users can create orders"
  ON orders FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Users can update own orders"
  ON orders FOR UPDATE
  TO authenticated
  USING (auth.uid() = buyer_id)
  WITH CHECK (auth.uid() = buyer_id);

CREATE POLICY "Sellers can read payout details"
  ON payout_details FOR SELECT
  TO authenticated
  USING (auth.uid() = seller_id);

CREATE POLICY "Sellers can create payout details"
  ON payout_details FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = seller_id);

CREATE POLICY "Sellers can update payout details"
  ON payout_details FOR UPDATE
  TO authenticated
  USING (auth.uid() = seller_id)
  WITH CHECK (auth.uid() = seller_id);

CREATE INDEX idx_stores_seller_id ON stores(seller_id);
CREATE INDEX idx_products_store_id ON products(store_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_created_at ON products(created_at DESC);
CREATE INDEX idx_product_reviews_product_id ON product_reviews(product_id);
CREATE INDEX idx_product_reviews_user_id ON product_reviews(user_id);
CREATE INDEX idx_orders_buyer_id ON orders(buyer_id);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_payout_details_seller_id ON payout_details(seller_id);
