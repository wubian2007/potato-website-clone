#!/usr/bin/env node

/**
 * 快速 Potato 网站抓取脚本
 * 使用 Firecrawl MCP 服务快速抓取 https://potato.im/ 的核心内容
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class QuickPotatoCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.mobileUrl = 'https://m.potato.im/';
        this.outputDir = './quick-potato-content';
        this.results = [];
        this.apiKey = 'fc-c6c470036718491484dfa3b5d8c4d14d';
    }

    async init() {
        console.log('🚀 初始化快速抓取任务...');
        
        // 创建输出目录
        const dirs = [
            this.outputDir,
            path.join(this.outputDir, 'desktop'),
            path.join(this.outputDir, 'mobile')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }

        console.log('✅ 目录结构创建完成');
    }

    async runFirecrawlMCP(url, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔥 快速抓取: ${url}`);
            
            const args = [
                'scrape',
                url,
                '--format', 'html',
                '--include-links',
                '--include-metadata',
                '--wait-for', '500'
            ];

            // 添加移动端选项
            if (options.mobile) {
                args.push('--mobile');
            }

            const firecrawl = spawn('firecrawl-mcp', args, {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: { ...process.env, FIRECRAWL_API_KEY: this.apiKey }
            });

            let stdout = '';
            let stderr = '';
            let startTime = Date.now();

            // 简化的进度指示器
            const progressInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                process.stdout.write(`\r   ⏱️ 抓取中... ${elapsed}秒`);
            }, 1000);

            firecrawl.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            firecrawl.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            firecrawl.on('close', (code) => {
                clearInterval(progressInterval);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`\n   ✅ 完成，耗时: ${elapsed}秒`);
                
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (error) {
                        resolve({
                            content: stdout,
                            url: url,
                            success: true
                        });
                    }
                } else {
                    reject(new Error(`Firecrawl MCP failed with code ${code}: ${stderr}`));
                }
            });

            firecrawl.on('error', (error) => {
                clearInterval(progressInterval);
                reject(new Error(`Failed to start Firecrawl MCP: ${error.message}`));
            });
        });
    }

    async scrapeWithFirecrawl(url, filename, options = {}) {
        try {
            console.log(`\n📄 抓取页面: ${url}`);
            
            const result = await this.runFirecrawlMCP(url, options);
            
            if (!result || !result.html) {
                throw new Error('No HTML content received');
            }

            // 确定输出目录
            const outputDir = options.mobile ? 
                path.join(this.outputDir, 'mobile') : 
                path.join(this.outputDir, 'desktop');
            
            // 保存HTML文件
            const htmlPath = path.join(outputDir, filename);
            await fs.writeFile(htmlPath, result.html, 'utf8');
            
            // 保存原始结果
            const jsonPath = path.join(outputDir, filename.replace('.html', '.json'));
            await fs.writeFile(jsonPath, JSON.stringify(result, null, 2), 'utf8');

            console.log(`✅ 保存页面: ${filename} (${result.html.length} 字节)`);
            
            this.results.push({
                url,
                filename,
                options,
                result: {
                    success: true,
                    size: result.html.length,
                    hasLinks: !!(result.linksOnPage && result.linksOnPage.length > 0),
                    metadata: result.metadata || null
                },
                timestamp: new Date().toISOString()
            });

            return result;

        } catch (error) {
            console.error(`❌ 抓取失败: ${url} - ${error.message}`);
            
            this.results.push({
                url,
                filename,
                options,
                result: {
                    success: false,
                    error: error.message
                },
                timestamp: new Date().toISOString()
            });

            return null;
        }
    }

    async crawlMainPages() {
        console.log('\n🔥 开始快速抓取主要页面...');
        
        // 只抓取最重要的两个页面
        const pages = [
            { url: this.baseUrl, filename: 'index.html', mobile: false },
            { url: this.mobileUrl, filename: 'index.html', mobile: true }
        ];

        console.log(`📋 计划抓取 ${pages.length} 个页面:`);
        pages.forEach((page, index) => {
            console.log(`   ${index + 1}. ${page.url} (${page.mobile ? '移动端' : '桌面端'})`);
        });

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            console.log(`\n🔄 [${i + 1}/${pages.length}] 开始抓取: ${page.url}`);
            
            await this.scrapeWithFirecrawl(page.url, page.filename, { mobile: page.mobile });
            
            if (i < pages.length - 1) {
                console.log(`⏳ 等待 0.5 秒后继续...`);
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        }
        
        console.log(`\n✅ 主要页面抓取完成！`);
    }

    async generateReport() {
        console.log('\n📊 生成抓取报告...');
        
        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                totalPages: this.results.length,
                successfulPages: this.results.filter(r => r.result.success).length,
                failedPages: this.results.filter(r => !r.result.success).length,
                successRate: (this.results.filter(r => r.result.success).length / this.results.length * 100).toFixed(2) + '%'
            },
            results: this.results,
            outputDirectory: this.outputDir
        };

        const reportPath = path.join(this.outputDir, 'quick-crawl-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.outputDir, 'QUICK_CRAWL_REPORT.md');
        await fs.writeFile(markdownPath, markdownReport, 'utf8');

        console.log(`✅ 报告已生成: ${reportPath}`);
        console.log(`✅ Markdown报告: ${markdownPath}`);
    }

    generateMarkdownReport(report) {
        return `# 🚀 快速 Potato 网站抓取报告

## 📊 抓取概览

- **抓取时间**: ${report.timestamp}
- **总页面数**: ${report.summary.totalPages}
- **成功页面**: ${report.summary.successfulPages}
- **失败页面**: ${report.summary.failedPages}
- **成功率**: ${report.summary.successRate}

## 📁 输出目录结构

\`\`\`
${this.outputDir}/
├── desktop/          # 桌面端页面
├── mobile/           # 移动端页面
├── quick-crawl-report.json # 详细报告
└── QUICK_CRAWL_REPORT.md  # 本报告
\`\`\`

## 📝 详细结果

### 成功抓取的页面
${this.results.filter(r => r.result.success).map(r => 
`- **${r.filename}**: ${r.url} (${r.result.size} 字节)`
).join('\n')}

### 失败的页面
${this.results.filter(r => !r.result.success).map(r => 
`- **${r.filename}**: ${r.url} - ${r.result.error}`
).join('\n')}

## 🎯 抓取内容

### 包含的内容类型
- ✅ HTML页面结构
- ✅ 页面元数据
- ✅ 页面链接
- ✅ 桌面端和移动端版本

## 🚀 使用说明

1. **查看桌面端**: 打开 \`desktop/index.html\`
2. **查看移动端**: 打开 \`mobile/index.html\`
3. **查看报告**: 查看 \`quick-crawl-report.json\`

---
*报告生成时间: ${report.timestamp}*
`;
    }

    async run() {
        console.log('🚀 开始快速 Potato 网站抓取任务...');
        console.log('=====================================');
        
        try {
            await this.init();
            
            // 抓取主要页面
            await this.crawlMainPages();
            
            // 生成报告
            await this.generateReport();
            
            console.log('\n🎉 快速抓取任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 成功页面: ${this.results.filter(r => r.result.success).length}`);
            console.log(`❌ 失败页面: ${this.results.filter(r => !r.result.success).length}`);
            console.log(`📋 查看详细报告: ${this.outputDir}/QUICK_CRAWL_REPORT.md`);

        } catch (error) {
            console.error(`💥 抓取任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行抓取任务
if (require.main === module) {
    const crawler = new QuickPotatoCrawler();
    crawler.run().catch(console.error);
}

module.exports = QuickPotatoCrawler;
