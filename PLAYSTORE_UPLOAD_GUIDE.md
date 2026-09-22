# 📱 PahadiCart — Complete Mobile App Build & Play Store Upload Guide

Is document me **PahadiCart** ko Android APK banane, phone me install karne, aur **Google Play Store par upload** karne ke aasaan tareeqe diye gaye hain.

---

## 🚀 3 Simple Methods to Build & Upload

| Method | Kab Use Karein | Setup Required | Output Format |
| :--- | :--- | :--- | :--- |
| **Method 1: GitHub Actions (Recommended)** | Jab PC par Android Studio na ho | Zero (Cloud me build hota hai) | **APK** (Phone ke liye) + **AAB** (Play Store ke liye) |
| **Method 2: PWABuilder (1-Click Web)** | Fast Google Play Store package | Browser only | Signed **AAB** for Play Console |
| **Method 3: Android Studio (Local)** | Offline development & custom edits | Android Studio + JDK 17 | Signed **APK / AAB** |

---

## 🥇 Method 1: GitHub Actions se 1-Click Download (Sabse Aasaan)

Aapke repository me automated CI/CD pipeline (`.github/workflows/build-android.yml`) ready hai:

1. Apne changes ko GitHub `main` branch par push karein:
   ```bash
   git add .
   git commit -m "build: release v2.0.0"
   git push origin main
   ```
2. GitHub par apne repo par jaayein: `https://github.com/HACK-X01/pahadicart`
3. Top navigation me **"Actions"** tab par click karein.
4. Left sidebar me **"Build Android APK and Google Play AAB"** workflow par click karein.
5. Workflow complete hone ke baad **"Artifacts"** section se download karein:
   - 📦 **`PahadiCart-Debug-APK`**: Apne Android phone me daal kar direct chalane ke liye.
   - 📦 **`PahadiCart-PlayStore-AAB`**: Google Play Console par upload karne ke liye.

---

## 🌐 Method 2: PWABuilder se Google Play Store Package

Google aur Microsoft ka official tool jisse bina kisi local build tool ke 2 minute me signed AAB mil jata hai:

1. Browser me open karein: **[https://www.pwabuilder.com/](https://www.pwabuilder.com/)**
2. URL daalein: `https://pahadicart.vercel.app/` aur **"Start"** click karein.
3. System automatic manifest aur service worker verify karega (Score: 100/100).
4. **"Package for Stores"** button par click karein aur **"Android"** select karein.
5. Package Details verify karein:
   - **Package ID**: `com.pahadicart.himachal`
   - **App Name**: `PahadiCart`
6. **"Generate Package"** par click karein — aapko Google Play Console ke liye ready signed **`.aab`** file mil jaayegi.

---

## 💻 Method 3: Android Studio se Local Build

Agar aapke system me Android Studio installed hai:

1. Android Studio open karein aur **"Open"** click karke `H:\pahadicart\android` folder select karein.
2. Gradle sync complete hone dein (auto-resolves dependencies).
3. **Menu -> Build -> Build Bundle(s) / APK(s) -> Build APK(s)** click karein.
4. Play Store ke liye: **Menu -> Build -> Generate Signed Bundle / APK** -> **Android App Bundle** choose karein.
5. Key store generate karein aur **Release** select karein.

---

## 📲 Phone Me APK Direct Kaise Install Karein (Sideloading)

1. GitHub Actions se download ki hui `.apk` file ko apne phone me bhejein (via WhatsApp, Google Drive, ya USB).
2. Phone ke File Manager me APK par tap karein.
3. Agar prompt aaye *"Install unknown apps"*, toh **"Allow from this source"** enable karein.
4. **"Install"** par click karein.
5. PahadiCart open ho jayegi:
   - Poori full-screen native feel (no browser address bar).
   - Real-time GPS location detection.
   - Offline support and audio notifications.

---

## 🏪 Google Play Console Par Upload Kaise Karein

1. **Google Play Console** me login karein: [https://play.google.com/console](https://play.google.com/console)
2. **"Create app"** par click karein:
   - **App name**: `PahadiCart`
   - **Default language**: English (United States) ya English (India)
   - **App or game**: App
   - **Free or paid**: Free
3. **Store Presence -> Main store listing**:
   - **Short description**: *Himachal's 2-hour mountain delivery network across Solan, Shimla, and Dharamshala.*
   - **Full description**: *PahadiCart brings hyperlocal quick-commerce to the hills. Featuring staircase-aware delivery ETAs, mountain weather surge protection, Vyapar Mandal local merchant integration, and dedicated glove-friendly rider cockpits.*
   - **App icon**: `icons/icon-512.png` (512x512)
   - **Feature graphic**: 1024x500 banner.
   - **Phone screenshots**: 2 se 8 screenshots (Customer store, Tracking, Rider cockpit).
4. **Release -> Production**:
   - **"Create new release"** click karein.
   - Apni **`.aab`** file upload karein.
   - Release name: `2.0.0`
   - Release notes daalein: *Initial release of PahadiCart Himachal Hyperlocal Delivery.*
5. **Review and rollout release** par click karke review ke liye submit kar dein!

---

## 🛠️ App Architecture & Permissions Summary

- **Package ID**: `com.pahadicart.himachal`
- **Target SDK**: `34` (Android 14 - Google Play requirement compliant)
- **Min SDK**: `24` (Android 7.0+ covers 99.2% of all active Android phones)
- **Permissions**:
  - `ACCESS_FINE_LOCATION` / `ACCESS_COARSE_LOCATION` (Hill trail GPS & nearest merchant discovery)
  - `POST_NOTIFICATIONS` / `VIBRATE` / `WAKE_LOCK` (Order alerts & kitchen chimes)
  - `INTERNET` / `ACCESS_NETWORK_STATE` (Live fleet synchronization)
