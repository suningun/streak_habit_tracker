# Streaks

Streaks is a habit and routine tracker built with React, TypeScript, Vite, and Supabase. It helps users keep a consistent rhythm by tracking habits, logging positive and negative progress, and viewing their current momentum from a simple dashboard.

## Features

- Email sign-up and sign-in with Supabase Auth
- Protected routes for authenticated users
- Habit dashboard with search and filtering
- Add, edit, delete, and log habit progress
- Progress tracking with daily target counts
- Light, dark, and system theme support
- Offline/online status indicator
- Persistent data storage in Supabase

## Tech stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Supabase JavaScript client
- Vitest + Testing Library

## Prerequisites

- Node.js 18+ recommended
- A Supabase project

## Setup

1. Install dependencies:

```bash
npm install
```

2. Create a `.env` file in the project root with your Supabase credentials:

```bash
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Apply the database schema from [supabase/migrations/01_schema.sql](supabase/migrations/01_schema.sql) to the same Supabase project.

## Supabase database setup

Before using the app, apply the migration to the project referenced by `VITE_SUPABASE_URL`:

1. Open the Supabase dashboard for that project.
2. Go to SQL Editor.
3. Create a new query and paste the contents of [supabase/migrations/01_schema.sql](supabase/migrations/01_schema.sql).
4. Run the migration.
5. Confirm that `public.tasks` and `public.habit_logs` exist in Table Editor.

If you are using the Supabase CLI, the equivalent commands are:

```bash
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

> The schema enables row-level security and creates the user-scoped policies required for authenticated access. The anon key is for client-side queries only and should not be used to create database objects.

## Running the app

```bash
npm run dev
```

Then open the local Vite URL shown in the terminal.

## Available scripts

```bash
npm run dev       # start the development server
npm run build     # production build
npm run preview   # preview the build locally
npm run test      # run the test suite
npm run lint      # run ESLint
npm run typecheck # TypeScript type checking
```

## Project structure

```text
src/
  components/     UI and feature components
  context/        authentication context
  hooks/          custom hooks for state/data access
  lib/            Supabase client and utility logic
  pages/          login, signup, dashboard screens
  test/           shared test setup
supabase/
  migrations/     database schema and policies
```

## Security and data-scoping audit

This app is designed so the database is the last line of defense and every user-scoped read/write is filtered by the signed-in user.

### RLS and query scoping

- The database schema in [supabase/migrations/01_schema.sql](supabase/migrations/01_schema.sql) enables row-level security on `public.tasks`, `public.habit_logs`, `public.tags`, and `public.task_tags`.
- Each policy restricts access to `auth.uid() = user_id`, which means a user can only read or mutate their own rows.
- In the client layer, every habit query is scoped to the active user before data is returned or updated.
- The destructive actions in [src/hooks/useHabits.ts](src/hooks/useHabits.ts) explicitly pair object identity checks with the user filter, for example:
  - `.eq("id", id).eq("user_id", user.id)` for edit/delete
  - `.eq("id", habit_id).eq("user_id", user.id)` before logging a habit

This means the application is not relying on client-side filtering alone; the database policies are the enforcement boundary.

### Environment and secret handling

- Supabase credentials live in `.env` only.
- The repo's [.gitignore](.gitignore) includes `.env`, so local keys are excluded from version control.
- The app reads keys from `import.meta.env` in [src/lib/supabase.ts](src/lib/supabase.ts) and never injects secrets into frontend markup or source-controlled files.
- No hard-coded API keys or project secrets are stored in the application source.

### CRUD and lifecycle checklist

- A second account sees an empty habit list because the fetch query filters on `user_id` and returns only that user's tasks.
- Deleting a habit removes its related logs because `habit_logs.task_id` references `public.tasks` with `ON DELETE CASCADE`.
- Refresh does not lose data because the app re-fetches the signed-in user's tasks and nested habit logs after authentication state changes or page reload.

### Validation checklist

- [x] `.env` is ignored and not tracked by Git
- [x] No secret is embedded in source files
- [x] User-scoped queries are used for reads and writes
- [x] RLS is enabled for protected tables
- [x] Habit deletion cascades to related logs
- [x] Refresh rehydrates state for the signed-in user

## Notes

This project is designed for a personal habit-tracker workflow with a compact mobile-first dashboard. It stores user-specific tasks and logs in Supabase and keeps authenticated access restricted by row-level security policies.
