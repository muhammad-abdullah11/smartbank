# SmartBank

A full-stack online banking application that allows users to manage accounts, send and receive money, apply for loans, and administrators to oversee the entire platform.

Built with Next.js 16 App Router, MongoDB, and NextAuth for a secure, real-time banking experience.

![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [Available Scripts](#available-scripts)
- [Architecture Overview](#architecture-overview)
- [Key Features](#key-features)
- [Database](#database)
- [Authentication](#authentication)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)
- [Troubleshooting](#troubleshooting)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.2.4 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 + shadcn/ui (base-nova) |
| Auth | NextAuth v4 (Credentials provider, JWT strategy) |
| Database | MongoDB (via Mongoose 9) |
| Email | Nodemailer (Gmail SMTP) |
| Icons | Lucide React + React Icons |
| HTTP Client | Axios |
| Utilities | class-variance-authority, clsx, tailwind-merge, uuid |

---

## Project Structure

```
├── app/
│   ├── (auth)/                  # Auth route group — login, signup, forgot-password, verify-email
│   │   ├── forgot-password/     #   3-step password reset flow (email → OTP → new password)
│   │   ├── login/               #   Login form with remember-me and validation
│   │   ├── signup/              #   Registration form with full address and account type
│   │   └── verify-email/[email]/ #   6-digit OTP verification with paste support
│   ├── (main)/                  # Protected user route group — dashboard, transfer, transactions, loans, etc.
│   │   ├── loans/               #   User loan list with status badges and return action
│   │   ├── profile/             #   Account details, limits, address, and status
│   │   ├── request-loan/        #   Loan request form (amount, duration, reason)
│   │   ├── settings/            #   Theme toggle (dark/light mode)
│   │   ├── transactions/        #   Transaction history with Send/Receive tabs and deduplication
│   │   └── transfer/            #   Money transfer form (email or account number)
│   ├── (admin)/                 # Admin route group — dashboard, user management, loan management
│   │   ├── admin/loans/         #   Loan approval/rejection management
│   │   ├── admin/users/         #   User management with status filters and actions
│   │   └── dashboard/           #   Admin stats overview (users, balance, loans, transactions)
│   ├── api/
│   │   ├── admin/dashboard/     #   GET — Admin dashboard stats
│   │   ├── auth/                #   NextAuth handler + signup, verify-otp, send-otp, forgot/reset-password
│   │   ├── loan/                #   GET user loans, POST request, PATCH approve/reject/return, GET all (admin)
│   │   ├── transactions/        #   POST create transfer, GET user transactions
│   │   └── users/               #   GET all (admin), GET /me, PATCH update-status
│   ├── globals.css              # Tailwind CSS v4 with shadcn/ui design tokens (OKLCH)
│   ├── layout.tsx               # Root layout with Geist font, theme script, ClientLayout
│   ├── page.tsx                 # Root page — renders <Home />
│   ├── not-found.tsx            # Custom 404 page
│   ├── global-error.tsx         # Global error boundary
│   └── favicon.ico
├── components/
│   ├── ui/                      # shadcn/ui primitives — button, card, input, badge, table, skeleton
│   ├── AdminHeader.tsx          # Admin top bar with nav links and sign-out
│   ├── AuthGuard.tsx            # Client-side session check with loading spinner and redirect
│   ├── ClientLayout.tsx         # SessionProvider, ThemeProvider, conditional Navbar
│   ├── Home.tsx                 # Main dashboard — account number, balance, account type, Send Money CTA
│   ├── Navbar.tsx               # Responsive sidebar (desktop) + overlay drawer (mobile)
│   └── ThemeProvider.tsx        # Dark/light theme context with localStorage persistence
├── lib/
│   ├── auth.ts                  # NextAuth config — credentials provider, JWT callbacks, lockout logic
│   ├── mongodb.ts               # Mongoose connection with cached singleton
│   ├── nodemailer.ts            # Gmail SMTP transporter + HTML email templates (verify, reset, transfer, loan, login alert)
│   └── utils.ts                 # cn() helper (clsx + tailwind-merge)
├── Models/
│   ├── user.Model.ts            # User schema — accountNumber (auto-generated hex), role, status, limits, lockout
│   ├── transaction.Model.ts     # Transaction schema — dual-entry (debit/credit), idempotency, fees
│   └── loan.Model.ts            # Loan schema — user ref, amount, duration, status
├── types/
│   └── next-auth.d.ts           # Augmented Session, User, and JWT types (id, accountNumber, balance, role)
├── public/                      # SVG icons (file, globe, next, vercel, window)
├── proxy.ts                     # NextAuth middleware — redirects authenticated users away from auth pages
├── next.config.ts               # Remote image patterns for Unsplash
├── postcss.config.mjs           # @tailwindcss/postcss
├── eslint.config.mjs            # ESLint 9 with next/core-web-vitals + next/typescript
├── tsconfig.json                # ES2017 target, bundler module resolution, @/* path alias
└── components.json              # shadcn/ui v4 configuration
```

---

## Prerequisites

- **Node.js** `>= 20.x` (check with `node --version`)
- **npm** `>= 10.x` (this project uses `npm` — lockfile is `package-lock.json`)
- **MongoDB** `>= 6.x` — local instance or [MongoDB Atlas](https://www.mongodb.com/atlas) free tier
- **Gmail account** with an [app password](https://support.google.com/accounts/answer/185833) for email notifications

---

## Getting Started

```bash
# 1. Clone the repository
git clone https://github.com/<your-org>/smartbank.git
cd smartbank

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env .env.local
# Edit .env.local and fill in the required values (see Environment Variables below)

# 4. Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

To create an admin user, register normally, then update the role directly in your MongoDB:

```
use smartbank
db.users.updateOne({email: "your-email@example.com"}, {$set: {role: "admin", accountStatus: "active", isEmailVerified: true}})
```

---

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| `MONGODB_URI` | MongoDB connection string (e.g. `mongodb://localhost:27017/smartbank` or Atlas SRV string) | ✅ |
| `NEXTAUTH_SECRET` | Random string for session encryption. Generate with `openssl rand -base64 32` | ✅ |
| `NEXTAUTH_URL` | Canonical URL of the app. Set to `http://localhost:3000` in development | ✅ |
| `USER_EMAIL` | Gmail address used to send transactional emails | ✅ |
| `USER_PASS` | Gmail app password (not your regular password) | ✅ |
| `MONGODB_REPLICA_SET` | Set to `false` to disable replica-set transactions for local single-node MongoDB (optional, defaults to `true`) | ❌ |

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the Next.js dev server on port 3000 |
| `npm run build` | Create an optimised production build |
| `npm start` | Start the production server (requires `build` first) |
| `npm run lint` | Run ESLint across all source files |

---

## Architecture Overview

The application uses Next.js 16 App Router with route groups to organise authentication pages (`(auth)/`), protected user pages (`(main)/`), and admin pages (`(admin)/`). Each route group has its own layout that enforces access control server-side before rendering any page. User routes check for a valid session via `getServerSession` and redirect to `/login` if unauthenticated. Admin routes additionally verify the user's role is `admin` before allowing access. A client-side `AuthGuard` component provides a second layer of protection during soft navigations.

Data flows from the client through server-rendered page components or client components that call API routes via Axios. API routes use `getServerSession` for authentication and then interact with MongoDB through Mongoose models. Transfer and loan operations send transactional email notifications through Nodemailer using Gmail SMTP with HTML templates that include account details and balances. The transfer endpoint implements dual-entry bookkeeping — a single transfer creates both a debit record for the sender and a credit record for the receiver within a MongoDB transaction when a replica set is available.

Authentication uses NextAuth v4 with a credentials provider and JWT session strategy. During login, the system validates credentials, checks account lockout status (5 failed attempts triggers a 30-minute lock), records the login timestamp, and optionally sends a login alert email. The JWT token stores the user's id, accountNumber, accountType, balance, and role — all accessible via the session object on both server and client. The proxy middleware (`proxy.ts`) redirects authenticated users away from auth pages like login and signup.

State management is minimal — React Context handles theme state (dark/light mode persisted to localStorage), while all data fetching (user profile, transactions, loans) is done on-demand via API calls with local React state and useEffect. No global state library or server-state cache is used. The UI is built with Tailwind CSS v4 using OKLCH color space variables, shadcn/ui primitives, and supports both desktop (sidebar navigation) and mobile (overlay drawer) layouts.

---

## Key Features

- User registration with email verification via 6-digit OTP
- Secure login with account lockout after 5 failed attempts
- Money transfers by email or account number with idempotency protection
- Daily and monthly transaction limit enforcement
- Dual-entry ledger (debit/credit) with replica-set transaction support
- Loan request, admin approval/rejection, and user repayment
- Admin dashboard with aggregated statistics (total balance, users, loans, transactions)
- Admin user management — activate, suspend, or block accounts
- Admin loan management — approve or reject pending loans
- Transaction history with Send/Receive filtering and deduplication
- Dark/light theme toggle with system preference detection
- Responsive design with mobile sidebar drawer
- Email notifications for verification, password reset, transfers, loan status, and login alerts

---

## Database

### Entity Summary

| Entity | Key Fields | Relationships |
|---|---|---|
| User | `_id`, `fullName`, `email`, `password` (hidden), `accountNumber` (auto-generated hex), `accountType` (savings/current/salary), `balance`, `role` (user/admin/support), `accountStatus` (active/suspended/blocked/closed/pending_verification), `failedLoginAttempts`, `accountLockedUntil`, `dailyTransactionLimit` (default 5000), `monthlyTransactionLimit` (default 100000), `usedDailyLimit`, `usedMonthlyLimit`, `address` (embedded) | Referenced by Transaction (`fromAccount`, `toAccount`, `fromUser`, `toUser`, `account`) and Loan (`user`) |
| Transaction | `_id`, `fromAccount`, `toAccount`, `fromUser`, `toUser`, `account`, `amount`, `fee` (embedded), `type` (TRANSFER/DEPOSIT/etc.), `status` (COMPLETED/FAILED/etc.), `ledgerType` (DEBIT/CREDIT), `idempotencyKey` (unique) | References User via multiple ObjectId fields |
| Loan | `_id`, `user`, `amount`, `duration` (months), `reason`, `status` (PENDING/APPROVED/REJECTED/RETURNED) | References User via `user` field |

### Migration Workflow

This project uses Mongoose schema definitions without formal migrations. Schema changes are applied when the application starts — Mongoose synchronises indexes automatically. To change a schema, edit the corresponding file in `Models/` and restart the server.

### Seeding

There is no automated seed script. To create test data:

1. Register a new user via the signup form at `/signup` and verify the email OTP
2. Perform a transfer at `/transfer` to generate transaction records
3. Request a loan at `/request-loan` to create loan records
4. Update a user's role to `admin` directly in MongoDB for admin access

---

## Authentication

### Providers

- **Credentials** (email + password) — the only provider configured

### Session Strategy

- **JWT** (JSON Web Tokens) — no database sessions. Tokens store `id`, `accountNumber`, `accountType`, `balance`, and `role`
- Token expiry: 30 days (`maxAge: 30 * 24 * 60 * 60`)

### Account Lockout

After 5 consecutive failed login attempts, the account is locked for 30 minutes (`accountLockedUntil` field). Successful login resets the counter. The `isAccountLocked()` method on the User model checks whether the lockout period has expired.

### Adding a New OAuth Provider

1. Add the provider package (`next-auth/providers/<provider>`)
2. Add the provider to the `providers` array in `lib/auth.ts`
3. Add any client ID / secret environment variables
4. Update the login page UI to include a button for the new provider
5. Extend the `User` schema if the provider returns additional fields

### Protected Routes

- **Server-side**: `app/(main)/layout.tsx` calls `getServerSession` and redirects to `/login` if no session exists. Admin layouts additionally check `session.user.role === "admin"`.
- **Client-side**: `AuthGuard` component wraps page content and uses `useSession` to redirect during soft navigations.
- **Middleware**: `proxy.ts` uses `withAuth` to redirect authenticated users away from auth pages (login, signup, forgot-password, verify-email).

### Permission Model

| Role | Access |
|---|---|
| `user` | Dashboard, transfers, transactions, loans, profile, settings |
| `admin` | All user routes + admin dashboard, user management, loan management |
| `support` | Currently no additional access beyond user level |

---

## API Reference

### Authentication

```
POST /api/auth/signups
  Body: { fullName, email, dateOfBirth, password, accountType, address: { street, city, state, postalCode, country } }
  Returns: 201 { message, user }
  Auth: public

POST /api/auth/verify-otp
  Body: { email, otp }
  Returns: 200 { message, user }
  Auth: public

POST /api/auth/send-otp
  Body: { email }
  Returns: 200 { message }
  Auth: public

POST /api/auth/forgot-password
  Body: { email }
  Returns: 200 { message }
  Auth: public

POST /api/auth/reset-password
  Body: { email, otp, newPassword }
  Returns: 200 { message }
  Auth: public

GET|POST /api/auth/[...nextauth]
  NextAuth handler — sign in, sign out, session retrieval
  Auth: varies
```

### Transactions

```
POST /api/transactions
  Body: { toAccountNumber (email or account number), amount, description? }
  Headers: x-idempotency-key? (auto-generated if omitted)
  Returns: 201 { success, message, data }
  Auth: required (user)

GET /api/transactions
  Returns: 200 { success, transactions[] }
  Auth: required (user)
```

### Loans

```
GET /api/loan
  Returns: 200 { success, loans[] }
  Auth: required (user)

POST /api/loan/request
  Body: { amount, duration (months), reason? }
  Returns: 200 { success, loan }
  Auth: required (user)

PATCH /api/loan/approve
  Body: { loanId }
  Returns: 200 { success, message }
  Auth: required (admin)

PATCH /api/loan/reject
  Body: { loanId }
  Returns: 200 { success, message }
  Auth: required (admin)

PATCH /api/loan/return
  Body: { loanId }
  Returns: 200 { success, message }
  Auth: required (user — must own the loan)

GET /api/loan/all
  Returns: 200 { success, loans[] }
  Auth: required (admin)
```

### Users

```
GET /api/users/me
  Returns: 200 { success, user }
  Auth: required (user)

GET /api/users
  Returns: 200 { success, users[] }
  Auth: required (admin)

PATCH /api/users/update-status
  Body: { email, status (active|suspended|blocked|closed|pending_verification) }
  Returns: 200 { success, message, user }
  Auth: required (admin — cannot change own status)
```

### Admin

```
GET /api/admin/dashboard
  Returns: 200 { success, stats: { totalUsers, activeUsers, totalBalance, totalLoans, pendingLoans, totalTransactions }, recentLoans[], recentTransactions[], recentUsers[] }
  Auth: required (admin)
```

---

## Deployment

### Vercel (recommended)

```bash
npx vercel --prod
```

Set the following environment variables in the Vercel dashboard:

- `MONGODB_URI` — MongoDB Atlas connection string (recommended for production)
- `NEXTAUTH_SECRET` — Random 32+ character string
- `NEXTAUTH_URL` — Your production URL (e.g. `https://smartbank.vercel.app`)
- `USER_EMAIL` — Gmail address for sending emails
- `USER_PASS` — Gmail app password
- `MONGODB_REPLICA_SET` — Set to `true` (Atlas uses replica sets by default)

### Manual (Node.js)

```bash
npm run build
npm start
```

The production server runs on port 3000 by default. Set `PORT` to change it.

Note: `NEXT_PUBLIC_*` variables (none currently exist in this project) must be set at build time. All other variables are read at runtime.

---

## Contributing

```bash
# Fork → clone → create a branch
git checkout -b feat/your-feature-name

# Make changes, then
npm run lint
npm run build

# Commit using Conventional Commits
git commit -m "feat(scope): short description"

# Push and open a PR against main
git push origin feat/your-feature-name
```

Commit types: `feat` | `fix` | `refactor` | `chore` | `docs` | `test` | `perf`

Branch naming: `feat/` | `fix/` | `chore/` | `docs/`

---

## License

This project is not currently licensed. No `LICENSE` file exists in the repository.

---

## Troubleshooting

| Problem | Likely Cause | Fix |
|---|---|---|
| `MongoDB connection error` | `MONGODB_URI` missing or wrong | Verify the connection string in `.env.local` and ensure MongoDB is running |
| `Please define the MONGODB_URI environment variable` | `.env.local` file missing or incomplete | Create `.env.local` from `.env` and fill in all variables |
| `NEXTAUTH_SECRET is not defined` | Missing secret for session encryption | Add `NEXTAUTH_SECRET` to `.env.local` (generate with `openssl rand -base64 32`) |
| `Email not sending` | Gmail app password incorrect or 2FA not set up | Enable 2FA on your Gmail account and create an app password at https://myaccount.google.com/apppasswords |
| `Transactions fail with "MongoTransactError"` | MongoDB not running as a replica set | Set `MONGODB_REPLICA_SET=false` in `.env.local` for local development, or configure your MongoDB instance as a replica set |
| `Port 3000 already in use` | Another process on the port | `npx kill-port 3000` or run on a different port with `npm run dev -- -p 3001` |
| `Module not found: Can't resolve '@/'` | TypeScript path alias not configured | Verify `tsconfig.json` has `"@/*": ["./*"]` under `paths` |
| `OTP not received` | Email in spam folder or SMTP credentials wrong | Check spam folder, verify `USER_EMAIL` and `USER_PASS` in `.env.local` |
| `Account locked` | 5 failed login attempts | Wait 30 minutes for automatic unlock, or update `accountLockedUntil` to `null` in MongoDB directly |
