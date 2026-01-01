# คู่มือการทดสอบระบบตรวจสอบสลิปเงินโอน

## 1. ทดสอบใน Local (Development)

### ขั้นตอนที่ 1: รัน Development Server
```bash
npm run dev
```

### ขั้นตอนที่ 2: ทดสอบ Customer App (อัปโหลดสลิป)

1. **เปิด LINE App บนมือถือ** และไปที่ LIFF App URL:
   ```
   https://loyalty-point-crm.vercel.app/customer/login
   ```
   หรือถ้ารัน local:
   ```
   http://localhost:3000/customer/login
   ```

2. **Login ด้วย LINE** (ระบบจะสร้าง profile อัตโนมัติ)

3. **ไปที่หน้า "อัปโหลดสลิป"** (เมนูด้านล่าง)

4. **ทดสอบอัปโหลดสลิป**:
   - กด "เลือกไฟล์" หรือ "ถ่ายรูป"
   - เลือก/ถ่ายรูปสลิปเงินโอน
   - รอระบบประมวลผล OCR (จะใช้เวลา 10-30 วินาที)
   - ตรวจสอบข้อมูลที่ OCR อ่านได้:
     - จำนวนเงิน
     - วันที่
     - เลขที่อ้างอิง
   - แก้ไขข้อมูลได้ถ้าจำเป็น
   - กด "ส่งให้ Admin ตรวจสอบ"

5. **ตรวจสอบผลลัพธ์**:
   - ควรเห็นข้อความ "ส่งสลิปสำเร็จ รอ Admin ตรวจสอบ"
   - สลิปจะถูกบันทึกในฐานข้อมูลด้วย status = "pending"

### ขั้นตอนที่ 3: ทดสอบ Admin Dashboard (ตรวจสอบสลิป)

1. **เปิด Admin Dashboard**:
   ```
   http://localhost:3000
   ```
   หรือ
   ```
   https://loyalty-point-crm.vercel.app
   ```

2. **ไปที่เมนู "ตรวจสอบสลิป"** (ควรเห็น notification badge แสดงจำนวนสลิปรอตรวจสอบ)

3. **ตรวจสอบรายการสลิป**:
   - ควรเห็นสลิปที่ลูกค้าส่งมา
   - ดูรูปสลิป
   - ดูข้อมูลที่ OCR อ่านได้
   - ดูข้อมูลลูกค้า

4. **ทดสอบอนุมัติสลิป**:
   - กดปุ่ม "ตรวจสอบ"
   - ตรวจสอบข้อมูลใน dialog
   - แก้ไขจำนวนแต้มได้ถ้าจำเป็น
   - กด "อนุมัติ"
   - ตรวจสอบว่า:
     - สลิปเปลี่ยน status เป็น "approved"
     - แต้มของลูกค้าเพิ่มขึ้นตามที่อนุมัติ

5. **ทดสอบปฏิเสธสลิป** (ถ้าต้องการ):
   - กดปุ่ม "ปฏิเสธ"
   - ระบุเหตุผล
   - กด "ยืนยันการปฏิเสธ"
   - ตรวจสอบว่า status เปลี่ยนเป็น "rejected"

## 2. ทดสอบใน Production (Vercel)

### ขั้นตอนที่ 1: Deploy ไปยัง Vercel

```bash
# Commit และ push code
git add .
git commit -m "Add slip verification system with OCR"
git push origin main

# Deploy to Vercel
vercel --prod
```

### ขั้นตอนที่ 2: ตรวจสอบ Environment Variables

ตรวจสอบว่าใน Vercel มี environment variables ครบ:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_LIFF_ID`
- `LINE_CHANNEL_ACCESS_TOKEN` (ถ้าใช้ LINE Bot)

### ขั้นตอนที่ 3: ทดสอบเหมือน Local

ใช้ URL ของ Vercel แทน localhost

## 3. Checklist การทดสอบ

### Customer App
- [ ] Login ด้วย LINE ได้
- [ ] อัปโหลดรูปสลิปได้
- [ ] OCR อ่านข้อมูลได้ (จำนวนเงิน, วันที่, เลขที่อ้างอิง)
- [ ] แก้ไขข้อมูลได้
- [ ] ส่งสลิปสำเร็จ

### Admin Dashboard
- [ ] เห็น notification badge แสดงจำนวนสลิปรอตรวจสอบ
- [ ] เห็นรายการสลิปที่รอตรวจสอบ
- [ ] ดูรูปสลิปได้
- [ ] ดูข้อมูล OCR ได้
- [ ] อนุมัติสลิปได้
- [ ] แต้มของลูกค้าเพิ่มขึ้นหลังอนุมัติ
- [ ] ปฏิเสธสลิปได้ (ถ้าต้องการ)

### Database
- [ ] สลิปถูกบันทึกใน `slip_submissions` table
- [ ] Transaction ถูกบันทึกใน `point_transactions` table
- [ ] แต้มของลูกค้าใน `profiles` table อัปเดตถูกต้อง

### Storage
- [ ] รูปสลิปถูกอัปโหลดไปยัง Supabase Storage
- [ ] สามารถดูรูปสลิปได้ (public URL)

## 4. ปัญหาที่อาจพบและวิธีแก้ไข

### OCR ไม่ทำงาน
- **สาเหตุ**: Tesseract.js ต้องโหลด model ครั้งแรก (ใช้เวลา)
- **วิธีแก้**: รอสักครู่ หรือลองอัปโหลดใหม่

### อัปโหลดรูปไม่ได้
- **สาเหตุ**: Storage policies ไม่ถูกต้อง
- **วิธีแก้**: ตรวจสอบ policies ใน Supabase Dashboard

### อนุมัติแล้วแต้มไม่เพิ่ม
- **สาเหตุ**: Error ในการอัปเดตแต้ม
- **วิธีแก้**: ตรวจสอบ console logs และ database

## 5. Tips สำหรับการทดสอบ

1. **ใช้รูปสลิปจริง** เพื่อทดสอบ OCR accuracy
2. **ทดสอบหลายรูปแบบ**:
   - สลิปที่ชัดเจน
   - สลิปที่เบลอ
   - สลิปที่มีแสงสว่าง/มืด
3. **ตรวจสอบ edge cases**:
   - สลิปที่ OCR อ่านไม่ได้
   - จำนวนเงินที่ผิดปกติ
   - สลิปซ้ำ (เลขที่อ้างอิงซ้ำ)

