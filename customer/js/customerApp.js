// Himora Customer-Facing App Controller — Powered by Jeevanix
// Compliant with 12-Screen Blueprint (Local Shopping. Made for the Hills.)

(function() {
  // Master Catalog Data aligned with PDF Blueprint
  const HIMORA_CATALOG = {
    products: [
      {
        id: 'PROD-ATTA-01',
        name: 'Aashirvaad Atta 5kg',
        hindi: 'आशीर्वाद आटा 5 किग्रा',
        desc: 'Premium quality whole wheat atta, rich in dietary fiber and essential mountain grains. Stone-ground for soft, healthy rotis that stay fresh longer.',
        price: 280,
        mrp: 310,
        discount: '10% OFF',
        rating: 4.5,
        reviewsCount: 120,
        unit: '5 kg',
        category: 'grocery',
        subcategory: 'Atta & Flour',
        icon: '🌾',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-OIL-01',
        name: 'Fortune Sunflower Oil 1L',
        hindi: 'फॉर्च्यून सनफ्लावर तेल 1 लीटर',
        desc: 'Refined sunflower oil enriched with Vitamins A & D. Light and healthy for everyday hill cooking.',
        price: 145,
        mrp: 160,
        discount: '9% OFF',
        rating: 4.2,
        reviewsCount: 98,
        unit: '1 L',
        category: 'grocery',
        subcategory: 'Oil & Masala',
        icon: '🌻',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-SALT-01',
        name: 'Tata Salt 1kg',
        hindi: 'टाटा नमक 1 किग्रा',
        desc: 'Vacuum evaporated iodized salt for pure taste and balanced iodine nutrition.',
        price: 25,
        mrp: 28,
        discount: '11% OFF',
        rating: 4.3,
        reviewsCount: 150,
        unit: '1 kg',
        category: 'grocery',
        subcategory: 'Sugar & Salt',
        icon: '🧂',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-MAGGI-01',
        name: 'Maggi Noodles 280g',
        hindi: 'मैगी 2-मिनट नूडल्स',
        desc: 'Classic masala instant noodles with authentic roasted mountain spices.',
        price: 32,
        mrp: 40,
        discount: '20% OFF',
        rating: 4.4,
        reviewsCount: 210,
        unit: '280g',
        category: 'grocery',
        subcategory: 'Snacks',
        icon: '🍜',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-MILK-01',
        name: 'Amul Taza Milk 1L',
        hindi: 'अमूल ताजा दूध 1 लीटर',
        desc: 'Fresh homogenized toned milk, pasteurized and sealed for door-to-door purity.',
        price: 52,
        mrp: 54,
        discount: '4% OFF',
        rating: 4.6,
        reviewsCount: 85,
        unit: '1 L',
        category: 'dairy',
        subcategory: 'Milk & Curd',
        icon: '🥛',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-PARLE-01',
        name: 'Parle-G Biscuits Pack',
        hindi: 'पारले-जी बिस्कुट',
        desc: 'Iconic glucose biscuits, crisp and golden, beloved across Himachal homes.',
        price: 10,
        mrp: 10,
        discount: 'BESTSELLER',
        rating: 4.5,
        reviewsCount: 130,
        unit: 'Pack of 2',
        category: 'bakery',
        subcategory: 'Biscuits & Snacks',
        icon: '🍪',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-TOMATO-01',
        name: 'Fresh Red Tomatoes 1kg',
        hindi: 'ताज़ा लाल टमाटर 1 किग्रा',
        desc: 'Plump, ripe Solan valley tomatoes directly hand-picked from hillside farmers.',
        price: 35,
        mrp: 45,
        discount: '22% OFF',
        rating: 4.7,
        reviewsCount: 65,
        unit: '1 kg',
        category: 'fruits-veg',
        subcategory: 'Fresh Vegetables',
        icon: '🍅',
        merchantId: 'shop-sharma',
        merchantName: 'Sharma General Store',
        inStock: true,
        popular: true
      },
      {
        id: 'PROD-APPLE-01',
        name: 'Kinnaur Royal Delicious Apples',
        hindi: 'किन्नौर रॉयल सेब 1 किग्रा',
        desc: 'Crisp, sweet, ruby-red high altitude Kinnaur harvest. 100% natural, wax-free.',
        price: 140,
        mrp: 180,
        discount: '22% OFF',
        rating: 4.9,
        reviewsCount: 180,
        unit: '1 kg',
        category: 'fruits-veg',
        subcategory: 'Fresh Fruits',
        icon: '🍎',
        merchantId: 'shop-organic',
        merchantName: 'Himora Organic Farm',
        inStock: true,
        popular: true
      },
      // Jeevanix Wellness Products (Screen 12)
      {
        id: 'PROD-HONEY-01',
        name: 'Himalayan Honey 500g',
        hindi: 'जीवनिक्स शुद्ध हिमालयन शहद',
        desc: 'Unfiltered raw multi-flora forest honey collected by hill tribal apiaries. Powered by Jeevanix.',
        price: 250,
        mrp: 290,
        discount: '14% OFF',
        rating: 4.6,
        reviewsCount: 95,
        unit: '500g jar',
        category: 'jeevanix-products',
        subcategory: 'Pure Honey',
        icon: '🍯',
        merchantId: 'shop-jeevanix',
        merchantName: 'Jeevanix Health & Wellness',
        inStock: true,
        popular: false
      },
      {
        id: 'PROD-TEA-01',
        name: 'Herbal Mountain Tea',
        hindi: 'जीवनिक्स प्राकृतिक हर्बल चाय',
        desc: 'Antioxidant-rich infusion of wild rhododendron petals, hill tulsi, and cinnamon.',
        price: 250,
        mrp: 280,
        discount: '11% OFF',
        rating: 4.4,
        reviewsCount: 70,
        unit: '100g pack',
        category: 'jeevanix-products',
        subcategory: 'Herbal Tea',
        icon: '🍵',
        merchantId: 'shop-jeevanix',
        merchantName: 'Jeevanix Health & Wellness',
        inStock: true,
        popular: false
      },
      {
        id: 'PROD-VITAMIN-01',
        name: 'Jeevanix Multivitamin Daily',
        hindi: 'जीवनिक्स मल्टीविटामिन कैप्सूल',
        desc: 'Daily vitality balance with mountain herbs, zinc, and bio-available vitamins. 60 Veg Capsules.',
        price: 499,
        mrp: 599,
        discount: '17% OFF',
        rating: 4.6,
        reviewsCount: 110,
        unit: '60 capsules',
        category: 'jeevanix-products',
        subcategory: 'Supplements',
        icon: '💊',
        merchantId: 'shop-jeevanix',
        merchantName: 'Jeevanix Health & Wellness',
        inStock: true,
        popular: false
      },
      {
        id: 'PROD-SPICES-01',
        name: 'Organic Pahadi Spices Box',
        hindi: 'जीवनिक्स ऑर्गेनिक पहाड़ी मसाले',
        desc: 'Stone-pounded mountain turmeric, wild coriander, and hill cumin. Aromatic & medicinal.',
        price: 180,
        mrp: 210,
        discount: '14% OFF',
        rating: 4.3,
        reviewsCount: 50,
        unit: '400g assortment',
        category: 'jeevanix-products',
        subcategory: 'Organic Spices',
        icon: '🌿',
        merchantId: 'shop-jeevanix',
        merchantName: 'Jeevanix Health & Wellness',
        inStock: true,
        popular: false
      }
    ],

    categories: [
      { id: 'grocery', name: 'Grocery', icon: '🧺', subcategories: ['Atta & Flour', 'Oil & Masala', 'Rice & Grains', 'Sugar & Salt', 'Snacks'] },
      { id: 'fruits-veg', name: 'Fruits & Vegetables', icon: '🍎', subcategories: ['Fresh Fruits', 'Fresh Vegetables', 'Hill Herbs'] },
      { id: 'bakery', name: 'Bakery', icon: '🥐', subcategories: ['Breads', 'Biscuits & Snacks', 'Cakes'] },
      { id: 'dairy', name: 'Dairy', icon: '🥛', subcategories: ['Milk & Curd', 'Paneer', 'Desi Ghee'] },
      { id: 'personal-care', name: 'Personal Care', icon: '🧴', subcategories: ['Soaps', 'Hair Care', 'Oral Care'] },
      { id: 'health-wellness', name: 'Health & Wellness', icon: '🌿', subcategories: ['Ayurveda', 'Supplements', 'Teas'] },
      { id: 'home-essentials', name: 'Home Essentials', icon: '🧹', subcategories: ['Cleaners', 'Detergents', 'Puja'] },
      { id: 'more', name: 'More', icon: '⋯', subcategories: ['All Categories'] },
      { id: 'local-products', name: 'Local Products', icon: '🏔️', subcategories: ['Pahadi Specialties', 'Handicrafts', 'Apples'] },
      { id: 'jeevanix-products', name: 'Jeevanix Products', icon: '✨', subcategories: ['Pure Honey', 'Herbal Tea', 'Supplements', 'Spices'] }
    ],

    shops: [
      {
        id: 'shop-sharma',
        name: 'Sharma General Store',
        avatar: '🏪',
        rating: 4.5,
        reviews: 320,
        distance: '1.2 km away',
        town: 'Dharampur',
        status: 'Open • Closes 10:00 PM',
        sla: 'Delivery in 30-60 min',
        categories: ['grocery', 'snacks', 'household', 'dairy']
      },
      {
        id: 'shop-organic',
        name: 'Himora Organic Farm',
        avatar: '🍏',
        rating: 4.8,
        reviews: 140,
        distance: '2.5 km away',
        town: 'Dharampur',
        status: 'Open • Closes 8:00 PM',
        sla: 'Delivery in 45-60 min',
        categories: ['fruits-veg', 'local-products']
      },
      {
        id: 'shop-jeevanix',
        name: 'Jeevanix Health & Wellness',
        avatar: '🌿',
        rating: 4.9,
        reviews: 420,
        distance: 'Direct Hub',
        town: 'Himachal',
        status: 'Always Open',
        sla: 'Express 30-45 min Delivery',
        categories: ['jeevanix-products', 'health-wellness']
      }
    ]
  };

  class HimoraApp {
    constructor() {
      this.currentScreen = 'home';
      this.navigationHistory = ['home'];
      this.cart = {}; // { [prodId]: qty }
      this.currentTown = localStorage.getItem('himora_selected_town') || 'Dharampur, Himachal Pradesh';
      this.currentTownId = 'dharampur';
      this.currentAddress = 'Near Himora Store, Dharampur, Himachal Pradesh - 176215';
      this.currentStairs = '35 steps down from road level, green gate';
      this.currentPhone = '98160-12890';
      this.activeProductDetail = null;
      this.activeShop = null;
      this.activeListingCategory = 'grocery';
      this.activeListingSubcat = 'all';
      this.selectedPayMode = 'UPI';
      this.activeOrder = null;
      this.wishlist = new Set(['PROD-ATTA-01']);

      this.init();
    }

    init() {
      this.loadCartFromStorage();
      this.syncMasterProductsToDataLayer();
      this.renderHomeScreen();
      this.renderCategoriesScreen();
      this.renderJeevanixScreen();
      this.renderOrdersScreen('current');
      this.updateCartBadges();
      this.updateTownDisplays();

      // Cross-portal real-time event listeners
      if (window.pahadiBus) {
        window.pahadiBus.on('ORDER_STATUS_CHANGED', ({ orderId, newStatus, order }) => {
          if (this.activeOrder && (this.activeOrder.id === orderId || !this.activeOrder.id)) {
            this.activeOrder.status = newStatus;
            if (order) Object.assign(this.activeOrder, order);
            this.renderTrackingScreen(this.activeOrder);
          }
          this.renderOrdersScreen('current');
        });

        window.pahadiBus.on('PRODUCT_ADDED', () => {
          this.reloadProductsFromStorage();
        });

        window.pahadiBus.on('PRODUCT_STOCK_CHANGED', () => {
          this.reloadProductsFromStorage();
        });

        window.pahadiBus.on('CATEGORIES_UPDATED', () => {
          this.renderCategoriesScreen();
          this.renderHomeScreen();
        });
      }
    }

    reloadProductsFromStorage() {
      try {
        const stored = localStorage.getItem('pahadicart_products');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            HIMORA_CATALOG.products = parsed;
            this.renderHomeScreen();
            if (this.currentScreen === 'listing') {
              this.renderListingScreen(this.activeListingCategory, this.activeListingSubcat);
            }
          }
        }
      } catch(e) {}
    }

    // Sync mock catalog to window.PAHADICART_DATA so Admin & Merchant portals also see it
    syncMasterProductsToDataLayer() {
      if (!window.PAHADICART_DATA) window.PAHADICART_DATA = {};
      if (!window.PAHADICART_DATA.products || window.PAHADICART_DATA.products.length === 0) {
        window.PAHADICART_DATA.products = HIMORA_CATALOG.products;
        try {
          localStorage.setItem('pahadicart_products', JSON.stringify(HIMORA_CATALOG.products));
        } catch(e) {}
      }
    }

    // ========================================================
    // SPA ROUTER & SCREEN TRANSITIONS
    // ========================================================
    navigateTo(screenId, params = {}) {
      const targetScreen = document.getElementById('screen-' + screenId);
      if (!targetScreen) {
        console.warn('Screen not found:', screenId);
        return;
      }

      // Handle screen-specific parameters before switching
      if (screenId === 'listing') {
        const cat = params.category || 'grocery';
        this.activeListingCategory = cat;
        this.activeListingSubcat = params.subcat || 'all';
        this.renderListingScreen(this.activeListingCategory, this.activeListingSubcat);
      } else if (screenId === 'product-detail') {
        const prodId = params.productId || 'PROD-ATTA-01';
        this.renderProductDetailScreen(prodId);
      } else if (screenId === 'shop') {
        const shopId = params.shopId || 'shop-sharma';
        this.renderShopScreen(shopId);
      } else if (screenId === 'cart') {
        this.renderCartScreen();
      } else if (screenId === 'checkout') {
        this.renderCheckoutScreen();
      } else if (screenId === 'tracking') {
        this.renderTrackingScreen(params.order || this.activeOrder);
      } else if (screenId === 'orders') {
        this.renderOrdersScreen(params.tab || 'current');
      } else if (screenId === 'offers') {
        // static offer deals
      } else if (screenId === 'jeevanix') {
        this.renderJeevanixScreen();
      }

      // Switch active class
      document.querySelectorAll('.himora-screen').forEach(el => el.classList.remove('active'));
      targetScreen.classList.add('active');
      targetScreen.scrollTop = 0;

      // Update Navigation History
      if (this.currentScreen !== screenId) {
        this.navigationHistory.push(screenId);
      }
      this.currentScreen = screenId;

      // Manage Bottom Navigation Visibility & Active Tabs
      const bottomNav = document.getElementById('appBottomNav');
      const noBottomNavScreens = ['product-detail', 'cart', 'checkout', 'tracking'];
      if (noBottomNavScreens.includes(screenId)) {
        if (bottomNav) bottomNav.style.display = 'none';
      } else {
        if (bottomNav) bottomNav.style.display = 'flex';
      }

      // Highlight active tab (Mobile)
      document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
      if (screenId === 'home') document.getElementById('tabNavHome')?.classList.add('active');
      else if (screenId === 'categories') document.getElementById('tabNavCategories')?.classList.add('active');
      else if (screenId === 'orders') document.getElementById('tabNavOrders')?.classList.add('active');
      else if (screenId === 'cart') document.getElementById('tabNavCart')?.classList.add('active');
      else if (screenId === 'profile') document.getElementById('tabNavAccount')?.classList.add('active');

      // Highlight active link (Desktop)
      document.querySelectorAll('.desktop-nav-link').forEach(btn => btn.classList.remove('active'));
      if (screenId === 'home') document.getElementById('desktopNavHome')?.classList.add('active');
      else if (screenId === 'categories') document.getElementById('desktopNavCategories')?.classList.add('active');
      else if (screenId === 'offers') document.getElementById('desktopNavOffers')?.classList.add('active');
      else if (screenId === 'jeevanix') document.getElementById('desktopNavJeevanix')?.classList.add('active');
      else if (screenId === 'orders') document.getElementById('desktopNavOrders')?.classList.add('active');
      else if (screenId === 'profile') document.getElementById('desktopNavAccount')?.classList.add('active');
    }

    goBack() {
      if (this.navigationHistory.length > 1) {
        this.navigationHistory.pop(); // Remove current
        const previousScreen = this.navigationHistory.pop(); // Get previous
        this.navigateTo(previousScreen || 'home');
      } else {
        this.navigateTo('home');
      }
    }

    // ========================================================
    // SCREEN 1: HOME SCREEN RENDERING
    // ========================================================
    renderHomeScreen() {
      // 8 Category Tiles
      const catGrid = document.getElementById('homeCategoryGrid');
      if (catGrid) {
        const top8 = HIMORA_CATALOG.categories.slice(0, 8);
        catGrid.innerHTML = top8.map(c => `
          <button class="category-tile-btn" onclick="window.customerApp.onCategoryTileClick('${c.id}')">
            <div class="category-icon-box">${c.icon}</div>
            <span class="category-tile-name">${c.name}</span>
          </button>
        `).join('');
      }

      // Popular Near You Products Scroll
      const popularList = document.getElementById('homePopularList');
      if (popularList) {
        const popularProds = HIMORA_CATALOG.products.filter(p => p.popular);
        popularList.innerHTML = popularProds.map(p => {
          const qty = this.cart[p.id] || 0;
          return `
            <div class="product-card-compact" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
              <div class="prod-img-box">
                <span>${p.icon}</span>
                <span class="discount-chip">${p.discount}</span>
              </div>
              <div class="prod-name">${p.name}</div>
              <div class="prod-unit">${p.unit} • ⭐ ${p.rating}</div>
              <div class="prod-price-row">
                <span class="current-price">₹${p.price}</span>
                <span class="mrp-strikethrough">₹${p.mrp}</span>
              </div>
              <div onclick="event.stopPropagation();">
                ${qty > 0 ? `
                  <div class="item-qty-stepper">
                    <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                    <span class="stepper-qty">${qty}</span>
                    <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
                  </div>
                ` : `
                  <button class="add-btn-green" onclick="window.customerApp.addToCart('${p.id}')">
                    <span>+ Add</span>
                  </button>
                `}
              </div>
            </div>
          `;
        }).join('');
      }
    }

    onCategoryTileClick(catId) {
      if (catId === 'more') {
        this.navigateTo('categories');
      } else if (catId === 'jeevanix-products') {
        this.navigateTo('jeevanix');
      } else {
        this.navigateTo('listing', { category: catId });
      }
    }

    // ========================================================
    // SCREEN 2: CATEGORIES SCREEN RENDERING
    // ========================================================
    renderCategoriesScreen() {
      const fullGrid = document.getElementById('fullCategoriesGrid');
      if (fullGrid) {
        const cats = HIMORA_CATALOG.categories.filter(c => c.id !== 'more');
        fullGrid.innerHTML = cats.map(c => `
          <div class="category-card-tile" onclick="window.customerApp.onCategoryTileClick('${c.id}')">
            <div class="cat-tile-avatar">${c.icon}</div>
            <div class="cat-tile-title">${c.name}</div>
          </div>
        `).join('');
      }
    }

    // ========================================================
    // SCREEN 3: PRODUCT LISTING SCREEN RENDERING
    // ========================================================
    renderListingScreen(catId = 'grocery', subcat = 'all') {
      const titleEl = document.getElementById('listingCategoryTitle');
      const catObj = HIMORA_CATALOG.categories.find(c => c.id === catId);
      if (titleEl) {
        titleEl.innerText = catObj ? catObj.name : 'Products';
      }

      // Render Subcategory Filter Pills
      const subcatScroll = document.getElementById('subcatFilterPills');
      if (subcatScroll && catObj && catObj.subcategories) {
        const subcats = ['All', ...catObj.subcategories];
        subcatScroll.innerHTML = subcats.map(s => {
          const val = s === 'All' ? 'all' : s;
          const isActive = (val.toLowerCase() === subcat.toLowerCase()) ? 'active' : '';
          return `
            <span class="subcat-pill ${isActive}" onclick="window.customerApp.filterSubcategory('${val}', this)">
              ${s}
            </span>
          `;
        }).join('');
      }

      // Filter Products
      const container = document.getElementById('listingProductContainer');
      if (!container) return;

      let prods = HIMORA_CATALOG.products;
      if (catId !== 'all') {
        prods = prods.filter(p => p.category === catId || (catId === 'local-products' && p.popular));
      }
      if (subcat && subcat !== 'all') {
        prods = prods.filter(p => p.subcategory && p.subcategory.toLowerCase() === subcat.toLowerCase());
      }

      if (prods.length === 0) {
        container.innerHTML = `
          <div style="text-align: center; padding: 40px 20px; color: var(--himora-text-muted);">
            <div style="font-size: 38px; margin-bottom: 8px;">📦</div>
            <p style="font-weight: 700;">No items found in this section</p>
            <p style="font-size: 12px; margin-top: 4px;">Check other categories or reset filters.</p>
          </div>
        `;
        return;
      }

      container.innerHTML = prods.map(p => {
        const qty = this.cart[p.id] || 0;
        return `
          <div class="listing-product-card" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
            <div class="listing-img-box">
              <span>${p.icon}</span>
              <span class="discount-chip">${p.discount}</span>
            </div>
            <div class="listing-info">
              <div class="listing-title">${p.name}</div>
              <div class="listing-meta">
                <span>${p.unit}</span>
                <span>•</span>
                <span class="listing-rating">⭐ ${p.rating} (${p.reviewsCount})</span>
              </div>
              <div class="listing-price-box">
                <span class="listing-price">₹${p.price}</span>
                <span class="mrp-strikethrough">₹${p.mrp}</span>
              </div>
            </div>
            <div class="listing-action-wrap" onclick="event.stopPropagation();">
              ${qty > 0 ? `
                <div class="item-qty-stepper">
                  <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                  <span class="stepper-qty">${qty}</span>
                  <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
                </div>
              ` : `
                <button class="add-btn-green" onclick="window.customerApp.addToCart('${p.id}')">
                  <span>+ Add</span>
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    filterSubcategory(subcat, el) {
      document.querySelectorAll('#subcatFilterPills .subcat-pill').forEach(b => b.classList.remove('active'));
      if (el) el.classList.add('active');
      this.activeListingSubcat = subcat;
      this.renderListingScreen(this.activeListingCategory, subcat);
    }

    toggleSort(type) {
      if (type === 'price') {
        HIMORA_CATALOG.products.sort((a, b) => a.price - b.price);
      } else if (type === 'rating') {
        HIMORA_CATALOG.products.sort((a, b) => b.rating - a.rating);
      }
      this.renderListingScreen(this.activeListingCategory, this.activeListingSubcat);
    }

    // ========================================================
    // SCREEN 4: PRODUCT DETAIL SCREEN RENDERING
    // ========================================================
    renderProductDetailScreen(prodId) {
      const prod = HIMORA_CATALOG.products.find(p => p.id === prodId) || HIMORA_CATALOG.products[0];
      this.activeProductDetail = prod;

      document.getElementById('detailProdAvatar').innerText = prod.icon;
      document.getElementById('detailProdName').innerText = prod.name;
      document.getElementById('detailProdRating').innerText = `⭐ ${prod.rating}`;
      document.getElementById('detailProdPrice').innerText = `₹${prod.price}`;
      document.getElementById('detailProdMrp').innerText = `₹${prod.mrp}`;
      document.getElementById('detailProdDiscount').innerText = prod.discount;
      document.getElementById('detailProdDesc').innerText = prod.desc;
      document.getElementById('detailStoreName').innerText = `Sold by: ${prod.merchantName || 'Sharma General Store'}`;
      
      const qty = this.cart[prod.id] || 1;
      document.getElementById('detailQtyVal').innerText = qty;

      const heart = document.getElementById('btnWishlistHeart');
      if (heart) {
        heart.innerText = this.wishlist.has(prod.id) ? '❤️' : '🤍';
      }
    }

    detailChangeQty(delta) {
      let qty = parseInt(document.getElementById('detailQtyVal').innerText, 10) || 1;
      qty = Math.max(1, qty + delta);
      document.getElementById('detailQtyVal').innerText = qty;
    }

    detailAddToCart() {
      if (!this.activeProductDetail) return;
      const qty = parseInt(document.getElementById('detailQtyVal').innerText, 10) || 1;
      this.addToCart(this.activeProductDetail.id, qty);
      this.navigateTo('cart');
    }

    selectPackVariant(variant, el) {
      document.querySelectorAll('.variant-chip').forEach(c => c.classList.remove('active'));
      if (el) el.classList.add('active');
    }

    toggleWishlist() {
      if (!this.activeProductDetail) return;
      const id = this.activeProductDetail.id;
      if (this.wishlist.has(id)) {
        this.wishlist.delete(id);
      } else {
        this.wishlist.add(id);
      }
      const heart = document.getElementById('btnWishlistHeart');
      if (heart) heart.innerText = this.wishlist.has(id) ? '❤️' : '🤍';
    }

    // ========================================================
    // SCREEN 5: SHOP PAGE RENDERING
    // ========================================================
    renderShopScreen(shopId = 'shop-sharma') {
      const shop = HIMORA_CATALOG.shops.find(s => s.id === shopId) || HIMORA_CATALOG.shops[0];
      this.activeShop = shop;

      document.getElementById('shopPageAvatar').innerText = shop.avatar;
      document.getElementById('shopPageTitle').innerText = shop.name;

      this.filterShopProducts('all');
    }

    filterShopProducts(catFilter, el) {
      if (el) {
        document.querySelectorAll('#screen-shop .subcat-pill').forEach(b => b.classList.remove('active'));
        el.classList.add('active');
      }

      const grid = document.getElementById('shopProductsGrid');
      if (!grid) return;

      const shopProds = HIMORA_CATALOG.products.filter(p => {
        if (p.merchantId !== (this.activeShop ? this.activeShop.id : 'shop-sharma')) return false;
        if (catFilter && catFilter !== 'all') return p.category.includes(catFilter) || p.subcategory.toLowerCase().includes(catFilter);
        return true;
      });

      grid.innerHTML = shopProds.map(p => {
        const qty = this.cart[p.id] || 0;
        return `
          <div class="product-card-compact" style="width: 100%;" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
            <div class="prod-img-box">
              <span>${p.icon}</span>
              <span class="discount-chip">${p.discount}</span>
            </div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-unit">${p.unit}</div>
            <div class="prod-price-row">
              <span class="current-price">₹${p.price}</span>
              <span class="mrp-strikethrough">₹${p.mrp}</span>
            </div>
            <div onclick="event.stopPropagation();">
              ${qty > 0 ? `
                <div class="item-qty-stepper">
                  <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                  <span class="stepper-qty">${qty}</span>
                  <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
                </div>
              ` : `
                <button class="add-btn-green" onclick="window.customerApp.addToCart('${p.id}')">
                  <span>+ Add</span>
                </button>
              `}
            </div>
          </div>
        `;
      }).join('');
    }

    // ========================================================
    // SCREEN 6: CART SCREEN ("YOUR CART")
    // ========================================================
    renderCartScreen() {
      const container = document.getElementById('cartItemsContainer');
      const wrapper = document.getElementById('cartContentWrapper');
      const emptyMsg = document.getElementById('emptyCartMessage');
      if (!container) return;

      const productIds = Object.keys(this.cart).filter(id => this.cart[id] > 0);

      if (productIds.length === 0) {
        if (wrapper) wrapper.style.display = 'none';
        if (emptyMsg) emptyMsg.style.display = 'block';
        return;
      }

      if (wrapper) wrapper.style.display = 'flex';
      if (emptyMsg) emptyMsg.style.display = 'none';

      let subtotal = 0;
      container.innerHTML = productIds.map(id => {
        const prod = HIMORA_CATALOG.products.find(p => p.id === id);
        if (!prod) return '';
        const qty = this.cart[id];
        const lineTotal = prod.price * qty;
        subtotal += lineTotal;

        return `
          <div class="cart-item-card">
            <div class="cart-item-avatar">${prod.icon}</div>
            <div class="cart-item-details">
              <div class="cart-item-title">${prod.name}</div>
              <div class="cart-item-rate">₹${prod.price} × ${qty} = <strong>₹${lineTotal}</strong></div>
            </div>
            <div class="item-qty-stepper" style="width: 82px;">
              <button class="stepper-btn" onclick="window.customerApp.changeQty('${prod.id}', -1)">-</button>
              <span class="stepper-qty">${qty}</span>
              <button class="stepper-btn" onclick="window.customerApp.changeQty('${prod.id}', 1)">+</button>
            </div>
            <button class="cart-trash-btn" onclick="window.customerApp.removeFromCart('${prod.id}')" title="Remove Item">🗑️</button>
          </div>
        `;
      }).join('');

      const deliveryFee = 30;
      const discount = 20;
      const total = Math.max(0, subtotal + deliveryFee - discount);

      document.getElementById('cartSubtotal').innerText = `₹${subtotal}`;
      document.getElementById('cartDeliveryFee').innerText = `₹${deliveryFee}`;
      document.getElementById('cartDiscount').innerText = `-₹${discount}`;
      document.getElementById('cartGrandTotal').innerText = `₹${total}`;
    }

    // ========================================================
    // SCREEN 7: CHECKOUT SCREEN
    // ========================================================
    renderCheckoutScreen() {
      const productIds = Object.keys(this.cart).filter(id => this.cart[id] > 0);
      let subtotal = 0;
      let count = 0;

      productIds.forEach(id => {
        const prod = HIMORA_CATALOG.products.find(p => p.id === id);
        if (prod) {
          const qty = this.cart[id];
          subtotal += prod.price * qty;
          count += qty;
        }
      });

      const deliveryFee = 30;
      const discount = 20;
      const total = Math.max(0, subtotal + deliveryFee - discount);

      document.getElementById('checkoutItemCount').innerText = count;
      document.getElementById('checkoutSubtotal').innerText = `₹${subtotal}`;
      document.getElementById('checkoutDeliveryFee').innerText = `₹${deliveryFee}`;
      document.getElementById('checkoutTotal').innerText = `₹${total}`;
    }

    setPayMode(mode) {
      this.selectedPayMode = mode;
    }

    placeFinalOrder() {
      const productIds = Object.keys(this.cart).filter(id => this.cart[id] > 0);
      if (productIds.length === 0) {
        alert('Aapka jhola khali hai.');
        return;
      }

      const items = productIds.map(id => {
        const prod = HIMORA_CATALOG.products.find(p => p.id === id);
        return {
          id: prod ? prod.id : id,
          name: prod ? prod.name : 'Pahadi Product',
          qty: this.cart[id],
          price: prod ? prod.price : 100
        };
      });

      let subtotal = items.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const deliveryFee = 30;
      const discount = 20;
      const grandTotal = Math.max(0, subtotal + deliveryFee - discount);

      // Generate random 4-digit ID matching PDF (e.g. HM1024)
      const orderNum = 'HM' + (1000 + Math.floor(Math.random() * 9000));
      const order = {
        id: orderNum,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        town: this.currentTownId || 'solan',
        townName: this.currentTown,
        customer: 'Amar Thakur',
        customerName: 'Amar Thakur',
        customerPhone: this.currentPhone,
        colony: this.currentTown,
        address: this.currentAddress,
        landmark: 'Near Himora Store',
        staircaseNotes: this.currentStairs,
        merchantId: 'm-101',
        merchantName: 'Sharma General Store',
        riderId: 'r-1',
        riderName: 'Rohit Kumar',
        riderPhone: '98161-12345',
        items: items,
        grandTotal: grandTotal,
        amount: grandTotal,
        paymentMode: this.selectedPayMode,
        status: 'Placed',
        rawStatus: 'Placed',
        otp: '5570',
        createdAt: new Date().toISOString()
      };

      this.activeOrder = order;

      // Save and broadcast across Super Admin, Merchant Terminal, and Rider Cockpit!
      if (window.pahadiBus) {
        window.pahadiBus.placeOrder(order);
      }

      // Audio Chime
      if (window.pahadiAudio) {
        window.pahadiAudio.playSuccessTune();
      }

      // Clear Cart
      this.cart = {};
      this.saveCartToStorage();
      this.updateCartBadges();

      // Navigate to Screen 8 (Order Tracking)
      this.navigateTo('tracking', { order: order });
    }

    // ========================================================
    // SCREEN 8: ORDER TRACKING SCREEN
    // ========================================================
    renderTrackingScreen(order) {
      if (!order) {
        order = this.activeOrder || {
          id: 'HM1024',
          date: 'Today',
          time: '10:24 AM',
          otp: '5570',
          riderName: 'Rohit Kumar',
          status: 'Confirmed'
        };
      }

      const rawStatus = (order.status || 'placed').toLowerCase();
      let activeStep = 1; // 1 to 6
      let statusLabel = 'Order Confirmed';

      if (rawStatus.includes('deliv')) {
        activeStep = 6;
        statusLabel = 'Delivered';
      } else if (rawStatus.includes('out') || rawStatus.includes('route')) {
        activeStep = 5;
        statusLabel = 'Out for Delivery';
      } else if (rawStatus.includes('pick') || rawStatus.includes('transit') || rawStatus.includes('climb')) {
        activeStep = 4;
        statusLabel = 'Rider Picked Up';
      } else if (rawStatus.includes('ready')) {
        activeStep = 3;
        statusLabel = 'Ready for Pickup';
      } else if (rawStatus.includes('prep') || rawStatus.includes('pack')) {
        activeStep = 2;
        statusLabel = 'Shop Preparing';
      } else {
        activeStep = 1;
        statusLabel = 'Order Confirmed';
      }

      document.getElementById('trackOrderCode').innerText = `#${order.id}`;
      document.getElementById('trackOrderTime').innerText = `Placed on ${order.date || 'Today'}, ${order.time || '10:24 AM'}`;
      document.getElementById('trackOtpDisplay').innerText = order.otp || '5570';
      document.getElementById('trackRiderName').innerText = order.riderName || 'Rohit Kumar';
      
      const badge = document.getElementById('trackStatusBadge');
      if (badge) {
        badge.innerText = statusLabel;
        if (activeStep === 6) {
          badge.style.background = '#DEF7EC';
          badge.style.color = '#03543F';
        } else {
          badge.style.background = '#ECFDF5';
          badge.style.color = '#0D7C66';
        }
      }

      // Render 6-Stage Timeline
      const stepperContainer = document.querySelector('.tracking-stepper-box');
      if (stepperContainer) {
        const steps = [
          { title: 'Order Confirmed', time: order.time || '10:24 AM', note: 'Verified with merchant' },
          { title: 'Shop Preparing', time: 'In Progress', note: 'Spill-proof packing sealed' },
          { title: 'Ready for Pickup', time: 'Counter Ready', note: 'Handover bag packed' },
          { title: 'Rider Picked Up', time: 'En-route', note: 'Climbing mountain trail to destination' },
          { title: 'Out for Delivery', time: 'Near destination ridge', note: 'Approaching recipient doorstep' },
          { title: 'Delivered', time: activeStep === 6 ? 'Delivered' : 'Estimated 30-45 min', note: 'Handover complete' }
        ];

        stepperContainer.innerHTML = steps.map((s, idx) => {
          const stepNum = idx + 1;
          let stateClass = '';
          let circleIcon = '○';

          if (stepNum < activeStep) {
            stateClass = 'completed';
            circleIcon = '✓';
          } else if (stepNum === activeStep) {
            stateClass = activeStep === 6 ? 'completed' : 'active';
            circleIcon = activeStep === 6 ? '✓' : '🔄';
          }

          return `
            <div class="track-step-row ${stateClass}">
              <div class="step-circle">${circleIcon}</div>
              <div>
                <div class="step-text-title">${s.title}</div>
                <div class="step-text-time">${s.time} • ${s.note}</div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // ========================================================
    // SCREEN 9: MY ORDERS SCREEN
    // ========================================================
    renderOrdersScreen(tab = 'current') {
      const container = document.getElementById('ordersListFeed');
      if (!container) return;

      const samplePastOrders = [
        {
          id: 'HM1024',
          date: '12 Apr, 10:24 AM',
          status: 'Delivered',
          statusType: 'delivered',
          thumbs: ['🌾', '🌻', '🍜'],
          total: 374
        },
        {
          id: 'HM1018',
          date: '10 Apr, 05:27 PM',
          status: 'Delivered',
          statusType: 'delivered',
          thumbs: ['🥛', '🍪'],
          total: 62
        },
        {
          id: 'HM1005',
          date: '06 Apr, 11:45 AM',
          status: 'Delivered',
          statusType: 'delivered',
          thumbs: ['🍎', '🍅', '🧂'],
          total: 200
        }
      ];

      let displayOrders = samplePastOrders;
      if (this.activeOrder) {
        displayOrders = [{
          id: this.activeOrder.id,
          date: 'Today, ' + this.activeOrder.time,
          status: 'On The Way',
          statusType: 'transit',
          thumbs: this.activeOrder.items.map(i => {
            const p = HIMORA_CATALOG.products.find(pr => pr.name === i.name);
            return p ? p.icon : '📦';
          }),
          total: this.activeOrder.grandTotal
        }, ...samplePastOrders];
      }

      if (tab === 'current') {
        displayOrders = displayOrders.filter(o => o.statusType === 'transit' || o.id === (this.activeOrder ? this.activeOrder.id : 'HM1024'));
      }

      container.innerHTML = displayOrders.map(o => `
        <div class="order-history-card">
          <div class="order-card-top-row">
            <div>
              <div style="font-family: var(--font-heading); font-size: 15px; font-weight: 800; color: #0F172A;">#${o.id}</div>
              <div style="font-size: 11.5px; color: #64748B;">${o.date}</div>
            </div>
            <span class="order-pill-status ${o.statusType}">${o.status}</span>
          </div>

          <div class="order-thumbs-row">
            ${o.thumbs.map(t => `<div class="order-thumb-icon">${t}</div>`).join('')}
          </div>

          <div class="order-actions-row">
            <button class="btn-order-view" onclick="window.customerApp.navigateTo('tracking', { order: { id: '${o.id}', date: '${o.date}' } })">View Details</button>
            <button class="btn-order-reorder" onclick="window.customerApp.reorderPastItems('${o.id}')">Reorder</button>
          </div>
        </div>
      `).join('');
    }

    switchOrderTab(tab, el) {
      document.querySelectorAll('.order-tab-btn').forEach(b => b.classList.remove('active'));
      if (el) el.classList.add('active');
      this.renderOrdersScreen(tab);
    }

    reorderPastItems(orderId) {
      this.addToCart('PROD-ATTA-01', 1);
      this.addToCart('PROD-OIL-01', 1);
      this.navigateTo('cart');
    }

    // ========================================================
    // SCREEN 12: JEEVANIX PRODUCTS SCREEN
    // ========================================================
    renderJeevanixScreen() {
      const grid = document.getElementById('jeevanixProductGrid');
      if (!grid) return;

      const jeevanixProds = HIMORA_CATALOG.products.filter(p => p.category === 'jeevanix-products');
      grid.innerHTML = jeevanixProds.map(p => {
        const qty = this.cart[p.id] || 0;
        return `
          <div class="jeevanix-prod-card" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
            <div class="jeevanix-img-box">
              <span>${p.icon}</span>
            </div>
            <div style="font-family: var(--font-heading); font-size: 14px; font-weight: 800; color: #0F172A; margin-bottom: 2px;">${p.name}</div>
            <div style="font-size: 11px; color: #059669; font-weight: 700; margin-bottom: 8px;">⭐ ${p.rating} (${p.reviewsCount})</div>
            <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid var(--himora-border-light); padding-top: 8px;">
              <span style="font-family: var(--font-heading); font-size: 16px; font-weight: 900; color: #0F172A;">₹${p.price}</span>
              <div onclick="event.stopPropagation();">
                ${qty > 0 ? `
                  <div class="item-qty-stepper" style="width: 72px; height: 30px;">
                    <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                    <span class="stepper-qty">${qty}</span>
                    <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
                  </div>
                ` : `
                  <button class="add-btn-green" style="width: 32px; height: 32px; border-radius: 50%; padding: 0;" onclick="window.customerApp.addToCart('${p.id}')">
                    <span>+</span>
                  </button>
                `}
              </div>
            </div>
          </div>
        `;
      }).join('');
    }

    // ========================================================
    // CART OPERATIONS
    // ========================================================
    addToCart(prodId, count = 1) {
      this.cart[prodId] = (this.cart[prodId] || 0) + count;
      this.saveCartToStorage();
      this.updateCartBadges();
      this.refreshCurrentScreenComponents();
    }

    changeQty(prodId, delta) {
      if (!this.cart[prodId]) return;
      this.cart[prodId] += delta;
      if (this.cart[prodId] <= 0) {
        delete this.cart[prodId];
      }
      this.saveCartToStorage();
      this.updateCartBadges();
      this.refreshCurrentScreenComponents();
    }

    removeFromCart(prodId) {
      delete this.cart[prodId];
      this.saveCartToStorage();
      this.updateCartBadges();
      this.refreshCurrentScreenComponents();
    }

    clearCart() {
      this.cart = {};
      this.saveCartToStorage();
      this.updateCartBadges();
      this.renderCartScreen();
      this.refreshCurrentScreenComponents();
    }

    updateCartBadges() {
      const badge = document.getElementById('cartNavBadge');
      if (!badge) return;
      const count = Object.values(this.cart).reduce((sum, q) => sum + q, 0);
      if (count > 0) {
        badge.innerText = count;
        badge.style.display = 'flex';
      } else {
        badge.style.display = 'none';
      }
    }

    refreshCurrentScreenComponents() {
      if (this.currentScreen === 'home') this.renderHomeScreen();
      else if (this.currentScreen === 'listing') this.renderListingScreen(this.activeListingCategory, this.activeListingSubcat);
      else if (this.currentScreen === 'shop') this.renderShopScreen(this.activeShop ? this.activeShop.id : 'shop-sharma');
      else if (this.currentScreen === 'cart') this.renderCartScreen();
      else if (this.currentScreen === 'jeevanix') this.renderJeevanixScreen();
    }

    loadCartFromStorage() {
      try {
        const stored = localStorage.getItem('pahadicart_cart_data');
        if (stored) {
          this.cart = JSON.parse(stored);
        } else {
          // Default to blueprint demo cart matching PDF Page 6
          this.cart = {
            'PROD-ATTA-01': 1,
            'PROD-MILK-01': 1,
            'PROD-MAGGI-01': 1
          };
          this.saveCartToStorage();
        }
      } catch(e) {
        this.cart = {
          'PROD-ATTA-01': 1,
          'PROD-MILK-01': 1,
          'PROD-MAGGI-01': 1
        };
      }
    }

    saveCartToStorage() {
      try {
        localStorage.setItem('pahadicart_cart_data', JSON.stringify(this.cart));
      } catch(e) {}
    }

    // ========================================================
    // MISC ACTIONS
    // ========================================================
    openTownPicker() {
      const town = prompt('Select Delivery Town:\n1. Dharampur\n2. Kotli\n3. Sarkaghat\n4. Mandi\n5. Jogindernagar\n6. Solan\n7. Shimla', 'Dharampur, Himachal Pradesh');
      if (town) {
        this.currentTown = town;
        document.getElementById('homeTownLabel').innerText = town + ' ▾';
      }
    }

    focusSearch() {
      this.navigateTo('home');
      const input = document.getElementById('homeSearchInput');
      if (input) {
        input.focus();
      }
    }

    handleSearch(query) {
      if (!query || query.trim() === '') {
        this.renderHomeScreen();
        return;
      }
      const q = query.toLowerCase().trim();
      const matched = HIMORA_CATALOG.products.filter(p => p.name.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q));
      
      const popularList = document.getElementById('homePopularList');
      if (popularList && matched.length > 0) {
        popularList.innerHTML = matched.map(p => `
          <div class="product-card-compact" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
            <div class="prod-img-box">
              <span>${p.icon}</span>
              <span class="discount-chip">${p.discount}</span>
            </div>
            <div class="prod-name">${p.name}</div>
            <div class="prod-unit">${p.unit}</div>
            <div class="prod-price-row">
              <span class="current-price">₹${p.price}</span>
            </div>
            <button class="add-btn-green" onclick="event.stopPropagation(); window.customerApp.addToCart('${p.id}')">
              <span>+ Add</span>
            </button>
          </div>
        `).join('');
      }
    }

    triggerVoiceSearch() {
      alert('🎤 Himora Hill Voice Assistant:\n"Bolkar order karein: Taaza apples, Aashirvaad Atta, ya Jeevanix Honey."');
    }

    shareCurrentProduct() {
      if (navigator.share) {
        navigator.share({
          title: this.activeProductDetail ? this.activeProductDetail.name : 'Himora Product',
          text: 'Check this out on Himora — Local Shopping Made for the Hills!',
          url: window.location.href
        }).catch(() => {});
      } else {
        alert('Product link copied to clipboard!');
      }
    }

    shareCurrentShop() {
      alert('Shop link copied: Sharma General Store on Himora!');
    }

    openHelpSupport() {
      alert('Himora Mountain Customer Care:\n📞 Helpline: +91 98160-12890\n💬 WhatsApp Support available 24x7 across Himachal.');
    }


    // Town Picker Modal Management
    openTownPicker() {
      const modal = document.getElementById('townPickerModal');
      if (modal) modal.style.display = 'flex';
    }

    closeTownPicker() {
      const modal = document.getElementById('townPickerModal');
      if (modal) modal.style.display = 'none';
    }

    selectTown(townKey, fullTownName) {
      this.currentTown = fullTownName;
      this.currentTownId = townKey.toLowerCase();
      this.currentAddress = `Near Himora Store, ${fullTownName}`;
      localStorage.setItem('himora_selected_town', fullTownName);

      this.updateTownDisplays();
      this.closeTownPicker();

      // Update active modal button
      document.querySelectorAll('.town-choice-btn').forEach(btn => btn.classList.remove('active'));
      const activeBtn = document.getElementById('btnTown' + townKey);
      if (activeBtn) activeBtn.classList.add('active');
    }

    updateTownDisplays() {
      const homeLabel = document.getElementById('homeTownLabel');
      const desktopLabel = document.getElementById('desktopTownLabel');
      const checkoutAddr = document.getElementById('checkoutAddressText');

      const shortTown = (this.currentTown || 'Dharampur').split(',')[0].trim();
      if (homeLabel) homeLabel.innerText = this.currentTown + ' ▾';
      if (desktopLabel) desktopLabel.innerText = shortTown + ' ▾';
      if (checkoutAddr) checkoutAddr.innerText = this.currentAddress;
    }

    // Address Modal Management
    openAddressModal() {
      const modal = document.getElementById('addressEditModal');
      if (modal) {
        document.getElementById('editInputAddress').value = this.currentAddress;
        document.getElementById('editInputStairs').value = this.currentStairs;
        document.getElementById('editInputPhone').value = this.currentPhone;
        modal.style.display = 'flex';
      }
    }

    closeAddressModal() {
      const modal = document.getElementById('addressEditModal');
      if (modal) modal.style.display = 'none';
    }

    saveCustomAddress() {
      this.currentAddress = document.getElementById('editInputAddress').value;
      this.currentStairs = document.getElementById('editInputStairs').value;
      this.currentPhone = document.getElementById('editInputPhone').value;

      const addrEl = document.getElementById('checkoutAddressText');
      const stairsEl = document.getElementById('checkoutStairsText');
      const phoneEl = document.getElementById('checkoutPhoneText');

      if (addrEl) addrEl.innerText = this.currentAddress;
      if (stairsEl) stairsEl.innerText = this.currentStairs;
      if (phoneEl) phoneEl.innerText = 'Contact: ' + this.currentPhone;

      this.closeAddressModal();
    }

    // Live Search input across Mobile & Desktop
    handleSearch(query) {
      if (!query || query.trim() === '') {
        this.renderHomeScreen();
        if (this.currentScreen === 'listing') {
          this.renderListingScreen(this.activeListingCategory, this.activeListingSubcat);
        }
        return;
      }

      const q = query.toLowerCase().trim();
      const matched = HIMORA_CATALOG.products.filter(p => 
        p.name.toLowerCase().includes(q) || 
        (p.desc && p.desc.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.subcategory && p.subcategory.toLowerCase().includes(q))
      );

      // If user typed on desktop navbar or mobile search, populate results in active view
      const popularList = document.getElementById('homePopularList');
      if (popularList && this.currentScreen === 'home') {
        popularList.innerHTML = matched.map(p => this.createProductCardHtml(p)).join('');
      }

      const listingContainer = document.getElementById('listingProductsList');
      if (listingContainer && this.currentScreen === 'listing') {
        listingContainer.innerHTML = matched.map(p => this.createHorizontalProductCardHtml(p)).join('');
      }
    }

    createProductCardHtml(p) {
      const qty = this.cart[p.id] || 0;
      return `
        <div class="product-card-compact" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
          <div class="prod-img-box">
            <span>${p.icon}</span>
            <span class="discount-chip">${p.discount}</span>
          </div>
          <div class="prod-name">${p.name}</div>
          <div class="prod-unit">${p.unit} • ⭐ ${p.rating}</div>
          <div class="prod-price-row">
            <span class="current-price">₹${p.price}</span>
            <span class="mrp-strikethrough">₹${p.mrp}</span>
          </div>
          <div onclick="event.stopPropagation();">
            ${qty > 0 ? `
              <div class="item-qty-stepper">
                <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                <span class="stepper-qty">${qty}</span>
                <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
              </div>
            ` : `
              <button class="add-btn-green" onclick="window.customerApp.addToCart('${p.id}')">
                <span>+ Add</span>
              </button>
            `}
          </div>
        </div>
      `;
    }

    createHorizontalProductCardHtml(p) {
      const qty = this.cart[p.id] || 0;
      return `
        <div class="product-card-horizontal" onclick="window.customerApp.navigateTo('product-detail', { productId: '${p.id}' })">
          <div class="prod-thumb-box">
            <span>${p.icon}</span>
            <span class="discount-badge-corner">${p.discount}</span>
          </div>
          <div class="prod-info-block">
            <h3 class="prod-title-text">${p.name}</h3>
            <div class="prod-meta-sub">${p.unit} • ⭐ ${p.rating} (${p.reviewsCount})</div>
            <div class="prod-rate-row">
              <span class="deal-price">₹${p.price}</span>
              <span class="striked-mrp">₹${p.mrp}</span>
            </div>
          </div>
          <div class="prod-action-block" onclick="event.stopPropagation();">
            ${qty > 0 ? `
              <div class="item-qty-stepper">
                <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', -1)">-</button>
                <span class="stepper-qty">${qty}</span>
                <button class="stepper-btn" onclick="window.customerApp.changeQty('${p.id}', 1)">+</button>
              </div>
            ` : `
              <button class="add-btn-green" onclick="window.customerApp.addToCart('${p.id}')">
                <span>+ Add</span>
              </button>
            `}
          </div>
        </div>
      `;
    }

    handleLogout() {
      if (confirm('Kya aap Himora app se logout karna chahte hain?')) {
        window.location.href = '/index.html';
      }
    }
  }

  window.customerApp = new HimoraApp();
})();
