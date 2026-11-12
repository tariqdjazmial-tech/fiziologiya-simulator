-- ===== Физиология — схема за Supabase. Пусни целия файл веднъж в SQL Editor. =====
-- Профили: един ред на потребител, създава се при регистрация.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  first text, last text, email text, inst text, purpose text, other text,
  lang text default 'bg', dev text,
  opened int default 0, ans int default 0, tot int default 0, days int default 0,
  tp text default '', dn text default '',
  code_hash text,
  full_access boolean not null default false,
  created_at timestamptz not null default now(),
  seen_at timestamptz not null default now()
);
-- Администратори (добавяш себе си след първата регистрация, вж. края на файла).
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
-- Кодове за безплатен достъп: пази се само хешът; самият код се вижда само от админа.
create table if not exists public.codes (
  hash text primary key, code text not null, label text,
  created_at timestamptz not null default now(),
  revoked_at timestamptz, used_by uuid references auth.users(id) on delete set null, used_at timestamptz
);
-- Покупки: записват се само от сървъра (Stripe webhook) със service role.
create table if not exists public.purchases (
  id bigserial primary key, user_id uuid references auth.users(id) on delete set null,
  stripe_session text unique, amount int, currency text, email text,
  created_at timestamptz not null default now()
);

create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as
$$ select exists(select 1 from admins where user_id = auth.uid()) $$;

alter table public.profiles enable row level security;
alter table public.admins enable row level security;
alter table public.codes enable row level security;
alter table public.purchases enable row level security;

-- Профили: всеки чете и пише само своя ред; админът чете и трие всички.
drop policy if exists p_self_sel on public.profiles; create policy p_self_sel on public.profiles for select using (id = auth.uid() or is_admin());
drop policy if exists p_self_ins on public.profiles; create policy p_self_ins on public.profiles for insert with check (id = auth.uid());
drop policy if exists p_self_upd on public.profiles; create policy p_self_upd on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
drop policy if exists p_adm_del on public.profiles; create policy p_adm_del on public.profiles for delete using (is_admin());
-- Потребителят не може сам да си даде пълен достъп или код: тези колони се пазят от тригер.
create or replace function public.protect_profile() returns trigger language plpgsql security definer set search_path=public as $$
begin
  if current_setting('app.trusted', true) = '1' or auth.role() = 'service_role' then return new; end if;
  if tg_op = 'INSERT' then new.full_access := false; new.code_hash := null;
  else new.full_access := old.full_access; new.code_hash := old.code_hash; end if;
  return new;
end $$;
drop trigger if exists t_protect on public.profiles;
create trigger t_protect before insert or update on public.profiles for each row execute function protect_profile();

drop policy if exists a_self on public.admins; create policy a_self on public.admins for select using (user_id = auth.uid());
drop policy if exists c_adm on public.codes; create policy c_adm on public.codes for all using (is_admin()) with check (is_admin());
drop policy if exists pu_sel on public.purchases; create policy pu_sel on public.purchases for select using (user_id = auth.uid() or is_admin());

-- Активиране на код: проверява хеша, че не е спрян и не е ползван от друг, и отключва профила.
create or replace function public.claim_code(p_hash text) returns text language plpgsql security definer set search_path=public as $$
declare c codes%rowtype;
begin
  if auth.uid() is null then return 'auth'; end if;
  select * into c from codes where hash = p_hash for update;
  if not found or c.revoked_at is not null then return 'invalid'; end if;
  if c.used_by is not null and c.used_by <> auth.uid() then return 'used'; end if;
  update codes set used_by = auth.uid(), used_at = coalesce(used_at, now()) where hash = p_hash;
  perform set_config('app.trusted','1',true);
  update profiles set full_access = true, code_hash = p_hash where id = auth.uid();
  return 'ok';
end $$;
-- Спиране на код от админа: отнема и достъпа, ако е даден само с този код.
create or replace function public.revoke_code(p_hash text) returns void language plpgsql security definer set search_path=public as $$
begin
  if not is_admin() then raise exception 'not admin'; end if;
  update codes set revoked_at = now() where hash = p_hash;
  perform set_config('app.trusted','1',true);
  update profiles p set full_access = exists(select 1 from purchases x where x.user_id = p.id), code_hash = null where p.code_hash = p_hash;
end $$;
-- Проверка на код преди регистрация (без да го активира).
create or replace function public.check_code(p_hash text) returns text language sql stable security definer set search_path=public as
$$ select case when c.hash is null or c.revoked_at is not null then 'invalid' when c.used_by is not null then 'used' else 'ok' end
   from (select 1) x left join codes c on c.hash = p_hash $$;
grant execute on function public.claim_code(text), public.revoke_code(text), public.is_admin() to authenticated;
grant execute on function public.check_code(text) to anon, authenticated;

-- След като се регистрираш в сайта, пусни този ред със своя имейл, за да станеш администратор:
-- insert into public.admins(user_id) select id from auth.users where email = 'твоят@имейл';
