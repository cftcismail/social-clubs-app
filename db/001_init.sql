create table if not exists users (
  id bigserial primary key,
  full_name text not null,
  email text not null unique,
  password_hash text not null,
  role text not null check (role in ('USER', 'CLUB_MANAGER', 'ADMIN')) default 'USER',
  created_at timestamptz not null default now()
);

create table if not exists sessions (
  token text primary key,
  user_id bigint not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create table if not exists clubs (
  id bigserial primary key,
  name text not null,
  description text not null,
  manager_id bigint references users(id),
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists memberships (
  id bigserial primary key,
  club_id bigint not null references clubs(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  status text not null check (status in ('PENDING', 'APPROVED', 'REJECTED')) default 'PENDING',
  created_at timestamptz not null default now(),
  unique (club_id, user_id)
);

create table if not exists posts (
  id bigserial primary key,
  club_id bigint not null references clubs(id) on delete cascade,
  author_id bigint not null references users(id) on delete cascade,
  content text not null,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists comments (
  id bigserial primary key,
  post_id bigint not null references posts(id) on delete cascade,
  author_id bigint not null references users(id) on delete cascade,
  content text not null,
  created_at timestamptz not null default now()
);

create table if not exists post_likes (
  id bigserial primary key,
  post_id bigint not null references posts(id) on delete cascade,
  user_id bigint not null references users(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (post_id, user_id)
);

create table if not exists events (
  id bigserial primary key,
  club_id bigint not null references clubs(id) on delete cascade,
  title text not null,
  event_date timestamptz not null,
  location text not null,
  created_by bigint not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists announcements (
  id bigserial primary key,
  club_id bigint not null references clubs(id) on delete cascade,
  title text not null,
  body text not null,
  created_by bigint not null references users(id),
  created_at timestamptz not null default now()
);

create table if not exists notifications (
  id bigserial primary key,
  user_id bigint not null references users(id) on delete cascade,
  title text not null,
  body text not null,
  is_read boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id bigserial primary key,
  club_id bigint not null references clubs(id) on delete cascade,
  sender_id bigint not null references users(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);

create table if not exists abuse_reports (
  id bigserial primary key,
  reporter_user_id bigint not null references users(id) on delete cascade,
  target_type text not null,
  target_id bigint not null,
  reason text not null,
  status text not null check (status in ('OPEN', 'IN_REVIEW', 'RESOLVED')) default 'OPEN',
  created_at timestamptz not null default now()
);

create table if not exists audit_logs (
  id bigserial primary key,
  actor_user_id bigint references users(id),
  action text not null,
  target_type text,
  target_id bigint,
  details jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_memberships_user_status on memberships(user_id, status);
create index if not exists idx_posts_club_created_at on posts(club_id, created_at desc);
create index if not exists idx_notifications_user_created_at on notifications(user_id, created_at desc);
create index if not exists idx_events_club_event_date on events(club_id, event_date);
