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



This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
