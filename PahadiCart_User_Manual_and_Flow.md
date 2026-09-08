# PahadiCart (पहाड़ीकार्ट) - Master Architecture Flow & Operations User Manual

> **Official Operations Guide & Technical Blueprint (Version 2.9 - September 2026)**  
> **Target Market:** Himachal Pradesh (Solan, Shimla, Dharamshala / McLeod Ganj)  
> **Live Production:** [https://pahadicart.vercel.app](https://pahadicart.vercel.app)  
> **Local Server:** `http://localhost:3333/`  
> **GitHub Repository:** [https://github.com/HACK-X01/pahadicart](https://github.com/HACK-X01/pahadicart)

---

## 📑 Table of Contents
1. [Executive Summary & 5-Portal Architecture](#1-executive-summary--5-portal-architecture)
2. [End-to-End Mountain Order Flow (5-Stage Triad Lifecycle)](#2-end-to-end-mountain-order-flow)
3. [Compulsory HTML5 Live GPS Auto-Detection & Flow](#3-compulsory-html5-live-gps-auto-detection--flow)
4. [Real-Time Meteorological Auto-Sync (Open-Meteo REST API)](#4-real-time-meteorological-auto-sync-open-meteo-rest-api)
5. [Universal Google Maps Turn-by-Turn Navigation Deep Links](#5-universal-google-maps-turn-by-turn-navigation-deep-links)
6. [Operations User Manual: Super Admin Command Tower](#6-operations-user-manual-super-admin-command-tower)
7. [Operations User Manual: Vyapar Mandal Merchant Shop Portal](#7-operations-user-manual-vyapar-mandal-merchant-shop-portal)
8. [Operations User Manual: Pahadi Rider Mobile Cockpit](#8-operations-user-manual-pahadi-rider-mobile-cockpit)
9. [Customer Guide, Tunnel Mode & Troubleshooting FAQ](#9-customer-guide-tunnel-mode--troubleshooting-faq)

---

## 1. Executive Summary & 5-Portal Architecture

PahadiCart is an indigenous mountain-first hyperlocal commerce platform engineered specifically for the steep ridges, winding road curves, and ancient staircase footpaths of Himachal Pradesh:
- **Zero-Cost Open Source Stack:** Built on vanilla JavaScript, HTML5, Web Audio API, Web SpeechSynthesis API, Leaflet OpenStreetMap, Open-Meteo REST API, and Service Worker PWA without expensive external SaaS fees.
- **Hardware-Level GPS & Elevation Routing:** Calculates true mountain road curvature and pedestrian staircase climbs rather than deceptive flat aerial straight lines.
- **Vyapar Mandal Empowerment:** Directly connects ancestral high-street dukandars, dhabas, bakers, and local chemists with mountain customers.

### The 5 Interconnected Portals:
| Portal | Live URL | Primary Users | Key Functions |
|---|---|---|---|
| **Super Hub Launcher** | `https://pahadicart.vercel.app/` | Founders & Admins | Ecosystem switcher & 1-Click Lifecycle Simulator |
| **Super Admin Tower** | `https://pahadicart.vercel.app/admin/` | Operations Managers | God View dispatch map, live weather sync, triad audit, P&L |
| **Customer PWA App** | `https://pahadicart.vercel.app/customer/` | Consumers & Tourists | Compulsory GPS detect, live mountain radar, staircase notes |
| **Merchant Shop Portal** | `https://pahadicart.vercel.app/merchant/` | Kirana Owners & Cooks | "Ghar Ki Ghanti" audio chime, 58mm thermal KOT slip printer |
| **Rider Mobile Cockpit** | `https://pahadicart.vercel.app/rider/` | Scooter & Walker Fleet | Google Maps turn-by-turn navigation, batched route optimizer |

---

## 2. End-to-End Mountain Order Flow

Every order follows an automated 5-stage triad cycle across the real-time event pipeline:

```
[Customer App / WhatsApp Bot]
      │ 1. Order Placed (Items + Staircase Address + Elevation Surcharge)
      ▼
[PahadiEventBus & Dispatch Engine] ──► Triggers "Ghar Ki Ghanti" Web Audio Chime
      │ 2. Proximity Shopkeeper Assignment
      ▼
[Merchant Portal] ──► Accepts & Prints 58mm KOT Slip (Prepares Package)
      │ 3. Auto-Dispatches to Nearest Available Rider
      ▼
[Rider Cockpit] ──► Radar Ping ──► Accepts & Navigates Batched Mountain Trail
      │ 4. Staircase Footpath Climb & Doorstep Handover
      ▼
[Customer Handshake] ──► Secret 4-Digit OTP Verified on Doorstep (COD / UPI)
      │ 5. Immediate Financial Settlement
      ▼
[Admin Command Tower] ──► Live GMV, Platform Commission, Rider Payout & 1% TCS Credited
```

---

## 3. Compulsory HTML5 Live GPS Auto-Detection & Flow

To guarantee accurate mountain staircase navigation and prevent deliveries to wrong hill ridges, PahadiCart enforces a **Compulsory Location Flow** upon initial app open:

### Key Operational Rules:
1. **First-Open Glassmorphic Modal:** Whenever any portal is opened without a pre-confirmed session, a high-tech modal prompts: *"📍 Live Location Access Compulsory"*.
2. **Permission Priming:** Explains why GPS is mandatory (staircase elevation, exact merchant hub allocation, and live mountain weather sync).
3. **Hardware-Level Precision:** Uses native `navigator.geolocation.getCurrentPosition({ enableHighAccuracy: true })` to capture true latitude, longitude, altitude, and accuracy radius.
4. **Interactive Map Auto-Pan:** The Leaflet God View map immediately flies to the user's coordinates with a pulsating cyan marker (`📍 You Are Here`).
5. **Nearest Himachal Hub Switching:** Calculates great-circle Haversine distances to Solan (1,502m), Shimla (2,206m), and Dharamshala (1,457m) and automatically switches the active catalog.
6. **Smart Fallback:** If the device has no GPS chip or permission is withheld, users can continue with default Solan Hub without crashing.

---

## 4. Real-Time Meteorological Auto-Sync (Open-Meteo REST API)

PahadiCart connects directly with the **Open-Meteo Meteorological REST API** (100% free, zero billing, zero API keys) for accurate Himachal weather intelligence:

### WMO Weather Classification & Hill Protocols:
- **☀️ Clear Skies (WMO 0–3):** Standard 45–60 min delivery SLA active across all hill corridors. Zero surge fees.
- **🌧️ Monsoon Rain (WMO 51–67, 80–82, 95–99):** Automatically adds **+20 minutes** buffer to customer ETAs and applies a **+₹15 Dynamic Rain Surge** directly to rider earnings.
- **❄️ Snowfall / Blizzard (WMO 71–77, 85–86):** Triggers the **Extreme Weather Safety Lock**. Steep unpaved slopes are locked; deliveries restricted to pedestrian walking runners on cleared main roads.
- **Live Telemetry Badges:** Admin Controller and Customer Hero Banner reflect real-time live temperatures (e.g. `18.1°C • ☀️ Clear Skies`).

---

## 5. Universal Google Maps Turn-by-Turn Navigation Deep Links

To bridge web app logistics with hardware satellite navigation, PahadiCart generates standard universal Google Maps deep links:
- **Format:** `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`
- **Rider Missions:** Riders tap **"🗺️ Open Turn-by-Turn in Google Maps"** to launch the official Google Maps app on Android/iOS devices for real-time turn-by-turn hill directions.
- **Multi-Stop Batched Routes:** Sequence stops from lowest to highest staircase elevation and launch the sequenced mountain route in Google Maps.
- **Customer Tracking:** Customers tap **"🗺️ Open in Google Maps"** from the Live Mountain GPS Radar to visualize their rider's approach.
- **Admin Queue:** Admins can inspect any delivery drop point directly in Google Maps from the Live Orders feed.

---

## 6. Operations User Manual: Super Admin Command Tower

### Control Tower Guide (`/admin/`):
- **Live Elevation & Dispatch Map:** Live God View Leaflet map with PostGIS service polygons, merchant pins, active rider scooters, and user's live GPS pulsating marker.
- **Weather Surge Controller:** Live telemetry badge displays real-time Open-Meteo updates. Operations managers can also click manual drill buttons (*Clear*, *Rain*, *Snow*) to test emergency protocols anytime.
- **Live Mountain Orders Feed:** Real-time stream of incoming orders with action buttons for *Accept*, *Dispatch*, *Verify OTP*, *Triad Audit*, and *Google Maps*.
- **Triad Audit Inspection:** 1-click comprehensive lifecycle modal displaying customer details, merchant KOT slip status, assigned rider telemetry, and exact timestamps.

---

## 7. Operations User Manual: Vyapar Mandal Merchant Shop Portal

### Merchant Guide (`/merchant/`):
1. **Audio & Voice Alerts:** Browser Web Audio API plays the loud **"Ghar Ki Ghanti"** temple bell chime and automated Hindi speech synthesis (*"Naya PahadiCart Order Aaya Hai"*).
2. **Thermal KOT Slip Printer:** 1-click print for standard 58mm/80mm POS thermal receipts with shop registration code, order items, and customer staircase notes.
3. **Kanban Status Management:** Dukandars move orders from *Placed* to *Preparing* and *Ready for Pickup*, triggering automatic rider dispatch.

---

## 8. Operations User Manual: Pahadi Rider Mobile Cockpit

### Rider Guide (`/rider/`):
1. **Online/Offline Duty Toggle:** High-contrast switch for riders on mountain routes.
2. **Google Maps Navigation:** Instant turn-by-turn driving directions to shop pickup and customer staircase doorstep.
3. **Batched Mountain Routes:** Groups proximate orders in the same hill ridge and sequences them in ascending staircase order, saving ~38% climbing fatigue.
4. **Secret Doorstep OTP Verification:** 4-digit customer OTP required to complete order, preventing misplaced hill deliveries.
5. **Emergency SOS Alert:** Alerts admin control tower with exact GPS coordinates in case of vehicle breakdown, heavy fog, or landslide.

---

## 9. Customer Guide, Tunnel Mode & Troubleshooting FAQ

### Customer Ordering Guide (`/customer/`):
- **Live GPS Auto-Detection:** Tap *"📍 Detect My Location"* to find the nearest Himachal town hub automatically.
- **Voice Ordering:** Hindi/English speech-to-text ordering for busy mountain residents.
- **Tunnel Mode (Offline Support):** When crossing mountain tunnels without cellular reception, orders are queued in IndexedDB/LocalCache and automatically transmitted once network restores.

---

### 📥 Available PDF Copies:
- **Workspace:** `H:\pahadicart\PahadiCart_User_Manual_and_Flow.pdf`
- **Artifact Directory:** `C:\Users\Venom\.gemini\antigravity-ide\brain\05a208ea-49f8-4034-a6e9-27f8f7e11da9\PahadiCart_User_Manual_and_Flow.pdf`
- **Desktop:** `C:\Users\Venom\OneDrive\Desktop\PahadiCart_User_Manual_and_Flow.pdf`
- **Downloads:** `C:\Users\Venom\Downloads\PahadiCart_User_Manual_and_Flow.pdf`


---

## 10. Super Admin Command Center V3.0 (60-Point PRD Master Specifications)

The Super Admin Web Panel is the central operational command tower for all hyperlocal deliveries across the challenging terrain of Himachal Pradesh (Solan, Dharamshala, Shimla).

### 10.1 Role-Based Access Control (RBAC)
| Role | Accessible Modules | Operational Bounds |
|---|---|---|
| **SUPER_ADMIN** | Full Platform Access | All towns, system settings, RBAC management, audit trails, financial overrides |
| **OPERATIONS_ADMIN** | Orders, Riders, Merchants, Zones, Dispatch, Live Map | Fleet dispatch, corridor management, live order escalations |
| **FINANCE_ADMIN** | Payments, Settlements, Merchant Ledger, Rider Wallets, COD, Refunds | T+1/T+2 payout runs, take-rate audits, cash float reconciliation |
| **SUPPORT_ADMIN** | Orders, Customers, Merchants, Riders, Support Tickets, Disputes | Order interventions, masked customer assistance, ticket resolutions |
| **TOWN_COORDINATOR** | Assigned Town Only (Solan, Shimla, or Dharamshala) | Local shop approvals, local rider shift allocations |

---

### 10.2 Mathematical Terrain & ETA Engine Blueprint
Direct straight-line distance produces massive delivery failure rates in Himachal valleys. The platform implements the exact terrain formula:

$$\text{Final ETA} = T_{\text{prep}} + T_{\text{pickup}} + T_{\text{transit}} + T_{\text{staircase}} + T_{\text{weather\_buffer}}$$

- **Transit Time ($T_{\text{transit}}$):**
  $$T_{\text{transit}} = \left(\frac{D_{\text{road}}}{V_{\text{base}}}\right) \times (1 + \alpha \times \text{Gradient\_Factor}) \times \text{Turn\_Penalty}$$
- **Gradient Factor:**
  $$\text{Gradient} = \max\left(0, \frac{\text{Elevation}_{\text{drop}} - \text{Elevation}_{\text{pickup}}}{D_{\text{road}}}\right)$$
- **Hairpin Bend Turn Penalty:**
  $$\text{Turn\_Penalty} = 1 + (\text{Hairpin Count} \times 0.035)$$
- **Doorstep Stairway Climb:**
  $$T_{\text{staircase}} = \text{Staircase Steps} \times 0.25\text{ min}$$
- **Dynamic Meteorological Buffers:**
  - *Monsoon Rain:* $+15\text{ mins}$
  - *Heavy Ridge Fog:* $+25\text{ mins}$
  - *Snow Alert:* $+35\text{ mins}$ (or automatic zone safety pause)

---

### 10.3 Unresolved PRD Decisions Matrix (Configurable System Settings)
To prevent hardcoded operational assumptions, all ambiguous PRD requirements are exposed as audited settings in the Super Admin panel:
1. **Merchant Acceptance Timer:** PRD Section 4.2 states 60s while Section 7.1 states 90s. Configured as a dynamic slider (default 75s with 60s/90s one-click presets).
2. **Gradient Factor Alpha ($\alpha$):** Default calibrated to $1.45$, dynamically adjustable for different mountain steepness profiles.
3. **Base Hill Transit Speed ($V_{\text{base}}$):** Default $24\text{ km/h}$ for winding mountain state highways.
4. **Abstracted Map Engine:** Supports Leaflet (zero-cost OpenStreetMap) and Mapbox GL JS.
5. **Abstracted Mountain Router:** Supports OSRM Hill Engine, Google Directions, and Mapbox Directions.
6. **Abstracted Settlement Infrastructure:** T+1 vs T+2 cycles, configured for RazorpayX and Cashfree Payouts.
7. **Cash Remittance Float Rules:** Configurable maximum cash-on-delivery holding limit per rider partner before mandatory hub deposit.
8. **Runner Partner Commercial Structure:** Walking couriers on Mall Road receive ₹45 base + ₹12/km walking surcharge.
9. **Controlled Inventory Overrides:** Admin can override merchant stock discrepancies on-ground with mandatory audit justification.
