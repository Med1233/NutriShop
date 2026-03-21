const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT,
      name TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      phone TEXT DEFAULT '',
      address TEXT DEFAULT '',
      provider TEXT NOT NULL DEFAULT 'local',
      provider_id TEXT,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `);

  // Add columns if upgrading from older schema (users)
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'customer';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS address TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN NOT NULL DEFAULT false;
    EXCEPTION WHEN others THEN NULL;
    END $$
  `);

  // Grandfather existing local users as verified
  await pool.query(
    "UPDATE users SET email_verified = true WHERE email_verified = false AND provider = 'local' AND created_at < NOW() - INTERVAL '1 minute'",
  );

  await pool.query(`
    CREATE TABLE IF NOT EXISTS verification_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS refresh_tokens (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      token TEXT UNIQUE NOT NULL,
      expires_at TIMESTAMP NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS products (
      id SERIAL PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      price NUMERIC(10,2) NOT NULL,
      image_url TEXT,
      category TEXT NOT NULL,
      stock INTEGER NOT NULL DEFAULT 0,
      nutrition_info JSONB,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS cart_items (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL DEFAULT 1,
      created_at TIMESTAMP DEFAULT NOW(),
      UNIQUE(user_id, product_id)
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      total NUMERIC(10,2) NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      shipping_address TEXT,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);

  await pool.query(`
    CREATE TABLE IF NOT EXISTS order_items (
      id SERIAL PRIMARY KEY,
      order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
      product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
      quantity INTEGER NOT NULL,
      price NUMERIC(10,2) NOT NULL
    )
  `);

  // Add columns if upgrading from older schema (orders)
  await pool.query(`
    DO $$ BEGIN
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
      ALTER TABLE orders ADD COLUMN IF NOT EXISTS status_updated_at TIMESTAMP;
    EXCEPTION WHEN others THEN NULL;
    END $$
  `);

  // Drop old items table if it exists
  await pool.query('DROP TABLE IF EXISTS items');

  // Seed default admin user from environment variables
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const adminName = process.env.ADMIN_NAME || 'Admin';

  if (adminEmail && adminPassword) {
    const { rows: adminCheck } = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [adminEmail],
    );
    if (adminCheck.length === 0) {
      const passwordHash = await bcrypt.hash(adminPassword, 12);
      await pool.query(
        `INSERT INTO users (email, password_hash, name, role, provider, email_verified)
         VALUES ($1, $2, $3, 'admin', 'local', true)`,
        [adminEmail, passwordHash, adminName],
      );
      console.log('Seeded default admin user');
    } else {
      await pool.query("UPDATE users SET role = 'admin' WHERE email = $1", [
        adminEmail,
      ]);
    }
  }

  // Seed products
  const { rows } = await pool.query('SELECT COUNT(*) FROM products');
  if (parseInt(rows[0].count) === 0) {
    await pool.query(`
      INSERT INTO products (name, description, price, image_url, category, stock, nutrition_info) VALUES
        ('Whey Protein Isolate', 'Premium whey protein isolate with 25g protein per serving. Fast-absorbing, low in fat and carbs.', 49.99, 'https://images.unsplash.com/photo-1593095948071-474c5cc2c614?w=600&h=400&fit=crop', 'proteins', 150, '{"calories": 120, "protein": "25g", "carbs": "2g", "fat": "1g", "serving_size": "30g"}'),
        ('BCAA Recovery Blend', 'Branch chain amino acids in a 2:1:1 ratio. Supports muscle recovery and reduces soreness.', 29.99, 'https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?w=600&h=400&fit=crop', 'proteins', 200, '{"calories": 10, "protein": "0g", "carbs": "0g", "fat": "0g", "bcaa": "7g", "serving_size": "10g"}'),
        ('Creatine Monohydrate', 'Pure micronized creatine monohydrate. Increases strength and power output.', 24.99, 'https://images.unsplash.com/photo-1619159440960-45e4c0463a41?w=600&h=400&fit=crop', 'supplements', 300, '{"calories": 0, "protein": "0g", "carbs": "0g", "fat": "0g", "creatine": "5g", "serving_size": "5g"}'),
        ('Daily Multivitamin', 'Complete multivitamin with 23 essential vitamins and minerals for daily wellness.', 19.99, 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&h=400&fit=crop', 'vitamins', 500, '{"vitamins": "A, B-complex, C, D3, E, K2", "minerals": "Zinc, Magnesium, Iron, Calcium", "serving_size": "1 tablet"}'),
        ('Omega-3 Fish Oil', 'High-potency omega-3 with EPA and DHA. Supports heart, brain, and joint health.', 22.99, 'https://images.unsplash.com/photo-1577401239170-897942555fb3?w=600&h=400&fit=crop', 'vitamins', 400, '{"calories": 15, "omega3": "1000mg", "epa": "600mg", "dha": "400mg", "serving_size": "1 softgel"}'),
        ('Organic Spirulina Powder', 'Nutrient-dense superfood packed with antioxidants, B-vitamins, and iron.', 18.99, 'https://images.unsplash.com/photo-1622485831930-34623fbd5ba0?w=600&h=400&fit=crop', 'superfoods', 250, '{"calories": 20, "protein": "4g", "iron": "15% DV", "vitamin_b12": "60% DV", "serving_size": "5g"}'),
        ('Plant-Based Protein', 'Pea and rice protein blend with complete amino acid profile. Vegan friendly.', 39.99, 'https://images.unsplash.com/photo-1622484212850-eb596d769edc?w=600&h=400&fit=crop', 'proteins', 180, '{"calories": 130, "protein": "24g", "carbs": "4g", "fat": "2g", "fiber": "2g", "serving_size": "35g"}'),
        ('Vitamin D3 + K2', 'Synergistic formula for bone health and immune support. 5000 IU D3 per capsule.', 14.99, 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&h=400&fit=crop', 'vitamins', 600, '{"vitamin_d3": "5000 IU", "vitamin_k2": "100mcg", "serving_size": "1 capsule"}'),
        ('Pre-Workout Energy', 'Clean energy blend with caffeine, beta-alanine, and citrulline for peak performance.', 34.99, 'https://images.unsplash.com/photo-1594381898411-846e7d168549?w=600&h=400&fit=crop', 'supplements', 120, '{"calories": 15, "caffeine": "200mg", "beta_alanine": "3.2g", "citrulline": "6g", "serving_size": "12g"}'),
        ('Protein Energy Bars (12-pack)', 'Delicious protein bars with 20g protein and only 2g sugar each. Mixed flavors.', 29.99, 'https://images.unsplash.com/photo-1622484211148-4e1c0975973e?w=600&h=400&fit=crop', 'snacks', 350, '{"calories": 210, "protein": "20g", "carbs": "22g", "sugar": "2g", "fat": "8g", "fiber": "4g", "serving_size": "1 bar (60g)"}'),
        ('Collagen Peptides', 'Grass-fed hydrolyzed collagen for skin, hair, nails, and joint support.', 27.99, 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&h=400&fit=crop', 'supplements', 220, '{"calories": 35, "protein": "9g", "collagen": "10g", "serving_size": "11g"}'),
        ('Organic Acai Berry Powder', 'Freeze-dried acai berry powder rich in antioxidants. Great in smoothies.', 21.99, 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=600&h=400&fit=crop', 'superfoods', 180, '{"calories": 30, "carbs": "5g", "fat": "2g", "fiber": "3g", "antioxidants": "high ORAC", "serving_size": "5g"}')
    `);
    console.log('Seeded products table');
  }
}

module.exports = { pool, initDb };
