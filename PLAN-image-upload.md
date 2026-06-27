# 📐 خطة: رفع صور الجيم (وغيرها) على Cloudflare R2

> هذا الملف يرصد تفاصيل التصميم لنظام رفع الصور، لتنفيذه لاحقاً.
> أنشئ كجزء من Batch 0. الـ credentials مؤمّنة في `.env` (مش في الكود).

## الحالة الحالية (موجود جاهز)
- **قاعدة البيانات جاهزة**: `Gym.logoUrl` (String?), `Member.photoUrl`, `Profile.avatarUrl`, `Payment.receiptUrl`, `Expense.receiptUrl` — كلها أعمدة موجودة لكن غير مستخدمة.
- **بيانات R2 في `.env`** (محلي + سيرفر):
  ```
  R2_ACCOUNT_ID=8bfa627acdc4c71f61e84c73116805e9
  R2_ACCESS_KEY_ID=63e50a09e20c8890f355413d3a800f20
  R2_SECRET_ACCESS_KEY=...   #rotate this after deploy
  R2_BUCKET=opengym-media
  R2_ENDPOINT=https://8bfa627acdc4c71f61e84c73116805e9.r2.cloudflarestorage.com
  R2_PUBLIC_BASE_URL=https://media.openappo.com   # يتطلب إعداد DNS (انظر أسفل)
  ```
- **لا يوجد** كود رفع حالياً ولا مكتبة S3.

## ⚠️ أمان — يجب عمل rotate للـ token
الـ credentials اتكشفت في نص محادثة. **بعد أول deploy ناجح يستخدم R2، روح Cloudflare R2 → API Tokens → اعمل token جديد واحذف القديم، وحدّث القيم في `.env` (محلي + سيرفر).**

## خطوات التنفيذ (لما نرجعله)

### 1. تثبيت المكتبة
```bash
npm install @aws-sdk/client-s3
```
R2 متوافق مع S3 API، فنستخدم AWS SDK.

### 2. إعداد الـ bucket + DNS العام (يدوي على Cloudflare)
- **أنشئ الـ bucket** `opengym-media` في Cloudflare R2 dashboard (لو مش موجود).
- **خصّصه كعام** (Settings → Public access)، أو فعّل R2 custom domain:
  - أضف CNAME record `media.openappo.com` → الـ R2 public hostname (في لوحة DNS الخاصة بـ openappo.com).
  - في R2 dashboard → Custom Domains → add `media.openappo.com`.
- **بدلاً من ذلك** (أبسط، بدون DNS): استخدم رابط R2 العام الافتراضي `<bucket>.r2.dev` وحدّث `R2_PUBLIC_BASE_URL` بدلاً منه. لكنه طويل وغير براندينج.

### 3. طبقة التخزين — `lib/storage.ts` (جديد)
```ts
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const s3 = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID!,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
  },
})

export async function uploadToR2(
  file: Buffer,
  key: string,
  contentType: string
): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: process.env.R2_BUCKET,
    Key: key,
    Body: file,
    ContentType: contentType,
  }))
  return `${process.env.R2_PUBLIC_BASE_URL}/${key}`
}
```

### 4. API رفع اللوجو — `app/api/gyms/[gymSlug]/logo/route.ts` (جديد)
- **POST** (multipart, `FormData` مع `file`):
  - استلم الملف عبر `request.formData()`.
  - تحقق: نوع صورة فقط (`image/*`)، حجم < 2MB.
  - أنشئ مفتاحاً فريداً: `gyms/<gymId>/logo-<timestamp>.<ext>`.
  - `uploadToR2(buffer, key, contentType)` → رجّع URL.
  - `prisma.gym.update({ logoUrl: url })`.
  - رجّع `{ logoUrl }`.

### 5. توسيع PATCH gym route
في `app/api/gyms/[gymSlug]/route.ts`:
- GET: أضف `logoUrl: true` للـ select.
- PATCH: اقبل حقل `logoUrl` (اختياري).

### 6. واجهة الإعدادات
في `app/(dashboard)/dashboard/settings/page.tsx`، سيكشن "بيانات الجيم":
- اعرض صورة اللوجو الحالية (لو موجودة) + `<input type="file" accept="image/*">`.
- زر "رفع اللوجو" → POST FormData → حدّث الحالة + اعرض المعاينة.
- معالجة: loading، خطأ، حجم كبير.

### 7. عرض اللوجو
- في الـ Sidebar (`components/dashboard/Sidebar.tsx`) بدل أيقونة Dumbbell الثابتة: لو `gym.logoUrl` موجود اعرضه، وإلا fallback للأيقونة.
- في `/api/auth/me` + `lib/gym-context.ts`: تأكد إن `logoUrl` بيرجع (بالفعل بيرجع من gym-context — تأكد فقط).

## الاعتبارات
- **التحقق من الصلاحيات**: رفع اللوجو = مالك/مدير فقط (نفس guard PATCH gym الحالي).
- **الحد الأقصى للحجم**: 2MB. الأفضلية: أضف `sharp` لعمل resize/compress قبل الرفع (اختياري).
- **التنسيقات**: JPEG/PNG/WebP. ارفض GIF/AVIF/SVG (تجنب XSS عبر SVG).
- **إعادة التسمية**: استخدم UUID/timestamp دائماً، لا تقبل أسماء ملفات يقدمها المستخدم.
- **ملفات مستقبلية**: نفس النمط يصلح لـ `Member.photoUrl` و `Payment.receiptUrl` (استبدل المسار والـ guard).
