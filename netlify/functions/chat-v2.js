/**
 * Al-Fares Chatbot API - Netlify Function
 * Version: 4.2.5
 * Last Updated: 2025-10-30
 * Description: Chatbot backend with Gemini AI, Telegram & WhatsApp notifications
 * Changes: Renamed to chat-v2.js to force Netlify cache refresh + Added detailed logging
 */

// استيراد المكتبات اللازمة
const { GoogleGenerativeAI } = require('@google/generative-ai');
const TelegramBot = require('node-telegram-bot-api');
const https = require('https'); 

// قراءة المفاتيح من متغيرات البيئة لضمان الأمان
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

// متغيرات واتساب
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;

// ********************************************************************************************************************************************************
// *** البرمجة التوجيهية (System Prompt 2.0) - المحتوى القابل للتعديل ***
// ********************************************************************************************************************************************************

const SYSTEM_PROMPT = "أنت \"المُشخِّص الذكي\"، مساعد فني خبير ومتعدد اللغات يعمل في \"مركز الفارس لصيانة الكمبيوتر واستعادة البيانات\".\n" +
"مهمتك الأساسية: التحدث مع العملاء بأسلوب ودود ومهني لتشخيص مشاكل أجهزتهم. يجب عليك تحديد لغة العميل (عربي أو إنجليزي) من رسالته الأولى والتفاعل معه بنفس اللغة طوال المحادثة.\n" +
"هدفك النهائي: جمع مجموعة محددة ومفصلة من المعلومات. المعلومات المطلوبة هي:\n" +
"1. الخدمة المطلوبة: (استعادة بيانات، صيانة كمبيوتر، أو صيانة Mac).\n" +
"2. نوع الجهاز: (لابتوب، هارد ديسك، SSD، فلاشة، جهاز Mac... إلخ).\n" +
"3. معلومات الجهاز الدقيقة (إذا أمكن):\n" +
"   - بالنسبة لوسائط التخزين (HDD/SSD): اسأل عن الموديل والسعة التخزينية (مثال: \"هل تعرف موديل الهارد ديسك أو سعته؟ مثل 1TB أو 500GB\").\n" +
"   - بالنسبة لأجهزة الكمبيوتر/Mac: اسأل عن الموديل أو سنة الصنع التقريبية.\n" +
"4. وصف دقيق للمشكلة: (ماذا يحدث بالضبط؟ هل هناك أصوات؟ رسائل خطأ؟ ضرر مادي؟).\n" +
"5. محاولات الإصلاح السابقة (مهم جدًا): اسأل بوضوح عما إذا كان قد تم إجراء أي محاولات إصلاح سابقة، سواء من قبل العميل أو فني آخر. يجب أن يشمل هذا:\n" +
"   - محاولات مادية: \"هل تم فتح الجهاز أو محاولة إصلاحه في مكان آخر؟\"\n" +
"   - محاولات برمجية: \"هل حاولت استخدام أي برامج للصيانة أو لاستعادة البيانات؟\"\n" +
"6. اسم العميل.\n" +
"7. رقم هاتف العميل.\n" +
"8. لغة العميل: (يجب تحديدها تلقائيًا: العربية أو الإنجليزية).\n\n" +
"قواعد الحوار:\n" +
"1. ابدأ دائمًا بسؤال ترحيبي عام باللغتين: "مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني (v4.2.5)، كيف يمكنني مساعدتك اليوم؟"\"\n" +
"2. من رد العميل الأول، حدد لغته وأكمل المحادثة بها.\n" +
"3. قاعدة الحوار المتدرج (مهمة جدًا): لا تطرح جميع أسئلتك دفعة واحدة. ابدأ بسؤال واحد فقط. بناءً على إجابة العميل، اطرح السؤال التالي الأكثر منطقية. اجعل الحوار طبيعيًا وتفاعليًا، كأنك تجري محادثة حقيقية، وليس كأنك تملأ استمارة. هدفك هو جمع كل المعلومات، ولكن بطريقة سلسة ومتدرجة.\n" +
"4. قاعدة التوجيه للمركز: في ردودك، يمكنك الإشارة بلطف إلى أن هذه الأسئلة الدقيقة ضرورية لأن \"مركز الفارس\" يستخدم أدوات متخصصة وخبرات عالية لضمان أفضل النتائج، وأن التشخيص الدقيق هو أول خطوة لعملية إصلاح ناجحة.\n" +
"5. إذا كانت إجابة العميل غير واضحة أو ناقصة، اطرح أسئلة متابعة ذكية ومحددة للحصول على المعلومات المفقودة. لا تتردد في طرح عدة أسئلة للوصول إلى التفاصيل.\n" +
"6. عندما تجمع كل المعلومات المطلوبة، قم بصياغة ملخص واضح بلغة العميل وقدمه له للتأكيد.\n" +
"7. بعد تأكيد العميل، اختتم المحادثة بلغة العميل برسالة: \"ممتاز. لقد قمت بإرسال تقرير مفصل للفريق الفني، وسنتواصل معك قريبًا. [END_OF_CONVERSATION]\"\n" +
"8. مهم جدًا: لا تقدم أي حلول تقنية أو نصائح إصلاح بنفسك. مهمتك هي جمع المعلومات فقط.\n\n" +
"قاعدة التقرير النهائي (للإرسال إلى تيليجرام):\n" +
"يجب أن يكون التقرير النهائي الذي ترسله دائمًا باللغة العربية، بغض النظر عن لغة المحادثة مع العميل.\n" +
"يجب أن يكون التقرير منظماً ويحتوي على جميع البيانات التي تم جمعها، بما في ذلك \"لغة العميل\".";

// ********************************************************************************************************************************************************
// *** نهاية البرمجة التوجيهية (System Prompt 2.0) - المحتوى القابل للتعديل ***
// ********************************************************************************************************************************************************

// تهيئة Gemini (يتم تمرير SYSTEM_PROMPT هنا)
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash", 
    config: { systemInstruction: SYSTEM_PROMPT } 
});

// تهيئة Telegram Bot
const telegramBot = new TelegramBot(TELEGRAM_BOT_TOKEN);

/**
 * دالة مساعدة لتحويل سجل الحوار إلى تنسيق Gemini
 * @param {Array<Object>} history - سجل الحوار
 * @returns {Array<Object>} - سجل الحوار بتنسيق Gemini
 */
function formatHistory(history) {
    // نتجاهل الرسالة الترحيبية الأولى
    return history.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
}

/**
 * دالة لإرسال رسالة إلى واتساب عبر CallMeBot
 * @param {string} messageText - نص الرسالة
 */
async function sendToWhatsapp(messageText) {
    return new Promise((resolve, reject) => {
        try {
            const encodedText = encodeURIComponent(messageText);
            
            const url = 'https://api.callmebot.com/whatsapp.php?phone=' + WHATSAPP_PHONE_NUMBER + '&text=' + encodedText + '&apikey=' + CALLMEBOT_API_KEY;

            const req = https.request(url, { method: 'GET' }, (res) => {
                let data = '';
                res.on('data', (chunk) => { data += chunk; });
                res.on('end', () => {
                    // الحل: نعتبر أي رمز 200 نجاحاً، بغض النظر عن محتوى الجسم (الذي هو نص عادي)
                    if (res.statusCode === 200) {
                        resolve({ success: true, response: data });
                    } else {
                        resolve({ success: false, error: `Failed to send WhatsApp message. Response: ${data}` });
                    }
                });
            });

            req.on('error', (e) => {
                reject({ success: false, error: e.message });
            });

            req.end();

        } catch (error) {
            reject({ success: false, error: error.message });
        }
    });
}

/**
 * دالة لإرسال رسالة إلى تيليجرام
 * @param {string} messageText - نص الرسالة
 */
async function sendToTelegram(messageText) {
    try {
        await telegramBot.sendMessage(TELEGRAM_CHAT_ID, messageText, { parse_mode: 'Markdown' });
        return { success: true, response: 'Message sent.' };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * دالة لإرسال التقرير إلى تيليجرام
 * @param {Array<Object>} history - سجل الحوار الكامل
 * @param {string} finalResponse - الرد النهائي من Gemini
 * @returns {string} - نص التقرير المستخلص
 */
async function sendReportToTelegram(history, finalResponse) {
    const historyText = history.map(msg => (msg.sender === 'user' ? 'العميل' : 'المشخص') + ': ' + msg.text).join('\n');

    const extractionPrompt = "بناءً على سجل الحوار التالي، استخرج المعلومات المطلوبة وصغ تقريراً نهائياً باللغة العربية فقط.\n" +
    "يجب أن يكون التقرير منظماً وواضحاً، ويحتوي على جميع النقاط الثمانية المطلوبة في مهمتك (الخدمة، نوع الجهاز، معلومات الجهاز، وصف المشكلة، محاولات الإصلاح، اسم العميل، رقم الهاتف، لغة العميل).\n" +
    "سجل الحوار:\n" +
    "---\n" +
    historyText +
    "\n---\n" +
    "الرد النهائي من المشخص: " + finalResponse + "\n" +
    "التقرير المطلوب (باللغة العربية فقط):";
    
    let reportText = '';

    try {
        console.log('Extracting report from Gemini...');
        const result = await model.generateContent(extractionPrompt);
        reportText = result.response.text().trim();
        console.log('Report extracted successfully, length:', reportText.length);

        console.log('Sending report to Telegram...');
        const telegramResult = await sendToTelegram('*تقرير تشخيص جديد*\n\n' + reportText);
        
        if (telegramResult.success) {
            console.log('Telegram notification sent successfully');
            return reportText; 
        } else {
            console.error('Failed to send report to Telegram:', telegramResult.error);
            return ''; 
        }

    } catch (error) {
        console.error('Error during report extraction or sending to Telegram:', error.message);
        console.error('Full error:', error);
        return '';
    }
}

/**
 * دالة مساعدة لاستدعاء جميع الإشعارات
 * @param {Array<Object>} history - سجل الحوار الكامل
 * @param {string} finalResponse - الرد النهائي من Gemini
 */
async function sendReportNotifications(history, finalResponse) {
    console.log('Starting report notifications...');
    
    // 1. الإرسال إلى تيليجرام واستخلاص نص التقرير
    const reportText = await sendReportToTelegram(history, finalResponse);
    
    // 2. الإرسال إلى واتساب (فقط إذا تم استخلاص التقرير بنجاح)
    if (reportText) {
        console.log('Sending to WhatsApp...');
        const whatsappResult = await sendToWhatsapp('*تقرير تشخيص جديد*\n\n' + reportText);
        if (whatsappResult.success) {
            console.log('WhatsApp notification sent successfully');
        } else {
            console.error('Failed to send WhatsApp notification:', whatsappResult.error);
        }
    } else {
        console.error('No report text to send to WhatsApp');
    }
    
    console.log('Report notifications completed');
}

/**
 * دالة Netlify Function الرئيسية
 */
exports.handler = async (event, context) => {
    console.log('Function version: 4.2.5');
    
    // التأكد من أن الطلب هو POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ error: 'Method Not Allowed' })
        };
    }

    // تحليل جسم الطلب
    let body;
    try {
        body = JSON.parse(event.body);
    } catch (e) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Invalid JSON body' })
        };
    }

    const { history, newMessage } = body;

    if (!history || !newMessage) {
        return {
            statusCode: 400,
            body: JSON.stringify({ error: 'Missing history or newMessage in request body.' })
        };
    }

    try {
        // تهيئة Gemini مرة أخرى داخل الدالة لضمان استخدام المتغيرات البيئية المحدثة
        const localGenAI = new GoogleGenerativeAI(GEMINI_API_KEY);
        const localModel = localGenAI.getGenerativeModel({ 
            model: "gemini-2.5-flash", 
            config: { systemInstruction: SYSTEM_PROMPT } 
        });

        const historyText = formatHistory(history).map(msg => `${msg.role}: ${msg.parts[0].text}`).join('\n');
        
        const fullPrompt = SYSTEM_PROMPT + "\n\n" +
        "--- سجل الحوار السابق ---\n" +
        historyText +
        "\n\n" +
        "--- رسالة المستخدم الجديدة ---\n" +
        "user: " + newMessage;

        const result = await localModel.generateContent(fullPrompt);
        const geminiResponse = result.response.text();

        // التحقق مما إذا كان الحوار قد اكتمل باستخدام المعرف الفريد
        const isConversationComplete = geminiResponse.includes("[END_OF_CONVERSATION]");

        if (isConversationComplete) {
            const fullHistory = [...history, { sender: 'user', text: newMessage }, { sender: 'model', text: geminiResponse }];
            // استدعاء دالة الإشعارات الجديدة
            await sendReportNotifications(fullHistory, geminiResponse);
        }

        // إرجاع الرد
        return {
            statusCode: 200,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ response: geminiResponse })
        };

    } catch (error) {
        console.error('Error during Gemini API call:', error);
        
        // التعامل مع خطأ 503 من Gemini وإرجاع رسالة ودية
        const errorMessage = error.message.includes('503 Service Unavailable') 
            ? 'عذراً، خادم الذكاء الاصطناعي مشغول حالياً. يرجى المحاولة مرة أخرى بعد قليل.'
            : 'عذراً، حدث خطأ غير متوقع أثناء الاتصال. يرجى المحاولة مرة أخرى.';

        return {
            statusCode: 500,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ error: errorMessage })
        };
    }
};
