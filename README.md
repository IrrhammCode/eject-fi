# 🛡️ Eject.fi: Autonomous Capital Rescue Protocol

<p align="center">
  <b>A Solana-First decentralized intelligence mesh leveraging LI.FI to provide embedded, one-click cross-chain exits (Safe Haven) during DeFi emergencies.</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Solana-Devnet-14F195?style=flat-square&logo=solana&logoColor=white" alt="Solana Devnet" />
  <img src="https://img.shields.io/badge/LI.FI-Cross--Chain-5A52FF?style=flat-square" alt="LI.FI Integration" />
  <img src="https://img.shields.io/badge/Oracle-Pyth_Network-A6A4ED?style=flat-square" alt="Pyth Network" />
  <img src="https://img.shields.io/badge/RPC-Helius-FF4500?style=flat-square" alt="Helius" />
</p>

---

## 🏆 Superteam Indonesia Hackathon Submission

This repository contains the complete, production-ready codebase for **Eject.fi**, encompassing both the Mobile "Rescue Wallet" and the Web "Command Deck" interfaces.

### 🌐 Live Demos
* **Web Command Deck (Power Users)**: [Insert Vercel Link Here]
* **Mobile Rescue Wallet**: (See instructions below to run via Expo)

---

## 📁 Monorepo Structure

This project is organized as a monorepo containing two dedicated applications sharing the same backend infrastructure.

*   [`/apps/mobile`](./apps/mobile) - The React Native (Expo) mobile application designed for institutional clients needing a physical "panic button" in their pocket.
*   [`/apps/web`](./apps/web) - The React (Vite) web dashboard designed for deep analytics, offering a full "Sentinel Console" for power users to track cross-chain migrations in real-time.

---

## 🧩 Architectural Overview

Eject.fi operates on a highly decoupled, reactive architecture. The primary objective is to eliminate the latency between vulnerability detection and capital extraction.

1.  **AI Sentinel Swarm**: Monitors Solana protocols using **Helius Enhanced RPCs** (for utilization/velocity) and **Pyth Network** (for oracle price deviation).
2.  **x402 Protocol**: Deep scans are monetized natively. Agents reject requests with an HTTP 402 until a micro-transaction (with a Memo tag) is confirmed on-chain.
3.  **LI.FI Routing**: Once panic is detected, the agent queries the **LI.FI REST API** for the fastest route out of Solana (e.g., to Base or Arbitrum).
4.  **Embedded Execution**: The user signs the unified payload securely using **Privy Embedded Wallets**.

---

## 🚀 Running Locally

### 1. Web Version (Vite)
```bash
cd apps/web
npm install
npm run dev
```
*Runs at http://localhost:5173*

### 2. Mobile Version (Expo)
```bash
cd apps/mobile
npm install
npx expo start -c
```
*Use the Expo Go app on your phone to scan the QR code.*

---

## 🔑 Environment Variables
Both applications require a `.env` file with the following keys to function properly:

```env
# Privy Authentication
VITE_PRIVY_APP_ID=your_privy_app_id
VITE_PRIVY_CLIENT_ID=your_privy_client_id

# Helius RPC
VITE_HELIUS_API_KEY=your_helius_api_key
VITE_SOLANA_RPC=https://devnet.helius-rpc.com/?api-key=your_helius_api_key
```
*(For the mobile app, replace `VITE_` with `EXPO_PUBLIC_`)*

---
*Built with ❤️ for the Superteam Indonesia National Campus Hackathon.*
