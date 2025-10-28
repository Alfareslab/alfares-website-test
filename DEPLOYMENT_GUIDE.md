# دليل النشر - مركز الفارس v4.2.0

## 📋 نظرة عامة

هذا الدليل يشرح كيفية نشر موقع مركز الفارس v4.2.0 (مع الشات بوت المحسّن) على Netlify.

### ✨ جديد في v4.2.0
- ✅ **Background Functions:** مهلة 15 دقيقة للاستقرار الكامل
- ✅ **Retry Logic:** معالجة أخطاء Gemini API تلقائياً
- ✅ **رقم الإصدار:** ظاهر في أسفل الموقع

---

## 🚀 الطريقة الموصى بها: Netlify + GitHub

### المميزات:
- ✅ **مجاني للأبد** - لا تكاليف شهرية
- ✅ **نشر تلقائي** - عند كل push إلى GitHub
- ✅ **HTTPS مجاني** - شهادة SSL تلقائية
- ✅ **CDN عالمي** - سرعة عالية في جميع أنحاء العالم
- ✅ **Netlify Background Functions** - دعم الشات بوت بدون سيرفر (مهلة 15 دقيقة)

---

## 📦 الخطوة 1: رفع المشروع إلى GitHub

### 1.1 إنشاء مستودع جديد

1. اذهب إلى: https://github.com/new
2. اختر اسماً للمستودع (مثل: `alfares-center-website`)
3. اجعله **Private** (خاص) لحماية المحتوى
4. **لا تضف** README أو .gitignore أو LICENSE

### 1.2 رفع الملفات

```bash
# في مجلد المشروع
cd alfares-v4.2.0

# تهيئة Git
git init
git add .
git commit -m "Initial commit - v4.2.0 with Stable AI Chatbot"

# ربط بـ GitHub
git remote add origin https://github.com/YOUR_USERNAME/alfares-center-website.git
git branch -M main
git push -u origin main
```

---

## 🌐 الخطوة 2: ربط Netlify بـ GitHub

### 2.1 إنشاء حساب Netlify

1. اذهب إلى: https://app.netlify.com/signup
2. سجّل باستخدام حساب GitHub (موصى به)

### 2.2 إضافة موقع جديد

1. انقر على **Add new site**
2. اختر **Import an existing project**
3. اختر **GitHub**
4. ابحث عن مستودعك (`alfares-center-website`)
5. انقر عليه

### 2.3 إعدادات النشر

**Build settings:**
- **Branch to deploy:** `main`
- **Build command:** (اتركه فارغاً)
- **Publish directory:** `.` (نقطة)

انقر على **Deploy site**

---

## 🔑 الخطوة 3: إضافة المتغيرات البيئية للشات بوت

### 3.1 الحصول على المفاتيح

راجع ملف `CHATBOT_SETUP.md` للحصول على:
- `GOOGLE_API_KEY`
- `TELEGRAM_BOT_TOKEN`
- `TELEGRAM_CHAT_ID`
- `WHATSAPP_PHONE_NUMBER`
- `CALLMEBOT_API_KEY`

### 3.2 إضافتها في Netlify

1. في Netlify Dashboard، اختر موقعك
2. اذهب إلى **Site settings**
3. اختر **Environment variables**
4. انقر على **Add a variable**
5. أضف كل متغير:

```
GOOGLE_API_KEY=your_gemini_api_key
TELEGRAM_BOT_TOKEN=your_telegram_bot_token
TELEGRAM_CHAT_ID=your_telegram_chat_id
WHATSAPP_PHONE_NUMBER=966507322542
CALLMEBOT_API_KEY=your_callmebot_key
```

6. احفظ كل متغير

---

## 🔄 الخطوة 4: إعادة النشر

بعد إضافة المتغيرات البيئية:

1. اذهب إلى **Deploys**
2. انقر على **Trigger deploy**
3. اختر **Deploy site**

انتظر حتى يكتمل النشر (1-2 دقيقة).

---

## ✅ الخطوة 5: الاختبار

### 5.1 فتح الموقع

1. في Netlify Dashboard، انسخ رابط الموقع (مثل: `https://your-site-name.netlify.app`)
2. افتحه في المتصفح

### 5.2 اختبار الشات بوت

1. انقر على زر الشات بوت (💬)
2. ابدأ محادثة
3. تحقق من:
   - الردود من AI
   - إرسال التقارير إلى Telegram
   - إرسال التقارير إلى WhatsApp

---

## 🌍 الخطوة 6: ربط دومين مخصص (اختياري)

### 6.1 إضافة دومين

1. في Netlify Dashboard، اذهب إلى **Domain settings**
2. انقر على **Add custom domain**
3. أدخل دومينك (مثل: `alfarescenter.com`)

### 6.2 تحديث DNS

في لوحة تحكم الدومين الخاص بك، أضف:

**A Record:**
```
Type: A
Name: @
Value: 75.2.60.5
```

**CNAME Record (للـ www):**
```
Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

### 6.3 تفعيل HTTPS

Netlify سيفعّل HTTPS تلقائياً خلال دقائق.

---

## 🔄 التحديثات المستقبلية

### نشر تلقائي

بعد الإعداد الأولي، أي تحديث يتم تلقائياً:

```bash
# عدّل الملفات
# ثم:
git add .
git commit -m "Update content"
git push origin main

# Netlify سينشر تلقائياً!
```

---

## 📊 المراقبة

### Netlify Analytics

1. اذهب إلى **Analytics**
2. فعّل **Netlify Analytics** (مدفوع - اختياري)

### Functions Logs

لمراقبة الشات بوت:

1. اذهب إلى **Functions**
2. انقر على `chat`
3. اختر **Logs**

---

## 🐛 استكشاف الأخطاء

### المشكلة: الموقع لا يعمل

**الحلول:**
1. تحقق من **Deploy log** في Netlify
2. تأكد من أن جميع الملفات موجودة في GitHub
3. تحقق من أن `index.html` في المجلد الرئيسي

### المشكلة: الشات بوت لا يعمل

**الحلول:**
1. تحقق من إضافة جميع المتغيرات البيئية
2. راجع **Functions logs**
3. تأكد من صحة المفاتيح

### المشكلة: خطأ 404

**الحل:**
- تحقق من أن **Publish directory** هو `.` (نقطة)

---

## 🔒 الأمان

### نصائح مهمة:

1. ✅ **لا تضع المفاتيح في الكود**
2. ✅ **استخدم Environment Variables**
3. ✅ **اجعل المستودع Private**
4. ✅ **راقب استخدام API**

---

## 📋 قائمة التحقق النهائية

- [ ] رفعت المشروع إلى GitHub
- [ ] ربطت Netlify بـ GitHub
- [ ] أضفت جميع المتغيرات البيئية
- [ ] أعدت نشر الموقع
- [ ] اختبرت الموقع بنجاح
- [ ] اختبرت الشات بوت بنجاح
- [ ] (اختياري) ربطت دومين مخصص

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع **Deploy log** في Netlify
2. راجع **Functions logs**
3. راجع ملف `CHATBOT_SETUP.md`

---

## 🎉 تهانينا!

موقعك الآن منشور ويعمل بكامل طاقته مع الشات بوت الذكي!

**رابط الموقع:** `https://your-site-name.netlify.app`

---

**الإصدار:** v4.0.0  
**آخر تحديث:** 2025-10-28
