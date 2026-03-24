# Kurumsal Sosyal Kulüp Platformu

Bu proje, şirket içi sosyal kulüplerin yönetimi ve çalışan etkileşimi için hazırlanmış teslime uygun bir web uygulamasıdır.

## Ürün Kapsamı

- Kimlik doğrulama: şirket e-posta + şifre ile kayıt/giriş/çıkış
- Rol bazlı yetkilendirme: `USER`, `CLUB_MANAGER`, `ADMIN`
- Kullanıcı alanı: kulüp listeleme, kulübe katılma, gönderi paylaşımı, duyuru/etkinlik/bildirim görünümü
- Kulüp yönetimi: kulüp oluşturma, duyuru yayınlama, etkinlik planlama
- Admin yönetimi: kullanıcı rol güncelleme, kulüp aktif/pasif yönetimi, özet metrikler
- Operasyonel katman: PostgreSQL + `node-postgres (pg)`, SQL migration + seed, sağlık kontrol endpoint’i

## Teknoloji

- Next.js 16 (App Router, TypeScript)
- Tailwind CSS
- PostgreSQL
- node-postgres (`pg`)
- bcryptjs, zod

## Kurulum

1. Bağımlılıkları yükleyin:

	```bash
	npm install
	```

2. Ortam değişkenlerini hazırlayın:

	```bash
	cp .env.example .env.local
	```

	Windows PowerShell için:

	```powershell
	Copy-Item .env.example .env.local
	```

3. `.env.local` içindeki `DATABASE_URL` değerini kendi PostgreSQL bilginize göre düzenleyin.

4. Veritabanı şemasını uygulayın:

	```bash
	npm run db:migrate
	```

5. Demo verileri yükleyin:

	```bash
	npm run db:seed
	```

6. Uygulamayı başlatın:

	```bash
	npm run dev
	```

7. Tarayıcıdan açın: `http://localhost:3000`

## Demo Hesaplar

- Admin: `admin@company.local` / `Passw0rd!`
- Kulüp Yöneticisi: `manager@company.local` / `Passw0rd!`
- Kullanıcı: `user@company.local` / `Passw0rd!`

## API / Operasyon

- Sağlık kontrolü: `GET /api/health`
- Migration dosyası: `db/001_init.sql`
- Seed dosyası: `db/002_seed.sql`

## Docker ile Tek Komut Deployment

### Ön Koşul

- Docker Desktop kurulu ve çalışır durumda olmalı.

### Ayağa Kaldırma

Tek komutla app + postgres başlatmak için:

```bash
npm run docker:up
```

veya PowerShell scripti:

```powershell
./scripts/up.ps1
```

Erişim:

- Uygulama: `http://localhost:3000`
- Health endpoint: `http://localhost:3000/api/health`

### Durdurma

```bash
npm run docker:down
```

veya:

```powershell
./scripts/down.ps1
```

### Veritabanını Sıfırlama (init + seed yeniden)

```bash
npm run docker:reset
```

veya:

```powershell
./scripts/reset-db.ps1
```

## Teslim Kontrol Listesi

- `npm run lint`
- `npm run build`
- `GET /api/health` yanıtı: `status=ok`
- Demo hesaplarla giriş ve rol bazlı panellerin doğrulanması

## Notlar

- Mesajlaşma tabloları ve veri modeli hazırlanmıştır; gerçek zamanlı kanal (WebSocket) ikinci faz için planlanmıştır.
- Güvenlik için şifreler `bcrypt` ile hashlenir, oturumlar `httpOnly` cookie + session tablosu ile yönetilir.
