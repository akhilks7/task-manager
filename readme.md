# Task & Report Management System

A lightweight, role-driven task delegation and reporting platform for teams built with Next.js 14+ (App Router), TypeScript, Tailwind CSS, and Supabase.

---

## 🏗️ Architecture & Roles

The system supports **3 distinct roles** accessing the platform via a **single shared login page (`/login`)**:

| Capability | Admin | Manager | Employee |
| :--- | :---: | :---: | :---: |
| Single shared login (`/login`) | ✅ | ✅ | ✅ |
| Manage users & roles (`/admin/users`) | ✅ | ❌ | ❌ |
| Assign employee $\rightarrow$ manager | ✅ | ❌ | ❌ |
| View company-wide metrics & all tasks (`/admin`) | ✅ | ❌ | ❌ |
| View tasks they created (`/manager`) | ✅ | ✅ | ❌ |
| Create tasks for assigned employees (`/manager/tasks/new`) | ❌ | ✅ | ❌ |
| Review / Approve / Reject reports (`/manager/tasks/[id]`) | ❌ | ✅ | ❌ |
| View assigned tasks (`/employee`) | ❌ | ❌ | ✅ |
| Start task & submit reports with attachments (`/employee/tasks/[id]`) | ❌ | ❌ | ✅ |
| Revise & resubmit upon rejection | ❌ | ❌ | ✅ |

### Task State Machine
```
assigned ──(employee starts)──► in_progress ──(employee submits)──► submitted
                                                                      │
                                          ┌────(manager approves)────┤
                                          ▼                           ▼
                                      approved              rejected ──(employee resubmits)──► submitted
```

---

## 🚀 Setup Guide (In Order)

### 1. Database Migration
1. Go to your [Supabase Dashboard](https://supabase.com/dashboard) $\rightarrow$ **SQL Editor**.
2. Open `supabase/migrations/0001_init.sql` and run the entire script.
   - Creates enums (`user_role`, `task_status`, `review_status`).
   - Creates tables (`profiles`, `tasks`, `task_reports`).
   - Configures `profiles` trigger on `auth.users` insertion.
   - Enforces non-recursive Row-Level Security (RLS) policies.
   - Installs RPC functions (`start_task`, `submit_report`, `review_report`).
   - Configures the `reports` Supabase Storage bucket with security policies.

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local` and add your project keys:

```bash
cp .env.example .env.local
```

Fill in:
```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-id>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```
> ⚠️ **Security Notice:** The `SUPABASE_SERVICE_ROLE_KEY` is exclusively consumed by server routes (`/api/admin/users`) and is never leaked to client bundles.

### 3. Disable Public Sign-ups
In your Supabase project:
1. Navigate to **Authentication** $\rightarrow$ **Providers** $\rightarrow$ **Email**.
2. Toggle **Disable "Confirm email"** (admin API confirms emails automatically) or keep it enabled according to your preference.
3. Toggle off **"Enable sign ups"** so only the Admin can provision staff.

### 4. Create the First Admin Account
You can create the initial admin user using either method:

**Option A (Recommended via SQL):**
1. In the Supabase Dashboard, go to **Authentication** $\rightarrow$ **Users** $\rightarrow$ **Add user** (or use the SQL script in `supabase/seed.sql`).
2. Enter email (e.g. `admin@company.com`) and a secure password.
3. In **SQL Editor**, elevate this account:
   ```sql
   UPDATE public.profiles
   SET role = 'admin'
   WHERE email = 'admin@company.com';
   ```

### 5. Start the Development Server
Install dependencies and launch the application:

```bash
npm install
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) (redirects to `/login`).

---

## 🔒 Security & Row-Level Security (RLS)

- **Database-Level Boundaries:** All queries are filtered through Supabase RLS. An employee attempting to select or mutate another user's task or report will be blocked by Postgres itself.
- **Manager Delegation Scoping:** Managers can strictly assign tasks to employees who have `manager_id = manager.uid`.
- **Atomic State Transitions:** Task submission and review are backed by Postgres RPCs (`submit_report`, `review_report`), preventing unauthorized field modification.
- **Middleware Guard:** `middleware.ts` runs on every request, verifying sessions and immediately redirecting any cross-role URL navigation attempt.

---

## 📁 Project Structure

```
├── app/
│   ├── admin/               # Admin dashboard and User Management
│   │   ├── page.tsx         # Birds-eye KPI metrics & all tasks
│   │   └── users/           # User CRUD & manager assignments
│   ├── api/admin/users/     # Protected admin user provisioning endpoint
│   ├── employee/            # Employee dashboard & task detail/reporting
│   ├── manager/             # Manager dashboard, task creation, and review queue
│   ├── login/               # Shared login form and auth actions
│   ├── globals.css          # Tailwind CSS styling
│   └── layout.tsx           # Root layout
├── components/
│   └── ui/                  # Reusable components (Navbar, StatusBadge, RoleBadge)
├── lib/
│   ├── supabase/            # SSR client, Server client, Admin client
│   └── utils.ts             # Styling & date formatting helpers
├── supabase/
│   ├── migrations/          # 0001_init.sql migration
│   └── seed.sql             # Admin seed queries
└── types/
    └── database.ts          # TypeScript type definitions
```
