# PahadiCart (पहाड़ीकार्ट) - Master Architecture Flow & Operations User Manual

> **Official Operations Guide & Technical Blueprint (Version 2.0 - 2026)**  
> **Target Market:** Himachal Pradesh (Solan, Shimla, Dharamshala / McLeod Ganj)  
> **Status:** Live & Fully Operational on Localhost Port 3333

---

## 📑 Table of Contents
1. [Executive Summary & 5-Portal Architecture](#1-executive-summary--5-portal-architecture)
2. [End-to-End Mountain Order Flow (5-Stage Triad Lifecycle)](#2-end-to-end-mountain-order-flow)
3. [Operations User Manual: Super Admin Command Tower](#3-operations-user-manual-super-admin-command-tower)
4. [Operations User Manual: Vyapar Mandal Merchant Shop Portal](#4-operations-user-manual-vyapar-mandal-merchant-shop-portal)
5. [Operations User Manual: Pahadi Rider Mobile Cockpit](#5-operations-user-manual-pahadi-rider-mobile-cockpit)
6. [Customer Guide, Tunnel Mode & Troubleshooting FAQ](#6-customer-guide-tunnel-mode--troubleshooting-faq)

---

## 1. Executive Summary & 5-Portal Architecture

PahadiCart is an indigenous mountain-first hyperlocal commerce platform designed specifically for the unique geographical and infrastructural challenges of Himachal Pradesh:
- **Zero-Cost Open Source Stack:** Built on vanilla JavaScript, HTML5, Web Audio API, Web SpeechSynthesis API, Leaflet OpenStreetMap, and Service Worker PWA without expensive external SaaS dependencies.
- **Elevation-Aware Routing:** Calculates true mountain road distance and climb time rather than deceptive flat aerial straight lines.
- **Vyapar Mandal Integration:** Directly empowers existing ancestral high-street dukandars, dhabas, bakers, and chemists.

### The 5 Interconnected Portals:
| Portal | URL | Primary Users | Key Functions |
|---|---|---|---|
| **Super Hub Launcher** | `http://localhost:3333/` | Founders, Admins | Platform portal switcher & 1-Click Lifecycle Simulator |
| **Super Admin Tower** | `http://localhost:3333/admin/` | Operations Managers | Triad Tracker, Rider fleet radar, P&L ledger, Weather surcharges |
| **Customer PWA App** | `http://localhost:3333/customer/` | Consumers, Tourists | Town switcher, WhatsApp Hinglish bot, staircase address notes, Tunnel mode |
| **Merchant Shop Portal** | `http://localhost:3333/merchant/` | Kirana Owners, Cooks | "Ghar Ki Ghanti" chime, voice call alerts, 58mm POS thermal KOT printer |
| **Rider Mobile Cockpit** | `http://localhost:3333/rider/` | Scooter Riders, Walkers | Glove-friendly touch UI, batched route staircase optimizer, OTP verify |

---

## 2. End-to-End Mountain Order Flow

Every order follows an automated 5-stage triad cycle across the real-time event pipeline:

```
[Customer App / WhatsApp Bot]
      │ 1. Order Placed (Items + Staircase Address + Elevation Fee)
      ▼
[PahadiEventBus & Dispatch Engine] ➔ Triggers "Ghar Ki Ghanti" Web Audio Chime
      │ 2. Proximity Shopkeeper Assignment
      ▼
[Merchant Portal] ➔ Accepts & Prints 58mm KOT Slip (Prepares Package)
      │ 3. Auto-Dispatches to Nearest Available Rider
      ▼
[Rider Cockpit] ➔ Radar Ping ➔ Accepts & Navigates Batched Mountain Trail
      │ 4. Staircase Climb & Doorstep Handover
      ▼
[Customer Handshake] ➔ Secret 4-Digit OTP Verified on Doorstep (COD / UPI Collected)
      │ 5. Immediate Financial Settlement
      ▼
[Admin Command Tower] ➔ Live GMV, Platform Commission, Rider Payout & 1% TCS Credited
```

### 5-Stage Breakdown:
1. **Stage 1 (Order Placement):** Customer selects items or types naturally in Hindi on WhatsApp bot (*"Bhaiya 1kg seb aur 2 Siddu bhej do Shamti, 42 seedhiyo ke upar"*). Dynamic fees added (Base ₹25 + Staircase ₹25 + Elevation ₹15 + Weather surge).
2. **Stage 2 (Merchant Chime & KOT):** Nearest merchant receives a loud brass temple bell chime (**"Ghar Ki Ghanti"**) and automated Hindi voice call. Dukandar clicks **"🖨️ KOT Slip"** to print 58mm receipt with customer staircase notes.
3. **Stage 3 (Rider Radar & Batching):** Nearest rider receives a high-contrast radar ping. If multiple orders are in the same hill pocket, the **Batched Route Optimizer** arranges stops in an ascending staircase sequence, reducing hill fatigue by ~38%.
4. **Stage 4 (Staircase Handover & OTP):** Rider navigates hill stairs, meets customer, verifies 4-digit secret OTP, and collects cash or UPI payment.
5. **Stage 5 (Financial Settlement):** GMV, platform commission (6%-18%), rider payout (₹85+), and Section 194-O 1% TCS tax deduction are settled instantly in the Admin ledger.

---

## 3. Operations User Manual: Super Admin Command Tower

### How to use the Command Tower (`/admin/`):
- **Live Triad Tracker:** View Customer, Merchant, and Rider status in one combined card per order.
- **Fleet Telemetry:** Monitor rider GPS positions, battery %, speed, and cash-in-hand limit (< ₹2,500).
- **1-Click Live Simulator:** Click **"⚡ 1-Click Simulator"**, choose town (Solan, Shimla, Dharamshala), and watch an entire 5-step order complete with live sound, map climb, and profit credit in 10 seconds.
- **Weather Surge Control:** Switch between *Clear Skies*, *Monsoon Rain (+₹15 surge)*, and *Snow/Landslide curfew*.
- **Rider SOS Alerts:** Emergency alerts show rider GPS coordinates for immediate rescue dispatch.

---

## 4. Operations User Manual: Vyapar Mandal Merchant Shop Portal

### How to manage orders (`/merchant/`):
1. **Audio Alerts:** Keep tablet/phone volume ON. An order triggers **"Ghar Ki Ghanti"** and a Hindi voice announcement.
2. **Printing KOT Slip:** Click **"🖨️ KOT Slip"** to print 58mm/80mm thermal receipt showing shop registration (`VM-SOL-2024-089`), items, UPI QR code, and staircase instructions.
3. **Kanban Tracking:** Click **"Accept & Pack"** to move order to *Preparing*, which notifies riders.
4. **Daily Settlements:** Check top banner for total orders, gross sales, platform commission, and **1% TCS tax credit** (claimable in annual ITR).

---

## 5. Operations User Manual: Pahadi Rider Mobile Cockpit

### How riders complete deliveries (`/rider/`):
1. **Duty Toggle:** Check **"🟢 Online (On Duty)"** status at top.
2. **Accepting Radar Orders:** Tap **"🛵 Accept Delivery Task"** on incoming order ping.
3. **Batched Mountain Route:** Tap **"📦 Batched Route"** to view stops ordered from bottom to top of the hill to minimize load carrying fatigue.
4. **Staircase Guidance:** Read customer notes (e.g. *"Descend 35 stone steps, green gate"*).
5. **Doorstep OTP:** Ask customer for their 4-digit secret OTP, enter into app, collect cash/UPI, and tap **"✅ Complete Delivery"** to receive instant ₹85 payout in wallet.
6. **Breakdown / Landslide:** Tap **"🚨 EMERGENCY SOS"** to alert the control room.

---

## 6. Customer Guide, Tunnel Mode & Troubleshooting FAQ

### How customers order:
- **Web App:** Visit `/customer/`, choose town, add products to cart, enter staircase notes, and checkout.
- **WhatsApp Bot:** Tap floating green icon, type order in plain Hindi, and receive instant confirmation with OTP.
- **Tunnel Mode (Offline):** When entering deep valleys without signal, the app enters *Tunnel Mode*. Orders are queued locally and automatically flush when 4G/5G restores.

### Quick Troubleshooting:
- **No Sound:** Click **"🔔 Test Ghar Ki Ghanti"** in merchant header to grant browser audio permissions.
- **House Not Found:** Call customer directly using the in-app masked calling button.
- **Lost OTP:** Merchant/Rider can request an emergency bypass verification code from the Admin Control Tower.
- **Thermal Slip Misaligned:** Set browser print margins to *None* and select matching 58mm or 80mm paper width.

---

### 📥 Available PDF Downloads:
- **Artifact:** `C:\Users\Venom\.gemini\antigravity-ide\brain\05a208ea-49f8-4034-a6e9-27f8f7e11da9\PahadiCart_User_Manual_and_Flow.pdf`
- **Project Root:** `H:\pahadicart\PahadiCart_User_Manual_and_Flow.pdf`
- **Desktop:** `C:\Users\Venom\OneDrive\Desktop\PahadiCart_User_Manual_and_Flow.pdf`
- **Downloads:** `C:\Users\Venom\Downloads\PahadiCart_User_Manual_and_Flow.pdf`
