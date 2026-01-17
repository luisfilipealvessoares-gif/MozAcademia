create table quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  video_id uuid,
  quiz_id uuid,
  passed boolean,
  answered_at timestamp default now()
);