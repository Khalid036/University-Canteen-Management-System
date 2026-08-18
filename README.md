# 🍔 CampusBites - University Canteen Management System

A full-stack **University Canteen Management System** built with **React (Vite)**, **Node.js (Express)**, **Prisma ORM (PostgreSQL)**, and styled in a vibrant **Neubrutalism** aesthetic (bold 3-4px solid black borders, hard drop shadows, high-contrast flat neon accents, chunky interactive buttons).

---

## 🌟 Key Features & User Roles

### 1. 🎓 Student Role
- **Menu Exploration**: Browse categorized menu (Breakfast, Lunch & Meals, Snacks, Beverages, Desserts) with instant live search and price sorting.
- **Dietary Filtering**: 1-click filter for **Vegetarian** (🥬) and **Non-Vegetarian** (🍗) meals.
- **Live Meal Tray / Cart**: Add items, adjust quantities, select custom pickup time slots (e.g. *Morning Slot*, *Peak Lunch*, *Tea Break*), and add special kitchen notes (e.g. *no onions, extra sauce*).
- **Live Order Tracking**: Visual progress bar tracking order status in real time (**Pending** ⏳ → **Preparing** 🍳 → **Ready for Pickup** 🔥 → **Completed** ✅).
- **Order Cancellation**: Cancel pending orders with automatic stock replenishment.
- **Student Profile**: Manage contact info, department, and Student ID.

### 2. 👑 Teacher / Faculty Role
- All Student capabilities plus:
- **VIP Faculty Priority Queue**: Faculty orders are automatically tagged with `is_priority: true` and highlighted with purple priority pass badges on kitchen displays.
- **Scheduled Express Pickup**: Reserve meal pickup slots in advance to avoid queue waiting times during short teaching breaks.

### 3. 👨‍🍳 Canteen Manager (Admin) Role
- **Live Kanban / Order Board**: Real-time kitchen dashboard with 1-click state transitions (*Start Cooking*, *Mark Ready*, *Complete*, *Cancel*). Auto-polls every 8 seconds.
- **Menu Items CRUD**: Full creation, photo uploads (via Multer), price adjustment, calorie tracking, prep-time setting, and veg/non-veg toggling.
- **Category Management**: Create, edit, and delete food categories with live item count indicators.
- **Real-Time Inventory & Stock Alerts**: Monitor remaining unit stock with **Low Stock Warnings** (≤ 5 units), quick +/- quantity adjusters, and 1-click ordering disable/enable.
- **Sales Analytics & Reports**:
  - Daily revenue chart (Last 7 Days) powered by **Recharts**.
  - Top 5 Best-Selling Dishes ranking with revenue counters.
  - Category sales revenue distribution pie chart.
- **User Governance Directory**: View students and faculty, check order history counts, and toggle account activation status.

---

## 🎨 Neubrutalism Design System

The entire UI is built with a cohesive Neubrutalist visual language:
- **Borders**: 3px - 4px solid black (`#000000`) borders on all cards, inputs, buttons, and badges.
- **Hard Offset Box Shadows**: Zero blur hard shadows (`4px 4px 0px #000`, `6px 6px 0px #000`, `10px 10px 0px #000`).
- **Tactile Pressed Hover Effects**: Buttons shift `-2px, -2px` on hover and `+2px, +2px` with shadow collapse on click.
- **High-Contrast Neon Palette**:
  - Cyber Yellow (`#FFE600`)
  - Neon Pink (`#FF5E8E`)
  - Emerald Green (`#00E599`)
  - Electric Blue (`#00D2FF`)
  - Vivid Purple (`#B388FF`)
  - Warm Off-White Canvas (`#FFFDF5`)

---

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, JavaScript, Tailwind CSS, Zustand, React Hook Form, Zod, Axios, Lucide React, Recharts, Canvas Confetti.
- **Backend**: Node.js, Express, Prisma ORM, PostgreSQL, JSON Web Tokens (Access + Refresh token rotation), bcryptjs, Multer, Helmet, CORS, Morgan, Zod.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18+ (tested on Node v24)
- **PostgreSQL Database**: Local PostgreSQL instance or cloud provider (e.g. Supabase, Neon, Railway).

---

### 2. Backend Setup (`/server`)

1. Open a terminal in the `server` directory:
   ```bash
   cd server
   npm install
   ```

2. Configure your `.env` file in `/server`:
   ```env
   PORT=5000
   NODE_ENV=development
   DATABASE_URL="postgresql://postgres:postgres@localhost:5432/canteen_db?schema=public"
   JWT_ACCESS_SECRET="super_secret_jwt_access_token_key_canteen_2026"
   JWT_REFRESH_SECRET="super_secret_jwt_refresh_token_key_canteen_2026"
   JWT_ACCESS_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   CLIENT_URL="http://localhost:5173"
   ```

3. Generate Prisma client & push database schema:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Seed the database with sample data (Categories, 15+ dishes, demo users, sample orders):
   ```bash
   npm run prisma:seed
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```
   Server will run on: `http://localhost:5000`

---

### 3. Frontend Setup (`/client`)

1. Open another terminal in the `client` directory:
   ```bash
   cd client
   npm install
   ```

2. Start the Vite development server:
   ```bash
   npm run dev
   ```
   Frontend will run on: `http://localhost:5173`

---

## 🔑 Pre-Seeded Demo Accounts (1-Click Login on UI)

The login screen includes **1-Click Demo Buttons** to instantly log in as any role:

| Role | Email | Password | Features / Access |
|---|---|---|---|
| **Student** | `student@canteen.edu` | `password123` | Menu browsing, cart, scheduled orders, live tracking |
| **Teacher** | `teacher@canteen.edu` | `password123` | Student features + VIP Faculty Priority Queue |
| **Manager** | `manager@canteen.edu` | `password123` | Live Order Board, Menu CRUD, Inventory, Reports, Users |

---

## 📡 REST API Reference (`/api/v1`)

### Authentication
- `POST /api/v1/auth/register` — Register student/teacher/manager
- `POST /api/v1/auth/login` — Login & receive JWT access + refresh tokens
- `POST /api/v1/auth/refresh` — Rotate refresh token & issue new access token
- `POST /api/v1/auth/logout` — Logout & invalidate token
- `GET /api/v1/auth/me` — Get current authenticated user profile

### Menu & Categories
- `GET /api/v1/menu` — List menu items (supports `?categoryId=`, `?search=`, `?isVeg=`, `?isAvailable=`, `?sort=`)
- `GET /api/v1/menu/:id` — Get single item details
- `POST /api/v1/menu` — Create menu item (Manager only, supports `multipart/form-data` with image)
- `PUT /api/v1/menu/:id` — Update menu item (Manager only)
- `DELETE /api/v1/menu/:id` — Delete menu item (Manager only)
- `PATCH /api/v1/menu/:id/stock` — Adjust stock quantity & availability (Manager only)
- `GET /api/v1/categories` — List categories with item counts
- `POST /api/v1/categories` — Create category (Manager only)
- `PUT /api/v1/categories/:id` — Update category (Manager only)
- `DELETE /api/v1/categories/:id` — Delete category (Manager only)

### Orders
- `POST /api/v1/orders` — Place new order (calculates totals, decrements stock in transaction, applies priority)
- `GET /api/v1/orders/me` — Get current user order history
- `GET /api/v1/orders` — Get all orders with user details & filters (Manager only)
- `PATCH /api/v1/orders/:id/status` — Update status (`PENDING` → `PREPARING` → `READY` → `COMPLETED` / `CANCELLED`)
- `PATCH /api/v1/orders/:id/cancel` — Cancel pending order & restore stock

### Analytics & Governance
- `GET /api/v1/reports/summary` — Dashboard quick metrics (Today's revenue, active kitchen orders, low stock count)
- `GET /api/v1/reports/sales` — Detailed analytics (7-day revenue, top 5 items, category breakdown)
- `GET /api/v1/users` — List registered users with role and order counts (Manager only)
- `PATCH /api/v1/users/:id/toggle-status` — Deactivate / activate user account (Manager only)
- `PUT /api/v1/users/profile` — Update personal profile details
