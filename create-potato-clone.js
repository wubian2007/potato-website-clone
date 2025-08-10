#!/usr/bin/env node

/**
 * 基于抓取结果创建完整的 Potato 网站复刻
 */

const fs = require('fs').promises;
const path = require('path');

class PotatoCloneCreator {
    constructor() {
        this.sourceDir = './curl-potato-content';
        this.outputDir = './potato-clone';
        this.cdnBase = 'https://cdn.jsdelivr.net';
    }

    async init() {
        console.log('🚀 初始化 Potato 网站复刻创建...');
        
        const dirs = [
            this.outputDir,
            path.join(this.outputDir, 'assets'),
            path.join(this.outputDir, 'assets/css'),
            path.join(this.outputDir, 'assets/js'),
            path.join(this.outputDir, 'assets/images')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }

        console.log('✅ 目录结构创建完成');
    }

    async createBootstrapCSS() {
        const bootstrapCSS = `/* Bootstrap 5.3.0 - 从 CDN 获取 */
@import url('${this.cdnBase}/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css');`;
        
        const cssPath = path.join(this.outputDir, 'assets/css/bootstrap.min.css');
        await fs.writeFile(cssPath, bootstrapCSS, 'utf8');
        console.log('✅ 创建 Bootstrap CSS');
    }

    async createJQueryJS() {
        const jqueryJS = `/* jQuery 3.7.1 - 从 CDN 获取 */
// 动态加载 jQuery
(function() {
    const script = document.createElement('script');
    script.src = '${this.cdnBase}/npm/jquery@3.7.1/dist/jquery.min.js';
    script.onload = function() {
        console.log('jQuery loaded successfully');
    };
    document.head.appendChild(script);
})();`;
        
        const jsPath = path.join(this.outputDir, 'assets/js/jquery.min.js');
        await fs.writeFile(jsPath, jqueryJS, 'utf8');
        console.log('✅ 创建 jQuery JS');
    }

    async createBootstrapJS() {
        const bootstrapJS = `/* Bootstrap 5.3.0 JS - 从 CDN 获取 */
// 动态加载 Bootstrap JS
(function() {
    const script = document.createElement('script');
    script.src = '${this.cdnBase}/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js';
    script.onload = function() {
        console.log('Bootstrap JS loaded successfully');
    };
    document.head.appendChild(script);
})();`;
        
        const jsPath = path.join(this.outputDir, 'assets/js/bootstrap.min.js');
        await fs.writeFile(jsPath, bootstrapJS, 'utf8');
        console.log('✅ 创建 Bootstrap JS');
    }

    async createCustomCSS() {
        const customCSS = `/* Potato 网站自定义样式 */
:root {
    --primary-color: #007EE5;
    --secondary-color: #F2FAFF;
    --text-color: #333333;
    --border-color: #E5E5E5;
}

body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    line-height: 1.6;
    color: var(--text-color);
}

.btn-primary {
    background-color: var(--primary-color);
    border-color: var(--primary-color);
}

.btn-primary:hover {
    background-color: #0056b3;
    border-color: #0056b3;
}

.navbar-brand {
    font-weight: bold;
    color: var(--primary-color) !important;
}

.hero-section {
    background: linear-gradient(135deg, var(--primary-color) 0%, #0056b3 100%);
    color: white;
    padding: 80px 0;
}

.feature-card {
    border: 1px solid var(--border-color);
    border-radius: 10px;
    padding: 30px;
    margin-bottom: 30px;
    transition: transform 0.3s ease;
}

.feature-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
}

.download-section {
    background-color: var(--secondary-color);
    padding: 60px 0;
}

.footer {
    background-color: #f8f9fa;
    padding: 40px 0;
    margin-top: 60px;
}

/* 响应式设计 */
@media (max-width: 768px) {
    .hero-section {
        padding: 40px 0;
    }
    
    .feature-card {
        padding: 20px;
    }
}

/* 动画效果 */
.animate-fade-in {
    animation: fadeIn 1s ease-in;
}

@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}

/* 版本选择器样式 */
.version-selector {
    position: absolute;
    left: 225px;
    background: #fff;
    border: 1px solid #ddd;
    border-radius: 16px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 5;
    padding: 20px;
    min-width: 180px;
    width: auto;
    display: none;
}

.float-box {
    height: 40px;
    padding: 6px 22px;
    width: auto;
    color: #333333;
    border: 1px solid rgba(229, 229, 229, 1);
    border-radius: 30px;
    display: flex;
    justify-content: left;
    align-items: center;
    text-decoration: none;
}

.float-box:hover {
    color: #ffffff !important;
    background: #007EE5 !important;
    border: 0;
    text-decoration: none;
}

.type-btn {
    height: 40px;
    width: 200px;
    font-size: 16px;
    color: #333333;
    background: #F2FAFF;
    border-radius: 30px;
    border: 0;
    transition: all ease 0.3s;
    display: flex;
    justify-content: center;
    align-items: center;
    text-decoration: none;
}

.type-btn:hover {
    background: #007EE5;
    color: white;
    text-decoration: none;
}`;
        
        const cssPath = path.join(this.outputDir, 'assets/css/main.css');
        await fs.writeFile(cssPath, customCSS, 'utf8');
        console.log('✅ 创建自定义 CSS');
    }

    async createCustomJS() {
        const customJS = `/* Potato 网站自定义 JavaScript */
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

window.addEventListener('scroll', animateOnScroll);`;
        
        const jsPath = path.join(this.outputDir, 'assets/js/main.js');
        await fs.writeFile(jsPath, customJS, 'utf8');
        console.log('✅ 创建自定义 JS');
    }

    async createPlaceholderImages() {
        const images = [
            { name: 'logo.png', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjUwIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9IiMwMDdFRTUiLz48dGV4dCB4PSI1MCUiIHk9IjUwJSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE2IiBmaWxsPSJ3aGl0ZSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPlBvdGF0bzwvdGV4dD48L3N2Zz4=' },
            { name: 'hero-bg.jpg', content: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwMCIgaGVpZ2h0PSI2MDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGxpbmVhckdyYWRpZW50IGlkPSJncmFkIiBncmFkaWVudFRyYW5zZm9ybT0icm90YXRlKDQ1KSI+PHN0b3Agb2Zmc2V0PSIwJSIgc3R5bGU9InN0b3AtY29sb3I6IzAwN0VFNTtzdG9wLW9wYWNpdHk6MSIgLz48c3RvcCBvZmZzZXQ9IjEwMCUiIHN0eWxlPSJzdG9wLWNvbG9yOiMwMDU2YjM7c3RvcC1vcGFjaXR5OjEiIC8+PC9saW5lYXJHcmFkaWVudD48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2dyYWQpIi8+PC9zdmc+' }
        ];

        for (const image of images) {
            const imagePath = path.join(this.outputDir, 'assets/images', image.name);
            await fs.writeFile(imagePath, image.content, 'utf8');
        }
        
        console.log('✅ 创建占位图片');
    }

    async processHTML(htmlContent, isMobile = false) {
        console.log(`🔄 处理 ${isMobile ? '移动端' : '桌面端'} HTML...`);
        
        let processedHTML = htmlContent;
        
        // 替换CSS路径
        processedHTML = processedHTML.replace(
            /href=["']([^"']*\.css[^"']*)["']/g,
            (match, href) => {
                if (href.includes('bootstrap')) {
                    return 'href="./assets/css/bootstrap.min.css"';
                } else if (href.includes('main.css')) {
                    return 'href="./assets/css/main.css"';
                }
                return match;
            }
        );
        
        // 替换JS路径
        processedHTML = processedHTML.replace(
            /src=["']([^"']*\.js[^"']*)["']/g,
            (match, src) => {
                if (src.includes('jquery')) {
                    return 'src="./assets/js/jquery.min.js"';
                } else if (src.includes('bootstrap')) {
                    return 'src="./assets/js/bootstrap.min.js"';
                } else if (src.includes('common.js') || src.includes('main.js')) {
                    return 'src="./assets/js/main.js"';
                }
                return match;
            }
        );
        
        // 替换图片路径
        processedHTML = processedHTML.replace(
            /src=["']([^"']*\.(png|jpg|jpeg|gif|svg|ico)[^"']*)["']/g,
            (match, src) => {
                const filename = path.basename(src.split('?')[0]);
                return `src="./assets/images/${filename}"`;
            }
        );
        
        // 添加CDN回退
        processedHTML = processedHTML.replace(
            '</head>',
            `<script>
                // CDN 回退机制
                window.addEventListener('error', function(e) {
                    if (e.target.tagName === 'LINK' || e.target.tagName === 'SCRIPT') {
                        const src = e.target.src || e.target.href;
                        if (src && src.includes('./assets/')) {
                            console.log('Local resource failed, trying CDN:', src);
                            // 可以在这里添加CDN回退逻辑
                        }
                    }
                }, true);
            </script>
            </head>`
        );
        
        return processedHTML;
    }

    async createClone() {
        console.log('\n🔥 开始创建 Potato 网站复刻...');
        
        try {
            // 创建静态资源
            await this.createBootstrapCSS();
            await this.createJQueryJS();
            await this.createBootstrapJS();
            await this.createCustomCSS();
            await this.createCustomJS();
            await this.createPlaceholderImages();
            
            // 处理桌面端HTML
            const desktopHtmlPath = path.join(this.sourceDir, 'desktop', 'index.html');
            const desktopHtml = await fs.readFile(desktopHtmlPath, 'utf8');
            const processedDesktopHtml = await this.processHTML(desktopHtml, false);
            
            const outputDesktopPath = path.join(this.outputDir, 'index.html');
            await fs.writeFile(outputDesktopPath, processedDesktopHtml, 'utf8');
            console.log('✅ 创建桌面端复刻页面');
            
            // 处理移动端HTML
            const mobileHtmlPath = path.join(this.sourceDir, 'mobile', 'index.html');
            const mobileHtml = await fs.readFile(mobileHtmlPath, 'utf8');
            const processedMobileHtml = await this.processHTML(mobileHtml, true);
            
            const outputMobilePath = path.join(this.outputDir, 'mobile.html');
            await fs.writeFile(outputMobilePath, processedMobileHtml, 'utf8');
            console.log('✅ 创建移动端复刻页面');
            
            // 创建README
            await this.createREADME();
            
            console.log('\n🎉 Potato 网站复刻创建完成！');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`🌐 桌面端: ${this.outputDir}/index.html`);
            console.log(`📱 移动端: ${this.outputDir}/mobile.html`);
            
        } catch (error) {
            console.error(`❌ 创建复刻失败: ${error.message}`);
            throw error;
        }
    }

    async createREADME() {
        const readme = `# 🥔 Potato 网站复刻

这是一个基于抓取结果创建的 Potato 网站本地复刻版本。

## 📁 文件结构

\`\`\`
potato-clone/
├── index.html          # 桌面端页面
├── mobile.html         # 移动端页面
├── assets/             # 静态资源
│   ├── css/           # 样式文件
│   ├── js/            # JavaScript文件
│   └── images/        # 图片文件
└── README.md          # 本文件
\`\`\`

## 🚀 使用方法

1. **查看桌面端**: 打开 \`index.html\`
2. **查看移动端**: 打开 \`mobile.html\`
3. **本地服务器**: 使用任何HTTP服务器运行

## 🔧 技术特点

- ✅ 完整的HTML结构
- ✅ 响应式设计
- ✅ Bootstrap 5.3.0 (CDN)
- ✅ jQuery 3.7.1 (CDN)
- ✅ 自定义样式和脚本
- ✅ 占位图片资源

## 📱 功能特性

- 多平台下载支持
- 响应式布局
- 动画效果
- 版本选择器
- 平滑滚动

## 🎯 注意事项

- 静态资源使用CDN加载
- 图片使用占位符
- 需要网络连接加载CDN资源
- 建议使用本地HTTP服务器运行

---
*基于 https://potato.im/ 抓取结果创建*
*创建时间: ${new Date().toISOString()}*
`;
        
        const readmePath = path.join(this.outputDir, 'README.md');
        await fs.writeFile(readmePath, readme, 'utf8');
        console.log('✅ 创建 README 文件');
    }

    async run() {
        console.log('🚀 开始创建 Potato 网站复刻...');
        console.log('=====================================');
        
        try {
            await this.init();
            await this.createClone();
            
            console.log('\n🎉 复刻任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`🌐 桌面端: ${this.outputDir}/index.html`);
            console.log(`📱 移动端: ${this.outputDir}/mobile.html`);

        } catch (error) {
            console.error(`💥 复刻任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行复刻任务
if (require.main === module) {
    const creator = new PotatoCloneCreator();
    creator.run().catch(console.error);
}

module.exports = PotatoCloneCreator;
