/**
 * Potato 网站精确副本 - 基于抓取内容的交互功能
 * 包含移动端和桌面端的完整功能实现
 */

class PotatoCrawledSite {
    constructor() {
        this.init();
        this.bindEvents();
        this.setupResponsive();
    }

    init() {
        console.log('🥔 Potato 精确副本已加载');
        this.setupDownloadTabs();
        this.setupAnimations();
    }

    // 下载标签页切换
    setupDownloadTabs() {
        const tabs = document.querySelectorAll('.download-tab');
        const panels = document.querySelectorAll('.download-panel');

        tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                
                // 更新标签状态
                tabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                // 更新面板状态
                panels.forEach(panel => {
                    panel.classList.remove('active');
                    if (panel.dataset.panel === target) {
                        panel.classList.add('active');
                    }
                });
            });
        });
    }

    // 设置动画
    setupAnimations() {
        // 滚动动画观察器
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                }
            });
        }, {
            threshold: 0.1
        });

        // 观察特性卡片
        document.querySelectorAll('.feature-card').forEach(card => {
            card.style.animationPlayState = 'paused';
            observer.observe(card);
        });
    }

    // 绑定事件
    bindEvents() {
        this.setupMobileMenu();
        this.setupModals();
        this.setupForms();
        this.setupDownloadButtons();
        this.setupScrollEffects();
    }

    // 移动端菜单
    setupMobileMenu() {
        const toggle = document.querySelector('.mobile-menu-toggle');
        const menu = document.querySelector('.nav-menu');
        
        if (toggle && menu) {
            toggle.addEventListener('click', () => {
                menu.classList.toggle('active');
                toggle.classList.toggle('active');
                
                // 汉堡菜单动画
                const spans = toggle.querySelectorAll('span');
                if (menu.classList.contains('active')) {
                    spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(7px, -6px)';
                } else {
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                }
            });
            
            // 点击菜单项时关闭菜单
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', () => {
                    menu.classList.remove('active');
                    toggle.classList.remove('active');
                    const spans = toggle.querySelectorAll('span');
                    spans.forEach(span => {
                        span.style.transform = '';
                        span.style.opacity = '';
                    });
                });
            });
        }
    }

    // 模态框控制
    setupModals() {
        // 打开模态框
        document.querySelectorAll('[data-modal]').forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                const modalId = trigger.dataset.modal;
                const modal = document.getElementById(modalId);
                if (modal) {
                    modal.classList.add('active');
                    document.body.style.overflow = 'hidden';
                }
            });
        });

        // 反馈按钮
        const feedbackBtn = document.querySelector('.feedback-btn');
        const feedbackModal = document.getElementById('feedback-modal');
        
        if (feedbackBtn && feedbackModal) {
            feedbackBtn.addEventListener('click', () => {
                feedbackModal.classList.add('active');
                document.body.style.overflow = 'hidden';
            });
        }

        // 关闭模态框
        document.querySelectorAll('.close-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const modal = btn.closest('.modal');
                if (modal) {
                    modal.classList.remove('active');
                    document.body.style.overflow = '';
                }
            });
        });

        // 点击背景关闭模态框
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

    // 表单处理
    setupForms() {
        // 反馈表单字符计数
        const feedbackText = document.getElementById('feedback-text');
        const charCount = document.getElementById('char-count');
        
        if (feedbackText && charCount) {
            feedbackText.addEventListener('input', () => {
                const count = feedbackText.value.length;
                charCount.textContent = count;
                
                // 字符数颜色变化
                if (count > 450) {
                    charCount.style.color = 'var(--warning-color)';
                } else if (count > 500) {
                    charCount.style.color = 'var(--error-color)';
                } else {
                    charCount.style.color = '';
                }
            });
        }

        // 文件上传
        const uploadArea = document.querySelector('.upload-area');
        const photoUpload = document.getElementById('photo-upload');
        
        if (uploadArea && photoUpload) {
            uploadArea.addEventListener('click', () => {
                photoUpload.click();
            });

            // 拖拽上传
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--primary-color)';
                uploadArea.style.backgroundColor = 'rgba(0, 122, 255, 0.05)';
            });

            uploadArea.addEventListener('dragleave', () => {
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = '';
                uploadArea.style.backgroundColor = '';
                
                const files = Array.from(e.dataTransfer.files).slice(0, 2);
                this.handleFileUpload(files);
            });

            photoUpload.addEventListener('change', (e) => {
                const files = Array.from(e.target.files).slice(0, 2);
                this.handleFileUpload(files);
            });
        }

        // 反馈表单提交
        const feedbackForm = document.querySelector('.feedback-form');
        if (feedbackForm) {
            feedbackForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const text = feedbackText ? feedbackText.value.trim() : '';
                if (!text) {
                    this.showNotification('请输入反馈内容', 'error');
                    return;
                }
                
                this.showNotification('反馈提交成功，感谢您的建议！', 'success');
                feedbackForm.reset();
                if (charCount) charCount.textContent = '0';
                
                setTimeout(() => {
                    const modal = feedbackForm.closest('.modal');
                    if (modal) {
                        modal.classList.remove('active');
                        document.body.style.overflow = '';
                    }
                }, 1500);
            });
        }

        // 邮件订阅
        const newsletterForm = document.querySelector('.newsletter-form');
        if (newsletterForm) {
            newsletterForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const emailInput = newsletterForm.querySelector('input[type="email"]');
                const email = emailInput ? emailInput.value.trim() : '';
                
                if (!email) {
                    this.showNotification('请输入邮箱地址', 'error');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    this.showNotification('邮箱地址格式不正确', 'error');
                    return;
                }
                
                this.showNotification('订阅成功！', 'success');
                if (emailInput) emailInput.value = '';
            });
        }
    }

    // 文件上传处理
    handleFileUpload(files) {
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                this.showNotification('只能上传图片文件', 'error');
                return false;
            }
            
            if (file.size > 3 * 1024 * 1024) {
                this.showNotification(`文件 ${file.name} 超过3MB限制`, 'error');
                return false;
            }
            
            return true;
        });
        
        if (validFiles.length > 0) {
            this.showNotification(`成功选择 ${validFiles.length} 张图片`, 'success');
            
            const uploadText = document.querySelector('.upload-text');
            if (uploadText) {
                uploadText.innerHTML = `
                    <p>已选择 ${validFiles.length} 张图片</p>
                    <div class="file-list">
                        ${validFiles.map(file => `<div class="file-item">${file.name}</div>`).join('')}
                    </div>
                `;
            }
        }
    }

    // 下载按钮处理
    setupDownloadButtons() {
        document.querySelectorAll('.download-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                
                const platform = btn.classList.contains('android') ? 'Android' :
                               btn.classList.contains('ios') ? 'iOS' :
                               btn.classList.contains('windows') ? 'Windows' :
                               btn.classList.contains('macos') ? 'macOS' :
                               btn.classList.contains('linux') ? 'Linux' : '未知平台';
                
                this.showNotification(`正在为您准备 ${platform} 版本下载...`, 'info');
                
                // 模拟下载延迟
                setTimeout(() => {
                    this.showNotification(`${platform} 版本下载链接已准备就绪`, 'success');
                }, 2000);
            });
        });
    }

    // 滚动效果
    setupScrollEffects() {
        // 导航栏滚动效果
        const header = document.querySelector('.header');
        let lastScrollY = window.scrollY;
        
        window.addEventListener('scroll', () => {
            const currentScrollY = window.scrollY;
            
            if (header) {
                if (currentScrollY > 100) {
                    header.style.backdropFilter = 'blur(10px)';
                    header.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
                } else {
                    header.style.backdropFilter = '';
                    header.style.backgroundColor = '';
                }
                
                // 滚动时隐藏/显示导航栏
                if (currentScrollY > lastScrollY && currentScrollY > 200) {
                    header.style.transform = 'translateY(-100%)';
                } else {
                    header.style.transform = 'translateY(0)';
                }
            }
            
            lastScrollY = currentScrollY;
        });

        // 平滑滚动到锚点
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // 响应式处理
    setupResponsive() {
        const handleResize = this.debounce(() => {
            // 移动端菜单在桌面端时自动关闭
            if (window.innerWidth > 768) {
                const menu = document.querySelector('.nav-menu');
                const toggle = document.querySelector('.mobile-menu-toggle');
                
                if (menu && menu.classList.contains('active')) {
                    menu.classList.remove('active');
                    if (toggle) {
                        toggle.classList.remove('active');
                        const spans = toggle.querySelectorAll('span');
                        spans.forEach(span => {
                            span.style.transform = '';
                            span.style.opacity = '';
                        });
                    }
                }
            }
            
            // 更新下载按钮布局
            this.updateDownloadLayout();
        }, 250);
        
        window.addEventListener('resize', handleResize);
        
        // 初始化时调用一次
        this.updateDownloadLayout();
    }

    // 更新下载按钮布局
    updateDownloadLayout() {
        const downloadGrids = document.querySelectorAll('.download-grid');
        const isMobile = window.innerWidth <= 768;
        
        downloadGrids.forEach(grid => {
            if (isMobile) {
                grid.style.gridTemplateColumns = '1fr';
            } else {
                grid.style.gridTemplateColumns = 'repeat(auto-fit, minmax(280px, 1fr))';
            }
        });
    }

    // 工具函数
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    debounce(func, wait) {
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

    // 通知系统
    showNotification(message, type = 'info') {
        // 移除现有通知
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => {
            notification.remove();
        });

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // 样式
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
            wordWrap: 'break-word',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            fontSize: '14px'
        });
        
        // 类型颜色
        const colors = {
            success: '#34C759',
            error: '#FF3B30',
            warning: '#FF9500',
            info: '#007EE5'
        };
        notification.style.backgroundColor = colors[type] || colors.info;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 显示动画
        requestAnimationFrame(() => {
            notification.style.transform = 'translateX(0)';
        });
        
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

    // 语言切换
    switchLanguage(lang) {
        // 这里可以实现真正的语言切换逻辑
        const languages = {
            'zh': '简体中文',
            'en': 'English',
            'tw': '繁體中文'
        };
        
        this.showNotification(`语言已切换到 ${languages[lang] || '简体中文'}`, 'success');
        
        // 存储语言设置
        localStorage.setItem('potato-language', lang);
    }

    // 设备检测
    detectDevice() {
        const userAgent = navigator.userAgent.toLowerCase();
        const isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(userAgent);
        const isTablet = /ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP)))/.test(userAgent);
        
        return {
            isMobile,
            isTablet,
            isDesktop: !isMobile && !isTablet,
            platform: this.getPlatform(userAgent)
        };
    }

    getPlatform(userAgent) {
        if (userAgent.includes('android')) return 'android';
        if (userAgent.includes('iphone') || userAgent.includes('ipad')) return 'ios';
        if (userAgent.includes('windows')) return 'windows';
        if (userAgent.includes('mac')) return 'macos';
        if (userAgent.includes('linux')) return 'linux';
        return 'unknown';
    }

    // 性能监控
    trackPerformance() {
        if ('performance' in window) {
            window.addEventListener('load', () => {
                setTimeout(() => {
                    const perfData = performance.getEntriesByType('navigation')[0];
                    const loadTime = perfData ? perfData.loadEventEnd - perfData.loadEventStart : 0;
                    
                    console.log('🚀 页面加载性能:', {
                        loadTime: `${loadTime}ms`,
                        domContentLoaded: `${perfData ? perfData.domContentLoadedEventEnd - perfData.domContentLoadedEventStart : 0}ms`,
                        firstPaint: performance.getEntriesByType('paint').find(entry => entry.name === 'first-paint')?.startTime || 0
                    });
                }, 0);
            });
        }
    }
}

// 初始化应用
document.addEventListener('DOMContentLoaded', () => {
    window.PotatoApp = new PotatoCrawledSite();
    
    // 语言选择器
    const languageSelector = document.getElementById('language');
    if (languageSelector) {
        // 恢复保存的语言设置
        const savedLang = localStorage.getItem('potato-language') || 'zh';
        languageSelector.value = savedLang;
        
        languageSelector.addEventListener('change', (e) => {
            window.PotatoApp.switchLanguage(e.target.value);
        });
    }
    
    // 性能监控
    window.PotatoApp.trackPerformance();
    
    // 设备信息
    const deviceInfo = window.PotatoApp.detectDevice();
    console.log('📱 设备信息:', deviceInfo);
    
    // 根据设备推荐下载
    if (deviceInfo.isMobile) {
        const mobileTab = document.querySelector('.download-tab[data-tab="mobile"]');
        if (mobileTab && !mobileTab.classList.contains('active')) {
            mobileTab.click();
        }
    }
});

// 导出给外部使用
window.PotatoCrawled = {
    showNotification: (message, type) => {
        if (window.PotatoApp) {
            window.PotatoApp.showNotification(message, type);
        }
    },
    switchLanguage: (lang) => {
        if (window.PotatoApp) {
            window.PotatoApp.switchLanguage(lang);
        }
    }
};

// 错误处理
window.addEventListener('error', (e) => {
    console.error('🚨 页面错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('🚨 未处理的 Promise 拒绝:', e.reason);
});
