# AGENTS.md

University Canteen Management System: `server/` (Express + Prisma/PostgreSQL) + `client/` (React + Vite + Tailwind). Neubrutalism UI.

## Commands

There is no test suite, linter, or typecheck anywhere. Verification = `npm run build` (client) or dev-server boot (server).

- Server dev: `npm run dev` in `server/` (uses `node --watch src/index.js`)
- Client dev: `npm run dev` in `client/` (port 5173, proxies `/api` and `/uploads` → localhost:5000)
- Root shortcuts: `npm run dev:server`, `npm run dev:client`, `install:all`, `build:client`, `prisma:generate|push|seed`
- Client build check: `npm run build:client` from root or `npm --prefix client run build`

## Database (server)

- Requires a live PostgreSQL at `DATABASE_URL` (see `server/.env.example`; `.env` is committed locally — do not commit secrets).
- Schema workflow is `npx prisma generate` + `npx prisma db push` — **no migration files**. After editing `prisma/schema.prisma`, run both before testing.
- `npm run prisma:seed` (`node prisma/seed.js`) is **destructive**: it `deleteMany`s all tables then re-creates users/categories/items/orders. It only makes sense on a fresh/dev DB.
- Demo logins (all password `password123`): `student@canteen.edu`, `teacher@canteen.edu`, `manager@canteen.edu`.

## Server conventions

- Both packages are ESM (`"type": "module"`). Server imports must use explicit `.js` extensions, e.g. `import authRoutes from './routes/authRoutes.js'`.
- Entrypoint `src/index.js`; routes are `src/routes/*Routes.js` → controllers → `src/config/env.js` (dotenv) and `src/config/db.js` (Prisma client).
- Roles: `STUDENT`, `TEACHER`, `MANAGER` (Prisma enum). Route auth uses `middleware/auth.js` + `middleware/roleCheck.js`. TEACHER orders are auto-tagged `isPriority` on creation (see `controllers/orderController.js`).
- Menu image uploads via Multer land in `server/uploads/` (auto-created) and are served at `/uploads`. Only jpg/jpeg/png/webp/gif, ≤5MB. Recreate the dir if deleted.
- Order status flow: `PENDING → PREPARING → READY → COMPLETED` / `CANCELLED`. Cancelling a pending order restores stock; stock decrement + order creation is transactional.

## Client conventions

- `@` path alias resolves to `src/` (see `vite.config.js`).
- Auth: access token in `localStorage` keys `canteen_access_token` / `canteen_user`; refresh token in httpOnly cookie. `src/lib/axios.js` auto-refreshes on 401 via `/auth/refresh` and redirects to `/login` on failure. If you touch auth, keep this contract.
- State: Zustand stores in `src/store/` (`authStore.js`, `cartStore.js`). Pages organized by role under `src/pages/{auth,student,teacher,manager,profile}`.
- Follow the Neubrutalism design tokens in `tailwind.config.js` (black borders, hard shadows, neon palette) when adding UI.
