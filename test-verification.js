#!/usr/bin/env node

/**
 * Potato 完美复刻版验证测试脚本
 * 全面测试所有功能和兼容性
 */

const fs = require('fs').promises;
const path = require('path');

class PotatoCloneTester {
    constructor() {
        this.testResults = [];
        this.startTime = Date.now();
    }

    async runAllTests() {
        console.log('🧪 开始 Potato 完美复刻版验证测试...');
        console.log('==========================================');
        
        // 文件存在性测试
        await this.testFileExistence();
        
        // 内容完整性测试
        await this.testContentIntegrity();
        
        // 图片资源测试
        await this.testImageResources();
        
        // 功能特性测试
        await this.testFeatures();
        
        // 多语言支持测试
        await this.testMultilingual();
        
        // 响应式设计测试
        await this.testResponsiveDesign();
        
        // 性能测试
        await this.testPerformance();
        
        // 生成测试报告
        await this.generateTestReport();
    }

    async testFileExistence() {
        console.log('\n📁 文件存在性测试...');
        
        const requiredFiles = [
            'potato-perfect-clone.html',
            'potato-perfect-clone.css',
            'potato-perfect-clone.js',
            'start-perfect-clone.sh',
            'images/potato-logo.png',
            'images/favicon.ico',
            'images/potato-logo.svg'
        ];

        for (const file of requiredFiles) {
            try {
                await fs.access(file);
                this.addTestResult('文件存在', file, 'PASS', '文件存在且可访问');
            } catch (error) {
                this.addTestResult('文件存在', file, 'FAIL', `文件不存在: ${error.message}`);
            }
        }
    }

    async testContentIntegrity() {
        console.log('\n📝 内容完整性测试...');
        
        try {
            const htmlContent = await fs.readFile('potato-perfect-clone.html', 'utf8');
            
            // 测试关键内容
            const contentTests = [
                {
                    name: '中文标题',
                    pattern: /让全球用户的沟通变得简单、安全、可靠且有趣/,
                    description: '包含中文主标题'
                },
                {
                    name: '语言选择器',
                    pattern: /简体中文.*English.*繁體中文/,
                    description: '包含三种语言选项'
                },
                {
                    name: '官方 Logo',
                    pattern: /images\/potato-logo\.png/,
                    description: '使用官方下载的 logo'
                },
                {
                    name: '下载链接',
                    pattern: /download\.potato\.im/,
                    description: '包含官方下载链接'
                },
                {
                    name: '功能特性',
                    pattern: /为什么全球用户选择 Potato Chat/,
                    description: '包含功能特性标题'
                },
                {
                    name: '热门问题',
                    pattern: /热门问题/,
                    description: '包含热门问题区域'
                }
            ];

            for (const test of contentTests) {
                if (test.pattern.test(htmlContent)) {
                    this.addTestResult('内容完整性', test.name, 'PASS', test.description);
                } else {
                    this.addTestResult('内容完整性', test.name, 'FAIL', `缺少: ${test.description}`);
                }
            }
        } catch (error) {
            this.addTestResult('内容完整性', 'HTML 读取', 'FAIL', `无法读取 HTML 文件: ${error.message}`);
        }
    }

    async testImageResources() {
        console.log('\n🖼️ 图片资源测试...');
        
        try {
            // 测试 PNG logo
            const pngStats = await fs.stat('images/potato-logo.png');
            if (pngStats.size > 50000) { // 大于 50KB
                this.addTestResult('图片资源', 'PNG Logo 质量', 'PASS', `高质量 PNG logo (${(pngStats.size/1024).toFixed(1)}KB)`);
            } else {
                this.addTestResult('图片资源', 'PNG Logo 质量', 'WARN', `PNG logo 可能质量较低 (${(pngStats.size/1024).toFixed(1)}KB)`);
            }

            // 测试 ICO 文件
            const icoStats = await fs.stat('images/favicon.ico');
            this.addTestResult('图片资源', 'Favicon', 'PASS', `Favicon 存在 (${(icoStats.size/1024).toFixed(1)}KB)`);

            // 测试 SVG 文件
            const svgContent = await fs.readFile('images/potato-logo.svg', 'utf8');
            if (svgContent.includes('<svg')) {
                this.addTestResult('图片资源', 'SVG Logo', 'PASS', 'SVG logo 格式正确');
            } else {
                this.addTestResult('图片资源', 'SVG Logo', 'FAIL', 'SVG logo 格式错误');
            }

        } catch (error) {
            this.addTestResult('图片资源', '图片检查', 'FAIL', `图片资源检查失败: ${error.message}`);
        }
    }

    async testFeatures() {
        console.log('\n⚙️ 功能特性测试...');
        
        try {
            const jsContent = await fs.readFile('potato-perfect-clone.js', 'utf8');
            
            const featureTests = [
                {
                    name: '语言切换',
                    pattern: /initLanguageSelector/,
                    description: '语言切换功能'
                },
                {
                    name: '反馈弹窗',
                    pattern: /initFeedbackModal/,
                    description: '反馈弹窗功能'
                },
                {
                    name: '邮件订阅',
                    pattern: /initNewsletterForm/,
                    description: '邮件订阅功能'
                },
                {
                    name: '移动菜单',
                    pattern: /initMobileMenu/,
                    description: '移动端菜单功能'
                },
                {
                    name: '下载追踪',
                    pattern: /initDownloadTracking/,
                    description: '下载追踪功能'
                },
                {
                    name: '滚动效果',
                    pattern: /initScrollEffects/,
                    description: '滚动动画效果'
                },
                {
                    name: '通知系统',
                    pattern: /showNotification/,
                    description: '通知系统功能'
                }
            ];

            for (const test of featureTests) {
                if (test.pattern.test(jsContent)) {
                    this.addTestResult('功能特性', test.name, 'PASS', test.description);
                } else {
                    this.addTestResult('功能特性', test.name, 'FAIL', `缺少: ${test.description}`);
                }
            }
        } catch (error) {
            this.addTestResult('功能特性', 'JS 功能', 'FAIL', `JavaScript 功能检查失败: ${error.message}`);
        }
    }

    async testMultilingual() {
        console.log('\n🌍 多语言支持测试...');
        
        try {
            const jsContent = await fs.readFile('potato-perfect-clone.js', 'utf8');
            
            const languageTests = [
                {
                    name: '简体中文',
                    pattern: /简体中文/,
                    description: '简体中文支持'
                },
                {
                    name: 'English',
                    pattern: /English/,
                    description: '英文支持'
                },
                {
                    name: '繁體中文',
                    pattern: /繁體中文/,
                    description: '繁体中文支持'
                },
                {
                    name: '语言切换逻辑',
                    pattern: /updatePageLanguage/,
                    description: '语言切换逻辑'
                },
                {
                    name: '默认中文',
                    pattern: /languageSelector\.value = 'zh'/,
                    description: '默认设置为简体中文'
                }
            ];

            for (const test of languageTests) {
                if (test.pattern.test(jsContent)) {
                    this.addTestResult('多语言支持', test.name, 'PASS', test.description);
                } else {
                    this.addTestResult('多语言支持', test.name, 'FAIL', `缺少: ${test.description}`);
                }
            }
        } catch (error) {
            this.addTestResult('多语言支持', '语言功能', 'FAIL', `多语言功能检查失败: ${error.message}`);
        }
    }

    async testResponsiveDesign() {
        console.log('\n📱 响应式设计测试...');
        
        try {
            const cssContent = await fs.readFile('potato-perfect-clone.css', 'utf8');
            
            const responsiveTests = [
                {
                    name: '移动端断点',
                    pattern: /@media.*max-width.*768px/,
                    description: '移动端响应式断点'
                },
                {
                    name: '小屏幕断点',
                    pattern: /@media.*max-width.*480px/,
                    description: '小屏幕响应式断点'
                },
                {
                    name: 'Flexbox 布局',
                    pattern: /display.*flex/,
                    description: '使用 Flexbox 布局'
                },
                {
                    name: 'Grid 布局',
                    pattern: /display.*grid/,
                    description: '使用 Grid 布局'
                },
                {
                    name: '视口设置',
                    pattern: /viewport.*width=device-width/,
                    description: '正确的视口设置'
                }
            ];

            for (const test of responsiveTests) {
                if (test.pattern.test(cssContent)) {
                    this.addTestResult('响应式设计', test.name, 'PASS', test.description);
                } else {
                    this.addTestResult('响应式设计', test.name, 'FAIL', `缺少: ${test.description}`);
                }
            }
        } catch (error) {
            this.addTestResult('响应式设计', 'CSS 响应式', 'FAIL', `响应式设计检查失败: ${error.message}`);
        }
    }

    async testPerformance() {
        console.log('\n⚡ 性能测试...');
        
        try {
            const htmlContent = await fs.readFile('potato-perfect-clone.html', 'utf8');
            const cssContent = await fs.readFile('potato-perfect-clone.css', 'utf8');
            const jsContent = await fs.readFile('potato-perfect-clone.js', 'utf8');
            
            // 文件大小测试
            const htmlSize = Buffer.byteLength(htmlContent, 'utf8');
            const cssSize = Buffer.byteLength(cssContent, 'utf8');
            const jsSize = Buffer.byteLength(jsContent, 'utf8');
            
            if (htmlSize < 50000) { // 小于 50KB
                this.addTestResult('性能', 'HTML 大小', 'PASS', `HTML 文件大小适中 (${(htmlSize/1024).toFixed(1)}KB)`);
            } else {
                this.addTestResult('性能', 'HTML 大小', 'WARN', `HTML 文件较大 (${(htmlSize/1024).toFixed(1)}KB)`);
            }
            
            if (cssSize < 30000) { // 小于 30KB
                this.addTestResult('性能', 'CSS 大小', 'PASS', `CSS 文件大小适中 (${(cssSize/1024).toFixed(1)}KB)`);
            } else {
                this.addTestResult('性能', 'CSS 大小', 'WARN', `CSS 文件较大 (${(cssSize/1024).toFixed(1)}KB)`);
            }
            
            if (jsSize < 20000) { // 小于 20KB
                this.addTestResult('性能', 'JS 大小', 'PASS', `JavaScript 文件大小适中 (${(jsSize/1024).toFixed(1)}KB)`);
            } else {
                this.addTestResult('性能', 'JS 大小', 'WARN', `JavaScript 文件较大 (${(jsSize/1024).toFixed(1)}KB)`);
            }
            
            // 性能优化测试
            const performanceTests = [
                {
                    name: '字体预加载',
                    pattern: /rel="preconnect"/,
                    description: '字体资源预连接'
                },
                {
                    name: 'CSS 优化',
                    pattern: /transition.*ease/,
                    description: 'CSS 过渡动画优化'
                },
                {
                    name: '图片优化',
                    pattern: /object-fit.*contain/,
                    description: '图片显示优化'
                }
            ];

            for (const test of performanceTests) {
                if (test.pattern.test(htmlContent) || test.pattern.test(cssContent)) {
                    this.addTestResult('性能优化', test.name, 'PASS', test.description);
                } else {
                    this.addTestResult('性能优化', test.name, 'FAIL', `缺少: ${test.description}`);
                }
            }
        } catch (error) {
            this.addTestResult('性能', '性能检查', 'FAIL', `性能检查失败: ${error.message}`);
        }
    }

    addTestResult(category, testName, status, description) {
        this.testResults.push({
            category,
            testName,
            status,
            description,
            timestamp: new Date().toISOString()
        });
        
        const statusIcon = status === 'PASS' ? '✅' : status === 'WARN' ? '⚠️' : '❌';
        console.log(`  ${statusIcon} ${testName}: ${description}`);
    }

    async generateTestReport() {
        const endTime = Date.now();
        const duration = endTime - this.startTime;
        
        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.status === 'PASS').length;
        const failedTests = this.testResults.filter(r => r.status === 'FAIL').length;
        const warningTests = this.testResults.filter(r => r.status === 'WARN').length;
        
        const successRate = ((passedTests / totalTests) * 100).toFixed(1);
        
        console.log('\n📊 测试报告');
        console.log('==========================================');
        console.log(`⏱️  测试耗时: ${duration}ms`);
        console.log(`📈 总测试数: ${totalTests}`);
        console.log(`✅ 通过: ${passedTests}`);
        console.log(`⚠️  警告: ${warningTests}`);
        console.log(`❌ 失败: ${failedTests}`);
        console.log(`📊 成功率: ${successRate}%`);
        
        // 按类别统计
        const categories = [...new Set(this.testResults.map(r => r.category))];
        console.log('\n📋 分类统计:');
        for (const category of categories) {
            const categoryTests = this.testResults.filter(r => r.category === category);
            const categoryPassed = categoryTests.filter(r => r.status === 'PASS').length;
            const categoryTotal = categoryTests.length;
            const categoryRate = ((categoryPassed / categoryTotal) * 100).toFixed(1);
            console.log(`  ${category}: ${categoryPassed}/${categoryTotal} (${categoryRate}%)`);
        }
        
        // 失败测试详情
        const failedTestsList = this.testResults.filter(r => r.status === 'FAIL');
        if (failedTestsList.length > 0) {
            console.log('\n❌ 失败测试详情:');
            failedTestsList.forEach(test => {
                console.log(`  - ${test.category} > ${test.testName}: ${test.description}`);
            });
        }
        
        // 保存详细报告
        const report = {
            timestamp: new Date().toISOString(),
            duration: duration,
            summary: {
                total: totalTests,
                passed: passedTests,
                failed: failedTests,
                warning: warningTests,
                successRate: successRate
            },
            results: this.testResults
        };
        
        await fs.writeFile('test-report.json', JSON.stringify(report, null, 2));
        console.log('\n📄 详细报告已保存到: test-report.json');
        
        // 最终评估
        if (successRate >= 90) {
            console.log('\n🎉 测试结果: 优秀！完美复刻版质量很高');
        } else if (successRate >= 80) {
            console.log('\n👍 测试结果: 良好！大部分功能正常');
        } else if (successRate >= 70) {
            console.log('\n⚠️  测试结果: 一般！需要一些改进');
        } else {
            console.log('\n❌ 测试结果: 需要修复！存在较多问题');
        }
    }
}

// 运行测试
const tester = new PotatoCloneTester();
tester.runAllTests().catch(console.error);
