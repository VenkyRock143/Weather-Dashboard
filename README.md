# SkyCast — AI Weather Dashboard

A full-stack weather intelligence platform built with Next.js, Node.js, MongoDB, and Groq AI. Track cities worldwide, get live weather data, and ask an AI assistant anything about conditions, travel, or what to wear today.

**Live demo:** [weather-dashborad-api.netlify.app](https://weather-dashborad-api.netlify.app)

---

## What it does

SkyCast lets you build a personal weather network. Add any city in the world, and it pulls live conditions — temperature, humidity, wind speed, pressure, visibility — and runs them through a risk scoring engine that flags heat stress, cold risk, high humidity, and strong winds with colour-coded badges.

The AI assistant (powered by Groq + LLaMA 3.3 70B) knows about all your saved cities. Ask it anything: *"Which city should I visit this weekend?"*, *"Do I need an umbrella in London today?"*, *"What should I wear in Tokyo right now?"* — it has live context for every city in your dashboard and remembers the conversation.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS v4 |
| Backend | Node.js, Express 5 |
| Database | MongoDB with Mongoose |
| AI | Groq API — LLaMA 3.3 70B via LangChain |
| Auth | JWT (jsonwebtoken), bcryptjs |
| Security | Helmet, CORS, express-rate-limit |
| Caching | node-cache (5-minute TTL) |
| Weather data | OpenWeatherMap API |
| Deployment | Render (backend), Netlify (frontend) |

---

## Features

**Dashboard**
- Add unlimited cities and monitor live weather for all of them
- Grid view and list view with sort by name, temperature, or humidity
- Favourite cities pinned to the sidebar for quick access
- Auto-refresh every 60 seconds in the background
- Optimistic UI updates — starring a city feels instant

**Weather data per city**
- Temperature, feels-like temperature, humidity
- Wind speed and direction
- Atmospheric pressure
- Visibility
- Weather description with matching emoji
- Automatic risk assessment: Extreme Heat, High Heat, Cold Risk, Freezing, High Humidity, Strong Wind, Normal

**AI assistant**
- Floating chat panel powered by Groq (LLaMA 3.3 70B)
- Live briefing auto-generated when you open the chat — summarises all your cities
- Free-form chat with full conversation history (last 8 messages sent as context)
- Suggestion chips for common questions on first open
- Typing indicator while waiting for a response

**Authentication**
- Register and login with email + password
- Passwords hashed with bcrypt (10 rounds)
- JWT tokens with 7-day expiry
- Auto-logout on 401 responses
- All city routes protected — users can only see and modify their own data

---

## Project structure

```
Weather-Dashboard/
├── client/                     # Next.js frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── page.tsx        # Landing page
│   │   │   ├── login/          # Login page
│   │   │   ├── register/       # Register page
│   │   │   ├── dashboard/      # Main dashboard
│   │   │   ├── layout.tsx      # Root layout with fonts
│   │   │   └── globals.css     # Design system + CSS variables
│   │   ├── components/
│   │   │   ├── AIChat.tsx      # Floating AI chat panel
│   │   │   └── AuthGuard.tsx   # Route protection wrapper
│   │   ├── lib/
│   │   │   └── api.ts          # Axios instance with interceptors
│   │   └── types/
│   │       └── city.ts         # TypeScript interfaces
│   ├── .env.local              # NEXT_PUBLIC_API_URL
│   └── netlify.toml            # Netlify build config
│
└── server/                     # Express backend
    ├── routes/
    │   ├── authRoutes.js       # POST /api/auth/register, /login
    │   ├── cityRoutes.js       # CRUD for user cities
    │   ├── weatherRoutes.js    # Direct weather lookups
    │   └── aiRoutes.js         # POST /api/ai/advisor, /query
    ├── controllers/
    │   ├── authController.js
    │   └── cityController.js   # City CRUD + weather enrichment
    ├── middleware/
    │   ├── authMiddleware.js   # JWT verification
    │   └── validate.js
    ├── models/
    │   ├── User.js
    │   └── City.js
    ├── services/
    │   └── weatherService.js   # OpenWeatherMap wrapper
    ├── config/
    │   └── db.js               # MongoDB connection
    └── index.js                # App entry point
```

---

## Getting started

### Prerequisites

- Node.js 18 or higher
- A MongoDB database (free tier on [MongoDB Atlas](https://cloud.mongodb.com) works fine)
- OpenWeatherMap API key — free at [openweathermap.org/api](https://openweathermap.org/api)
- Groq API key — free at [console.groq.com](https://console.groq.com)

### 1. Clone the repo

```bash
git clone https://github.com/your-username/weather-dashboard.git
cd weather-dashboard
```

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file in the `server/` folder:

```env
PORT=5000
MONGO_URI=mongodb+srv://your-user:your-password@cluster.mongodb.net/skycast
JWT_SECRET=a-long-random-string-at-least-32-characters
API_KEY=your-openweathermap-api-key
GROQ_API_KEY=your-groq-api-key
```

Start the server:

```bash
node index.js
```

The server runs on `http://localhost:5000`.

### 3. Set up the frontend

```bash
cd client
npm install
```

Create a `.env.local` file in the `client/` folder:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

---

## API reference

All city and AI routes require a Bearer token in the `Authorization` header.

### Auth

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, password }` | Create account |
| POST | `/api/auth/login` | `{ email, password }` | Returns JWT token |

### Cities

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/cities` | Get all cities with live weather data |
| POST | `/api/cities` | Add a city `{ name }` — validates it exists first |
| DELETE | `/api/cities/:id` | Remove a city |
| PATCH | `/api/cities/:id/favorite` | Toggle favourite status |

### AI

| Method | Endpoint | Body | Description |
|---|---|---|---|
| POST | `/api/ai/advisor` | — | Auto-briefing for all saved cities |
| POST | `/api/ai/query` | `{ message, history[] }` | Free-form chat with live weather context |

---

## Deployment

The backend is deployed on [Render](https://render.com) and the frontend on [Netlify](https://netlify.com).

**Render (backend)**

- Root directory: `server`
- Build command: `npm install`
- Start command: `node index.js`
- Add all five environment variables from the `.env` section above

**Netlify (frontend)**

- Base directory: `client`
- Build command: `npm run build`
- Publish directory: `client/.next`
- Add `NEXT_PUBLIC_API_URL` pointing to your Render URL

After deploying the backend, update `NEXT_PUBLIC_API_URL` in Netlify's environment variables and update the CORS origin in `server/index.js` to allow your Netlify domain.

---

## How the AI works

When you send a message to the AI assistant, the server:

1. Fetches all cities you have saved from the database
2. Pulls live weather data for each one (from cache if available, otherwise from OpenWeatherMap)
3. Sends the weather data as system context to Groq along with the last 8 messages from the conversation
4. Streams the response back

The model is `llama-3.3-70b-versatile` running on Groq's inference infrastructure, which gives response times under 2 seconds in most cases.

The `/advisor` endpoint runs the same pipeline but asks the model for an unprompted briefing rather than answering a specific question.

---

## Caching

Weather data is cached in memory for 5 minutes per city using `node-cache`. This means:

- Repeated requests to `/api/cities` within 5 minutes skip the OpenWeatherMap call entirely
- The AI routes use the same cache, so opening the chat panel does not trigger additional API calls if the data is fresh
- Cache keys are lowercase city names to handle inconsistent capitalisation

---

## Security

- Passwords are hashed with bcrypt before storage — plain text is never saved
- JWTs are signed with a secret from the environment and expire after 7 days
- Every city query includes `{ userId: req.user.id }` — there is no way to read or modify another user's data
- Rate limiting caps requests at 100 per 15-minute window per IP
- Helmet sets security-related HTTP headers on every response

---

## Known issues and limitations

- Weather data is sourced from OpenWeatherMap's free tier, which does not include hourly forecasts or historical data
- The free tier of Render spins down after inactivity — the first request after a period of no traffic may take 30–60 seconds
- City names must be recognised by OpenWeatherMap. The API rejects ambiguous or misspelled city names with a clear error message
- Conversation history is stored in component state only — it resets on page refresh

---

## License

MIT