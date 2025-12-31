# Loyalty Point CRM

ระบบจัดการแต้มสะสมและแลกรางวัลแบบครบวงจร สร้างด้วย Next.js, Tailwind CSS, shadcn/ui และ Supabase

## ฟีเจอร์

### 1. Admin - Manage Rewards
- เพิ่ม/แก้ไข/ลบ สินค้ารางวัล
- กำหนดแต้มที่ใช้และจำนวนสต็อก
- อัปโหลดรูปภาพรางวัล

### 2. Admin/Staff - Point Collector
- ค้นหาลูกค้าด้วยเบอร์โทรศัพท์
- ดูแต้มปัจจุบันของลูกค้า
- เพิ่มแต้มให้ลูกค้า
- สร้างโปรไฟล์ลูกค้าใหม่

### 3. Admin - Redemption List
- ดูรายการแลกรางวัลทั้งหมด
- ดูข้อมูลลูกค้าและรางวัลที่แลก
- เปลี่ยนสถานะการแลกเป็น "Completed"

### 4. Customer - Reward Store
- ดู Catalog รางวัลทั้งหมด
- ดูแต้มคงเหลือ (เมื่อ Login)
- แลกรางวัลด้วยแต้มสะสม
- ตรวจสอบความถูกต้อง: แต้มไม่พอ/สต็อกหมด

## การติดตั้ง

1. ติดตั้ง dependencies:
```bash
npm install
```

2. สร้างไฟล์ `.env.local` (ถ้ายังไม่มี):
```env
NEXT_PUBLIC_SUPABASE_URL=https://xnzalzpkjdtlqozwlurr.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuemFsenBramR0bHFvendsdXJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjcxNTk3NDcsImV4cCI6MjA4MjczNTc0N30.LLWPZfO0gpGBtgYZwpCxs8y6nLfbBjJZmjDpOfugJ58
```

3. รัน development server:
```bash
npm run dev
```

4. เปิดเบราว์เซอร์ไปที่ [http://localhost:3000](http://localhost:3000)

## Database Schema

### profiles
- `id` (uuid, primary key)
- `phone` (text, unique)
- `full_name` (text)
- `total_points` (integer, default 0)
- `role` (text: admin, customer)

### rewards
- `id` (uuid, primary key)
- `title` (text)
- `description` (text)
- `points_required` (integer)
- `stock` (integer)
- `image_url` (text)

### redemptions
- `id` (uuid, primary key)
- `customer_id` (uuid, foreign key → profiles)
- `reward_id` (uuid, foreign key → rewards)
- `status` (text: pending, completed)
- `created_at` (timestamp)

## หน้าเว็บไซต์

- `/` - หน้าหลัก (Dashboard)
- `/admin/rewards` - จัดการรางวัล
- `/admin/collect-points` - เพิ่มแต้มให้ลูกค้า
- `/admin/redemptions` - รายการแลกรางวัล
- `/store` - ร้านรางวัล (สำหรับลูกค้า)

## เทคโนโลยีที่ใช้

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **shadcn/ui** - UI Components
- **Supabase** - Database & Backend
- **React Hook Form** - Form Management
- **Zod** - Validation
- **date-fns** - Date Formatting

## License

MIT

