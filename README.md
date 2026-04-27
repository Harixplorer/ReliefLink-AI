# 🚀 ReliefLink AI+

> Transforming disaster response into a real-time, AI-powered decision system

---

## 🧠 Overview

**ReliefLink AI+** is a full-stack AI-powered platform that enables users to report real-world issues such as disasters, food shortages, and medical emergencies.

The system:

* Instantly classifies issues using AI
* Assigns priority levels
* Matches the best volunteer
* Displays everything in a **live operations dashboard**

👉 Built to shift systems from **reactive → proactive decision-making**

---

## ✨ Key Features

* 🤖 AI-powered issue classification (category + priority)
* ⚡ Real-time dashboard updates (no refresh feel)
* 🚨 Critical alert highlighting
* 📊 Interactive operations dashboard
* 🎯 Priority & status filtering
* 🧠 AI preview before submission
* 🎤 Voice input support
* 📈 Risk prediction & trend detection
* 🎨 Premium UI (dark theme + animations)

---

## 📸 Demo

### 🏠 Home

![Home](./screens/home.png)

### 📝 Report Issue

![Report](./screens/report.png)

### 📊 Dashboard

![Dashboard](./screens/dashboard.png)

---

## 🏗️ Architecture

* **Frontend** → React + Vite
* **Backend** → Node.js + Express
* **Database** → Supabase (PostgreSQL)
* **AI Layer** → Python + OpenRouter (LLMs)

---

## 🧰 Tech Stack

### Frontend

* React
* Vite
* Framer Motion
* Tailwind / Custom CSS
* Lucide Icons

### Backend

* Node.js
* Express
* Supabase SDK

### AI Module

* Python
* OpenRouter API (GPT / Llama models)
* Rule-based fallback engine

---

## 🔌 API Endpoints

| Method | Endpoint      | Description                      |
| ------ | ------------- | -------------------------------- |
| POST   | `/api/report` | Submit issue → AI classification |
| GET    | `/api/issues` | Fetch all issues                 |

---

## 🚀 How to Run

### 1. Clone repo

```bash
git clone https://github.com/Harixplorer/ReliefLink-AI.git
cd ReliefLink-AI
```

### 2. Install dependencies

```bash
npm install
cd frontend && npm install
cd ../backend && npm install
```

### 3. Run backend

```bash
cd backend
node server.js
```

### 4. Run frontend

```bash
cd frontend
npm run dev
```

---

## 🔐 Environment Variables

```env
OPENROUTER_API_KEY=your_key
SUPABASE_URL=your_url
SUPABASE_KEY=your_key
```

---

## 💡 Problem

Traditional systems:

* Slow
* Reactive
* No prioritization

Critical issues often get ignored.

---

## 🎯 Solution

ReliefLink AI+ provides:

* Instant AI classification
* Priority-based alerts
* Real-time dashboard

👉 Enabling faster and smarter responses.

---

## 🔮 Future Improvements

* 🌍 Map-based visualization
* 📡 Real-time notifications
* 🤝 Volunteer coordination system
* 📈 Predictive analytics

---

## 👥 Team

* Konduru Rithvik
* Seelam Bhavana
* Harshith Reddy Jaggavarapu 

---

## 🏁 Final Note

This project demonstrates how AI + real-time systems can significantly improve disaster response and community issue management.

---


