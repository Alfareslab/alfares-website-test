/*
 * Al-Fares Center Website - Version 4.2.0
 * Last Updated: 2025-10-29
 * Author: Manus AI
 * Description: Main JavaScript file for Al-Fares Computer Repair & Data Recovery Center
 */

// ===================================
// Global State
// ===================================
let currentLang = 'ar';
let contentData = null;
let currentSlideIndex = 0;
let sliderInterval = null;
let reviewsInterval = null;
let currentReviewSet = [];

// ===================================
// Initialization
// ===================================
document.addEventListener('DOMContentLoaded', () => {
    // Detect browser language
    const browserLang = navigator.language || navigator.userLanguage;
    currentLang = browserLang.startsWith('ar') ? 'ar' : 'ar'; // Default to Arabic
    
    // Load content
    loadContent(currentLang);
    
    // Initialize event listeners
    initEventListeners();
});

// ===================================
// Content Loading
// ===================================
async function loadContent(lang) {
    try {
        const response = await fetch(`data/content-${lang}_v4.2.0.json`);
        if (!response.ok) {
            throw new Error(`Failed to load content: ${response.status}`);
        }
        
        contentData = await response.json();
        currentLang = lang;
        
        // Populate all content
        populateContent();
        
        // Initialize slider after content is loaded
        initHeroSlider();
        
        // Dispatch custom event
        document.dispatchEvent(new CustomEvent('contentLoaded'));
        
    } catch (error) {
        console.error('Error loading content:', error);
        alert('خطأ في تحميل المحتوى. يرجى تحديث الصفحة.');
    }
}

// ===================================
// Content Population
// ===================================
function populateContent() {
    if (!contentData) return;
    
    // Populate simple text elements with data-key
    populateSimpleElements();
    
    // Populate complex components
    populateNavigation();
    populateHeroSlider();
    populateAboutSection();
    populateServices();
    populateCapabilities();
    populateProcess();
    populateReviews();
    populateContact();
    populateFloatingButtons();
    populateFooter();
    
    // Update language button
    updateLanguageButton();
}

function populateSimpleElements() {
    const elements = document.querySelectorAll('[data-key]');
    
    elements.forEach(element => {
        const key = element.getAttribute('data-key');
        const value = getNestedValue(contentData, key);
        
        if (value !== undefined && value !== null) {
            if (element.tagName === 'IMG') {
                element.src = value;
                element.alt = value;
            } else if (element.tagName === 'META') {
                element.setAttribute('content', value);
            } else {
                element.textContent = value;
            }
        }
    });
}

function getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
        // Handle array notation like "slides[0]"
        const arrayMatch = key.match(/(\w+)\[(\d+)\]/);
        if (arrayMatch) {
            const arrayName = arrayMatch[1];
            const index = parseInt(arrayMatch[2]);
            return current?.[arrayName]?.[index];
        }
        return current?.[key];
    }, obj);
}

// ===================================
// Navigation
// ===================================
function populateNavigation() {
    const nav = contentData.navigation;
    
    // Primary navigation
    const navPrimary = document.getElementById('navPrimary');
    navPrimary.innerHTML = nav.primary.map(item => `
        <li><a href="${item.href}">${item.label}</a></li>
    `).join('');
    
    // Secondary navigation
    const navSecondary = document.getElementById('navSecondary');
    navSecondary.innerHTML = nav.secondary.map(item => `
        <li><a href="${item.href}">${item.label}</a></li>
    `).join('');
}

// ===================================
// Hero Slider
// ===================================
function populateHeroSlider() {
    const hero = contentData.hero;
    const slidesContainer = document.getElementById('heroSlides');
    
    slidesContainer.innerHTML = hero.slides.map((slide, index) => `
        <div class="slide ${index === 0 ? 'active' : ''}" data-slide="${index}" 
             style="background-color: ${slide.backgroundColor || '#FFFFFF'}; color: ${slide.textColor || '#1f2937'};">
            <div class="slide-image">
                <img src="${slide.image}" alt="${slide.title}" loading="lazy">
            </div>
            <div class="slide-content">
                <h2>${slide.title}</h2>
                <p>${slide.description}</p>
                <a href="${slide.cta.link}" class="slide-cta" 
                   data-action="${slide.cta.action || ''}" 
                   style="background-color: ${slide.ctaBackgroundColor || '#2563eb'}; color: ${slide.ctaTextColor || '#ffffff'};">
                    ${slide.cta.text}
                </a>
            </div>
        </div>
    `).join('');
    
    // Create pagination dots
    const pagination = document.getElementById('sliderPagination');
    pagination.innerHTML = hero.slides.map((_, index) => `
        <span class="pagination-dot ${index === 0 ? 'active' : ''}" data-slide="${index}"></span>
    `).join('');
}

function initHeroSlider() {
    if (!contentData) return;
    
    const hero = contentData.hero;
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.pagination-dot');
    const prevBtn = document.getElementById('sliderPrev');
    const nextBtn = document.getElementById('sliderNext');
    const sliderContainer = document.querySelector('.slider-container');
    
    // Auto play
    if (hero.settings.autoplay) {
        startSlider();
    }
    
    // Pause on hover
    if (hero.settings.pauseOnHover) {
        sliderContainer.addEventListener('mouseenter', stopSlider);
        sliderContainer.addEventListener('mouseleave', startSlider);
    }
    
    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex - 1);
    });
    
    nextBtn.addEventListener('click', () => {
        goToSlide(currentSlideIndex + 1);
    });
    
    // Pagination dots
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            const slideIndex = parseInt(dot.getAttribute('data-slide'));
            goToSlide(slideIndex);
        });
    });
}

function goToSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.pagination-dot');
    
    // Wrap around
    if (index < 0) {
        index = slides.length - 1;
    } else if (index >= slides.length) {
        index = 0;
    }
    
    // Update slides
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    currentSlideIndex = index;
}

function startSlider() {
    if (!contentData) return;
    stopSlider(); // Clear any existing interval
    
    const interval = contentData.hero.settings.interval || 5000;
    sliderInterval = setInterval(() => {
        goToSlide(currentSlideIndex + 1);
    }, interval);
}

function stopSlider() {
    if (sliderInterval) {
        clearInterval(sliderInterval);
        sliderInterval = null;
    }
}

// ===================================
// About Section
// ===================================
function populateAboutSection() {
    const about = contentData.about;
    const featuresContainer = document.getElementById('aboutFeatures');
    
    featuresContainer.innerHTML = about.features.map(feature => `
        <div class="feature-card">
            <div class="icon">${feature.icon}</div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        </div>
    `).join('');
}

// ===================================
// Services Section
// ===================================
function populateServices() {
    const services = contentData.services;
    const servicesGrid = document.getElementById('servicesGrid');
    
    servicesGrid.innerHTML = services.map(service => `
        <div class="service-card" data-service-id="${service.id}">
            <img src="${service.image}" alt="${service.title}" class="service-image" loading="lazy">
            <div class="service-content">
                <div class="service-icon">${service.icon}</div>
                <h3>${service.title}</h3>
                <p>${service.description}</p>
                
                <div class="service-features">
                    ${service.features.map(feature => `
                        <div class="service-feature-item">
                            <strong>${feature.title}</strong>
                            <span>${feature.description}</span>
                        </div>
                    `).join('')}
                </div>
                
                ${service.note ? `<div class="service-note">${service.note}</div>` : ''}
                
                ${service.detailedContent ? `
                    <button class="btn-service-more" data-service-id="${service.id}">
                        ${service.cta.text}
                    </button>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    // Add event listeners to "More" buttons
    document.querySelectorAll('.btn-service-more').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const serviceId = e.target.getAttribute('data-service-id');
            showServiceDetails(serviceId);
        });
    });
}

function showServiceDetails(serviceId) {
    const service = contentData.services.find(s => s.id === serviceId);
    if (!service || !service.detailedContent) return;
    
    const modal = document.getElementById('serviceModal');
    const modalBody = document.getElementById('modalBody');
    
    let detailsHTML = `
        <h2>${service.title}</h2>
        <p><strong>${service.detailedContent.intro}</strong></p>
        <p>${service.detailedContent.description}</p>
    `;
    
    // Services
    if (service.detailedContent.services) {
        service.detailedContent.services.forEach(subService => {
            detailsHTML += `
                <h3>${subService.title}</h3>
                <p>${subService.description}</p>
            `;
            
            if (subService.steps) {
                detailsHTML += '<ul>';
                subService.steps.forEach(step => {
                    detailsHTML += `<li>${step}</li>`;
                });
                detailsHTML += '</ul>';
            }
            
            if (subService.cases) {
                detailsHTML += '<ul>';
                subService.cases.forEach(caseItem => {
                    detailsHTML += `<li>${caseItem}</li>`;
                });
                detailsHTML += '</ul>';
            }
            
            if (subService.features) {
                detailsHTML += '<ul>';
                subService.features.forEach(feature => {
                    detailsHTML += `<li>${feature}</li>`;
                });
                detailsHTML += '</ul>';
            }
        });
    }
    
    // Equipment
    if (service.detailedContent.equipment) {
        detailsHTML += '<h3>المعدات المستخدمة</h3>';
        service.detailedContent.equipment.forEach(equipment => {
            detailsHTML += `
                <p><strong>${equipment.name}:</strong> ${equipment.description}</p>
            `;
        });
    }
    
    // Brands
    if (service.detailedContent.brands) {
        detailsHTML += '<h3>الماركات المدعومة</h3>';
        detailsHTML += '<p>' + service.detailedContent.brands.join(' • ') + '</p>';
    }
    
    modalBody.innerHTML = detailsHTML;
    modal.classList.add('active');
}

// ===================================
// Capabilities Section
// ===================================
function populateCapabilities() {
    const capabilities = contentData.capabilities;
    const capabilitiesGrid = document.getElementById('capabilitiesGrid');
    
    capabilitiesGrid.innerHTML = capabilities.items.map(item => `
        <div class="capability-card">
            <div class="icon">${item.icon}</div>
            <h3>${item.title}</h3>
            <p>${item.description}</p>
        </div>
    `).join('');
}

// ===================================
// Process Section
// ===================================
function populateProcess() {
    const process = contentData.process;
    const processSteps = document.getElementById('processSteps');
    
    processSteps.innerHTML = process.steps.map(step => `
        <div class="process-step">
            <div class="step-number">${step.number}</div>
            <div class="step-icon">${step.icon}</div>
            <h3>${step.title}</h3>
            <p>${step.description}</p>
        </div>
    `).join('');
}

// ===================================
// Reviews Section
// ===================================
function populateReviews() {
    const reviews = contentData.reviews;
    const reviewsGrid = document.getElementById('reviewsGrid');
    
    // Get random reviews
    currentReviewSet = getRandomReviews(reviews.items, reviews.displayCount);
    
    reviewsGrid.innerHTML = currentReviewSet.map(review => `
        <div class="review-card">
            <div class="review-rating">${'⭐'.repeat(parseInt(review.rating))}</div>
            <p class="review-text">"${review.text}"</p>
            <div class="review-author">
                <div>
                    <div class="review-author-name">${review.name}</div>
                    <div class="review-date">${review.date}</div>
                </div>
            </div>
        </div>
    `).join('');
    
    // Start auto-rotation if enabled
    if (reviews.autoRotate) {
        startReviewsRotation();
        
        // Pause on hover
        reviewsGrid.addEventListener('mouseenter', stopReviewsRotation);
        reviewsGrid.addEventListener('mouseleave', startReviewsRotation);
    }
}

function getRandomReviews(reviews, count) {
    // Shuffle array
    const shuffled = [...reviews].sort(() => Math.random() - 0.5);
    // Return first 'count' items
    return shuffled.slice(0, count);
}

function startReviewsRotation() {
    if (!contentData || !contentData.reviews.autoRotate) return;
    stopReviewsRotation(); // Clear any existing interval
    
    const interval = contentData.reviews.rotateInterval || 7000;
    reviewsInterval = setInterval(() => {
        rotateReviews();
    }, interval);
}

function stopReviewsRotation() {
    if (reviewsInterval) {
        clearInterval(reviewsInterval);
        reviewsInterval = null;
    }
}

function rotateReviews() {
    const reviews = contentData.reviews;
    const reviewsGrid = document.getElementById('reviewsGrid');
    
    // Get new random reviews
    currentReviewSet = getRandomReviews(reviews.items, reviews.displayCount);
    
    // Add fade-out effect
    reviewsGrid.style.opacity = '0';
    
    setTimeout(() => {
        reviewsGrid.innerHTML = currentReviewSet.map(review => `
            <div class="review-card">
                <div class="review-rating">${'⭐'.repeat(parseInt(review.rating))}</div>
                <p class="review-text">"${review.text}"</p>
                <div class="review-author">
                    <div>
                        <div class="review-author-name">${review.name}</div>
                        <div class="review-date">${review.date}</div>
                    </div>
                </div>
            </div>
        `).join('');
        
        // Fade-in effect
        reviewsGrid.style.opacity = '1';
    }, 300);
}

// ===================================
// Contact Section
// ===================================
function populateContact() {
    const contact = contentData.contact;
    
    // Map
    if (contact.map.enabled) {
        const mapIframe = document.getElementById('contactMap');
        mapIframe.src = contact.map.embedUrl;
    }
    
    // WhatsApp Sections
    const whatsappSections = document.getElementById('whatsappSections');
    whatsappSections.innerHTML = contact.whatsappSections.map(section => `
        <a href="${section.link}" class="whatsapp-btn" target="_blank" rel="noopener noreferrer">
            <div class="whatsapp-icon">💬</div>
            <div class="whatsapp-label">${section.label}</div>
        </a>
    `).join('');
    
    // Social Media
    const socialMedia = document.getElementById('socialMedia');
    const socials = contentData.socialMedia;
    let socialHTML = '';
    
    if (socials.facebook.enabled) {
        socialHTML += `<a href="${socials.facebook.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${socials.facebook.label}">f</a>`;
    }
    if (socials.twitter.enabled) {
        socialHTML += `<a href="${socials.twitter.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${socials.twitter.label}">𝕏</a>`;
    }
    if (socials.instagram.enabled) {
        socialHTML += `<a href="${socials.instagram.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${socials.instagram.label}">📷</a>`;
    }
    if (socials.youtube.enabled) {
        socialHTML += `<a href="${socials.youtube.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${socials.youtube.label}">▶</a>`;
    }
    if (socials.linkedin.enabled) {
        socialHTML += `<a href="${socials.linkedin.url}" class="social-link" target="_blank" rel="noopener noreferrer" aria-label="${socials.linkedin.label}">in</a>`;
    }
    
    socialMedia.innerHTML = socialHTML;
}

// ===================================
// Floating Buttons
// ===================================
function populateFloatingButtons() {
    const floating = contentData.floatingButtons;
    if (!floating.enabled) return;
    
    const floatingButtons = document.getElementById('floatingButtons');
    
    floatingButtons.innerHTML = floating.buttons.map(button => {
        let btnClass = 'floating-btn';
        if (button.type === 'whatsapp') btnClass += ' whatsapp';
        else if (button.type === 'messenger') btnClass += ' messenger';
        else if (button.type === 'call') btnClass += ' call';
        else if (button.type === 'tiktok') btnClass += ' tiktok';
        else if (button.type === 'chatbot') btnClass += ' chatbot';
        
        const tooltip = button.tooltip || button.label;
        const bgColor = button.backgroundColor || '#2563eb';
        
        // Check if icon is a file path or emoji
        const iconHtml = button.icon && button.icon.startsWith('assets/') 
            ? `<img src="${button.icon}" alt="${button.label}">` 
            : `<span>${button.icon || '💬'}</span>`;
        
        // If chatbot type, use button instead of link
        if (button.type === 'chatbot') {
            return `
                <button class="${btnClass}" style="background-color: ${bgColor};" onclick="openChatbotWidget()" aria-label="${button.label}">
                    ${iconHtml}
                    <span class="floating-btn-label">${tooltip}</span>
                </button>
            `;
        }
        
        return `
            <a href="${button.link}" class="${btnClass}" style="background-color: ${bgColor};" target="_blank" rel="noopener noreferrer" aria-label="${button.label}">
                ${iconHtml}
                <span class="floating-btn-label">${tooltip}</span>
            </a>
        `;
    }).join('');
}

// ===================================
// Footer
// ===================================
function populateFooter() {
    // Footer content is populated via data-key attributes
    // Already handled by populateSimpleElements()
}

// ===================================
// Event Listeners
// ===================================
function initEventListeners() {
    // Language switcher
    const btnLang = document.getElementById('btnLang');
    btnLang.addEventListener('click', switchLanguage);
    
    // More dropdown
    const btnMore = document.getElementById('btnMore');
    const navSecondary = document.getElementById('navSecondary');
    
    btnMore.addEventListener('click', () => {
        btnMore.classList.toggle('active');
        navSecondary.classList.toggle('active');
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!btnMore.contains(e.target) && !navSecondary.contains(e.target)) {
            btnMore.classList.remove('active');
            navSecondary.classList.remove('active');
        }
    });
    
    // Mobile menu toggle
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const mainNav = document.querySelector('.main-nav');
    
    mobileMenuToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });
    
    // Modal close
    const modalClose = document.getElementById('modalClose');
    const modalOverlay = document.getElementById('modalOverlay');
    const modal = document.getElementById('serviceModal');
    
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    modalOverlay.addEventListener('click', () => {
        modal.classList.remove('active');
    });
    
    // Smooth scroll for anchor links
    document.addEventListener('click', (e) => {
        const target = e.target.closest('a[href^="#"]');
        if (target) {
            e.preventDefault();
            const id = target.getAttribute('href').substring(1);
            const element = document.getElementById(id);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth' });
                // Close mobile menu if open
                mainNav.classList.remove('active');
            }
        }
        
        // Handle openChatbot action
        const ctaButton = e.target.closest('[data-action="openChatbot"]');
        if (ctaButton) {
            e.preventDefault();
            if (window.ChatbotWidget && typeof window.ChatbotWidget.open === 'function') {
                window.ChatbotWidget.open();
            }
        }
    });
    
    // Smooth scroll to hero when clicking site title or home link
    const siteTitle = document.querySelector('.site-title');
    const homeLink = document.querySelector('a[href="#hero"]');
    
    if (siteTitle) {
        siteTitle.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
        siteTitle.style.cursor = 'pointer';
    }
    
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
}

// ===================================
// Language Switching
// ===================================
function switchLanguage() {
    const newLang = currentLang === 'ar' ? 'en' : 'ar';
    loadContent(newLang);
}

function updateLanguageButton() {
    const btnLang = document.getElementById('btnLang');
    const langText = btnLang.querySelector('.lang-text');
    
    if (currentLang === 'ar') {
        langText.textContent = 'EN';
    } else {
        langText.textContent = 'AR';
    }
}

// ===================================
// Utility Functions
// ===================================

// Lazy loading images
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                }
                observer.unobserve(img);
            }
        });
    });
    
    // Observe all images with data-src
    document.addEventListener('contentLoaded', () => {
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    });
}

// Log version
console.log('Al-Fares Center Website v3.0.0 - Loaded successfully');

