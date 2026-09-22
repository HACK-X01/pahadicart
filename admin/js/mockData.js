// Enriched Master Database with COD Cash Limits, SOS, Support Tickets & Growth Analytics
const PahadiMockDB = {
  towns: [
    {
      id: "solan",
      name: "Solan (Mushroom City)",
      center: [30.9084, 77.0999],
      zoom: 14,
      elevation: "1,502 m",
      activeRiders: 8,
      activeOrders: 0,
      weather: "clear",
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: false,
      zones: [
        {
          id: "solan-mall",
          name: "Mall Road & Kotwali",
          type: "commercial",
          coords: [[30.904, 77.095], [30.912, 77.097], [30.914, 77.104], [30.906, 77.103]],
          color: "#10b981",
          sla: "45-60 min"
        },
        {
          id: "solan-shamti",
          name: "Shamti Residential Corridor",
          type: "hill-slopes",
          coords: [[30.898, 77.101], [30.906, 77.104], [30.908, 77.112], [30.901, 77.110]],
          color: "#0ea5e9",
          sla: "60-75 min"
        }
      ]
    },
    {
      id: "dharamshala",
      name: "Dharamshala & McLeodGanj",
      center: [32.2190, 76.3234],
      zoom: 13,
      elevation: "1,457 m",
      activeRiders: 6,
      activeOrders: 0,
      weather: "rain",
      weatherSurgeFee: 15,
      weatherBufferMins: 20,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: true,
      zones: [
        {
          id: "dha-kotwali",
          name: "Lower Dharamshala (Kotwali)",
          type: "commercial",
          coords: [[32.212, 76.318], [32.222, 76.320], [32.225, 76.328], [32.215, 76.327]],
          color: "#10b981",
          sla: "45-60 min"
        },
        {
          id: "dha-mcleod",
          name: "McLeodGanj (Pedestrian Walking Zone)",
          type: "walking-runner",
          coords: [[32.235, 76.320], [32.246, 76.321], [32.248, 76.330], [32.237, 76.329]],
          color: "#a855f7",
          sla: "50-70 min"
        }
      ]
    },
    {
      id: "shimla",
      name: "Shimla (The Ridge)",
      center: [31.1048, 77.1734],
      zoom: 14,
      elevation: "2,276 m",
      activeRiders: 10,
      activeOrders: 0,
      weather: "clear",
      weatherSurgeFee: 0,
      weatherBufferMins: 0,
      todayGMV: 0,
      todayOrders: 0,
      todayProfit: 0,
      peakHourSurgeActive: false,
      zones: [
        {
          id: "shimla-ridge",
          name: "The Ridge / Mall Road (Zero Motor Vehicle Zone)",
          type: "walking-runner",
          coords: [[31.101, 77.168], [31.108, 77.170], [31.109, 77.179], [31.102, 77.177]],
          color: "#a855f7",
          sla: "45-65 min"
        },
        {
          id: "shimla-sanjauli",
          name: "Sanjauli Hill Belt",
          type: "steep-slopes",
          coords: [[31.102, 77.185], [31.112, 77.187], [31.115, 77.198], [31.104, 77.196]],
          color: "#f59e0b",
          sla: "65-90 min"
        }
      ]
    }
  ],

  merchants: [
    {
      id: "m1",
      name: "Anand Sweet Shop & Bakers",
      owner: "Ramesh Anand",
      town: "solan",
      category: "Bakery & Sweets",
      commissionRate: 14,
      address: "Mall Road, Near Old Bus Stand, Solan",
      phone: "+91 98160 12345",
      coords: [30.9092, 77.0988],
      status: "approved",
      vyaparMandalVerified: true,
      bankAccount: "HDFC Bank (A/C: ****4921, IFSC: HDFC000120)",
      todaySales: 6450,
      todayOrders: 0,
      pendingPayout: 5547,
      platformCutEarned: 903,
      strikeCount: 0,
      gstin: "02AAACA1234A1Z5"
    },
    {
      id: "m2",
      name: "Him Kirana & Organic Store",
      owner: "Surinder Thakur",
      town: "solan",
      category: "Grocery & Kirana",
      commissionRate: 6,
      address: "Shamti Bypass Chowk, Solan",
      phone: "+91 94180 54321",
      coords: [30.9021, 77.1054],
      status: "approved",
      vyaparMandalVerified: true,
      bankAccount: "State Bank of India (A/C: ****8812, IFSC: SBIN000067)",
      todaySales: 11200,
      todayOrders: 0,
      pendingPayout: 10528,
      platformCutEarned: 672,
      strikeCount: 1, // 1 rejection due to stock
      gstin: "02AABCT9876K1ZQ"
    },
    {
      id: "m3",
      name: "Pine View Cafe & Siddu Point",
      owner: "Devender Sharma",
      town: "solan",
      category: "Restaurant",
      commissionRate: 18,
      address: "Kotwali Bazaar, Solan",
      phone: "+91 98055 67890",
      coords: [30.9075, 77.1012],
      status: "approved",
      vyaparMandalVerified: true,
      bankAccount: "Punjab National Bank (A/C: ****3341, IFSC: PUNB0124)",
      todaySales: 4890,
      todayOrders: 0,
      pendingPayout: 4010,
      platformCutEarned: 880,
      strikeCount: 0,
      gstin: "02AALCP4432P1ZT"
    },
    {
      id: "m4",
      name: "Ridge Medicos (Emergency Pharmacy)",
      owner: "Dr. K.L. Gupta",
      town: "shimla",
      category: "Pharmacy",
      commissionRate: 5,
      address: "Near Gaiety Theatre, Mall Road, Shimla",
      phone: "+91 94181 99887",
      coords: [31.1045, 77.1725],
      status: "approved",
      vyaparMandalVerified: true,
      bankAccount: "ICICI Bank (A/C: ****7729, IFSC: ICIC000341)",
      todaySales: 8750,
      todayOrders: 0,
      pendingPayout: 8312,
      platformCutEarned: 438,
      strikeCount: 0,
      gstin: "02AABCR5511M1ZX"
    },
    {
      id: "m5",
      name: "Tibet Kitchen & Dumplings",
      owner: "Tenzin Norbu",
      town: "dharamshala",
      category: "Restaurant",
      commissionRate: 16,
      address: "Main Square, McLeodGanj",
      phone: "+91 98822 45678",
      coords: [32.2425, 76.3255],
      status: "approved",
      vyaparMandalVerified: true,
      bankAccount: "SBI McLeod Branch (A/C: ****1104, IFSC: SBIN000542)",
      todaySales: 9400,
      todayOrders: 0,
      pendingPayout: 7896,
      platformCutEarned: 1504,
      strikeCount: 0,
      gstin: "02AANCT3321N1ZL"
    }
  ],

  riders: [
    {
      id: "r1",
      name: "Aman Thakur",
      phone: "+91 98051 11223",
      vehicle: "Honda Activa 125 (Hill Tuned)",
      vehicleNumber: "HP-14-B-4421",
      town: "solan",
      coords: [30.9070, 77.1020],
      status: "available",
        activeOrder: null,
      todayDeliveries: 9,
      todayDistanceKm: 34.2,
      elevationClimbedMeters: 1420,
      earningsToday: 0,
      customerTips: 0,
      rating: 4.9,
      batteryPercent: 88,
      bankUPI: "amanthakur@okaxis",
      // COD Cash Defense Fields
      cashInHand: 2150,
      maxCashLimit: 2500,
      isCashLocked: false,
      thermalKitIssued: true,
      sosActive: false
    },
    {
      id: "r2",
      name: "Rohit Verma",
      phone: "+91 98166 44556",
      vehicle: "TVS Ntorq 125",
      vehicleNumber: "HP-14-C-8812",
      town: "solan",
      coords: [30.9035, 77.0980],
      status: "available",
      activeOrder: null,
      todayDeliveries: 7,
      todayDistanceKm: 26.5,
      elevationClimbedMeters: 980,
      earningsToday: 0,
      customerTips: 0,
      rating: 4.8,
      batteryPercent: 72,
      bankUPI: "rohitverma@paytm",
      cashInHand: 2780, // OVER THE LIMIT (Locked!)
      maxCashLimit: 2500,
      isCashLocked: true,
      thermalKitIssued: true,
      sosActive: false
    },
    {
      id: "r3",
      name: "Vikram Negi",
      phone: "+91 94182 88990",
      vehicle: "Walking Runner Partner (Mall Road)",
      vehicleNumber: "Pedestrian Pass #04",
      town: "shimla",
      coords: [31.1050, 77.1740],
      status: "available",
        activeOrder: null,
      todayDeliveries: 14,
      todayDistanceKm: 12.8,
      elevationClimbedMeters: 850,
      earningsToday: 0,
      customerTips: 0,
      rating: 5.0,
      batteryPercent: 95,
      bankUPI: "vikramnegi@oksbi",
      cashInHand: 1240,
      maxCashLimit: 2500,
      isCashLocked: false,
      thermalKitIssued: true,
      sosActive: false
    },
    {
      id: "r4",
      name: "Sonam Dorjee",
      phone: "+91 98820 99112",
      vehicle: "Walking Runner (McLeod)",
      vehicleNumber: "Pedestrian Pass #09",
      town: "dharamshala",
      coords: [32.2410, 76.3240],
      status: "available",
      activeOrder: null,
      todayDeliveries: 6,
      todayDistanceKm: 9.4,
      elevationClimbedMeters: 620,
      earningsToday: 0,
      customerTips: 0,
      rating: 4.7,
      batteryPercent: 64,
      bankUPI: "sonamdorjee@gpay",
      cashInHand: 850,
      maxCashLimit: 2500,
      isCashLocked: false,
      thermalKitIssued: false,
      sosActive: false
    },
    {
      id: "r5",
      name: "Rakesh Kashyap",
      phone: "+91 98162 77119",
      vehicle: "Hero Splendor Plus (Hill Gear)",
      vehicleNumber: "HP-14-A-1904",
      town: "solan",
      coords: [30.9010, 77.1060],
      status: "available",
        activeOrder: null,
      todayDeliveries: 4,
      todayDistanceKm: 16.0,
      elevationClimbedMeters: 510,
      earningsToday: 0,
      customerTips: 0,
      rating: 4.6,
      batteryPercent: 40,
      bankUPI: "rakeshkashyap@ybl",
      cashInHand: 420,
      maxCashLimit: 2500,
      isCashLocked: false,
      thermalKitIssued: true,
      sosActive: true // ACTIVE EMERGENCY SOS!
    }
  ],

  orders: [],

  // Customer Support & Tickets
  supportTickets: [],

  // Growth & Colony Heatmap Intelligence
  colonyHeatmap: [],

  // Marketing Coupons Burn vs ROI
  coupons: [],

  // Inactive Customers for WhatsApp Re-engagement
  inactiveCustomers: [],

  financialSummary: {
    monthToDateGMV: 0,
    merchantPayoutsProcessed: 0,
    merchantDuesPending: 0,
    riderPayoutsProcessed: 0,
    gatewayAndSmsFees: 0,
    netFounderProfitMtd: 0,
    netProfitMarginPct: 0,
    averageOrderValue: 0,
    totalCompletedOrdersMonth: 0
  },

  categoryShare: []
};
