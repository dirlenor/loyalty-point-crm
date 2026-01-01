# คู่มือการตั้งค่า LINE Notification

## ปัญหาที่พบบ่อย

### 1. ไม่มีแจ้งเตือนเลย

**สาเหตุที่เป็นไปได้:**
- ลูกค้าไม่มี LINE User ID ในฐานข้อมูล
- LINE_CHANNEL_ACCESS_TOKEN ไม่ได้ตั้งค่าใน Vercel
- LINE User ID ไม่ถูกต้อง
- LINE Messaging API ยังไม่ได้เปิดใช้งาน

## วิธีตรวจสอบ

### 1. ตรวจสอบ LINE User ID ในฐานข้อมูล

```sql
SELECT id, full_name, line_user_id 
FROM profiles 
WHERE role = 'customer';
```

**ถ้า `line_user_id` เป็น `null`:**
- ลูกค้าต้อง login ผ่าน LINE LIFF App ก่อน
- ระบบจะบันทึก LINE User ID อัตโนมัติเมื่อ login

### 2. ตรวจสอบ Environment Variable

ใน Vercel Dashboard:
1. ไปที่ Project → Settings → Environment Variables
2. ตรวจสอบว่า `LINE_CHANNEL_ACCESS_TOKEN` มีอยู่
3. ตรวจสอบว่า Value ไม่ว่างเปล่า

### 3. ตรวจสอบ Logs

ดู logs ใน Vercel:
```bash
vercel logs --follow
```

หรือใน Vercel Dashboard:
- Project → Deployments → เลือก deployment → Functions → View Function Logs

### 4. ตรวจสอบ LINE Messaging API

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. เลือก Channel (Messaging API)
3. ไปที่ tab "Messaging API"
4. ตรวจสอบว่า:
   - Channel access token มีอยู่
   - Webhook URL ตั้งค่าแล้ว (ถ้าต้องการ)
   - **สำคัญ**: ต้องเปิดใช้งาน "Allow bot to send push messages" ใน Settings

## วิธีตั้งค่า LINE Messaging API

### ขั้นตอนที่ 1: สร้าง LINE Channel

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider (ถ้ายังไม่มี)
3. สร้าง Messaging API Channel
4. ตั้งชื่อ Channel (เช่น "6CAT Point")

### ขั้นตอนที่ 2: ตั้งค่า Channel Access Token

1. ไปที่ tab "Messaging API"
2. Scroll ลงไปหา "Channel access token"
3. กด "Issue" เพื่อสร้าง token ใหม่ (หรือใช้ token ที่มีอยู่)
4. คัดลอก token

### ขั้นตอนที่ 3: ตั้งค่าใน Vercel

1. ไปที่ Vercel Dashboard → Project → Settings → Environment Variables
2. เพิ่ม:
   - **Name**: `LINE_CHANNEL_ACCESS_TOKEN`
   - **Value**: Token ที่คัดลอกมา
   - **Environment**: Production, Preview, Development (เลือกทั้งหมด)
3. กด "Save"
4. **สำคัญ**: ต้อง Redeploy เพื่อให้ environment variable ใหม่มีผล

### ขั้นตอนที่ 4: เปิดใช้งาน Push Messages

1. ไปที่ LINE Developers Console → Channel → Settings
2. เปิด "Allow bot to send push messages"
3. บันทึกการตั้งค่า

### ขั้นตอนที่ 5: Redeploy

```bash
vercel --prod
```

## ทดสอบการส่งข้อความ

### วิธีที่ 1: ผ่าน Admin Dashboard

1. อนุมัติสลิปเงินโอน
2. ตรวจสอบ logs ใน Vercel
3. ตรวจสอบว่า LINE User ID มีในฐานข้อมูล

### วิธีที่ 2: ใช้ API โดยตรง

```bash
curl -X POST https://api.line.me/v2/bot/message/push \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_CHANNEL_ACCESS_TOKEN" \
  -d '{
    "to": "LINE_USER_ID",
    "messages": [
      {
        "type": "text",
        "text": "ทดสอบการส่งข้อความ"
      }
    ]
  }'
```

## ข้อผิดพลาดที่พบบ่อย

### Error: "Invalid channel access token"
- **สาเหตุ**: Token ไม่ถูกต้องหรือหมดอายุ
- **แก้ไข**: สร้าง token ใหม่ใน LINE Developers Console

### Error: "The user hasn't added the LINE Official Account as a friend"
- **สาเหตุ**: ลูกค้ายังไม่ได้ Add Bot เป็นเพื่อน
- **แก้ไข**: ลูกค้าต้อง Add Bot เป็นเพื่อนก่อน (หรือใช้ LINE Notify แทน)

### Error: "LINE_CHANNEL_ACCESS_TOKEN is not configured"
- **สาเหตุ**: Environment variable ไม่ได้ตั้งค่า
- **แก้ไข**: ตั้งค่าใน Vercel และ redeploy

### ไม่มี error แต่ไม่ได้รับข้อความ
- **สาเหตุ**: LINE User ID ไม่ถูกต้องหรือลูกค้ายังไม่ได้ Add Bot
- **แก้ไข**: ตรวจสอบ LINE User ID ในฐานข้อมูล

## หมายเหตุ

- LINE Messaging API ต้องให้ลูกค้า Add Bot เป็นเพื่อนก่อนถึงจะส่งข้อความได้
- ถ้าต้องการส่งข้อความโดยไม่ต้อง Add Bot ให้ใช้ LINE Notify แทน (แต่ต้องให้ลูกค้า authorize ก่อน)
- ตรวจสอบ logs ใน Vercel เพื่อดู error messages

