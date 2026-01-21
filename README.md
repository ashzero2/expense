# Expense Tracker (Offline-First)

A **local-first expense tracking app** built with **Expo + React Native** using **SQLite**.  
No accounts. No sync. No cloud. Your data stays on the device.

This app is intentionally simple, fast, and reliable.

---

## Features

- 📱 Offline-first (SQLite)
- 💸 Add, edit, delete expenses
- 🗂 Category seeding
- 📊 Analytics
  - Monthly category bar chart
  - Category share (donut)
  - 6-month spending trend
- 📅 History grouped by date and month
- 📤 Export expenses as CSV
- 🧹 Clear all expenses (safe reset)
- 🌗 Theme-ready (styling intentionally minimal)

---

## Tech Stack

- **Expo (managed workflow)**
- **React Native**
- **SQLite**
- **TypeScript**
- **EAS (local build)**

No backend. No authentication. No network dependency.

---

## Development

### Install & Run

```bash
npm install
npx expo start


Local APK Build (No EAS Credits)
Requirements

Java 17

Android SDK + NDK

Expo CLI + EAS CLI

Build
NODE_ENV=production eas build -p android --profile preview --local


The signed APK is generated locally.