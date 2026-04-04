# Swift Appointment / Kozlowski Chiropractic Booking System

A full-stack web application designed for chiropractic clinics to manage client bookings, handle complex calendar availability rules, and provide dedicated client/admin dashboards. 

## 🚀 Tech Stack

- **Frontend Framework**: [React](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/) (Radix Primitives) + [Lucide Icons](https://lucide.dev/)
- **Routing**: [React Router v6](https://reactrouter.com/)
- **State/Data Fetching**: [TanStack Query](https://tanstack.com/query/latest) (React Query)
- **Backend/Database**: [Supabase](https://supabase.com/) (PostgreSQL + Auth + Row Level Security)

## 📁 Project Structure Highlights

- `src/pages/`: Contains all our main views, split between public pages (`Index.tsx`, `auth/`), `client/` dashboards, and `admin/` dashboards.
- `src/components/layout/`: Shared layouts like `DashboardLayout` that provide the authenticated sidebar shell.
- `src/components/ui/`: Reusable Shadcn base components.
- `src/contexts/AuthContext.tsx`: The heart of user session and role management (fetches Supabase session -> verifies profile role).
- `src/components/ProtectedRoute.tsx`: Guards the routes depending on the user's role (`user`, `client`, `admin`).
- `database_setup.sql`: Reference SQL file containing the schema, custom enum types, triggers, and comprehensive RLS policies.

## 🔑 Authentication & Roles

Supabase handles auth. Upon signup, a user defaults to the `'user'` role. 
Triggers in the database automatically create a `profiles` hook and handle role escalation (e.g. promoting them to `'client'` when they make a booking).
- **Admins** have full dashboard access to manage calendars, users, and global settings.
- **Clients** have read/write access focused strictly on their own profile and booking records.

## 🛠 Getting Started

1. **Install Dependencies:**
   ```bash
   npm install
   ```
2. **Setup Environment Variables:**
   Create a `.env` file in the root copying the structure from `.env.example`.
   ```bash
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
3. **Database Schema:**
   Ensure the Supabase project contains the tables arrayed in `database_setup.sql`. If you are picking up from scratch, paste that file into the Supabase SQL editor.
4. **Run Local Dev Server:**
   ```bash
   npm run dev
   ```
   *The local app should resolve to `http://localhost:5173`.*
