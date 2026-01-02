# 🚀 คู่มือ Deploy และทดสอบระบบ Demo Topup บน Production

## 📋 สารบัญ
1. [Deploy ไปยัง Vercel](#1-deploy-ไปยัง-vercel)
2. [ตั้งค่า Environment Variables](#2-ตั้งค่า-environment-variables)
3. [ทดสอบบน Production](#3-ทดสอบบน-production)
4. [ตรวจสอบ Logs](#4-ตรวจสอบ-logs)

---

## 1. Deploy ไปยัง Vercel

### วิธีที่ 1: ใช้ Vercel CLI (แนะนำ)

```bash
# 1. Install Vercel CLI (ถ้ายังไม่มี)
npm i -g vercel

# 2. Login to Vercel
vercel login

# 3. Deploy to production
cd "/Users/apple/Desktop/CRM - Reward Point"
vercel --prod --yes
```

### วิธีที่ 2: ใช้ Git Push (Auto Deploy)

```bash
# 1. Commit และ push code
git add -A
git commit -m "Add demo topup system"
git push origin main

# 2. Vercel จะ auto-deploy อัตโนมัติ
```

---

## 2. ตั้งค่า Environment Variables

### 2.1 ไปที่ Vercel Dashboard

1. เปิด [Vercel Dashboard](https://vercel.com)
2. เลือกโปรเจคของคุณ
3. ไปที่ **Settings** → **Environment Variables**

### 2.2 เพิ่ม Environment Variables

เพิ่มตัวแปรต่อไปนี้สำหรับ **ทุก Environment** (Production, Preview, Development):

```
DEMO_MODE = true
DEMO_ENABLED = true
PROMPTPAY_API_KEY = test_demo_key_12345
PROMPTPAY_API_SECRET = test_demo_secret_67890
PROMPTPAY_SANDBOX_URL = https://sandbox-api.promptpay.com
PROMPTPAY_WEBHOOK_SECRET = test_webhook_secret_abc123
DEMO_POINT_RATE = 1
DEMO_QR_EXPIRY_MINUTES = 15
```

**สำคัญ**: ต้องมี Environment Variables เหล่านี้ด้วย:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIFF_ID`
- `LINE_CHANNEL_ACCESS_TOKEN` (ถ้าใช้)

### 2.3 Redeploy

หลังจากเพิ่ม Environment Variables:
1. ไปที่ **Deployments** tab
2. คลิก **...** (สามจุด) บน deployment ล่าสุด
3. เลือก **Redeploy**

---

## 3. ทดสอบบน Production

### 3.1 ตรวจสอบว่า Deploy สำเร็จ

1. ไปที่ Production URL (เช่น `https://your-app.vercel.app`)
2. ตรวจสอบว่าเว็บโหลดได้
3. ตรวจสอบว่าเมนู "Demo Topup" แสดงขึ้น

### 3.2 ทดสอบสร้าง Topup Order

1. ไปที่: `https://your-app.vercel.app/admin/demo-topup`
2. สร้าง Topup Order (เหมือน local)
3. คัดลอก Order ID และ Transaction ID

### 3.3 ทดสอบ Webhook

**วิธีที่ 1: ใช้หน้า Test Webhook**

1. ไปที่: `https://your-app.vercel.app/admin/demo-topup/test-webhook`
2. กรอกข้อมูล Order ID, Transaction ID, Amount
3. กด "ส่ง Webhook"

**วิธีที่ 2: ใช้ curl**

```bash
curl -X POST https://your-app.vercel.app/api/demo/webhook/payment \
  -H "Content-Type: application/json" \
  -H "x-promptpay-signature: test_signature" \
  -H "x-promptpay-timestamp: $(date -u +"%Y-%m-%dT%H:%M:%SZ")" \
  -d '{
    "event": "payment.success",
    "transactionId": "txn_demo_123456789",
    "amount": 100.00,
    "currency": "THB",
    "timestamp": "'$(date -u +"%Y-%m-%dT%H:%M:%SZ")'",
    "metadata": {
      "orderId": "DEMO-20241215-ABC12"
    }
  }'
```

### 3.4 ตรวจสอบผลลัพธ์

1. ไปที่: `https://your-app.vercel.app/admin/demo-topup/orders`
2. ตรวจสอบว่า Order Status เป็น "สำเร็จ"
3. ไปที่: `https://your-app.vercel.app/customer/demo-wallet`
4. ตรวจสอบว่าแต้มถูกเพิ่มแล้ว

---

## 4. ตรวจสอบ Logs

### 4.1 ดู Vercel Logs

1. ไปที่ Vercel Dashboard
2. เลือกโปรเจค
3. ไปที่ **Deployments** → เลือก deployment
4. คลิก **View Function Logs**

### 4.2 ดู Real-time Logs

```bash
# ใช้ Vercel CLI
vercel logs --follow
```

### 4.3 ตรวจสอบ Webhook Logs

ใน Logs ควรเห็น:
- `Demo mode: Skipping strict webhook verification`
- `Webhook processed successfully`
- `เพิ่ม points สำเร็จ`

---

## 5. Troubleshooting

### ปัญหา: "Demo mode is not enabled"

**แก้ไข**:
- ตรวจสอบว่า `DEMO_MODE=true` และ `DEMO_ENABLED=true` ใน Vercel
- Redeploy หลังจากเพิ่ม environment variables

### ปัญหา: Webhook ไม่ทำงาน

**แก้ไข**:
- ตรวจสอบ Vercel Logs
- ตรวจสอบว่า URL ถูกต้อง (ไม่มี trailing slash)
- ตรวจสอบว่า Headers ถูกส่งมา

### ปัญหา: แต้มไม่ถูกเพิ่ม

**แก้ไข**:
- ตรวจสอบ Vercel Logs ว่ามี error อะไร
- ตรวจสอบ Database ว่า Order Status เป็น "success"
- ตรวจสอบ `demo_wallets` table

---

## 6. URLs สำหรับทดสอบ

หลังจาก deploy แล้ว:

- **Admin - Create Topup**: `https://your-app.vercel.app/admin/demo-topup`
- **Admin - View Orders**: `https://your-app.vercel.app/admin/demo-topup/orders`
- **Admin - Test Webhook**: `https://your-app.vercel.app/admin/demo-topup/test-webhook`
- **Customer - Demo Wallet**: `https://your-app.vercel.app/customer/demo-wallet`
- **Customer - Create Topup**: `https://your-app.vercel.app/customer/demo-topup`

---

## 7. Checklist ก่อน Deploy

- [ ] Code ทำงานได้ใน local
- [ ] Environment Variables ถูกตั้งค่าใน Vercel
- [ ] Database tables ถูกสร้างแล้ว (demo_*)
- [ ] Test Webhook ทำงานได้ใน local
- [ ] Deploy สำเร็จ
- [ ] ทดสอบบน Production URL

---

## 8. หมายเหตุ

- **Demo Mode**: ระบบจะใช้ Mock Response อัตโนมัติ
- **Webhook URL**: สำหรับทดสอบ ใช้หน้า Test Webhook ได้เลย
- **Production API**: เมื่อพร้อม เปลี่ยน `DEMO_MODE=false` และใช้ Production API Keys

---

## 🎉 พร้อม Deploy แล้ว!

ทำตามขั้นตอนที่ 1-3 เพื่อ deploy และทดสอบบน production

