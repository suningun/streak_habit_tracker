create type public.task_type as enum ('habit', 'daily', 'todo');
create type public.priority_level as enum ('low', 'medium', 'high');
create type public.habit_log_type as enum ('positive', 'negative');

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users,
  title text not null,
  description text,
  type public.task_type not null,
  priority public.priority_level not null,
  target_count integer not null default 1,
  schedule_type text not null,
  schedule_interval integer,
  due_date timestamptz,
  position double precision not null default 0,
  created_at timestamptz not null default now()
);

create table public.habit_logs (
  id uuid primary key default gen_random_uuid(),
  task_id uuid not null references public.tasks on delete cascade,
  user_id uuid not null references auth.users,
  log_type public.habit_log_type not null,
  logged_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users,
  name text not null,
  color text not null
);

create table public.task_tags (
  task_id uuid not null references public.tasks on delete cascade,
  tag_id uuid not null references public.tags on delete cascade,
  user_id uuid not null references auth.users,
  primary key (task_id, tag_id)
);

alter table public.tasks enable row level security;
alter table public.habit_logs enable row level security;
alter table public.tags enable row level security;
alter table public.task_tags enable row level security;

create policy "Users can select their own tasks"
  on public.tasks for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tasks"
  on public.tasks for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tasks"
  on public.tasks for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tasks"
  on public.tasks for delete
  using (auth.uid() = user_id);

create policy "Users can select their own habit logs"
  on public.habit_logs for select
  using (auth.uid() = user_id);

create policy "Users can insert their own habit logs"
  on public.habit_logs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own habit logs"
  on public.habit_logs for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own habit logs"
  on public.habit_logs for delete
  using (auth.uid() = user_id);

create policy "Users can select their own tags"
  on public.tags for select
  using (auth.uid() = user_id);

create policy "Users can insert their own tags"
  on public.tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own tags"
  on public.tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own tags"
  on public.tags for delete
  using (auth.uid() = user_id);

create policy "Users can select their own task tags"
  on public.task_tags for select
  using (auth.uid() = user_id);

create policy "Users can insert their own task tags"
  on public.task_tags for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own task tags"
  on public.task_tags for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own task tags"
  on public.task_tags for delete
  using (auth.uid() = user_id);
