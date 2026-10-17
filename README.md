# 🌍 EcoTrack — Personal Carbon Footprint Tracker

[![GitHub license](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](https://github.com/adityavish-02/MyProject/pulls)

**EcoTrack** is a lightweight, responsive web application designed to help individuals measure, log, and reduce their daily carbon footprint. Users can track their environmental impact across travel, energy, diet, and lifestyle purchases, visualising totals in real time and receiving personalized reduction recommendations via **EcoBuddy**, an integrated AI coach.

---

## 📌 Table of Contents

- [Features](#-features)
- [How It Works](#-how-it-works)
  - [Emission Factors & Formula](#emission-factors--formula)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Local Installation](#local-installation)
  - [Firebase Configuration](#firebase-configuration)
  - [Gemini API Key Setup](#gemini-api-key-setup)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## ✨ Features

- **Multi-Category Footprint Logging:** Track carbon output across 4 primary lifestyle verticals:
  - 🚗 **Travel & Commute:** Petrol cars, buses, trains, and non-motorized options.
  - 💡 **Household Energy:** Electricity consumption (kWh) scaled by regional grid intensity.
  - 🥦 **Diet & Food:** Footprint weighting for beef, poultry, dairy, produce, and grains.
  - 🛍️ **Shopping & Digital:** Consumption footprints for electronics, apparel, and digital streaming.
- **Real-Time Footprint Ledger:** Instant dashboard recalculations powered by Google Cloud Firestore.
- **Persistent Cloud Storage:** Anonymous user authentication tied directly to user-isolated database collections.
- **🤖 EcoBuddy AI Coach:** Summarizes active activity breakdowns and delivers focused, under-50-word actionable lifestyle adjustments using Google Gemini.

---

## 🔬 How It Works

Every activity entry computes carbon equivalent emissions using standard emissions modeling:

> **Total Emission (kg CO₂e) = Activity Quantity × Emission Factor**

### Emission Factors & Formula

| Category | Subtype | Emission Factor | Unit Basis |
| :--- | :--- | :--- | :--- |
| **Travel** | Petrol Car | `0.21` | kg CO₂ / km |
| | City Bus | `0.10` | kg CO₂ / km |
| | Commuter Train | `0.04` | kg CO₂ / km |
| | Walking / Cycling | `0.00` | kg CO₂ / km |
| **Energy** | Regional Grid (India) | `0.82` | kg CO₂ / kWh |
| | Regional Grid (USA) | `0.42` | kg CO₂ / kWh |
| | Generic Average | `0.60` | kg CO₂ / kWh |
| **Diet** | Beef | `27.0` | kg CO₂ / kg food |
| | Chicken | `6.90` | kg CO₂ / kg food |
| | Dairy | `3.00` | kg CO₂ / kg food |
| | Produce & Greens | `2.00` | kg CO₂ / kg food |
| | Grains & Cereals | `1.40` | kg CO₂ / kg food |
| **Shopping** | Consumer Electronics | `150.0` | kg CO₂ / unit |
| | Apparel & Garments | `25.0` | kg CO₂ / item |
| | Media Streaming | `0.03` | kg CO₂ / hour |

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3, JavaScript (ES6+ Modules)
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) (CDN)
- **Backend & Persistence:** [Firebase Firestore](https://firebase.google.com/docs/firestore) & [Firebase Authentication](https://firebase.google.com/docs/auth)
- **AI Intelligence:** [Google Gemini API](https://ai.google.dev/) (`gemini-2.5-flash`)

---

## 📁 Project Structure

```text
EcoTrack/
├── index.html         # Main dashboard, UI components, and client logic
├── README.md          # Project documentation and setup guide
└── assets/            # Static media, icons, and diagrams (optional)
