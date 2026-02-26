# 🌦️ AI-Powered Multi-User Weather Dashboard

A production-grade, full-stack weather intelligence system. This platform goes beyond simple data fetching by incorporating **AI reasoning**, **data isolation**, and **performance-centric architecture**.



---

## 🚀 Engineering Highlights
* **Clean Architecture:** Strict separation of concerns (Routes → Controllers → Services).
* **AI Reasoning:** Integration with **LangChain** and **Groq (LLaMA 3.1)** for natural language weather analysis.
* **Security First:** JWT-based stateless authentication, bcrypt password hashing, and Zod schema validation.
* **Performance:** Layered caching strategy using **NodeCache** to minimize external API latency and costs.
* **Data Integrity:** Multi-tenant data isolation ensuring users only access their own private resources.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js (App Router), Tailwind CSS, Axios, React Hooks |
| **Backend** | Node.js, Express, MongoDB (Mongoose) |
| **Auth/Security** | JWT, Bcrypt, Helmet, Express Rate Limit |
| **AI/LLM** | LangChain, Groq (LLaMA 3.1) |
| **Validation** | Zod |
| **Caching** | NodeCache (In-memory) |

---

## 🌟 Core Features

### 🤖 AI Weather Intelligence Agent
Powered by **LangChain**, the assistant doesn't just display data—it reasons through it.
* **Dynamic Context:** Analyzes real-time metrics across all of a user's saved cities simultaneously.
* **Natural Language:** Handles queries like *"Which city is safest to visit?"* or *"Do I need an umbrella today?"*
* **Decision Support:** Provides travel safety advice based on humidity and temperature thresholds.

### 🌡️ Weather Risk Scoring System
A custom algorithm implemented to provide actionable intelligence beyond raw numbers:
* **Heat/Cold Stress:** Evaluates temperature extremes for health warnings.
* **Humidity Index:** Assesses comfort levels and respiratory risk.
* **Visual Indicators:** Color-coded badges (Low/Medium/High) for immediate UI feedback.

### 🔐 Enterprise-Grade Security
* **Multi-User Isolation:** Every database query is scoped by `userId`. Users cannot access or modify each other's cities.
* **Rate Limiting:** Protects the OpenWeatherMap and Groq API quotas from brute force or abuse.
* **Stateless Auth:** Secure JWT implementation with middleware-protected routes.

---

## 🏗️ Architecture Decisions

### Data Isolation Pattern
To ensure privacy in a multi-user environment, the backend implements a middleware-driven approach:
1.  **Extract:** User identity from JWT.
2.  **Inject:** `req.user` into the controller context.
3.  **Filter:** All Mongoose queries include `{ user: req.user.id }` to prevent data leaks.

### Caching Strategy
To optimize performance, a **5-minute TTL (Time-To-Live)** cache is implemented.
* **Hit:** Returns data in `<10ms`.
* **Miss:** Fetches from OpenWeatherMap, updates cache, and returns.
* **Benefit:** Dramatically reduces API costs and prevents 429 "Too Many Requests" errors.

---

## 📦 Installation & Setup

### 1. Backend Setup
```bash
cd server
npm install
```
### Create a .env file:
```bash
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
API_KEY=your_openweather_api_key
GROQ_API_KEY=your_groq_api_key
PORT=5000
```
### Run Backend
```bash
node index.js
```
### 2. Frontend Setup
```bash
cd client
npm install
```
### Create a .env.local file:
NEXT_PUBLIC_API_URL=http://localhost:5000

### Run Frontend
```bash
npm run dev
```



