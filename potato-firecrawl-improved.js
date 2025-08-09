// Potato Firecrawl Improved - JavaScript Functionality
// Based on content extracted from Firecrawl MCP

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initLanguageSelector();
    initFeedbackModal();
    initNewsletterForm();
    initMobileMenu();
    initDownloadTracking();
    
    console.log('🥔 Potato website loaded - Firecrawl MCP Enhanced Version');
});

// Language Selector
function initLanguageSelector() {
    const languageSelector = document.getElementById('language');
    if (languageSelector) {
        languageSelector.addEventListener('change', function(e) {
            const selectedLang = e.target.value;
            console.log(`Language changed to: ${selectedLang}`);
            
            // In a real implementation, this would change the site language
            // For now, we'll just show a notification
            showNotification(`Language changed to ${getLanguageName(selectedLang)}`, 'success');
        });
    }
}

function getLanguageName(code) {
    const languages = {
        'zh': '简体中文',
        'en': 'English', 
        'tw': '繁體中文'
    };
    return languages[code] || code;
}

// Feedback Modal
function initFeedbackModal() {
    const feedbackBtn = document.querySelector('.feedback-btn');
    const modal = document.getElementById('feedback-modal');
    const closeBtn = document.querySelector('.modal-close');
    const form = document.getElementById('feedback-form');
    const textArea = document.getElementById('feedback-text');
    const charCount = document.getElementById('char-count');
    
    if (feedbackBtn && modal) {
        feedbackBtn.addEventListener('click', function() {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    if (closeBtn && modal) {
        closeBtn.addEventListener('click', function() {
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
        });
    }
    
    // Close modal when clicking outside
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // Character counter
    if (textArea && charCount) {
        textArea.addEventListener('input', function() {
            const count = this.value.length;
            charCount.textContent = count;
            
            if (count > 520) {
                charCount.style.color = '#e74c3c';
            } else if (count > 450) {
                charCount.style.color = '#f39c12';
            } else {
                charCount.style.color = '#666';
            }
        });
    }
    
    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const formData = new FormData(form);
            const feedbackData = {
                message: document.getElementById('feedback-text').value,
                phone: document.getElementById('phone-number').value,
                countryCode: document.getElementById('country-code').value,
                timestamp: new Date().toISOString()
            };
            
            // Simulate form submission
            console.log('Feedback submitted:', feedbackData);
            
            // Show success message
            showNotification('Feedback submitted successfully! Thank you for your input.', 'success');
            
            // Close modal and reset form
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            form.reset();
            charCount.textContent = '0';
        });
    }
}

// Newsletter Form
function initNewsletterForm() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    const emailInput = document.getElementById('newsletter-email');
    const statusDiv = document.getElementById('newsletter-status');
    
    if (subscribeBtn && emailInput && statusDiv) {
        subscribeBtn.addEventListener('click', function() {
            const email = emailInput.value.trim();
            
            if (!email) {
                showNewsletterStatus('Please enter your email address', 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNewsletterStatus('Email address is wrong, please re-enter', 'error');
                return;
            }
            
            // Simulate subscription
            subscribeBtn.textContent = 'Subscribing...';
            subscribeBtn.disabled = true;
            
            setTimeout(() => {
                showNewsletterStatus('Successfully! Congratulations, the subscription is successful', 'success');
                emailInput.value = '';
                subscribeBtn.textContent = 'Subscribe';
                subscribeBtn.disabled = false;
            }, 1500);
        });
        
        // Enter key support
        emailInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                subscribeBtn.click();
            }
        });
    }
}

function showNewsletterStatus(message, type) {
    const statusDiv = document.getElementById('newsletter-status');
    if (statusDiv) {
        statusDiv.textContent = message;
        statusDiv.className = `newsletter-status ${type}`;
        
        // Clear status after 5 seconds
        setTimeout(() => {
            statusDiv.textContent = '';
            statusDiv.className = 'newsletter-status';
        }, 5000);
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mobile Menu
function initMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileToggle && navMenu) {
        mobileToggle.addEventListener('click', function() {
            navMenu.classList.toggle('mobile-active');
            this.classList.toggle('active');
        });
    }
}

// Download Tracking
function initDownloadTracking() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const platform = this.closest('.download-item')?.querySelector('h3')?.textContent || 'Unknown';
            const url = this.href;
            
            console.log(`Download initiated: ${platform} - ${url}`);
            
            // Track download (in real app, this would send to analytics)
            trackDownload(platform, url);
            
            // Show confirmation
            showNotification(`Starting download for ${platform}...`, 'success');
        });
    });
}

function trackDownload(platform, url) {
    // Simulate analytics tracking
    const downloadData = {
        platform: platform,
        url: url,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent
    };
    
    console.log('Download tracked:', downloadData);
    
    // In a real implementation, this would send to analytics service
    // analytics.track('download_started', downloadData);
}

// Notification System
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#4a90e2'};
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        font-weight: 500;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // Add animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                opacity: 0;
                transform: translateX(100%);
            }
            to {
                opacity: 1;
                transform: translateX(0);
            }
        }
        @keyframes slideOutRight {
            from {
                opacity: 1;
                transform: translateX(0);
            }
            to {
                opacity: 0;
                transform: translateX(100%);
            }
        }
    `;
    
    if (!document.querySelector('#notification-styles')) {
        style.id = 'notification-styles';
        document.head.appendChild(style);
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Auto remove after 4 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe feature items for animation
document.addEventListener('DOMContentLoaded', function() {
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        // Initial state
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // Observe for animation
        observer.observe(item);
    });
});

// Hot Issues (FAQ) functionality
const hotIssues = [
    {
        title: "Mobile phone can not be logged in, quickly bind email address",
        tag: "HOT",
        link: "#"
    },
    {
        title: "Why do I need to register by email?",
        tag: "HOT", 
        link: "https://potato.im/faq?md=whyBindEmail"
    },
    {
        title: "How to download the latest version of Potato?",
        tag: "",
        link: "https://potato.im/apps"
    },
    {
        title: "What if the registration/login fails to send the verification code?",
        tag: "",
        link: "https://potato.im/faq?md=RegMsgNotCode"
    }
];

// Initialize hot issues if container exists
function initHotIssues() {
    const container = document.getElementById('hot-issues');
    if (container) {
        const issuesHTML = hotIssues.map(issue => `
            <div class="hot-issue-item">
                ${issue.tag ? `<span class="hot-tag">${issue.tag}</span>` : ''}
                <a href="${issue.link}" class="issue-link">${issue.title}</a>
            </div>
        `).join('');
        
        container.innerHTML = issuesHTML;
    }
}

// Performance monitoring
function initPerformanceMonitoring() {
    // Monitor page load time
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🥔 Page loaded in ${loadTime}ms`);
        
        // Track performance metrics
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`🎨 LCP: ${entry.startTime}ms`);
                    }
                });
            });
            
            observer.observe({ entryTypes: ['largest-contentful-paint'] });
        }
    });
}

// Initialize performance monitoring
initPerformanceMonitoring();

// Service Worker registration (for offline functionality)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', function() {
        navigator.serviceWorker.register('/sw.js')
            .then(function(registration) {
                console.log('🔧 ServiceWorker registration successful');
            })
            .catch(function(err) {
                console.log('🔧 ServiceWorker registration failed');
            });
    });
}

// Export functions for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        getLanguageName,
        showNotification,
        trackDownload
    };
}
