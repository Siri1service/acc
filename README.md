# AccData - Cloud Accounting & Tax ERP


---

## 🚀 ฟังก์ชันหลักของระบบ (Core Features)

### 1. แดชบอร์ดภาพรวมการเงิน (Executive Dashboard)
- **กราฟยอดขายจริงย้อนหลัง**: คำนวณจากใบเสร็จรับเงิน (`RE`) และรายการขายเงินสด (`CASH`) ที่ชำระแล้วเสร็จจริง สามารถเลือกช่วงเวลาได้: 7 วันล่าสุด, เดือนนี้, ไตรมาส, ปีนี้
- **Live Thai Bank Feeds**: เชื่อมต่อ API ธนาคารในไทย (KBANK, SCB, BBL, KTB, BAY, GSB) แสดงยอดเงินสดปัจจุบันแบบเรียลไทม์ พร้อมปุ่มซิงค์ข้อมูล
- **Document Pipeline Stepper**: แสดงลำดับความคืบหน้าของเอกสารขายทั้งระบบ
- **Reconciliation & Quick Slip Check**: ตรวจสอบสลิปโอนเงินแบบเร่งด่วน

### 2. ระบบเอกสารขาย & การเชื่อมโยงสถานะ (Sales Pipeline)
- **ใบเสนอราคา (Quotation - QT)**
- **ใบวางบิล / แจ้งหนี้ (Billing Note - BL)**
- **ใบกำกับภาษี (Tax Invoice - TAX)**
- **ใบเสร็จรับเงิน (Official Receipt - RE)**: *สามารถแก้ไขได้ก่อนอนุมัติ* (เช่น เลขที่เอกสาร, ยอดชำระ, วันที่ชำระ, รูปแบบการจ่ายเงิน: เงินสด, เงินโอนเข้าบัญชีธนาคารที่กำหนด, เช็ค)
- **ขายเงินสด (Cash Sale - CS)**: รวมใบกำกับภาษี + ใบเสร็จรับเงินในตัว
- **ใบลดหนี้ (Credit Note - CN)** & **ใบเพิ่มหนี้ (Debit Note - DN)**
- **ระบบสลับและแปลงสถานะใน 1 คลิก**: QT ➔ BL ➔ TAX ➔ RE
- **ปรับแต่งเลขที่เอกสารอัตโนมัติ**: กำหนดคำนำหน้า (Prefix) ของแต่ละหมวดหมู่ได้จากหน้าตั้งค่า

### 3. เอกสารซื้อ (Purchase Pipeline)
- **ใบสั่งซื้อ (Purchase Order - PO)**
- **ใบรับสินค้า (Goods Receipt - GR)** เชื่อมโยงตัดยอดเข้าสต็อกอัตโนมัติ

### 4. ค่าใช้จ่ายและภาษี (Tax & Expenses)
- **ภาษีมูลค่าเพิ่ม (VAT 7%)**: รายงานภาษีขาย vs ภาษีซื้อ, คำนวณแบบ **ภ.พ. 30** พร้อมยอดที่ต้องชำระหรือขอคืน
- **ภาษีหัก ณ ที่จ่าย**: แบบ **ภ.ง.ด. 3** (บุคคลธรรมดา) และ **ภ.ง.ด. 53** (นิติบุคคล) อัตรา 1%, 2%, 3%, 5%
- **หนังสือรับรองการหักภาษี ณ ที่จ่าย (มาตรา 50 ทวิ)**: แสดงตัวอย่างและพิมพ์ได้ทันที

### 5. การจัดการสินค้าและสต็อก (Inventory Hub)
- แค็ตตาล็อกสินค้า, SKU, บาร์โค้ด 1D/2D (EAN-13), ราคาทุน, ราคาขาย
- ระบบแจ้งเตือนจุดสั่งซื้อซ้ำ (Reorder Point Alert)
- ปรับยอดสต็อกสินค้าเข้า/ออก พร้อมบันทึกประวัติ

### 6. สมุดรายชื่อผู้ติดต่อ (CRM & DBD AI)
- รายชื่อลูกค้าและคู่ค้า
- ระบบตรวจสอบสถานะนิติบุคคลผ่าน **DBD AI** ด้วยเลข 13 หลัก
- ตรวจสอบเครดิตเทอมและวงเงินเครดิตสูงสุด

### 7. โลจิสติกส์ & ใบปะหน้าพัสดุ (Logistics & Shipping Labels)
- เชื่อมต่อ API ขนส่งชั้นนำ: **Flash Express, Kerry (KEX), ไปรษณีย์ไทย (EMS), J&T Express**
- พิมพ์ใบปะหน้าพัสดุมาตรฐานขนาด **4x6 นิ้ว** พร้อม Barcode และ QR Code
- สเต็ปเปอร์ติดตามสถานะ: รอส่งมอบ ➔ เข้ารับแล้ว ➔ กำลังจัดส่ง ➔ นำจ่ายสำเร็จ
- รองรับการเก็บเงินปลายทาง (COD)

### 8. ระบบตรวจสอบยอดโอน (Bank Slip Verification)
- อัพโหลดสลิปธนาคาร ตรวจจับยอดเงินและบัญชีต้นทาง-ปลายทาง
- จับคู่บิลที่รอยืนยันยอดเงิน และอนุมัติปรับสถานะบิลเป็นชำระแล้วเสร็จใน 1 คลิก

### 9. เทมเพลตเอกสาร PDF & การส่งออกข้อมูล
- **เลือกได้ 5 เทมเพลตมาตรฐาน**:
  1. *Modern Indigo & Teal*: โมเดิร์นคอร์ปอเรท สวยงาม ทันสมัย
  2. *Minimal Professional*: เรียบหรู ทางการ โทนเทาเข้ม
  3. *Cyber Tech Slate*: ดีไซน์เทคโนโลยี ไฮเทค คมชัด
  4. *ตารางมาตรฐานสรรพากร*: แบบฟอร์มทางการตามระเบียบกรมสรรพากร
  5. *สลิป 80mm (Thermal POS)*: สำหรับเครื่องพิมพ์สลิปใบเสร็จอย่างย่อ
- รองรับการพิมพ์ทั้งขนาด **A4** และ **สลิป 80mm**
- **Import / Export ข้อมูลผ่าน Excel และ CSV**

### 10. ระบบผู้ใช้งาน 3 รูปแบบ & Gmail การตลาด
1. **Admin**: ผู้ดูแลระบบสูงสุด ควบคุมภาพรวม, บัญชีธนาคาร, สิทธิ์, ผังบัญชี, ตั้งค่า และส่งแคมเปญการตลาด
2. **userSeller**: บุคลากรทีมขายในหน่วยงาน ร่วมใช้ฐานข้อมูลเดียวกัน ออกใบเสนอราคา/วางบิล
3. **user**: เจ้าหน้าที่ทั่วไปตามสิทธิ์ที่ได้รับมอบหมาย
- **Gmail Marketing Tool**: Admin สามารถเขียนและส่งอีเมลโปรโมชั่น/แจ้งข่าวสารผ่าน Gmail ไปยังกลุ่มลูกค้าเป้าหมาย
- **Security Audit Trail**: บันทึกประวัติการกระทำและกิจกรรมความปลอดภัยทุกรายการ

### 11. การเข้าสู่ระบบด้วย Gmail & การลงทะเบียน Onboarding
- เข้าสู่ระบบครั้งแรก: เลือก **บุคคลธรรมดา / นิติบุคคล**, ชื่อ, รายละเอียดใบกำกับภาษี, ที่อยู่จัดส่ง และเลือกฟังก์ชันเริ่มต้น
- เข้าสู่ระบบครั้งถัดไป: สลับเลือกองค์กร หรือ UserData ที่ได้รับเชิญเข้าใช้งาน (**Multi-Tenant**)

### 12. หน้าตั้งค่าระบบ (Settings Switchboard)
- สวิตช์เปิด/ปิดฟังก์ชันที่ต้องการใช้งาน หรือซ่อนระบบที่ไม่ต้องการ
- ปรับแต่งคำนำหน้าเลขที่เอกสาร
- จัดการบัญชีธนาคารในไทย
- เชื่อมต่อ Supabase PostgreSQL และ LINE Notify / Messaging API

---

## 🛠️ การติดตั้งและรันในเครื่อง (Local Development with Bun)

```bash
# 1. ติดตั้ง Dependencies ด้วย Bun
bun install

# 2. รันโหมด Development
bun run dev

# 3. ทดสอบ Build เพื่อตรวจสอบความถูกต้อง
bun run build
```

---

## ☁️ การเชื่อมต่อฐานข้อมูล Supabase PostgreSQL

1. สร้างโปรเจกต์ใหม่บน [Supabase](https://supabase.com)
2. เข้าไปที่เมนู **SQL Editor** บน Dashboard ของ Supabase
3. คัดลอกคำสั่งทั้งหมดจากไฟล์ `supabase/schema.sql` แล้วกด **Run**
4. นำ URL และ Anon Key มาใส่ในไฟล์ `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```

---

## 🚀 การ Deploy ขึ้น Vercel

ระบบได้เตรียมไฟล์ `vercel.json` ไว้เรียบร้อยแล้ว:

1. Push โค้ดขึ้น GitHub / GitLab / Bitbucket
2. Import repository เข้าสู่ [Vercel](https://vercel.com)
3. กำหนดค่าในส่วนของ Build Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `bun run build`
   - **Output Directory**: `dist`
   - **Install Command**: `bun install`
4. ระบุ Environment Variables (หากต้องการเชื่อมต่อ Supabase):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
5. กด **Deploy** เว็บแอปพลิเคชันจะพร้อมใช้งานได้ทันทีทั่วโลก

---

## 📱 การใช้งานบน iOS และ Android (PWA)

เว็บแอปพลิเคชันนี้รองรับ PWA (Progressive Web App):
- **iOS (Safari)**: กดปุ่มแชร์ ➔ เลือก **"Add to Home Screen" (เพิ่มไปยังหน้าจอโฮม)**
- **Android (Chrome)**: กดจุดสามจุด ➔ เลือก **"Install app" (ติดตั้งแอป)**
แอปจะมีไอคอนบนหน้าจอและทำงานแบบเต็มหน้าจอ (Standalone) พร้อม Bottom Navigation Bar สำหรับมือถือโดยเฉพาะ

## สมัครและเข้าใช้งาน Online

**ไม่มีรหัสผ่านแอดมินกลาง** สมัครและเข้าสู่ระบบด้วยบัญชี Google; บัญชีใหม่จะได้สิทธิ์ `user` ก่อน ผู้ดูแลคนแรกต้องถูกเลื่อนสิทธิ์ในฐานข้อมูลโดยเจ้าของ Supabase Project

### ตั้งค่า Supabase ครั้งแรก

1. สร้าง Supabase Project แล้วคัดลอก **Project URL** กับ **Publishable key** (หรือ `anon` key รุ่นเก่า) จากหน้า Project API settings
2. เปิดเว็บ AccData จะเห็นหน้าตั้งค่า Supabase ถ้ายังไม่มีค่าเชื่อมต่อ กรอก URL และ key ดังกล่าวได้เลย หรือใส่ใน `.env` เป็น `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY` แล้ว restart dev server
3. เปิด Supabase **SQL Editor** วางเนื้อหาทั้งไฟล์ `supabase/schema.sql` แล้วกด Run เพื่อสร้างตาราง, Google user profile, เลขเอกสาร และนโยบาย RLS สำหรับแยกข้อมูลองค์กร
4. ตั้ง Google OAuth: ไปที่ **Authentication → Providers → Google** แล้วใส่ OAuth Client ID/Secret ที่สร้างจาก Google Cloud Console; ใช้ callback URL ที่ Supabase แสดงในหน้านั้น (รูปแบบ `https://<project-ref>.supabase.co/auth/v1/callback`)
5. ใน **Authentication → URL Configuration** ใส่ URL เว็บ AccData ทั้งตอนพัฒนาและ URL production ที่ Redirect URLs เช่น `http://localhost:5173/**` และ `https://your-domain.example/**`
6. เริ่มเว็บด้วย `bun run dev` เปิด URL ที่แสดง แล้วกด **เข้าสู่ระบบด้วย Google** การสมัครครั้งแรกจะสร้างโปรไฟล์ `user` อัตโนมัติ

### กำหนดผู้ดูแลระบบ

หลังจากผู้ดูแลเข้าสู่ระบบ Google อย่างน้อยหนึ่งครั้ง ให้เจ้าของ Supabase Project เปิด SQL Editor และรันคำสั่งนี้ โดยแทนอีเมลให้ตรงกับบัญชี Google ที่ใช้สมัคร:

```sql
UPDATE public.user_profiles
SET role = 'admin'
WHERE lower(email) = lower('admin@yourcompany.com');
```

ตรวจผลลัพธ์ว่ามี 1 แถวถูกแก้ไข แล้ว refresh หน้าเว็บ สิทธิ์ `admin` จะถูกอ่านจากโปรไฟล์ในฐานข้อมูล ไม่มีรหัสแอดมินให้กรอกหรือแชร์ ใช้ Google Workspace ของบริษัท เปิด MFA/passkey และเก็บ recovery methods ไว้กับผู้รับผิดชอบ

**ห้ามใส่ `service_role` key ในเว็บหรือ `.env` ของ Vite** ใช้เฉพาะ Publishable/Anon key ซึ่งออกแบบมาสำหรับ client และพึ่ง RLS ควบคุมสิทธิ์ ตาราง tenant เปิดให้อ่าน/เขียนเฉพาะผู้ใช้ที่เป็นเจ้าขององค์กรหรือถูกเพิ่มใน `organization_members` เท่านั้น การเพิ่มสมาชิกองค์กรที่มีอยู่ทำได้โดยเจ้าของผ่าน SQL Editor:

```sql
INSERT INTO public.organization_members (organization_id, user_id, role)
SELECT o.id, p.id, 'user'
FROM public.organizations o
JOIN public.user_profiles p ON lower(p.email) = lower('staff@yourcompany.com')
WHERE o.tax_id = 'เลขประจำตัวผู้เสียภาษีองค์กร';
```

ค่า `.env` ใน checkout นี้ยังเป็น placeholder จึงต้องใส่ URL/key ของ Supabase Project จริงก่อน ระบบจะเชื่อมออนไลน์และบันทึกข้อมูลข้ามอุปกรณ์ได้
