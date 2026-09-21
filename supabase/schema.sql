-- 이음청년목장 사역팀 소개서 — Supabase 초기 설정
-- Supabase 대시보드 → SQL Editor 에 통째로 붙여 넣고 Run 하시면 됩니다.

-- 1) 사역팀 내용을 담는 표 ---------------------------------------------------
create table if not exists public.team_profiles (
  id          text primary key,
  sort_order  integer     not null default 0,
  data        jsonb       not null default '{}'::jsonb,
  updated_at  timestamptz not null default now()
);

create index if not exists team_profiles_sort_idx on public.team_profiles (sort_order);

alter table public.team_profiles enable row level security;

-- 2) 접근 규칙 ---------------------------------------------------------------
-- 주소를 아는 사람이면 누구나 읽고 쓸 수 있는 설정입니다.
-- 사역팀장님들께 로그인을 요구하지 않는 대신, 페이지 주소를 아는 사람은
-- 누구나 내용을 고칠 수 있다는 뜻입니다. 교회 내부용으로는 대개 이 정도면
-- 충분하지만, 잠그고 싶으시면 README 의 "더 잠그고 싶다면" 항목을 보세요.

drop policy if exists "team_profiles_read"   on public.team_profiles;
drop policy if exists "team_profiles_insert" on public.team_profiles;
drop policy if exists "team_profiles_update" on public.team_profiles;
drop policy if exists "team_profiles_delete" on public.team_profiles;

create policy "team_profiles_read"   on public.team_profiles for select using (true);
create policy "team_profiles_insert" on public.team_profiles for insert with check (true);
create policy "team_profiles_update" on public.team_profiles for update using (true) with check (true);
create policy "team_profiles_delete" on public.team_profiles for delete using (true);

-- 3) 실시간 반영 -------------------------------------------------------------
-- 한 팀장님이 고치면 다른 분 화면에도 바로 반영됩니다.
-- (이미 등록되어 있으면 그냥 넘어갑니다 — 여러 번 실행해도 안전합니다.)
do $$
begin
  alter publication supabase_realtime add table public.team_profiles;
exception
  when duplicate_object then null;
end
$$;

-- 4) 사진 보관함 -------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('team-photos', 'team-photos', true)
on conflict (id) do update set public = true;

drop policy if exists "team_photos_read"   on storage.objects;
drop policy if exists "team_photos_insert" on storage.objects;
drop policy if exists "team_photos_update" on storage.objects;
drop policy if exists "team_photos_delete" on storage.objects;

create policy "team_photos_read"   on storage.objects for select using (bucket_id = 'team-photos');
create policy "team_photos_insert" on storage.objects for insert with check (bucket_id = 'team-photos');
create policy "team_photos_update" on storage.objects for update using (bucket_id = 'team-photos');
create policy "team_photos_delete" on storage.objects for delete using (bucket_id = 'team-photos');
