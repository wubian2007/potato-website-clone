// Potato Perfect Clone - 完美复刻原站功能
// 基于 Firecrawl MCP 抓取的真实内容和功能

document.addEventListener('DOMContentLoaded', function() {
    // 初始化所有组件
    initLanguageSelector();
    initFeedbackModal();
    initNewsletterForm();
    initMobileMenu();
    initDownloadTracking();
    initScrollEffects();
    
    console.log('🥔 Potato 完美复刻版加载完成');
});

// 语言选择器
function initLanguageSelector() {
    const languageSelector = document.getElementById('language');
    if (languageSelector) {
        // 设置默认语言为简体中文
        languageSelector.value = 'zh';
        
        languageSelector.addEventListener('change', function(e) {
            const selectedLang = e.target.value;
            console.log(`语言切换至: ${selectedLang}`);
            
            // 根据选择的语言更新页面内容
            updatePageLanguage(selectedLang);
            showNotification(getLanguageText(selectedLang, 'languageChanged'), 'success');
        });
    }
}

function updatePageLanguage(lang) {
    const translations = {
        zh: {
            heroTitle: '让全球用户的沟通变得简单、安全、可靠且有趣',
            heroSubtitle: '使用 POTATO，您可以快速、轻松、安全地与世界各地的用户收发消息和通话，同时享受最安全的娱乐体验。',
            downloadTitle: '下载 Potato',
            featuresTitle: '为什么全球用户选择 Potato Chat？',
            hotIssuesTitle: '热门问题',
            browserNotice: '您的浏览器版本过低，部分内容可能无法正常显示，请下载最新版本！'
        },
        en: {
            heroTitle: 'Make communications simple, safe, reliable and interesting for users around the world',
            heroSubtitle: 'With POTATO you can send and receive messages and calls quickly, easily and securely from all over the world, while you can enjoy the safest entertainment experience.',
            downloadTitle: 'Download Potato',
            featuresTitle: 'Why do global users choose Potato Chat?',
            hotIssuesTitle: 'Hot Issues',
            browserNotice: 'Your browser version is too low, some content may not display properly, please download the latest version!'
        },
        tw: {
            heroTitle: '讓全球用戶的溝通變得簡單、安全、可靠且有趣',
            heroSubtitle: '使用 POTATO，您可以快速、輕鬆、安全地與世界各地的用戶收發消息和通話，同時享受最安全的娛樂體驗。',
            downloadTitle: '下載 Potato',
            featuresTitle: '為什麼全球用戶選擇 Potato Chat？',
            hotIssuesTitle: '熱門問題',
            browserNotice: '您的瀏覽器版本過低，部分內容可能無法正常顯示，請下載最新版本！'
        }
    };
    
    const texts = translations[lang];
    if (texts) {
        // 更新页面文本
        const heroTitle = document.querySelector('.hero-title');
        const heroSubtitle = document.querySelector('.hero-subtitle');
        const downloadTitle = document.querySelector('.download-title');
        const featuresTitle = document.querySelector('.features .section-title');
        const hotIssuesTitle = document.querySelector('.hot-issues .section-title');
        const browserNotice = document.querySelector('.browser-notice');
        
        if (heroTitle) heroTitle.textContent = texts.heroTitle;
        if (heroSubtitle) heroSubtitle.textContent = texts.heroSubtitle;
        if (downloadTitle) downloadTitle.textContent = texts.downloadTitle;
        if (featuresTitle) featuresTitle.textContent = texts.featuresTitle;
        if (hotIssuesTitle) hotIssuesTitle.textContent = texts.hotIssuesTitle;
        if (browserNotice) browserNotice.textContent = texts.browserNotice;
    }
}

function getLanguageText(lang, key) {
    const texts = {
        zh: {
            languageChanged: '语言已切换为简体中文',
            feedbackSubmitted: '反馈提交成功！感谢您的反馈。',
            subscribeSuccess: '订阅成功！恭喜您，订阅成功！',
            subscribeError: '抱歉，订阅失败',
            emailError: '邮箱地址有误，请重新输入',
            downloadStarted: '开始下载'
        },
        en: {
            languageChanged: 'Language changed to English',
            feedbackSubmitted: 'Feedback submitted successfully! Thank you for your input.',
            subscribeSuccess: 'Successfully! Congratulations, the subscription is successful!',
            subscribeError: 'Sorry, subscription failed',
            emailError: 'Email address is wrong, please re-enter',
            downloadStarted: 'Starting download'
        },
        tw: {
            languageChanged: '語言已切換為繁體中文',
            feedbackSubmitted: '反饋提交成功！感謝您的反饋。',
            subscribeSuccess: '訂閱成功！恭喜您，訂閱成功！',
            subscribeError: '抱歉，訂閱失敗',
            emailError: '郵箱地址有誤，請重新輸入',
            downloadStarted: '開始下載'
        }
    };
    
    return texts[lang]?.[key] || texts['zh'][key];
}

// 反馈弹窗
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
    
    // 点击背景关闭弹窗
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = 'auto';
            }
        });
    }
    
    // 字符计数器
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
    
    // 表单提交
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentLang = document.getElementById('language').value;
            const feedbackData = {
                message: document.getElementById('feedback-text').value,
                phone: document.getElementById('phone-number').value,
                countryCode: document.getElementById('country-code').value,
                timestamp: new Date().toISOString(),
                language: currentLang
            };
            
            // 模拟表单提交
            console.log('反馈提交:', feedbackData);
            
            // 显示成功消息
            showNotification(getLanguageText(currentLang, 'feedbackSubmitted'), 'success');
            
            // 关闭弹窗并重置表单
            modal.classList.remove('active');
            document.body.style.overflow = 'auto';
            form.reset();
            charCount.textContent = '0';
        });
    }
}

// 邮件订阅表单
function initNewsletterForm() {
    const subscribeBtn = document.getElementById('subscribe-btn');
    const emailInput = document.getElementById('newsletter-email');
    const statusDiv = document.getElementById('newsletter-status');
    
    if (subscribeBtn && emailInput && statusDiv) {
        subscribeBtn.addEventListener('click', function() {
            const email = emailInput.value.trim();
            const currentLang = document.getElementById('language').value;
            
            if (!email) {
                showNewsletterStatus(getLanguageText(currentLang, 'emailError'), 'error');
                return;
            }
            
            if (!isValidEmail(email)) {
                showNewsletterStatus(getLanguageText(currentLang, 'emailError'), 'error');
                return;
            }
            
            // 模拟订阅
            subscribeBtn.textContent = currentLang === 'zh' ? '订阅中...' : 'Subscribing...';
            subscribeBtn.disabled = true;
            
            setTimeout(() => {
                showNewsletterStatus(getLanguageText(currentLang, 'subscribeSuccess'), 'success');
                emailInput.value = '';
                subscribeBtn.textContent = currentLang === 'zh' ? '订阅' : 'Subscribe';
                subscribeBtn.disabled = false;
            }, 1500);
        });
        
        // 回车键支持
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
        
        // 5秒后清除状态
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

// 移动端菜单
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

// 下载追踪
function initDownloadTracking() {
    const downloadBtns = document.querySelectorAll('.download-btn');
    
    downloadBtns.forEach(btn => {
        btn.addEventListener('click', function(e) {
            const platform = this.querySelector('.platform')?.textContent || 'Unknown';
            const url = this.href;
            const currentLang = document.getElementById('language').value;
            
            console.log(`下载启动: ${platform} - ${url}`);
            
            // 追踪下载
            trackDownload(platform, url);
            
            // 显示确认信息
            showNotification(`${getLanguageText(currentLang, 'downloadStarted')} ${platform}...`, 'success');
        });
    });
}

function trackDownload(platform, url) {
    const downloadData = {
        platform: platform,
        url: url,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        language: document.getElementById('language').value
    };
    
    console.log('下载追踪:', downloadData);
}

// 滚动效果
function initScrollEffects() {
    // 观察器选项
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
    
    // 观察功能特性项目
    const featureItems = document.querySelectorAll('.feature-item');
    featureItems.forEach((item, index) => {
        // 初始状态
        item.style.opacity = '0';
        item.style.transform = 'translateY(30px)';
        item.style.transition = `opacity 0.6s ease ${index * 0.1}s, transform 0.6s ease ${index * 0.1}s`;
        
        // 观察动画
        observer.observe(item);
    });
    
    // 观察问题列表项目
    const issueItems = document.querySelectorAll('.issue-item');
    issueItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = `opacity 0.4s ease ${index * 0.1}s, transform 0.4s ease ${index * 0.1}s`;
        
        observer.observe(item);
    });
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 样式设置
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'};
        color: white;
        padding: 12px 20px;
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 3000;
        font-weight: 500;
        font-size: 13px;
        max-width: 300px;
        animation: slideInRight 0.3s ease;
    `;
    
    // 添加动画样式
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
        document.head.appendChild(style);
    }
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 4秒后自动移除
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// 平滑滚动
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

// 性能监控
function initPerformanceMonitoring() {
    window.addEventListener('load', function() {
        const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
        console.log(`🥔 页面加载时间: ${loadTime}ms`);
        
        // 监控 LCP
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                list.getEntries().forEach((entry) => {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log(`🎨 LCP: ${entry.startTime}ms`);
                    }
                });
            });
            
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint'] });
            } catch (e) {
                // 忽略不支持的浏览器
            }
        }
    });
}

// 初始化性能监控
initPerformanceMonitoring();

// 文件上传处理
document.addEventListener('change', function(e) {
    if (e.target.id === 'photo-upload') {
        const files = e.target.files;
        const uploadArea = document.querySelector('.upload-area');
        
        if (files.length > 0) {
            const fileNames = Array.from(files).map(file => file.name).join(', ');
            uploadArea.querySelector('p').textContent = `已选择: ${fileNames}`;
            uploadArea.style.borderColor = '#2ecc71';
            uploadArea.style.backgroundColor = 'rgba(46, 204, 113, 0.1)';
        }
    }
});

// 导出函数供测试使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        isValidEmail,
        getLanguageText,
        showNotification,
        trackDownload
    };
}
