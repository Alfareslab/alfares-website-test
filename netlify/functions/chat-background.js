/**
 * Al-Fares Chatbot API - Netlify Background Function - Version 4.2.3
 * Last Updated: 2025-10-29
 * Author: Manus AI
 * Description: Background serverless function for chatbot AI processing and notifications
 * Changes: Fixed response handling + Added version display in welcome message
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// ===================================
// Environment Variables
// ===================================
const GEMINI_API_KEY = process.env.GOOGLE_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
const WHATSAPP_PHONE_NUMBER = process.env.WHATSAPP_PHONE_NUMBER;
const CALLMEBOT_API_KEY = process.env.CALLMEBOT_API_KEY;

// ===================================
// System Prompt (v2.0)
// ===================================
const SYSTEM_PROMPT = `أنت "المُشخِّص الذكي"، مساعد فني خبير ومتعدد اللغات يعمل في "مركز الفارس لصيانة الكمبيوتر واستعادة البيانات".
مهمتك الأساسية: التحدث مع العملاء بأسلوب ودود ومهني لتشخيص مشاكل أجهزتهم. يجب عليك تحديد لغة العميل (عربي أو إنجليزي) من رسالته الأولى والتفاعل معه بنفس اللغة طوال المحادثة.
هدفك النهائي: جمع مجموعة محددة ومفصلة من المعلومات. المعلومات المطلوبة هي:
1. الخدمة المطلوبة: (استعادة بيانات، صيانة كمبيوتر، أو صيانة Mac).
2. نوع الجهاز: (لابتوب، هارد ديسك، SSD، فلاشة، جهاز Mac... إلخ).
3. معلومات الجهاز الدقيقة (إذا أمكن):
   - بالنسبة لوسائط التخزين (HDD/SSD): اسأل عن الموديل والسعة التخزينية (مثال: "هل تعرف موديل الهارد ديسك أو سعته؟ مثل 1TB أو 500GB").
   - بالنسبة لأجهزة الكمبيوتر/Mac: اسأل عن الموديل أو سنة الصنع التقريبية.
4. وصف دقيق للمشكلة: (ماذا يحدث بالضبط؟ هل هناك أصوات؟ رسائل خطأ؟ ضرر مادي؟).
5. محاولات الإصلاح السابقة (مهم جدًا): اسأل بوضوح عما إذا كان قد تم إجراء أي محاولات إصلاح سابقة، سواء من قبل العميل أو فني آخر. يجب أن يشمل هذا:
   - محاولات مادية: "هل تم فتح الجهاز أو محاولة إصلاحه في مكان آخر؟"
   - محاولات برمجية: "هل حاولت استخدام أي برامج للصيانة أو لاستعادة البيانات؟"
6. اسم العميل.
7. رقم هاتف العميل.
8. لغة العميل: (يجب تحديدها تلقائيًا: العربية أو الإنجليزية).

قواعد الحوار:
1. ابدأ دائمًا بسؤال ترحيبي عام باللغتين: "مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني (v4.2.3)، كيف يمكنني مساعدتك اليوم؟"
2. من رد العميل الأول، حدد لغته وأكمل المحادثة بها.
3. قاعدة الحوار المتدرج (مهمة جدًا): لا تطرح جميع أسئلتك دفعة واحدة. ابدأ بسؤال واحد فقط. بناءً على إجابة العميل، اطرح السؤال التالي الأكثر منطقية. اجعل الحوار طبيعيًا وتفاعليًا، كأنك تجري محادثة حقيقية، وليس كأنك تملأ استمارة. هدفك هو جمع كل المعلومات، ولكن بطريقة سلسة ومتدرجة.
4. قاعدة التوجيه للمركز: في ردودك، يمكنك الإشارة بلطف إلى أن هذه الأسئلة الدقيقة ضرورية لأن "مركز الفارس" يستخدم أدوات متخصصة وخبرات عالية لضمان أفضل النتائج، وأن التشخيص الدقيق هو أول خطوة لعملية إصلاح ناجحة.
5. إذا كانت إجابة العميل غير واضحة أو ناقصة، اطرح أسئلة متابعة ذكية ومحددة للحصول على المعلومات المفقودة. لا تتردد في طرح عدة أسئلة للوصول إلى التفاصيل.
6. عندما تجمع كل المعلومات المطلوبة، قم بصياغة ملخص واضح بلغة العميل وقدمه له للتأكيد.
7. بعد تأكيد العميل، اختتم المحادثة بلغة العميل برسالة: "ممتاز. لقد قمت بإرسال تقرير مفصل للفريق الفني، وسنتواصل معك قريبًا. [END_OF_CONVERSATION]"
8. مهم جدًا: لا تقدم أي حلول تقنية أو نصائح إصلاح بنفسك. مهمتك هي جمع المعلومات فقط.

قاعدة التقرير النهائي (للإرسال إلى تيليجرام):
يجب أن يكون التقرير النهائي الذي ترسله دائمًا باللغة العربية، بغض النظر عن لغة المحادثة مع العميل.
يجب أن يكون التقرير منظماً ويحتوي على جميع البيانات التي تم جمعها، بما في ذلك "لغة العميل".`;

// ===================================
// Initialize Gemini
// ===================================
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ 
    model: "gemini-2.0-flash-exp",
    systemInstruction: SYSTEM_PROMPT
});

// ===================================
// Helper Functions
// ===================================
function formatHistory(history) {
    return history.slice(1).map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
    }));
}

// Retry logic for Gemini API calls
async function callGeminiWithRetry(prompt, maxRetries = 3) {
    let lastError;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Gemini API attempt ${attempt}/${maxRetries}`);
            const result = await model.generateContent(prompt);
            const response = result.response.text();
            console.log(`Gemini API success on attempt ${attempt}`);
            return response;
        } catch (error) {
            lastError = error;
            console.error(`Gemini API error on attempt ${attempt}:`, error.message);
            
            // Wait before retry (exponential backoff)
            if (attempt < maxRetries) {
                const waitTime = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
                console.log(`Waiting ${waitTime}ms before retry...`);
                await new Promise(resolve => setTimeout(resolve, waitTime));
            }
        }
    }
    
    throw lastError;
}

async function sendToTelegram(messageText) {
    try {
        const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: TELEGRAM_CHAT_ID,
                text: messageText,
                parse_mode: 'Markdown'
            })
        });
        
        if (!response.ok) {
            throw new Error(`Telegram API error: ${response.status}`);
        }
        
        console.log('Telegram notification sent successfully');
        return { success: true };
    } catch (error) {
        console.error('Error sending to Telegram:', error);
        return { success: false, error: error.message };
    }
}

async function sendToWhatsapp(messageText) {
    try {
        const encodedText = encodeURIComponent(messageText);
        const url = `https://api.callmebot.com/whatsapp.php?phone=${WHATSAPP_PHONE_NUMBER}&text=${encodedText}&apikey=${CALLMEBOT_API_KEY}`;
        
        const response = await fetch(url, { method: 'GET' });
        
        if (response.status === 200) {
            console.log('WhatsApp notification sent successfully');
            return { success: true };
        } else {
            return { success: false, error: `WhatsApp API error: ${response.status}` };
        }
    } catch (error) {
        console.error('Error sending to WhatsApp:', error);
        return { success: false, error: error.message };
    }
}

async function sendReportToTelegram(history, finalResponse) {
    const historyText = history.map(msg => 
        (msg.sender === 'user' ? 'العميل' : 'المشخص') + ': ' + msg.text
    ).join('\n');

    const extractionPrompt = `بناءً على سجل الحوار التالي، استخرج المعلومات المطلوبة وصغ تقريراً نهائياً باللغة العربية فقط.
يجب أن يكون التقرير منظماً وواضحاً، ويحتوي على جميع النقاط الثمانية المطلوبة في مهمتك (الخدمة، نوع الجهاز، معلومات الجهاز، وصف المشكلة، محاولات الإصلاح، اسم العميل، رقم الهاتف، لغة العميل).
سجل الحوار:
---
${historyText}
---
الرد النهائي من المشخص: ${finalResponse}
التقرير المطلوب (باللغة العربية فقط):`;
    
    try {
        const reportText = await callGeminiWithRetry(extractionPrompt);
        await sendToTelegram('*تقرير تشخيص جديد*\n\n' + reportText);
        return reportText;
    } catch (error) {
        console.error('Error during report extraction:', error);
        return '';
    }
}

async function sendReportNotifications(history, finalResponse) {
    console.log('Starting report notifications...');
    const reportText = await sendReportToTelegram(history, finalResponse);
    
    if (reportText) {
        await sendToWhatsapp('*تقرير تشخيص جديد*\n\n' + reportText);
    }
    console.log('Report notifications completed');
}

// ===================================
// Main Handler (Netlify Background Function)
// ===================================
exports.handler = async (event, context) => {
    // CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight OPTIONS request
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 200,
            headers,
            body: ''
        };
    }

    // Only allow POST
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ error: 'Method not allowed' })
        };
    }

    try {
        const { history, newMessage } = JSON.parse(event.body);

        if (!history || !newMessage) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({ error: 'Missing history or newMessage' })
            };
        }

        console.log('Request received, processing with Gemini AI');
        
        // Format history for Gemini
        const historyText = formatHistory(history)
            .map(msg => `${msg.role}: ${msg.parts[0].text}`)
            .join('\n');
        
        const fullPrompt = `${SYSTEM_PROMPT}\n\n--- سجل الحوار السابق ---\n${historyText}\n\n--- رسالة المستخدم الجديدة ---\nuser: ${newMessage}`;

        // Generate response with retry (this is the key - we WAIT for the response)
        const geminiResponse = await callGeminiWithRetry(fullPrompt);

        // Check if conversation is complete
        const isConversationComplete = geminiResponse.includes("[END_OF_CONVERSATION]");

        if (isConversationComplete) {
            const fullHistory = [
                ...history, 
                { sender: 'user', text: newMessage }, 
                { sender: 'model', text: geminiResponse }
            ];
            
            // Send notifications in background (don't wait for them)
            sendReportNotifications(fullHistory, geminiResponse).catch(err => {
                console.error('Error sending notifications:', err);
            });
        }

        // Return the actual Gemini response to the user
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ response: geminiResponse })
        };

    } catch (error) {
        console.error('Error in chatbot function:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ error: 'Failed to process request' })
        };
    }
};
