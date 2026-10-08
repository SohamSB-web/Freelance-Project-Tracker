# Freelance Project Tracker

A focused, minimalist full-stack project built for managing freelance client contracts, deadlines, project statuses, and budgets. Built with **React** on the frontend, **Node.js/Express with SQLite** on the backend, and passwordless SMS OTP authentication powered by **Minimoth**.

---

## ⚡ Workshop Architecture & Constraints

| Component | Limit / Actual | Description |
| :--- | :--- | :--- |
| **Frontend Pages** | **3 Pages** | 1. **AuthPage** (Minimoth OTP Login & Registration)<br>2. **DashboardPage** (Contracts List, Financial Metrics, Status Filters, Inline Updates)<br>3. **NewProjectPage** (Contract Creation & Client Onboarding) |
| **Backend Endpoints**| **5 Endpoints** | 1. `POST /api/auth/send-otp`<br>2. `POST /api/auth/verify-otp`<br>3. `GET /api/projects`<br>4. `POST /api/projects`<br>5. `PUT /api/projects/:id` |
| **Database Models** | **3 Entities** | 1. `users` (id, phone, name, title, created_at)<br>2. `clients` (id, user_id, name, company, email, created_at)<br>3. `projects` (id, user_id, client_id, title, description, category, budget, status, deadline, created_at) |
| **Authentication** | Minimoth API | Secure phone OTP dispatch and verification via `https://api.minimoth.dev/v1/otp/*` |

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm

---

### 1. Backend Setup

```bash
cd backend
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```

Ensure your `backend/.env` has:
```env
PORT=5000
JWT_SECRET=freelance_project_tracker_jwt_secret_2026
MINIMOTH_API_KEY=mm_live_8632247c5a1a8f63f96af53a66ea55958ee9bf99080f3507c388834d45d2de242efff2a251bfaa6564c79427e1a93339
```

Run the backend server:
```bash
npm start
# Server starts on http://localhost:5000
```

---

### 2. Frontend Setup

```bash
cd frontend
npm install
```

Configure environment variables:
```bash
cp .env.example .env
```

Ensure your `frontend/.env` has:
```env
VITE_API_URL=http://localhost:5000/api
```

Run the Vite development server:
```bash
npm run dev
# App opens on http://localhost:3000
```

---

## 🔐 Authentication Flow with Minimoth

1. **Send OTP**: Enter your mobile phone number with country code (e.g., `+919876543210`). The backend calls Minimoth's `/v1/otp/send` API using the backend `MINIMOTH_API_KEY`.
2. **Verify OTP**: Submit the received OTP code. Minimoth verifies the code via `/v1/otp/verify`.
3. **Session**: Upon verification, the backend issues a signed JWT token stored in browser localStorage.

*(For local workshop testing without carrier SMS delivery, fallback code `123456` or `000000` is accepted).*

---

## 📦 Project Structure

```
├── backend/
│   ├── .env.example
│   ├── db.js           # SQLite schema (users, clients, projects) & seed data
│   ├── server.js       # Express API (5 endpoints) & Minimoth OTP auth
│   └── package.json
├── frontend/
│   ├── .env.example
│   ├── index.html
│   ├── vite.config.js
│   ├── src/
│   │   ├── api.js       # Backend API client
│   │   ├── App.jsx      # Navigation & page routing
│   │   ├── index.css    # Responsive theme & design tokens
│   │   ├── main.jsx     # React entry point
│   │   └── pages/
│   │       ├── AuthPage.jsx        # Page 1: Minimoth OTP Auth
│   │       ├── DashboardPage.jsx   # Page 2: Projects & Metrics Dashboard
│   │       └── NewProjectPage.jsx  # Page 3: New Project & Client Form
│   └── package.json
├── .gitignore
└── README.md
```

---

## 📄 License
MIT
