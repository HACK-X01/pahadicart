// PahadiCart Shared Catalog & Master Mock Data across Himachal Pradesh
window.PAHADICART_DATA = {
  towns: [
    {
      id: 'solan',
      name: 'Solan (City of Red Gold)',
      center: [30.9084, 77.0999],
      altitude: '1,502 m',
      weather: 'clear',
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      zones: ['Mall Road', 'Shamti', 'Kotla Nullah', 'Chambaghat', 'Tank Road']
    },
    {
      id: 'shimla',
      name: 'Shimla (The Ridge & Sanjauli)',
      center: [31.1048, 77.1734],
      altitude: '2,206 m',
      weather: 'clear',
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      zones: ['The Mall Road', 'Sanjauli', 'Chotta Shimla', 'Lakkar Bazaar', 'Summer Hill']
    },
    {
      id: 'dharamshala',
      name: 'Dharamshala & McLeod Ganj',
      center: [32.2190, 76.3234],
      altitude: '1,457 m',
      weather: 'clear',
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      zones: ['Kotwali Bazaar', 'McLeod Ganj Square', 'Bhagsunag', 'Dharamkot', 'Forsyth Ganj']
    }
  ],

  categories: (function() {
    try {
      const stored = localStorage.getItem('pahadicart_categories');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch(e) {}
    return [
    { id: 'all', name: 'Sabhi Products', icon: '🏔️', order: 1, hidden: false },
    { id: 'kirana', name: 'Pahadi Kirana & Fresh', icon: '🍎', order: 2, hidden: false },
    { id: 'dhaba', name: 'Local Dhabas & Cafes', icon: '🍲', order: 3, hidden: false },
    { id: 'bakery', name: 'Mountain Bakeries', icon: '🍰', order: 4, hidden: false },
    { id: 'meds', name: '2-Hr Pahadi Meds', icon: '💊', order: 5, hidden: false },
    { id: 'wellness', name: 'Jeevanix Health & Wellness', icon: '🌿', order: 6, hidden: false }
  ];
  })(),

  merchants: [
    // --- SOLAN MERCHANTS ---
    {
      id: 'm-101',
      name: 'Sharma Kirana & Fresh Produce',
      category: 'kirana',
      town: 'solan',
      area: 'Mall Road Lower Bazaar',
      rating: 4.8,
      commission: 6,
      phone: '98160-22110',
      upi: 'sharmakiranahp@okhdfcbank',
      bankAcc: 'HDFC0001842 - A/C 50200039281',
      vyaparMandalId: 'VM-SOL-2024-089',
      image: '🍎',
      coordinates: [30.9080, 77.0990]
    },
    {
      id: 'm-102',
      name: 'Pahadi Rasoi & Dham Kitchen',
      category: 'dhaba',
      town: 'solan',
      area: 'Kotla Nullah Chowk',
      rating: 4.9,
      commission: 12,
      phone: '98161-55420',
      upi: 'pahadirasoisolan@okaxis',
      bankAcc: 'SBIN0000718 - A/C 38291048192',
      vyaparMandalId: 'VM-SOL-2024-112',
      image: '🍲',
      coordinates: [30.9055, 77.1040]
    },
    {
      id: 'm-103',
      name: 'Solan Heritage Hill Bakery',
      category: 'bakery',
      town: 'solan',
      area: 'Old Bus Stand Road',
      rating: 4.7,
      commission: 10,
      phone: '98055-11920',
      upi: 'solanbakery@icici',
      bankAcc: 'ICIC0000841 - A/C 08410150928',
      vyaparMandalId: 'VM-SOL-2023-044',
      image: '🍰',
      coordinates: [30.9100, 77.0980]
    },
    {
      id: 'm-104',
      name: 'Himalayan Health & Emergency Chemist',
      category: 'meds',
      town: 'solan',
      area: 'Hospital Road',
      rating: 4.9,
      commission: 5,
      phone: '98160-99441',
      upi: 'himhealth@sbi',
      bankAcc: 'SBIN0000718 - A/C 11920492819',
      vyaparMandalId: 'VM-SOL-2022-019',
      image: '💊',
      coordinates: [30.9090, 77.1020]
    },

    // --- SHIMLA MERCHANTS ---
    {
      id: 'm-201',
      name: 'Baljee Sweets & Heritage Bakery',
      category: 'bakery',
      town: 'shimla',
      area: 'The Mall Road',
      rating: 4.9,
      commission: 12,
      phone: '98160-33410',
      upi: 'baljeeshimla@okhdfcbank',
      bankAcc: 'HDFC0000184 - A/C 50200088192',
      vyaparMandalId: 'VM-SHM-2024-001',
      image: '🍰',
      coordinates: [31.1045, 77.1730]
    },
    {
      id: 'm-202',
      name: 'Himachal State Handicrafts & Dry Fruits',
      category: 'kirana',
      town: 'shimla',
      area: 'Lakkar Bazaar',
      rating: 4.8,
      commission: 8,
      phone: '98161-88421',
      upi: 'lakkarbazaar@sbi',
      bankAcc: 'SBIN0002490 - A/C 39281048201',
      vyaparMandalId: 'VM-SHM-2024-045',
      image: '🍎',
      coordinates: [31.1065, 77.1750]
    },
    {
      id: 'm-203',
      name: 'Sanjauli Daily Fresh Hill Kirana',
      category: 'kirana',
      town: 'shimla',
      area: 'Sanjauli Chowk',
      rating: 4.7,
      commission: 6,
      phone: '98055-44219',
      upi: 'sanjaulikirana@icici',
      bankAcc: 'ICIC0000214 - A/C 02140150938',
      vyaparMandalId: 'VM-SHM-2023-089',
      image: '🍎',
      coordinates: [31.1010, 77.1950]
    },
    {
      id: 'm-204',
      name: 'Chotta Shimla Ayurvedic & Medicos',
      category: 'meds',
      town: 'shimla',
      area: 'Chotta Shimla',
      rating: 4.9,
      commission: 5,
      phone: '98162-11990',
      upi: 'chottashimlameds@okaxis',
      bankAcc: 'UTIB0000492 - A/C 91902004819',
      vyaparMandalId: 'VM-SHM-2022-014',
      image: '💊',
      coordinates: [31.0960, 77.1850]
    },
    {
      id: 'm-205',
      name: 'Wake & Bake Hilltop Cafe',
      category: 'dhaba',
      town: 'shimla',
      area: 'The Ridge',
      rating: 4.9,
      commission: 14,
      phone: '98160-55992',
      upi: 'wakeandbake@okhdfcbank',
      bankAcc: 'HDFC0000184 - A/C 50200044910',
      vyaparMandalId: 'VM-SHM-2024-118',
      image: '🍲',
      coordinates: [31.1050, 77.1740]
    },

    // --- DHARAMSHALA & MCLEOD GANJ MERCHANTS ---
    {
      id: 'm-301',
      name: 'Tibet Kitchen Himalayan Cafe',
      category: 'dhaba',
      town: 'dharamshala',
      area: 'McLeod Ganj Main Square',
      rating: 4.9,
      commission: 12,
      phone: '98160-77180',
      upi: 'tibetkitchen@okhdfcbank',
      bankAcc: 'HDFC0001928 - A/C 50200077182',
      vyaparMandalId: 'VM-DHM-2024-002',
      image: '🍲',
      coordinates: [32.2425, 76.3215]
    },
    {
      id: 'm-302',
      name: 'Bhagsunag Organic Cafe & German Bakery',
      category: 'bakery',
      town: 'dharamshala',
      area: 'Bhagsunag Road',
      rating: 4.8,
      commission: 10,
      phone: '98055-66120',
      upi: 'bhagsubakery@icici',
      bankAcc: 'ICIC0000892 - A/C 08920150491',
      vyaparMandalId: 'VM-DHM-2023-033',
      image: '🍰',
      coordinates: [32.2460, 76.3320]
    },
    {
      id: 'm-303',
      name: 'Kangra Valley Organic Tea Estate',
      category: 'kirana',
      town: 'dharamshala',
      area: 'Kotwali Bazaar',
      rating: 4.9,
      commission: 7,
      phone: '98161-22990',
      upi: 'kangrateaestate@sbi',
      bankAcc: 'SBIN0000634 - A/C 31920491820',
      vyaparMandalId: 'VM-DHM-2024-051',
      image: '🍎',
      coordinates: [32.2195, 76.3240]
    },
    {
      id: 'm-304',
      name: 'Dharamkot Himalayan Herbal Care',
      category: 'meds',
      town: 'dharamshala',
      area: 'Dharamkot Village',
      rating: 4.9,
      commission: 5,
      phone: '98160-44119',
      upi: 'dharamkotherbal@okaxis',
      bankAcc: 'UTIB0000612 - A/C 91402004811',
      vyaparMandalId: 'VM-DHM-2022-009',
      image: '💊',
      coordinates: [32.2530, 76.3260]
    }
  ],

  riders: [
    // Solan Riders
    {
      id: 'r-1',
      name: 'Vikas Thakur',
      town: 'solan',
      phone: '98160-55421',
      bike: 'Hero Splendor HP-14-B-8821',
      status: 'available',
      ordersToday: 7,
      rating: 4.9,
      cashInHand: 1420,
      elevationClimbedMeters: 540,
      isWalkingRunner: false,
      coordinates: [30.9095, 77.1010]
    },
    {
      id: 'r-2',
      name: 'Mohit Verma',
      town: 'solan',
      phone: '98161-99201',
      bike: 'Honda Activa 6G HP-14-C-3310',
      status: 'available',
      ordersToday: 5,
      rating: 4.8,
      cashInHand: 850,
      elevationClimbedMeters: 380,
      isWalkingRunner: false,
      coordinates: [30.9060, 77.0970]
    },
    {
      id: 'r-3',
      name: 'Amit Kumar',
      town: 'solan',
      phone: '98055-12340',
      bike: 'Pedestrian Walking Runner (Staircase Backpack)',
      status: 'available',
      ordersToday: 8,
      rating: 5.0,
      cashInHand: 420,
      elevationClimbedMeters: 720,
      isWalkingRunner: true,
      coordinates: [30.9085, 77.0995]
    },

    // Shimla Riders
    {
      id: 'r-201',
      name: 'Sunil Negi',
      town: 'shimla',
      phone: '98160-44910',
      bike: 'Registered Walking Runner (The Mall & Ridge)',
      status: 'available',
      ordersToday: 9,
      rating: 4.95,
      cashInHand: 450,
      elevationClimbedMeters: 610,
      isWalkingRunner: true,
      coordinates: [31.1048, 77.1735]
    },
    {
      id: 'r-202',
      name: 'Praveen Rawat',
      town: 'shimla',
      phone: '98161-33829',
      bike: 'Hero Xpulse 200 (Anti-Skid Chains) HP-07-E-4421',
      status: 'available',
      ordersToday: 6,
      rating: 4.85,
      cashInHand: 920,
      elevationClimbedMeters: 890,
      isWalkingRunner: false,
      coordinates: [31.1020, 77.1930]
    },
    {
      id: 'r-203',
      name: 'Rajeev Sharma',
      town: 'shimla',
      phone: '98055-77102',
      bike: 'TVS Ntorq 125 HP-07-C-1192',
      status: 'available',
      ordersToday: 5,
      rating: 4.8,
      cashInHand: 1100,
      elevationClimbedMeters: 450,
      isWalkingRunner: false,
      coordinates: [31.0970, 77.1840]
    },

    // Dharamshala Riders
    {
      id: 'r-301',
      name: 'Tenzin Norbu',
      town: 'dharamshala',
      phone: '98160-88129',
      bike: 'Royal Enfield Himalayan HP-68-A-9921',
      status: 'available',
      ordersToday: 8,
      rating: 4.95,
      cashInHand: 650,
      elevationClimbedMeters: 1040,
      isWalkingRunner: false,
      coordinates: [32.2420, 76.3210]
    },
    {
      id: 'r-302',
      name: 'Kishore Sharma',
      town: 'dharamshala',
      phone: '98161-22440',
      bike: 'Walking Runner Partner (Bhagsunag Falls Trail)',
      status: 'available',
      ordersToday: 7,
      rating: 4.9,
      cashInHand: 320,
      elevationClimbedMeters: 690,
      isWalkingRunner: true,
      coordinates: [32.2455, 76.3315]
    },
    {
      id: 'r-303',
      name: 'Arun Rana',
      town: 'dharamshala',
      phone: '98055-99881',
      bike: 'Honda Activa 125 HP-68-B-3319',
      status: 'available',
      ordersToday: 6,
      rating: 4.8,
      cashInHand: 980,
      elevationClimbedMeters: 510,
      isWalkingRunner: false,
      coordinates: [32.2210, 76.3235]
    }
  ],

    products: (function() {
    try {
      const stored = localStorage.getItem('pahadicart_products');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  })(),

  businessRules: (function() {
    const defaults = {
      defaultCommissionPercent: 8,
      baseDeliveryFee: 25,
      staircaseDeliveryFee: 25,
      minOrderValue: 99,
      deliveryPromiseText: 'Under 2 Hours Hyperlocal Delivery (Himachal Hills)',
      serviceTowns: ['solan', 'shimla', 'dharamshala'],
      codEnabled: true,
      upiEnabled: true,
      requireShopApproval: true,
      requireProductApproval: false,
      activeCoupons: [
        { code: 'PAHADI50', discountPercent: 20, maxDiscount: 50, minOrder: 199, active: true },
        { code: 'WELCOME10', discountPercent: 10, maxDiscount: 30, minOrder: 99, active: true }
      ]
    };
    try {
      const stored = localStorage.getItem('pahadicart_business_rules');
      if (stored) {
        return Object.assign({}, defaults, JSON.parse(stored));
      }
    } catch(e) {}
    return defaults;
  })(),

  homepageCms: (function() {
    const defaults = {
      heroBanner: {
        title: 'Fresh From Himachal Hills to Your Doorstep in 2 Hours',
        subtitle: 'Pure Himalayan produce, local Vyapar Mandal stores & Jeevanix wellness remedies.',
        badge: '🌲 100% Authentic Hill Sourced',
        active: true
      },
      announcement: {
        text: '🏔️ Weather Advisory: Hill runners active across stone staircases. 2-Hour Express Delivery live!',
        type: 'info',
        active: true
      },
      featuredProductIds: [],
      featuredShopIds: [],
      offers: [
        { id: 'off-1', title: 'Solan Fresh Produce Deal', discount: 'Flat 15% OFF', code: 'HILLFRESH', active: true },
        { id: 'off-2', title: 'Jeevanix Health Boost', discount: 'Pure Himalayan Shilajit & Chyawanprash', code: 'JEEVANIX', active: true }
      ]
    };
    try {
      const stored = localStorage.getItem('pahadicart_homepage_cms');
      if (stored) {
        return Object.assign({}, defaults, JSON.parse(stored));
      }
    } catch(e) {}
    return defaults;
  })(),

  initialOrders: []
};

