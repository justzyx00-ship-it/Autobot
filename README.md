# SatiKey Store

Website ban dich vu so chuyen nghiep cho Discord user, streamer, creator va nguoi dung AI tools.

## Stack

- Next.js App Router, TypeScript
- Prisma + SQLite
- Server Actions cho auth, order, topup, admin workflow
- Dark mode / Light mode, luu theme theo tai khoan

## Tinh nang da xay dung

- Trang chu premium, tim kiem nhanh, loc theo danh muc
- Danh muc dich vu: Discord Nitro, ChatGPT Plus, CapCut Pro, Spotify, Netflix, YouTube Premium
- Dang ky, dang nhap, phan quyen USER / ADMIN
- Dashboard user:
  - dat don nhanh
  - trang thai don: PENDING_PAYMENT, PROCESSING, COMPLETED
  - nap tien QR ngan hang va the cao tu dong
  - lich su nap tien, lich su don, bien dong vi, thong bao
  - cap nhat profile, doi mat khau, doi theme
- Dashboard admin:
  - thong ke doanh thu ngay, thang
  - quan ly san pham
  - xu ly don dang processing
  - duyet / tu choi lenh nap QR
  - theo doi ticket ho tro
- Trang lien he + FAQ
- SEO co ban: metadata, robots, sitemap

## Khoi dong local

1) Cai package

```bash
npm install
```

2) Tao file env

```bash
cp .env.example .env
```

3) Tao database va seed du lieu

```bash
npm run db:generate
npm run db:push
npm run db:seed
```

4) Chay app

```bash
npm run dev
```

Mo `http://localhost:3000`

## Tai khoan demo

- Admin
  - email: admin@satikey.store
  - password: Admin@12345
- User
  - email: demo@satikey.store
  - password: User@12345

## Webhook nap tien bank QR

Endpoint:

`POST /api/topups/webhook`

Headers:

- `x-webhook-secret: <WEBHOOK_TOPUP_SECRET>`

Body:

```json
{
  "referenceCode": "BANK-12345",
  "status": "success",
  "note": "doi soat thanh cong"
}
```

## Cac script chinh

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm run db:generate`
- `npm run db:push`
- `npm run db:seed`
- `npm run db:studio`
