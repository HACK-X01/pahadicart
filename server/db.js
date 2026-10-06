/**
 * Himora / Jeevanix Local — Master SQLite Database Engine
 * SINGLE SOURCE OF TRUTH for Products, Categories, Merchants, Riders, Orders, CMS, and Business Rules.
 * Built with Node.js 24 native node:sqlite.
 */

const { DatabaseSync } = require('node:sqlite');
const path = require('path');
const fs = require('fs');

const DATA_DIR = path.join(__dirname, '..', 'data');
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const DB_PATH = path.join(DATA_DIR, 'himora.db');
const db = new DatabaseSync(DB_PATH);

// Enable WAL Mode & High-Performance Pragmas
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA busy_timeout = 5000;');
db.exec('PRAGMA foreign_keys = ON;');

// 1. Initialize Tables
db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    hidden INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS merchants (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    owner TEXT,
    phone TEXT,
    rating REAL DEFAULT 4.8,
    category TEXT,
    town TEXT DEFAULT 'solan',
    address TEXT,
    status TEXT DEFAULT 'Active',
    commission_rate REAL DEFAULT 10,
    featured INTEGER DEFAULT 0,
    image TEXT,
    upi TEXT,
    bank_acc TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS riders (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT,
    vehicle_type TEXT,
    vehicle_num TEXT,
    status TEXT DEFAULT 'Active',
    rating REAL DEFAULT 5.0,
    active_orders_count INTEGER DEFAULT 0,
    cash_in_hand REAL DEFAULT 0,
    town TEXT DEFAULT 'solan',
    is_walking_runner INTEGER DEFAULT 0,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category_id TEXT,
    subcategory TEXT,
    merchant_id TEXT,
    merchant_name TEXT,
    price REAL NOT NULL,
    mrp REAL NOT NULL,
    stock INTEGER DEFAULT 10,
    unit TEXT DEFAULT 'unit',
    active INTEGER DEFAULT 1,
    is_launched INTEGER DEFAULT 1,
    rating REAL DEFAULT 4.8,
    reviews_count INTEGER DEFAULT 12,
    featured INTEGER DEFAULT 0,
    popular INTEGER DEFAULT 0,
    is_jeevanix INTEGER DEFAULT 0,
    approval TEXT DEFAULT 'approved',
    description TEXT,
    image TEXT,
    icon TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    customer_name TEXT,
    customer_phone TEXT,
    delivery_address TEXT,
    staircase_notes TEXT,
    town TEXT,
    merchant_id TEXT,
    merchant_name TEXT,
    rider_id TEXT,
    rider_name TEXT,
    rider_phone TEXT,
    items_json TEXT,
    grand_total REAL,
    payment_mode TEXT,
    payment_status TEXT,
    utr_ref TEXT,
    screenshot_url TEXT,
    status TEXT DEFAULT 'Placed',
    raw_status TEXT DEFAULT 'Placed',
    otp TEXT,
    verified_by TEXT,
    verified_at TEXT,
    rejection_reason TEXT,
    created_at TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS homepage_cms (
    key TEXT PRIMARY KEY,
    value_json TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS business_rules (
    key TEXT PRIMARY KEY,
    value_json TEXT,
    updated_at TEXT
  );

  CREATE TABLE IF NOT EXISTS coupons (
    code TEXT PRIMARY KEY,
    discount_percent REAL,
    min_order REAL,
    max_discount REAL,
    active INTEGER DEFAULT 1,
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    phone TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    address TEXT,
    colony TEXT,
    staircase_note TEXT,
    town TEXT,
    role TEXT DEFAULT 'CUSTOMER',
    status TEXT DEFAULT 'ACTIVE',
    created_at TEXT
  );

  CREATE TABLE IF NOT EXISTS audit_logs (
    id TEXT PRIMARY KEY,
    admin_id TEXT,
    action TEXT,
    entity TEXT,
    entity_id TEXT,
    previous_value TEXT,
    new_value TEXT,
    reason TEXT,
    created_at TEXT
  );
`);

// Audit Logger Helper
function recordAudit(adminId, action, entity, entityId, prevVal, newVal, reason) {
  try {
    const stmt = db.prepare(`
      INSERT INTO audit_logs (id, admin_id, action, entity, entity_id, previous_value, new_value, reason, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      'AUD-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      adminId || 'SUPER_ADMIN',
      action,
      entity,
      entityId || '',
      typeof prevVal === 'object' ? JSON.stringify(prevVal) : String(prevVal || ''),
      typeof newVal === 'object' ? JSON.stringify(newVal) : String(newVal || ''),
      reason || '',
      new Date().toISOString()
    );
  } catch (err) {
    console.warn('[DB Audit Error]:', err.message);
  }
}

// 2. Seeder for Initial Run (Ensures catalog is never empty on fresh deploy)
function seedIfEmpty() {
  const catCount = db.prepare('SELECT COUNT(*) as count FROM categories').get().count;
  if (catCount === 0) {
    console.log('[DB Seeder] Populating initial categories...');
    const insertCat = db.prepare('INSERT INTO categories (id, name, icon, sort_order, hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)');
    const defaultCats = [
      { id: 'all', name: 'Sabhi Products', icon: '🏔️', order: 1, hidden: 0 },
      { id: 'grocery', name: 'Pahadi Kirana & Fresh', icon: '🍎', order: 2, hidden: 0 },
      { id: 'fruits-veg', name: 'Himachal Orchard Fresh', icon: '🥦', order: 3, hidden: 0 },
      { id: 'dairy', name: 'Mountain Dairy & Bakes', icon: '🥛', order: 4, hidden: 0 },
      { id: 'medicines', name: 'Emergency Pharma', icon: '💊', order: 5, hidden: 0 },
      { id: 'jeevanix-products', name: 'Jeevanix Health & Wellness', icon: '🌿', order: 6, hidden: 0 }
    ];
    for (const c of defaultCats) {
      insertCat.run(c.id, c.name, c.icon, c.order, c.hidden, new Date().toISOString(), new Date().toISOString());
    }
  }

  const merCount = db.prepare('SELECT COUNT(*) as count FROM merchants').get().count;
  if (merCount === 0) {
    console.log('[DB Seeder] Populating initial merchants...');
    const insertMer = db.prepare(`
      INSERT INTO merchants (id, name, owner, phone, rating, category, town, address, status, commission_rate, featured, image, upi, bank_acc, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const defaultMers = [
      { id: 'shop-sharma', name: 'Sharma General Store', owner: 'Ramesh Sharma', phone: '98160-22110', rating: 4.8, category: 'grocery', town: 'solan', address: 'Mall Road Lower Bazaar', status: 'Active', commission_rate: 6, featured: 1, image: '🍎', upi: 'sharma@okhdfcbank', bank_acc: 'HDFC0001842-50200039281' },
      { id: 'shop-himfresh', name: 'HimFresh Organic Orchard', owner: 'Suresh Thakur', phone: '98161-55420', rating: 4.9, category: 'fruits-veg', town: 'solan', address: 'Kotla Nullah Chowk', status: 'Active', commission_rate: 8, featured: 1, image: '🍏', upi: 'himfresh@okaxis', bank_acc: 'SBIN0000718-38291048192' },
      { id: 'shop-verma', name: 'Verma Mountain Meds', owner: 'Anil Verma', phone: '98160-33411', rating: 4.9, category: 'medicines', town: 'solan', address: 'Hospital Road Solan', status: 'Active', commission_rate: 5, featured: 1, image: '💊', upi: 'vermameds@paytm', bank_acc: 'ICIC0000214-02140150982' }
    ];
    for (const m of defaultMers) {
      insertMer.run(m.id, m.name, m.owner, m.phone, m.rating, m.category, m.town, m.address, m.status, m.commission_rate, m.featured, m.image, m.upi, m.bank_acc, new Date().toISOString(), new Date().toISOString());
    }
  }

  const riderCount = db.prepare('SELECT COUNT(*) as count FROM riders').get().count;
  if (riderCount === 0) {
    console.log('[DB Seeder] Populating initial riders...');
    const insertRider = db.prepare(`
      INSERT INTO riders (id, name, phone, vehicle_type, vehicle_num, status, rating, active_orders_count, cash_in_hand, town, is_walking_runner, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const defaultRiders = [
      { id: 'r-1', name: 'Vikas Thakur', phone: '98160-55421', vehicle_type: 'Splendor', vehicle_num: 'HP-14-B-8821', status: 'Active', rating: 4.9, active_orders_count: 0, cash_in_hand: 0, town: 'solan', is_walking_runner: 0 },
      { id: 'r-2', name: 'Mohit Verma', phone: '98161-99201', vehicle_type: 'Activa 6G', vehicle_num: 'HP-14-C-3310', status: 'Active', rating: 4.8, active_orders_count: 0, cash_in_hand: 0, town: 'solan', is_walking_runner: 0 },
      { id: 'r-3', name: 'Sunil Kumar (Runner)', phone: '98162-44331', vehicle_type: 'Walking Runner', vehicle_num: 'STAIRS-ONLY', status: 'Active', rating: 4.9, active_orders_count: 0, cash_in_hand: 0, town: 'solan', is_walking_runner: 1 }
    ];
    for (const r of defaultRiders) {
      insertRider.run(r.id, r.name, r.phone, r.vehicle_type, r.vehicle_num, r.status, r.rating, r.active_orders_count, r.cash_in_hand, r.town, r.is_walking_runner, new Date().toISOString(), new Date().toISOString());
    }
  }

  const prodCount = db.prepare('SELECT COUNT(*) as count FROM products').get().count;
  if (prodCount === 0) {
    console.log('[DB Seeder] Populating initial master products...');
    const insertProd = db.prepare(`
      INSERT INTO products (id, name, category_id, subcategory, merchant_id, merchant_name, price, mrp, stock, unit, active, is_launched, rating, reviews_count, featured, popular, is_jeevanix, approval, description, image, icon, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const defaultProducts = [
      { id: 'PROD-ATTA-01', name: 'Aashirvaad Atta 5kg', category_id: 'grocery', subcategory: 'Atta & Flour', merchant_id: 'shop-sharma', merchant_name: 'Sharma General Store', price: 280, mrp: 310, stock: 45, unit: '5 kg', active: 1, is_launched: 1, rating: 4.8, reviews_count: 120, featured: 1, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Stone-ground wheat flour for soft mountain rotis.', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80', icon: '🌾' },
      { id: 'PROD-GHEE-02', name: 'Himachal Desi Cow Ghee 1L', category_id: 'grocery', subcategory: 'Oils & Ghee', merchant_id: 'shop-sharma', merchant_name: 'Sharma General Store', price: 650, mrp: 750, stock: 20, unit: '1 L', active: 1, is_launched: 1, rating: 4.9, reviews_count: 85, featured: 1, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Pure A2 bilona desi cow ghee from high-altitude pastures.', image: 'https://images.unsplash.com/photo-1589927986089-35812388d1f4?w=400&q=80', icon: '🧈' },
      { id: 'PROD-RICE-03', name: 'Himalayan Red Rice (Matali) 1kg', category_id: 'grocery', subcategory: 'Rice & Grains', merchant_id: 'shop-sharma', merchant_name: 'Sharma General Store', price: 120, mrp: 140, stock: 30, unit: '1 kg', active: 1, is_launched: 1, rating: 4.7, reviews_count: 42, featured: 1, popular: 0, is_jeevanix: 0, approval: 'approved', description: 'Nutrient-dense native Himalayan red rice from Giri valley.', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80', icon: '🍚' },
      { id: 'PROD-APPLE-04', name: 'Kinnauri Royal Apples Grade-A 1kg', category_id: 'fruits-veg', subcategory: 'Fresh Fruits', merchant_id: 'shop-himfresh', merchant_name: 'HimFresh Organic Orchard', price: 140, mrp: 170, stock: 80, unit: '1 kg', active: 1, is_launched: 1, rating: 5.0, reviews_count: 210, featured: 1, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Crisp, sweet high-altitude apples plucked fresh from Kinnaur orchards.', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80', icon: '🍎' },
      { id: 'PROD-WALNUT-05', name: 'Raw Giri Walnuts (Kashmiri/Himachal) 500g', category_id: 'grocery', subcategory: 'Dry Fruits', merchant_id: 'shop-himfresh', merchant_name: 'HimFresh Organic Orchard', price: 420, mrp: 500, stock: 25, unit: '500 g', active: 1, is_launched: 1, rating: 4.9, reviews_count: 64, featured: 1, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Freshly shelled brain-boosting walnut kernels.', image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?w=400&q=80', icon: '🌰' },
      { id: 'PROD-MILK-06', name: 'Kamdhenu Full Cream Fresh Milk 1L', category_id: 'dairy', subcategory: 'Fresh Milk', merchant_id: 'shop-sharma', merchant_name: 'Sharma General Store', price: 66, mrp: 66, stock: 60, unit: '1 L', active: 1, is_launched: 1, rating: 4.8, reviews_count: 310, featured: 0, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Morning chilled fresh milk pouch for tea and daily use.', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80', icon: '🥛' },
      { id: 'PROD-PANEER-07', name: 'Solan Fresh Malai Paneer 200g', category_id: 'dairy', subcategory: 'Paneer & Curd', merchant_id: 'shop-sharma', merchant_name: 'Sharma General Store', price: 90, mrp: 100, stock: 35, unit: '200 g', active: 1, is_launched: 1, rating: 4.9, reviews_count: 95, featured: 1, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'Ultra-soft malai paneer prepared fresh daily.', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80', icon: '🧀' },
      { id: 'PROD-CHURPEE-08', name: 'Mountain Yak Churpi High Protein 250g', category_id: 'dairy', subcategory: 'Speciality', merchant_id: 'shop-himfresh', merchant_name: 'HimFresh Organic Orchard', price: 210, mrp: 250, stock: 15, unit: '250 g', active: 1, is_launched: 1, rating: 4.7, reviews_count: 18, featured: 0, popular: 0, is_jeevanix: 0, approval: 'approved', description: 'Traditional Himalayan dried hardened cheese snack.', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80', icon: '🏔️' },
      { id: 'PROD-SHILAJIT-09', name: 'Jeevanix Pure Himalayan Shilajit Resin 20g', category_id: 'jeevanix-products', subcategory: 'Herbal Wellness', merchant_id: 'shop-verma', merchant_name: 'Verma Mountain Meds', price: 890, mrp: 1199, stock: 40, unit: '20 g', active: 1, is_launched: 1, rating: 5.0, reviews_count: 150, featured: 1, popular: 1, is_jeevanix: 1, approval: 'approved', description: 'Lab-tested 100% pure Himalayan Gold grade shilajit resin with 75%+ fulvic acid.', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80', icon: '🌿' },
      { id: 'PROD-HONEY-10', name: 'Jeevanix Wild Forest Raw Honey 500g', category_id: 'jeevanix-products', subcategory: 'Natural Foods', merchant_id: 'shop-verma', merchant_name: 'Verma Mountain Meds', price: 340, mrp: 420, stock: 50, unit: '500 g', active: 1, is_launched: 1, rating: 4.9, reviews_count: 112, featured: 1, popular: 1, is_jeevanix: 1, approval: 'approved', description: 'Unpasteurized wild multiflora honey harvested from high deodar forests.', image: 'https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400&q=80', icon: '🍯' },
      { id: 'PROD-BANDAGE-11', name: 'Emergency First-Aid Bandage Kit', category_id: 'medicines', subcategory: 'First Aid', merchant_id: 'shop-verma', merchant_name: 'Verma Mountain Meds', price: 95, mrp: 110, stock: 100, unit: '1 kit', active: 1, is_launched: 1, rating: 4.8, reviews_count: 73, featured: 0, popular: 0, is_jeevanix: 0, approval: 'approved', description: 'Antiseptic wipes, micropore tape, sterile gauze, and waterproof bandages.', image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=400&q=80', icon: '🩹' },
      { id: 'PROD-ORS-12', name: 'Electral ORS Energy Sachet (Pack of 5)', category_id: 'medicines', subcategory: 'Hydration', merchant_id: 'shop-verma', merchant_name: 'Verma Mountain Meds', price: 110, mrp: 115, stock: 80, unit: 'Pack of 5', active: 1, is_launched: 1, rating: 4.9, reviews_count: 190, featured: 0, popular: 1, is_jeevanix: 0, approval: 'approved', description: 'WHO formula oral rehydration salts for hill fatigue and dehydration.', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=400&q=80', icon: '⚡' }
    ];
    for (const p of defaultProducts) {
      insertProd.run(
        p.id, p.name, p.category_id, p.subcategory, p.merchant_id, p.merchant_name,
        p.price, p.mrp, p.stock, p.unit, p.active, p.is_launched,
        p.rating, p.reviews_count, p.featured, p.popular, p.is_jeevanix, p.approval,
        p.description, p.image, p.icon, new Date().toISOString(), new Date().toISOString()
      );
    }
  }

  // Seed default business rules and CMS
  const cmsCount = db.prepare('SELECT COUNT(*) as count FROM homepage_cms').get().count;
  if (cmsCount === 0) {
    const insertCms = db.prepare('INSERT INTO homepage_cms (key, value_json, updated_at) VALUES (?, ?, ?)');
    insertCms.run('heroBanner', JSON.stringify({
      title: 'Solan Mountain Fast Delivery',
      subtitle: 'Fresh orchard apples, desi bilona ghee & urgent medicines delivered in 30 mins.',
      badge: '🏔️ 30-MIN HILL SLA',
      imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=800&q=80',
      active: true
    }), new Date().toISOString());

    insertCms.run('announcement', JSON.stringify({
      text: 'Heavy rain alert on Barog corridor — our Hill Runners are equipped with rain gear.',
      type: 'warning',
      active: true
    }), new Date().toISOString());
  }

  const rulesCount = db.prepare('SELECT COUNT(*) as count FROM business_rules').get().count;
  if (rulesCount === 0) {
    const insertRule = db.prepare('INSERT INTO business_rules (key, value_json, updated_at) VALUES (?, ?, ?)');
    insertRule.run('general', JSON.stringify({
      defaultCommissionPercent: 8,
      baseDeliveryFee: 25,
      staircaseDeliveryFee: 15,
      minOrderValue: 99,
      freeDeliveryThreshold: 299,
      deliveryPromiseText: '30-45 min (Hill SLA)',
      serviceTowns: ['Solan', 'Shimla', 'Dharamshala'],
      codEnabled: true,
      upiEnabled: true,
      upiVpa: 'jeevanix@okhdfcbank',
      businessName: 'Jeevanix Local'
    }), new Date().toISOString());
  }
}

seedIfEmpty();

// ==========================================
// CRUD REPOSITORIES
// ==========================================

const ProductsRepo = {
  getAll(includeInactive = false) {
    if (includeInactive) {
      return db.prepare('SELECT * FROM products ORDER BY is_jeevanix DESC, created_at DESC').all();
    }
    return db.prepare('SELECT * FROM products WHERE active = 1 AND is_launched = 1 ORDER BY is_jeevanix DESC, popular DESC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM products WHERE id = ?').get(id);
  },

  create(data, adminId = 'SUPER_ADMIN') {
    const id = data.id || ('PROD-' + Date.now().toString(36).toUpperCase());
    const now = new Date().toISOString();
    const stmt = db.prepare(`
      INSERT INTO products (
        id, name, category_id, subcategory, merchant_id, merchant_name,
        price, mrp, stock, unit, active, is_launched, rating, reviews_count,
        featured, popular, is_jeevanix, approval, description, image, icon,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
      id,
      data.name,
      data.category_id || data.category || 'grocery',
      data.subcategory || 'General',
      data.merchant_id || data.merchantId || 'shop-sharma',
      data.merchant_name || data.merchantName || 'Sharma General Store',
      Number(data.price),
      Number(data.mrp || data.price),
      Number(data.stock !== undefined ? data.stock : 10),
      data.unit || 'unit',
      data.active !== undefined ? (data.active ? 1 : 0) : 1,
      data.is_launched !== undefined ? (data.is_launched ? 1 : 0) : 1,
      Number(data.rating || 4.8),
      Number(data.reviews_count || data.reviewsCount || 0),
      data.featured ? 1 : 0,
      data.popular ? 1 : 0,
      data.is_jeevanix || data.category === 'jeevanix-products' ? 1 : 0,
      data.approval || 'approved',
      data.description || data.desc || '',
      data.image || '',
      data.icon || '📦',
      now, now
    );
    recordAudit(adminId, 'CREATE_PRODUCT', 'products', id, null, data, 'New product created');
    return this.getById(id);
  },

  update(id, updates, adminId = 'SUPER_ADMIN', reason = 'Admin update') {
    const prev = this.getById(id);
    if (!prev) throw new Error('Product not found: ' + id);

    const allowedFields = [
      'name', 'category_id', 'subcategory', 'merchant_id', 'merchant_name',
      'price', 'mrp', 'stock', 'unit', 'active', 'is_launched', 'rating',
      'reviews_count', 'featured', 'popular', 'is_jeevanix', 'approval',
      'description', 'image', 'icon'
    ];

    const fieldsToSet = [];
    const values = [];

    for (const key of allowedFields) {
      if (updates[key] !== undefined) {
        fieldsToSet.push(key + ' = ?');
        values.push(updates[key]);
      }
    }

    // Support camelCase aliases
    if (updates.categoryId !== undefined && !updates.category_id) {
      fieldsToSet.push('category_id = ?');
      values.push(updates.categoryId);
    }
    if (updates.merchantId !== undefined && !updates.merchant_id) {
      fieldsToSet.push('merchant_id = ?');
      values.push(updates.merchantId);
    }
    if (updates.isLaunched !== undefined && updates.is_launched === undefined) {
      fieldsToSet.push('is_launched = ?');
      values.push(updates.isLaunched ? 1 : 0);
    }

    if (fieldsToSet.length === 0) return prev;

    fieldsToSet.push('updated_at = ?');
    values.push(new Date().toISOString());
    values.push(id);

    const sql = `UPDATE products SET ${fieldsToSet.join(', ')} WHERE id = ?`;
    db.prepare(sql).run(...values);

    const updated = this.getById(id);
    recordAudit(adminId, 'UPDATE_PRODUCT', 'products', id, prev, updated, reason);
    return updated;
  },

  delete(id, adminId = 'SUPER_ADMIN', reason = 'Admin delete') {
    const prev = this.getById(id);
    if (!prev) throw new Error('Product not found: ' + id);
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
    recordAudit(adminId, 'DELETE_PRODUCT', 'products', id, prev, null, reason);
    return { success: true, id };
  }
};

const CategoriesRepo = {
  getAll() {
    return db.prepare('SELECT * FROM categories ORDER BY sort_order ASC').all();
  },

  create(data, adminId = 'SUPER_ADMIN') {
    const id = data.id || ('cat-' + Date.now().toString(36));
    const now = new Date().toISOString();
    db.prepare('INSERT INTO categories (id, name, icon, sort_order, hidden, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)')
      .run(id, data.name, data.icon || '📦', data.sort_order || data.order || 99, data.hidden ? 1 : 0, now, now);
    recordAudit(adminId, 'CREATE_CATEGORY', 'categories', id, null, data, 'New category created');
    return db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
  },

  update(id, updates, adminId = 'SUPER_ADMIN') {
    const prev = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!prev) throw new Error('Category not found');
    const name = updates.name !== undefined ? updates.name : prev.name;
    const icon = updates.icon !== undefined ? updates.icon : prev.icon;
    const order = updates.sort_order !== undefined ? updates.sort_order : (updates.order !== undefined ? updates.order : prev.sort_order);
    const hidden = updates.hidden !== undefined ? (updates.hidden ? 1 : 0) : prev.hidden;
    const now = new Date().toISOString();
    db.prepare('UPDATE categories SET name = ?, icon = ?, sort_order = ?, hidden = ?, updated_at = ? WHERE id = ?')
      .run(name, icon, order, hidden, now, id);
    const updated = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    recordAudit(adminId, 'UPDATE_CATEGORY', 'categories', id, prev, updated, 'Category updated');
    return updated;
  },

  delete(id, adminId = 'SUPER_ADMIN') {
    const prev = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    if (!prev) throw new Error('Category not found');
    db.prepare('DELETE FROM categories WHERE id = ?').run(id);
    recordAudit(adminId, 'DELETE_CATEGORY', 'categories', id, prev, null, 'Category deleted');
    return { success: true, id };
  }
};

const MerchantsRepo = {
  getAll() {
    return db.prepare('SELECT * FROM merchants ORDER BY featured DESC, rating DESC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM merchants WHERE id = ?').get(id);
  },

  update(id, updates, adminId = 'SUPER_ADMIN', reason = 'Admin update') {
    const prev = this.getById(id);
    if (!prev) throw new Error('Merchant not found: ' + id);

    const allowed = ['name', 'owner', 'phone', 'category', 'town', 'address', 'status', 'commission_rate', 'featured', 'image', 'upi', 'bank_acc'];
    const sets = [];
    const vals = [];

    for (const k of allowed) {
      if (updates[k] !== undefined) {
        sets.push(k + ' = ?');
        vals.push(updates[k]);
      }
    }
    if (updates.commission !== undefined && updates.commission_rate === undefined) {
      sets.push('commission_rate = ?');
      vals.push(updates.commission);
    }

    if (sets.length === 0) return prev;
    sets.push('updated_at = ?');
    vals.push(new Date().toISOString());
    vals.push(id);

    db.prepare(`UPDATE merchants SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const updated = this.getById(id);
    recordAudit(adminId, 'UPDATE_MERCHANT', 'merchants', id, prev, updated, reason);
    return updated;
  }
};

const RidersRepo = {
  getAll() {
    return db.prepare('SELECT * FROM riders ORDER BY rating DESC').all();
  },

  getById(id) {
    return db.prepare('SELECT * FROM riders WHERE id = ?').get(id);
  },

  update(id, updates, adminId = 'SUPER_ADMIN', reason = 'Admin update') {
    const prev = this.getById(id);
    if (!prev) throw new Error('Rider not found: ' + id);

    const allowed = ['name', 'phone', 'vehicle_type', 'vehicle_num', 'status', 'rating', 'active_orders_count', 'cash_in_hand', 'town', 'is_walking_runner'];
    const sets = [];
    const vals = [];

    for (const k of allowed) {
      if (updates[k] !== undefined) {
        sets.push(k + ' = ?');
        vals.push(updates[k]);
      }
    }

    if (sets.length === 0) return prev;
    sets.push('updated_at = ?');
    vals.push(new Date().toISOString());
    vals.push(id);

    db.prepare(`UPDATE riders SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const updated = this.getById(id);
    recordAudit(adminId, 'UPDATE_RIDER', 'riders', id, prev, updated, reason);
    return updated;
  }
};

const OrdersRepo = {
  getAll() {
    const rows = db.prepare('SELECT * FROM orders ORDER BY created_at DESC').all();
    return rows.map(r => ({
      ...r,
      items: r.items_json ? JSON.parse(r.items_json) : []
    }));
  },

  getById(id) {
    const row = db.prepare('SELECT * FROM orders WHERE id = ?').get(id);
    if (!row) return null;
    return {
      ...row,
      items: row.items_json ? JSON.parse(row.items_json) : []
    };
  },

  create(data) {
    const id = data.id || ('HM' + (1000 + Math.floor(Math.random() * 9000)));
    const now = new Date().toISOString();
    const itemsJson = JSON.stringify(data.items || []);

    const stmt = db.prepare(`
      INSERT INTO orders (
        id, customer_name, customer_phone, delivery_address, staircase_notes,
        town, merchant_id, merchant_name, rider_id, rider_name, rider_phone,
        items_json, grand_total, payment_mode, payment_status, utr_ref,
        screenshot_url, status, raw_status, otp, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    stmt.run(
      id,
      data.customerName || data.customer || 'Customer',
      data.customerPhone || '98160-00000',
      data.deliveryAddress || data.address || '',
      data.staircaseNotes || data.staircaseNote || '',
      data.town || 'solan',
      data.merchantId || 'shop-sharma',
      data.merchantName || 'Sharma General Store',
      data.riderId || null,
      data.riderName || null,
      data.riderPhone || null,
      itemsJson,
      Number(data.grandTotal || data.total || data.amount || 0),
      data.paymentMode || 'COD',
      data.paymentStatus || 'PAYMENT_PENDING',
      data.utrRef || null,
      data.screenshotUrl || null,
      data.status || 'Placed',
      data.rawStatus || 'Placed',
      data.otp || '5570',
      data.createdAt || now,
      now
    );

    return this.getById(id);
  },

  update(id, updates, adminId = 'SUPER_ADMIN') {
    const prev = this.getById(id);
    if (!prev) throw new Error('Order not found: ' + id);

    const allowed = [
      'customer_name', 'customer_phone', 'delivery_address', 'staircase_notes',
      'town', 'merchant_id', 'merchant_name', 'rider_id', 'rider_name', 'rider_phone',
      'grand_total', 'payment_mode', 'payment_status', 'utr_ref', 'screenshot_url',
      'status', 'raw_status', 'otp', 'verified_by', 'verified_at', 'rejection_reason'
    ];

    const sets = [];
    const vals = [];

    for (const k of allowed) {
      if (updates[k] !== undefined) {
        sets.push(k + ' = ?');
        vals.push(updates[k]);
      }
    }

    // Support camelCase mappings
    const mappings = {
      paymentStatus: 'payment_status',
      rawStatus: 'raw_status',
      riderId: 'rider_id',
      riderName: 'rider_name',
      verifiedBy: 'verified_by',
      verifiedAt: 'verified_at',
      rejectionReason: 'rejection_reason'
    };
    for (const [camel, snake] of Object.entries(mappings)) {
      if (updates[camel] !== undefined && updates[snake] === undefined) {
        sets.push(snake + ' = ?');
        vals.push(updates[camel]);
      }
    }

    if (sets.length === 0) return prev;
    sets.push('updated_at = ?');
    vals.push(new Date().toISOString());
    vals.push(id);

    db.prepare(`UPDATE orders SET ${sets.join(', ')} WHERE id = ?`).run(...vals);
    const updated = this.getById(id);
    recordAudit(adminId, 'UPDATE_ORDER_STATUS', 'orders', id, prev.status, updated.status, 'Order status transitioned');
    return updated;
  }
};

const CmsRepo = {
  getAll() {
    const rows = db.prepare('SELECT * FROM homepage_cms').all();
    const result = {};
    for (const r of rows) {
      try { result[r.key] = JSON.parse(r.value_json); } catch(e) { result[r.key] = r.value_json; }
    }
    return result;
  },

  save(key, value, adminId = 'SUPER_ADMIN') {
    const jsonStr = JSON.stringify(value);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO homepage_cms (key, value_json, updated_at)
      VALUES (?, ?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
    `).run(key, jsonStr, now);
    recordAudit(adminId, 'UPDATE_CMS', 'homepage_cms', key, null, value, 'CMS updated');
    return { [key]: value };
  }
};

const BusinessRulesRepo = {
  get() {
    const row = db.prepare("SELECT value_json FROM business_rules WHERE key = 'general'").get();
    if (!row) return {};
    try { return JSON.parse(row.value_json); } catch(e) { return {}; }
  },

  save(rules, adminId = 'SUPER_ADMIN') {
    const current = this.get();
    const merged = { ...current, ...rules };
    const jsonStr = JSON.stringify(merged);
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO business_rules (key, value_json, updated_at)
      VALUES ('general', ?, ?)
      ON CONFLICT(key) DO UPDATE SET value_json = excluded.value_json, updated_at = excluded.updated_at
    `).run(jsonStr, now);
    recordAudit(adminId, 'UPDATE_BUSINESS_RULES', 'business_rules', 'general', current, merged, 'Business rules saved');
    return merged;
  }
};

const CouponsRepo = {
  getAll() {
    return db.prepare('SELECT * FROM coupons ORDER BY created_at DESC').all();
  },

  create(coupon, adminId = 'SUPER_ADMIN') {
    const code = coupon.code.toUpperCase().trim();
    const now = new Date().toISOString();
    db.prepare('INSERT INTO coupons (code, discount_percent, min_order, max_discount, active, created_at) VALUES (?, ?, ?, ?, ?, ?)')
      .run(code, Number(coupon.discount_percent || 10), Number(coupon.min_order || 99), Number(coupon.max_discount || 100), coupon.active !== 0 ? 1 : 0, now);
    recordAudit(adminId, 'CREATE_COUPON', 'coupons', code, null, coupon, 'New coupon created');
    return db.prepare('SELECT * FROM coupons WHERE code = ?').get(code);
  },

  delete(code, adminId = 'SUPER_ADMIN') {
    db.prepare('DELETE FROM coupons WHERE code = ?').run(code);
    recordAudit(adminId, 'DELETE_COUPON', 'coupons', code, null, null, 'Coupon deleted');
    return { success: true, code };
  }
};

const AuditLogsRepo = {
  getAll(limit = 100) {
    return db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?').all(limit);
  }
};

function exportFullDatabase() {
  return {
    timestamp: new Date().toISOString(),
    categories: CategoriesRepo.getAll(),
    merchants: MerchantsRepo.getAll(),
    riders: RidersRepo.getAll(),
    products: ProductsRepo.getAll(true),
    orders: OrdersRepo.getAll(),
    cms: CmsRepo.getAll(),
    businessRules: BusinessRulesRepo.get(),
    coupons: CouponsRepo.getAll(),
    auditLogs: AuditLogsRepo.getAll(50)
  };
}

module.exports = {
  db,
  ProductsRepo,
  CategoriesRepo,
  MerchantsRepo,
  RidersRepo,
  OrdersRepo,
  CmsRepo,
  BusinessRulesRepo,
  CouponsRepo,
  AuditLogsRepo,
  recordAudit,
  exportFullDatabase
};
