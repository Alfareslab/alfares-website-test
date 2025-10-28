/*
 * Al-Fares Chatbot Widget - Version 4.2.0
 * Last Updated: 2025-10-29
 * Author: Manus AI
 * Description: Chatbot widget logic for Al-Fares Center
 */

// ===================================
// Global State
// ===================================
let chatHistory = [];
let isWaitingForResponse = false;

// ===================================
// API Configuration
// ===================================
const CHATBOT_API_URL = '/.netlify/functions/chat-background'; // Netlify Background Function endpoint

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    initChatbotWidget();
});

// ===================================
// Widget Initialization
// ===================================
function initChatbotWidget() {
    const widget = document.getElementById('chatbot-widget-alfares');
    const closeBtn = document.getElementById('chatbot-close-alfares');
    const sendBtn = document.getElementById('chatbot-send-alfares');
    const inputField = document.getElementById('chatbot-input-field-alfares');

    // Close button
    if (closeBtn) {
        closeBtn.addEventListener('click', closeChatbotWidget);
    }

    // Send button
    if (sendBtn) {
        sendBtn.addEventListener('click', sendMessage);
    }

    // Enter key to send
    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessage();
            }
        });
    }

    // Initialize with welcome message
    if (chatHistory.length === 0) {
        addBotMessage('مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني، كيف يمكنني مساعدتك اليوم؟');
        chatHistory.push({
            sender: 'model',
            text: 'مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني، كيف يمكنني مساعدتك اليوم؟'
        });
    }
}

// ===================================
// Open/Close Widget
// ===================================
function openChatbotWidget() {
    const widget = document.getElementById('chatbot-widget-alfares');
    if (widget) {
        widget.classList.add('active');
        // Focus input field
        const inputField = document.getElementById('chatbot-input-field-alfares');
        if (inputField) {
            setTimeout(() => inputField.focus(), 100);
        }
    }
}

function closeChatbotWidget() {
    const widget = document.getElementById('chatbot-widget-alfares');
    if (widget) {
        widget.classList.remove('active');
    }
}

// Make openChatbotWidget globally accessible
window.openChatbotWidget = openChatbotWidget;

// ===================================
// Message Handling
// ===================================
function sendMessage() {
    const inputField = document.getElementById('chatbot-input-field-alfares');
    const message = inputField.value.trim();

    if (!message || isWaitingForResponse) return;

    // Add user message to UI
    addUserMessage(message);

    // Add to history
    chatHistory.push({
        sender: 'user',
        text: message
    });

    // Clear input
    inputField.value = '';

    // Show typing indicator
    showTypingIndicator();

    // Send to API
    sendToAPI(message);
}

async function sendToAPI(message) {
    isWaitingForResponse = true;

    try {
        const response = await fetch(CHATBOT_API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                history: chatHistory,
                newMessage: message
            })
        });

        // Handle HTTP 202 (Accepted) for background processing
        if (response.status === 202) {
            // Hide typing indicator
            hideTypingIndicator();
            
            // Show processing message
            const processingMessage = 'جاري معالجة طلبك... سنرد عليك في أقرب وقت.';
            addBotMessage(processingMessage);
            
            // Add to history
            chatHistory.push({
                sender: 'model',
                text: processingMessage
            });
            
            isWaitingForResponse = false;
            return;
        }

        if (!response.ok) {
            throw new Error('Failed to get response from chatbot API');
        }

        const data = await response.json();
        const botResponse = data.response;

        // Hide typing indicator
        hideTypingIndicator();

        // Add bot response to UI
        addBotMessage(botResponse);

        // Add to history
        chatHistory.push({
            sender: 'model',
            text: botResponse
        });

        // Check if conversation ended
        if (botResponse.includes('[END_OF_CONVERSATION]')) {
            // Show final message without the marker
            const cleanResponse = botResponse.replace('[END_OF_CONVERSATION]', '').trim();
            // Update last message
            const messages = document.querySelectorAll('.chatbot-message-alfares.bot');
            const lastMessage = messages[messages.length - 1];
            if (lastMessage) {
                const bubble = lastMessage.querySelector('.chatbot-message-bubble-alfares');
                if (bubble) {
                    bubble.textContent = cleanResponse;
                }
            }
        }

    } catch (error) {
        console.error('Error communicating with chatbot:', error);
        hideTypingIndicator();
        addBotMessage('عذراً، حدث خطأ في الاتصال. يرجى المحاولة مرة أخرى.');
    } finally {
        isWaitingForResponse = false;
    }
}

// ===================================
// UI Functions
// ===================================
function addUserMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages-alfares');
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message-alfares user';
    
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message-bubble-alfares';
    bubble.textContent = text;
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
}

function addBotMessage(text) {
    const messagesContainer = document.getElementById('chatbot-messages-alfares');
    
    // Remove [END_OF_CONVERSATION] marker from display
    const cleanText = text.replace('[END_OF_CONVERSATION]', '').trim();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chatbot-message-alfares bot';
    
    const bubble = document.createElement('div');
    bubble.className = 'chatbot-message-bubble-alfares';
    bubble.textContent = cleanText;
    
    messageDiv.appendChild(bubble);
    messagesContainer.appendChild(messageDiv);
    
    // Scroll to bottom
    scrollToBottom();
}

function showTypingIndicator() {
    const messagesContainer = document.getElementById('chatbot-messages-alfares');
    
    // Check if typing indicator already exists
    let typingDiv = document.querySelector('.chatbot-typing-alfares');
    
    if (!typingDiv) {
        typingDiv = document.createElement('div');
        typingDiv.className = 'chatbot-typing-alfares';
        typingDiv.innerHTML = `
            <div class="chatbot-typing-dot-alfares"></div>
            <div class="chatbot-typing-dot-alfares"></div>
            <div class="chatbot-typing-dot-alfares"></div>
        `;
        messagesContainer.appendChild(typingDiv);
    }
    
    typingDiv.classList.add('active');
    scrollToBottom();
}

function hideTypingIndicator() {
    const typingDiv = document.querySelector('.chatbot-typing-alfares');
    if (typingDiv) {
        typingDiv.classList.remove('active');
    }
}

function scrollToBottom() {
    const messagesContainer = document.getElementById('chatbot-messages-alfares');
    if (messagesContainer) {
        setTimeout(() => {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
    }
}

// ===================================
// Utility Functions
// ===================================
function resetChat() {
    chatHistory = [];
    const messagesContainer = document.getElementById('chatbot-messages-alfares');
    if (messagesContainer) {
        messagesContainer.innerHTML = '';
    }
    // Add welcome message
    addBotMessage('مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني، كيف يمكنني مساعدتك اليوم؟');
    chatHistory.push({
        sender: 'model',
        text: 'مرحباً بك في مركز الفارس | Welcome to Al-Fares Center. أنا مساعدك التقني، كيف يمكنني مساعدتك اليوم؟'
    });
}

// Log version
console.log('Al-Fares Chatbot Widget v4.2.0 - Loaded successfully');

