/* Potato 网站自定义 JavaScript */
document.addEventListener('DOMContentLoaded', function() {
    console.log('Potato Clone loaded successfully');
    
    // 初始化工具提示
    var tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    var tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
    
    // 版本选择器功能
    const downloadButtons = document.querySelectorAll('.download-btn');
    downloadButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const platform = this.getAttribute('data-platform');
            showVersionSelector(platform);
        });
    });
    
    // 关闭版本选择器
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.version-selector') && !e.target.closest('.download-btn')) {
            hideAllVersionSelectors();
        }
    });
});

function showVersionSelector(platform) {
    hideAllVersionSelectors();
    const selector = document.getElementById(platform + '_download_float');
    if (selector) {
        selector.style.display = 'block';
        selector.classList.add('show');
    }
}

function hideAllVersionSelectors() {
    const selectors = document.querySelectorAll('.version-selector');
    selectors.forEach(selector => {
        selector.style.display = 'none';
        selector.classList.remove('show');
    });
}

// 平滑滚动
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        element.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }
}

// 动画效果
function animateOnScroll() {
    const elements = document.querySelectorAll('.animate-fade-in');
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementVisible = 150;
        
        if (elementTop < window.innerHeight - elementVisible) {
            element.classList.add('animate-fade-in');
        }
    });
}

window.addEventListener('scroll', animateOnScroll);