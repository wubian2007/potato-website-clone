// DOM 元素选择器
const elements = {
    // 导航相关
    mobileMenuToggle: document.querySelector('.mobile-menu-toggle'),
    navMenu: document.querySelector('.nav-menu'),
    
    // 模态框相关
    feedbackBtn: document.querySelector('.feedback-btn'),
    serviceBtn: document.querySelector('.service-btn'),
    feedbackModal: document.getElementById('feedback-modal'),
    serviceModal: document.getElementById('service-modal'),
    closeBtns: document.querySelectorAll('.close-btn'),
    
    // 表单相关
    feedbackForm: document.querySelector('.feedback-form'),
    feedbackText: document.getElementById('feedback-text'),
    charCount: document.getElementById('char-count'),
    photoUpload: document.getElementById('photo-upload'),
    uploadArea: document.querySelector('.upload-area'),
    
    // 服务表单
    bindEmailForm: document.querySelector('.bind-email-form'),
    phoneNumber: document.getElementById('phone-number'),
    phoneCode: document.getElementById('phone-code'),
    getCodeBtn: document.querySelector('.get-code-btn'),
    
    // 其他
    languageSelector: document.getElementById('language'),
    newsletterForm: document.querySelector('.newsletter-form'),
    subscriptionStatus: document.querySelector('.subscription-status')
};

// 移动端菜单切换
function initMobileMenu() {
    if (elements.mobileMenuToggle && elements.navMenu) {
        elements.mobileMenuToggle.addEventListener('click', () => {
            elements.navMenu.classList.toggle('active');
            elements.mobileMenuToggle.classList.toggle('active');
            
            // 切换汉堡菜单图标动画
            const spans = elements.mobileMenuToggle.querySelectorAll('span');
            spans.forEach((span, index) => {
                if (elements.navMenu.classList.contains('active')) {
                    if (index === 0) span.style.transform = 'rotate(45deg) translate(5px, 5px)';
                    if (index === 1) span.style.opacity = '0';
                    if (index === 2) span.style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    span.style.transform = '';
                    span.style.opacity = '';
                }
            });
        });
        
        // 点击导航链接时关闭菜单
        const navLinks = elements.navMenu.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                elements.navMenu.classList.remove('active');
                elements.mobileMenuToggle.classList.remove('active');
                const spans = elements.mobileMenuToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            });
        });
    }
}

// 模态框控制
function initModals() {
    // 打开反馈模态框
    if (elements.feedbackBtn && elements.feedbackModal) {
        elements.feedbackBtn.addEventListener('click', () => {
            elements.feedbackModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // 打开服务模态框
    if (elements.serviceBtn && elements.serviceModal) {
        elements.serviceBtn.addEventListener('click', () => {
            elements.serviceModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }
    
    // 关闭模态框
    elements.closeBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const modal = e.target.closest('.modal');
            if (modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // 点击模态框背景关闭
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });
    
    // ESC 键关闭模态框
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal.active').forEach(modal => {
                modal.classList.remove('active');
                document.body.style.overflow = '';
            });
        }
    });
}

// 反馈表单处理
function initFeedbackForm() {
    if (elements.feedbackText && elements.charCount) {
        // 字符计数
        elements.feedbackText.addEventListener('input', () => {
            const count = elements.feedbackText.value.length;
            elements.charCount.textContent = count;
            
            // 字符数接近限制时改变颜色
            if (count > 450) {
                elements.charCount.style.color = 'var(--warning-color)';
            } else if (count > 500) {
                elements.charCount.style.color = 'var(--error-color)';
            } else {
                elements.charCount.style.color = '';
            }
        });
    }
    
    // 文件上传处理
    if (elements.photoUpload && elements.uploadArea) {
        // 点击上传区域触发文件选择
        elements.uploadArea.addEventListener('click', () => {
            elements.photoUpload.click();
        });
        
        // 拖拽上传
        elements.uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            elements.uploadArea.style.borderColor = 'var(--primary-color)';
            elements.uploadArea.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
        });
        
        elements.uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            elements.uploadArea.style.borderColor = '';
            elements.uploadArea.style.backgroundColor = '';
        });
        
        elements.uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            elements.uploadArea.style.borderColor = '';
            elements.uploadArea.style.backgroundColor = '';
            
            const files = Array.from(e.dataTransfer.files).slice(0, 2); // 最多2张图片
            handleFileUpload(files);
        });
        
        // 文件选择处理
        elements.photoUpload.addEventListener('change', (e) => {
            const files = Array.from(e.target.files).slice(0, 2);
            handleFileUpload(files);
        });
    }
    
    // 反馈表单提交
    if (elements.feedbackForm) {
        elements.feedbackForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(elements.feedbackForm);
            const feedbackText = elements.feedbackText.value.trim();
            
            if (!feedbackText) {
                showNotification('请输入反馈内容', 'error');
                return;
            }
            
            // 模拟提交
            showNotification('反馈提交成功，感谢您的建议！', 'success');
            elements.feedbackForm.reset();
            elements.charCount.textContent = '0';
            
            // 关闭模态框
            setTimeout(() => {
                elements.feedbackModal.classList.remove('active');
                document.body.style.overflow = '';
            }, 1500);
        });
    }
}

// 文件上传处理
function handleFileUpload(files) {
    const validFiles = files.filter(file => {
        // 检查文件类型
        if (!file.type.startsWith('image/')) {
            showNotification('只能上传图片文件', 'error');
            return false;
        }
        
        // 检查文件大小 (3MB)
        if (file.size > 3 * 1024 * 1024) {
            showNotification(`文件 ${file.name} 超过3MB限制`, 'error');
            return false;
        }
        
        return true;
    });
    
    if (validFiles.length > 0) {
        showNotification(`成功选择 ${validFiles.length} 张图片`, 'success');
        
        // 显示预览
        const uploadText = elements.uploadArea.querySelector('.upload-text');
        uploadText.innerHTML = `
            <p>已选择 ${validFiles.length} 张图片</p>
            <div class="file-list">
                ${validFiles.map(file => `<div class="file-item">${file.name}</div>`).join('')}
            </div>
        `;
    }
}

// 服务表单处理
function initServiceForm() {
    if (elements.getCodeBtn) {
        elements.getCodeBtn.addEventListener('click', () => {
            const phoneNumber = elements.phoneNumber.value.trim();
            
            if (!phoneNumber) {
                showNotification('请输入手机号码', 'error');
                return;
            }
            
            if (!/^\d{11}$/.test(phoneNumber)) {
                showNotification('请输入有效的手机号码', 'error');
                return;
            }
            
            // 模拟发送验证码
            let countdown = 60;
            elements.getCodeBtn.disabled = true;
            elements.getCodeBtn.textContent = `${countdown}秒后重试`;
            
            const timer = setInterval(() => {
                countdown--;
                if (countdown > 0) {
                    elements.getCodeBtn.textContent = `${countdown}秒后重试`;
                } else {
                    clearInterval(timer);
                    elements.getCodeBtn.disabled = false;
                    elements.getCodeBtn.textContent = '获取验证码';
                }
            }, 1000);
            
            showNotification('验证码已发送', 'success');
        });
    }
    
    if (elements.bindEmailForm) {
        elements.bindEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const phoneNumber = elements.phoneNumber.value.trim();
            const phoneCode = elements.phoneCode.value.trim();
            
            if (!phoneNumber || !phoneCode) {
                showNotification('请填写完整信息', 'error');
                return;
            }
            
            if (!/^\d{6}$/.test(phoneCode)) {
                showNotification('请输入6位验证码', 'error');
                return;
            }
            
            // 模拟验证
            showNotification('验证成功，正在跳转...', 'success');
            
            setTimeout(() => {
                elements.serviceModal.classList.remove('active');
                document.body.style.overflow = '';
            }, 1500);
        });
    }
}

// 语言切换
function initLanguageSelector() {
    if (elements.languageSelector) {
        elements.languageSelector.addEventListener('change', (e) => {
            const selectedLang = e.target.value;
            
            // 这里可以实现真正的语言切换逻辑
            showNotification(`语言已切换到 ${getLanguageName(selectedLang)}`, 'success');
        });
    }
}

function getLanguageName(code) {
    const languages = {
        'zh': '简体中文',
        'en': 'English',
        'tw': '繁體中文'
    };
    return languages[code] || '简体中文';
}

// 邮件订阅
function initNewsletter() {
    if (elements.newsletterForm) {
        elements.newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const emailInput = elements.newsletterForm.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showSubscriptionStatus('error', '请输入邮箱地址');
                return;
            }
            
            if (!isValidEmail(email)) {
                showSubscriptionStatus('error', '邮箱地址错误，请重新输入');
                return;
            }
            
            // 模拟订阅
            showSubscriptionStatus('success', '成功！恭喜，订阅成功');
            emailInput.value = '';
        });
    }
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showSubscriptionStatus(type, message) {
    if (!elements.subscriptionStatus) return;
    
    const successMsg = elements.subscriptionStatus.querySelector('.success-message');
    const errorMsg = elements.subscriptionStatus.querySelector('.error-message');
    
    // 重置状态
    successMsg.style.display = 'none';
    errorMsg.style.display = 'none';
    
    if (type === 'success') {
        successMsg.textContent = message;
        successMsg.style.display = 'block';
    } else {
        errorMsg.textContent = message;
        errorMsg.style.display = 'block';
    }
    
    // 3秒后隐藏
    setTimeout(() => {
        successMsg.style.display = 'none';
        errorMsg.style.display = 'none';
    }, 3000);
}

// 通知系统
function showNotification(message, type = 'info') {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // 添加样式
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '16px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10001',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        wordWrap: 'break-word'
    });
    
    // 根据类型设置背景色
    const colors = {
        success: '#34C759',
        error: '#FF3B30',
        warning: '#FF9500',
        info: '#007AFF'
    };
    notification.style.backgroundColor = colors[type] || colors.info;
    
    // 添加到页面
    document.body.appendChild(notification);
    
    // 动画显示
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // 自动隐藏
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// 平滑滚动
function initSmoothScroll() {
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
}

// 懒加载图片
function initLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// 页面加载时的动画
function initPageAnimations() {
    // 为特性卡片添加滚动动画
    const featureCards = document.querySelectorAll('.feature-card');
    
    const cardObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.animationPlayState = 'running';
            }
        });
    }, {
        threshold: 0.1
    });
    
    featureCards.forEach(card => {
        card.style.animationPlayState = 'paused';
        cardObserver.observe(card);
    });
}

// 性能优化：防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 窗口大小改变时的处理
function initResponsiveHandlers() {
    const handleResize = debounce(() => {
        // 移动端菜单在桌面端时自动关闭
        if (window.innerWidth > 768) {
            if (elements.navMenu && elements.navMenu.classList.contains('active')) {
                elements.navMenu.classList.remove('active');
                elements.mobileMenuToggle.classList.remove('active');
                const spans = elements.mobileMenuToggle.querySelectorAll('span');
                spans.forEach(span => {
                    span.style.transform = '';
                    span.style.opacity = '';
                });
            }
        }
    }, 250);
    
    window.addEventListener('resize', handleResize);
}

// 主初始化函数
function init() {
    // 检查浏览器支持
    if (!('IntersectionObserver' in window)) {
        console.warn('IntersectionObserver not supported, some features may not work');
    }
    
    // 初始化所有功能
    initMobileMenu();
    initModals();
    initFeedbackForm();
    initServiceForm();
    initLanguageSelector();
    initNewsletter();
    initSmoothScroll();
    initLazyLoading();
    initPageAnimations();
    initResponsiveHandlers();
    
    // 页面加载完成提示
    console.log('Potato 网站已加载完成');
}

// DOM 加载完成后初始化
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

// 导出一些函数供外部使用
window.PotatoApp = {
    showNotification,
    showSubscriptionStatus
};
