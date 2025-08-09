#!/usr/bin/env node

/**
 * Potato 网站 Firecrawl MCP 抓取脚本
 * 使用 Firecrawl MCP 服务抓取 https://potato.im/ 的完整内容
 * 与 Puppeteer 结果进行对比分析
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class FirecrawlPotatoCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.outputDir = './firecrawl-content';
        this.crawledPages = new Set();
        this.crawlResults = [];
    }

    async init() {
        // 创建输出目录
        await this.ensureDir(this.outputDir);
        await this.ensureDir(path.join(this.outputDir, 'pages'));
        await this.ensureDir(path.join(this.outputDir, 'analysis'));
        
        console.log('📁 输出目录已创建');
    }

    async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    async runFirecrawlMCP(url, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔥 使用 Firecrawl MCP 抓取: ${url}`);
            
            const args = [
                'scrape',
                url,
                '--format', 'html',
                '--include-links',
                '--include-metadata'
            ];

            // 添加移动端选项
            if (options.mobile) {
                args.push('--mobile');
            }

            // 添加深度抓取选项
            if (options.crawl) {
                args.push('--crawl');
                args.push('--max-depth', '2');
                args.push('--max-pages', '10');
            }

            const firecrawl = spawn('firecrawl-mcp', args, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';

            firecrawl.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            firecrawl.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            firecrawl.on('close', (code) => {
                if (code === 0) {
                    try {
                        // 尝试解析 JSON 输出
                        const result = JSON.parse(stdout);
                        resolve(result);
                    } catch (error) {
                        // 如果不是 JSON，返回原始文本
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
                reject(new Error(`Failed to start Firecrawl MCP: ${error.message}`));
            });
        });
    }

    async scrapeWithFirecrawl(url, filename, options = {}) {
        try {
            const result = await this.runFirecrawlMCP(url, options);
            
            // 保存结果
            const filePath = path.join(this.outputDir, 'pages', filename);
            
            if (result.content) {
                await fs.writeFile(filePath, result.content, 'utf8');
            } else if (result.html) {
                await fs.writeFile(filePath, result.html, 'utf8');
            } else {
                await fs.writeFile(filePath, JSON.stringify(result, null, 2), 'utf8');
            }

            console.log(`✅ 保存页面: ${filename}`);
            
            this.crawlResults.push({
                url,
                filename,
                options,
                result: {
                    success: true,
                    size: result.content ? result.content.length : 0,
                    hasLinks: !!(result.links && result.links.length > 0),
                    metadata: result.metadata || null
                },
                timestamp: new Date().toISOString()
            });

            return result;

        } catch (error) {
            console.error(`❌ 抓取失败: ${url} - ${error.message}`);
            
            this.crawlResults.push({
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
        console.log('🔥 开始使用 Firecrawl MCP 抓取主要页面...');
        
        const pages = [
            { url: this.baseUrl, filename: 'index-desktop.html', mobile: false },
            { url: this.baseUrl, filename: 'index-mobile.html', mobile: true },
            { url: 'https://potato.im/apps', filename: 'apps.html', mobile: false },
            { url: 'https://potato.im/api', filename: 'api.html', mobile: false },
            { url: 'https://potato.im/faq', filename: 'faq.html', mobile: false },
            { url: 'https://potato.im/privacy', filename: 'privacy.html', mobile: false },
            { url: 'https://potato.im/news', filename: 'news.html', mobile: false }
        ];

        for (const page of pages) {
            await this.scrapeWithFirecrawl(page.url, page.filename, { mobile: page.mobile });
            
            // 添加延迟避免请求过于频繁
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    async performCrawlAnalysis() {
        console.log('🔥 执行深度抓取分析...');
        
        try {
            const crawlResult = await this.runFirecrawlMCP(this.baseUrl, { 
                crawl: true,
                mobile: false 
            });
            
            // 保存深度抓取结果
            const crawlPath = path.join(this.outputDir, 'analysis', 'deep-crawl.json');
            await fs.writeFile(crawlPath, JSON.stringify(crawlResult, null, 2), 'utf8');
            
            console.log('✅ 深度抓取分析完成');
            return crawlResult;

        } catch (error) {
            console.error(`❌ 深度抓取失败: ${error.message}`);
            return null;
        }
    }

    async generateComparisonReport() {
        console.log('📊 生成 Firecrawl vs Puppeteer 对比报告...');

        // 读取 Puppeteer 抓取结果
        let puppeteerReport = null;
        try {
            const puppeteerReportPath = path.join('./crawled-content', 'crawl-report.json');
            const puppeteerData = await fs.readFile(puppeteerReportPath, 'utf8');
            puppeteerReport = JSON.parse(puppeteerData);
        } catch (error) {
            console.warn('⚠️  无法读取 Puppeteer 抓取报告');
        }

        const report = {
            timestamp: new Date().toISOString(),
            firecrawl: {
                tool: 'Firecrawl MCP',
                totalPages: this.crawlResults.length,
                successfulPages: this.crawlResults.filter(r => r.result.success).length,
                failedPages: this.crawlResults.filter(r => !r.result.success).length,
                results: this.crawlResults
            },
            puppeteer: puppeteerReport ? {
                tool: 'Puppeteer',
                totalPages: puppeteerReport.crawledPages ? puppeteerReport.crawledPages.length : 0,
                totalResources: puppeteerReport.totalResources || 0,
                comparison: 'Available for comparison'
            } : {
                tool: 'Puppeteer',
                status: 'Report not found'
            },
            comparison: {
                toolsUsed: ['Firecrawl MCP', 'Puppeteer'],
                advantages: {
                    firecrawl: [
                        'MCP 协议标准化',
                        '云端处理能力',
                        '专业的网页抓取服务',
                        '更好的反爬虫处理'
                    ],
                    puppeteer: [
                        '完全控制浏览器',
                        '本地处理',
                        '详细的资源下载',
                        '自定义用户代理'
                    ]
                },
                recommendations: [
                    'Firecrawl MCP 适合标准化的内容抓取',
                    'Puppeteer 适合需要精细控制的场景',
                    '两种工具可以互补使用'
                ]
            }
        };

        // 保存对比报告
        const reportPath = path.join(this.outputDir, 'firecrawl-comparison-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成 Markdown 报告
        await this.generateMarkdownReport(report);

        console.log('📋 对比报告已生成');
        return report;
    }

    async generateMarkdownReport(report) {
        const markdown = `# Firecrawl MCP vs Puppeteer 抓取对比报告

## 📊 抓取结果对比

### Firecrawl MCP 结果
- **抓取时间**: ${report.timestamp}
- **总页面数**: ${report.firecrawl.totalPages}
- **成功页面**: ${report.firecrawl.successfulPages}
- **失败页面**: ${report.firecrawl.failedPages}
- **成功率**: ${((report.firecrawl.successfulPages / report.firecrawl.totalPages) * 100).toFixed(1)}%

### Puppeteer 结果
- **总页面数**: ${report.puppeteer.totalPages || 'N/A'}
- **资源文件**: ${report.puppeteer.totalResources || 'N/A'}
- **状态**: ${report.puppeteer.comparison || report.puppeteer.status}

## 🔍 详细分析

### Firecrawl MCP 优势
${report.comparison.advantages.firecrawl.map(item => `- ${item}`).join('\n')}

### Puppeteer 优势
${report.comparison.advantages.puppeteer.map(item => `- ${item}`).join('\n')}

## 📝 抓取详情

### 成功抓取的页面
${report.firecrawl.results
    .filter(r => r.result.success)
    .map(r => `- **${r.filename}**: ${r.url} (${r.result.size} bytes)`)
    .join('\n')}

### 失败的页面
${report.firecrawl.results
    .filter(r => !r.result.success)
    .map(r => `- **${r.filename}**: ${r.url} - ${r.result.error}`)
    .join('\n') || '无失败页面'}

## 🎯 建议

${report.comparison.recommendations.map(item => `- ${item}`).join('\n')}

## 📁 文件结构

\`\`\`
firecrawl-content/
├── pages/                    # 抓取的页面
│   ├── index-desktop.html    # 桌面端首页
│   ├── index-mobile.html     # 移动端首页
│   ├── apps.html             # 应用页面
│   ├── api.html              # API页面
│   ├── faq.html              # FAQ页面
│   ├── privacy.html          # 隐私页面
│   └── news.html             # 新闻页面
├── analysis/                 # 分析结果
│   └── deep-crawl.json       # 深度抓取结果
└── firecrawl-comparison-report.json  # 对比报告
\`\`\`

---
*报告生成时间: ${report.timestamp}*
`;

        const markdownPath = path.join(this.outputDir, 'FIRECRAWL_ANALYSIS.md');
        await fs.writeFile(markdownPath, markdown, 'utf8');
    }

    async run() {
        console.log('🔥 开始 Firecrawl MCP 抓取任务...');
        console.log('=====================================');
        
        try {
            await this.init();
            
            // 抓取主要页面
            await this.crawlMainPages();
            
            // 执行深度抓取分析
            await this.performCrawlAnalysis();
            
            // 生成对比报告
            await this.generateComparisonReport();
            
            console.log('\n🎉 Firecrawl MCP 抓取任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 成功页面: ${this.crawlResults.filter(r => r.result.success).length}`);
            console.log(`❌ 失败页面: ${this.crawlResults.filter(r => !r.result.success).length}`);
            console.log(`📋 查看详细报告: ${this.outputDir}/FIRECRAWL_ANALYSIS.md`);

        } catch (error) {
            console.error(`💥 抓取任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 检查是否直接运行此脚本
if (require.main === module) {
    const crawler = new FirecrawlPotatoCrawler();
    crawler.run().catch(console.error);
}

module.exports = FirecrawlPotatoCrawler;
