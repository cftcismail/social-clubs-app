insert into users (full_name, email, password_hash, role)
values
  ('Sistem Admin', 'admin@company.local', '$2b$12$5R3NzxP0dN4VIGQn2jL2Bu2RsyRyu7M8yY4QQ4fagfFY6jUd7Z6PO', 'ADMIN'),
  ('Kulüp Yöneticisi', 'manager@company.local', '$2b$12$5R3NzxP0dN4VIGQn2jL2Bu2RsyRyu7M8yY4QQ4fagfFY6jUd7Z6PO', 'CLUB_MANAGER'),
  ('Demo Kullanıcı', 'user@company.local', '$2b$12$5R3NzxP0dN4VIGQn2jL2Bu2RsyRyu7M8yY4QQ4fagfFY6jUd7Z6PO', 'USER')
on conflict (email) do nothing;

insert into clubs (name, description, manager_id)
select 'Koşu Kulübü', 'Haftalık koşu etkinlikleri ve kondisyon programı.', u.id
from users u where u.email = 'manager@company.local'
on conflict do nothing;

insert into clubs (name, description, manager_id)
select 'Kitap Kulübü', 'Aylık kitap buluşmaları ve tartışma oturumları.', u.id
from users u where u.email = 'manager@company.local'
on conflict do nothing;

insert into memberships (club_id, user_id, status)
select c.id, u.id, 'APPROVED'
from clubs c
cross join users u
where c.name = 'Koşu Kulübü' and u.email in ('manager@company.local', 'user@company.local')
on conflict (club_id, user_id) do update set status = excluded.status;

insert into posts (club_id, author_id, content)
select c.id, u.id, 'Cumartesi sabahı 07:30 parkur koşusu için buluşuyoruz.'
from clubs c
join users u on u.email = 'manager@company.local'
where c.name = 'Koşu Kulübü';

insert into announcements (club_id, title, body, created_by)
select c.id, 'Nisan Etkinlik Takvimi', 'Aylık kulüp etkinlik planı yayınlandı.', u.id
from clubs c
join users u on u.email = 'manager@company.local'
where c.name = 'Koşu Kulübü';

insert into events (club_id, title, event_date, location, created_by)
select c.id, 'Pazar Sabah Koşusu', now() + interval '3 days', 'Caddebostan Sahili', u.id
from clubs c
join users u on u.email = 'manager@company.local'
where c.name = 'Koşu Kulübü';

insert into notifications (user_id, title, body)
select u.id, 'Demo Ortamı Hazır', 'Kulüpler, gönderiler ve etkinlikler demo için yüklendi.'
from users u
where u.email = 'user@company.local';
