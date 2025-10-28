# دليل إعداد الشات بوت - مركز الفارس v4.0.0

## 📋 نظرة عامة

هذا الدليل يشرح كيفية إعداد وتفعيل الشات بوت الذكي على موقع مركز الفارس.

---

## 🔑 الخطوة 1: الحصول على المفاتيح المطلوبة

### 1.1 Google Gemini API Key

**الغرض:** محرك الذكاء الاصطناعي للشات بوت

**الخطوات:**
1. اذهب إلى: https://makersuite.google.com/app/apikey
2. سجّل الدخول بحساب Google
3. انقر على "Create API Key"
4. اختر مشروع موجود أو أنشئ مشروع جديد
5. انسخ API Key (يبدأ بـ `AIza...`)

**مثال:**
```
GOOGLE_API_KEY=AIzaSyBPd15DKs1umVpt2XhveF0si4vBgX9i24w
```

---

### 1.2 Telegram Bot Token

**الغرض:** إرسال تقارير التشخيص إلى Telegram

**الخطوات:**
1. افتح Telegram وابحث عن `@BotFather`
2. أرسل الأمر: `/newbot`
3. اختر اسماً للبوت (مثل: "Al-Fares Diagnostic Bot")
4. اختر username للبوت (يجب أن ينتهي بـ `bot`)
5. انسخ Token الذي يظهر (طويل جداً)

**مثال:**
```
TELEGRAM_BOT_TOKEN=8454425098:AAFx6QDdc-zHkxlkFsq01Z59G7Tni_WcFRY
```

---

### 1.3 Telegram Chat ID

**الغرض:** تحديد المحادثة التي سيرسل إليها البوت التقارير

**الخطوات:**
1. أرسل رسالة إلى البوت الذي أنشأته (أي رسالة)
2. افتح المتصفح واذهب إلى:
   ```
   https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates
   ```
   استبدل `<YOUR_BOT_TOKEN>` بالـ Token الذي حصلت عليه
3. ابحث عن `"chat":{"id":` في النتيجة
4. انسخ الرقم الذي يظهر بعدها

**مثال:**
```
TELEGRAM_CHAT_ID=7244203502
```

---

### 1.4 WhatsApp Phone Number & CallMeBot API Key

**الغرض:** إرسال تقارير التشخيص إلى WhatsApp

**الخطوات:**
1. اذهب إلى: https://www.callmebot.com/blog/free-api-whatsapp-messages/
2. اتبع التعليمات:
   - أضف رقم CallMeBot إلى جهات الاتصال: `+34 644 51 44 13`
   - أرسل رسالة WhatsApp إلى هذا الرقم:
     ```
     I allow callmebot to send me messages
     ```
   - ستحصل على API Key في الرد
3. استخدم رقم هاتفك بصيغة دولية (بدون + أو 00)

**مثال:**
```
WHATSAPP_PHONE_NUMBER=966507322542
CALLMEBOT_API_KEY=6720242
```

---

## 🚀 الخطوة 2: إضافة المفاتيح إلى Netlify

### 2.1 الدخول إلى Netlify Dashboard

1. اذهب إلى: https://app.netlify.com
2. اختر موقعك (مشروع مركز الفارس)
3. انقر على **Site settings**

### 2.2 إضافة Environment Variables

1. في القائمة الجانبية، اختر **Environment variables**
2. انقر على **Add a variable**
3. أضف كل متغير على حدة:

| Key | Value | مثال |
|-----|-------|------|
| `GOOGLE_API_KEY` | مفتاح Gemini الذي حصلت عليه | `AIzaSy...` |
| `TELEGRAM_BOT_TOKEN` | Token البوت من BotFather | `8454425098:AAFx...` |
| `TELEGRAM_CHAT_ID` | Chat ID من getUpdates | `7244203502` |
| `WHATSAPP_PHONE_NUMBER` | رقم هاتفك (صيغة دولية) | `966507322542` |
| `CALLMEBOT_API_KEY` | API Key من CallMeBot | `6720242` |

### 2.3 حفظ التغييرات

- انقر على **Save** بعد إضافة كل متغير
- **مهم:** لا تشارك هذه المفاتيح مع أحد!

---

## 🔄 الخطوة 3: إعادة النشر

بعد إضافة المتغيرات البيئية، يجب إعادة نشر الموقع:

### الطريقة 1: من Netlify Dashboard

1. اذهب إلى **Deploys**
2. انقر على **Trigger deploy**
3. اختر **Deploy site**

### الطريقة 2: من Git

```bash
# أي تعديل بسيط ثم push
git commit --allow-empty -m "Trigger redeploy"
git push origin main
```

---

## ✅ الخطوة 4: الاختبار

### 4.1 اختبار الشات بوت

1. افتح موقعك المنشور على Netlify
2. انقر على زر الشات بوت (💬)
3. ابدأ محادثة:
   - أرسل: "مرحباً"
   - يجب أن يرد البوت بالترحيب
4. أكمل المحادثة حتى النهاية

### 4.2 التحقق من الإشعارات

**Telegram:**
- افتح Telegram
- تحقق من وصول رسالة من البوت مع التقرير

**WhatsApp:**
- افتح WhatsApp
- تحقق من وصول رسالة من CallMeBot مع التقرير

---

## 🐛 استكشاف الأخطاء

### المشكلة: الشات بوت لا يرد

**الحلول:**
1. تحقق من إضافة `GOOGLE_API_KEY` بشكل صحيح
2. افتح **Netlify Functions Logs** وتحقق من الأخطاء
3. تأكد من أن Gemini API Key صالح وغير منتهي

### المشكلة: لا تصل رسائل Telegram

**الحلول:**
1. تحقق من `TELEGRAM_BOT_TOKEN` و `TELEGRAM_CHAT_ID`
2. أرسل رسالة جديدة للبوت وأعد الحصول على Chat ID
3. تأكد من أن البوت لم يتم حظره

### المشكلة: لا تصل رسائل WhatsApp

**الحلول:**
1. تحقق من أنك أرسلت رسالة التفعيل إلى CallMeBot
2. تأكد من أن رقم الهاتف بصيغة دولية صحيحة (بدون + أو 00)
3. تأكد من أن API Key صحيح

### المشكلة: خطأ CORS

**الحل:**
- تأكد من أن ملف `netlify/functions/chat.js` يحتوي على CORS headers
- الملف الحالي يحتوي عليها بالفعل

---

## 🔒 الأمان

### نصائح مهمة:

1. ✅ **لا تشارك المفاتيح:** احتفظ بها سرية
2. ✅ **استخدم Environment Variables:** لا تضعها في الكود
3. ✅ **راقب الاستخدام:** تحقق من استخدام Gemini API
4. ✅ **حدد الصلاحيات:** استخدم أقل الصلاحيات المطلوبة

---

## 📊 المراقبة

### Netlify Functions Logs

للتحقق من سجلات الشات بوت:

1. اذهب إلى Netlify Dashboard
2. اختر **Functions**
3. انقر على `chat`
4. اختر **Logs**

ستجد هنا:
- طلبات الشات بوت
- الأخطاء (إن وجدت)
- حالة الإرسال إلى Telegram/WhatsApp

---

## 🎨 التخصيص

### تعديل البرمجة التوجيهية (System Prompt)

لتغيير طريقة عمل الشات بوت:

1. افتح `netlify/functions/chat.js`
2. ابحث عن `const SYSTEM_PROMPT`
3. عدّل النص حسب احتياجاتك
4. احفظ وارفع إلى Git

**مثال:**
```javascript
const SYSTEM_PROMPT = `أنت "المُشخِّص الذكي"...
// عدّل هنا
`;
```

### تغيير نموذج Gemini

لاستخدام نموذج مختلف:

```javascript
// في netlify/functions/chat.js
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp", // غيّر هنا
    systemInstruction: SYSTEM_PROMPT
});
```

**النماذج المتاحة:**
- `gemini-2.0-flash-exp` (الحالي - سريع ومجاني)
- `gemini-1.5-pro` (أقوى لكن أغلى)
- `gemini-1.5-flash` (متوازن)

---

## 📞 الدعم

إذا واجهت أي مشاكل:

1. راجع قسم **استكشاف الأخطاء** أعلاه
2. تحقق من Netlify Functions Logs
3. تواصل مع الدعم الفني

---

## ✅ قائمة التحقق النهائية

- [ ] حصلت على Gemini API Key
- [ ] أنشأت Telegram Bot وحصلت على Token
- [ ] حصلت على Telegram Chat ID
- [ ] فعّلت CallMeBot WhatsApp وحصلت على API Key
- [ ] أضفت جميع المتغيرات البيئية في Netlify
- [ ] أعدت نشر الموقع
- [ ] اختبرت الشات بوت بنجاح
- [ ] وصلت رسالة Telegram
- [ ] وصلت رسالة WhatsApp

---

**تم بنجاح! 🎉**

الشات بوت الآن جاهز للعمل على موقعك.

