#!/usr/bin/env node

/**
 * 简化的 Firecrawl MCP 抓取脚本
 * 直接使用 Firecrawl API 进行网站抓取
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class SimpleFirecrawlCrawler {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.firecrawl.dev/v0';
        this.outputDir = './firecrawl-results';
        this.results = [];
    }

    async init() {
        await this.ensureDir(this.outputDir);
        await this.ensureDir(path.join(this.outputDir, 'pages'));
        console.log('📁 输出目录已创建');
    }

    async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    async makeFirecrawlRequest(endpoint, data) {
        return new Promise((resolve, reject) => {
            const postData = JSON.stringify(data);
            
            const options = {
                hostname: 'api.firecrawl.dev',
                port: 443,
                path: endpoint,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`,
                    'Content-Length': Buffer.byteLength(postData)
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(result);
                        } else {
                            reject(new Error(`API Error ${res.statusCode}: ${result.error || data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse Error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request Error: ${error.message}`));
            });

            req.write(postData);
            req.end();
        });
    }

    async scrapeUrl(url, options = {}) {
        console.log(`🔥 抓取: ${url}`);
        
        try {
            const requestData = {
                url: url,
                formats: ['html', 'markdown'],
                onlyMainContent: false,
                includeTags: ['title', 'meta', 'link', 'script'],
                excludeTags: [],
                waitFor: 3000,
                ...options
            };

            const result = await this.makeFirecrawlRequest('/v0/scrape', requestData);
            
            if (result.success) {
                console.log(`✅ 成功抓取: ${url}`);
                return result.data;
            } else {
                throw new Error(result.error || 'Unknown error');
            }

        } catch (error) {
            console.error(`❌ 抓取失败: ${url} - ${error.message}`);
            return null;
        }
    }

    async crawlWebsite(url, options = {}) {
        console.log(`🕷️  开始爬取网站: ${url}`);
        
        try {
            const requestData = {
                url: url,
                crawlerOptions: {
                    includes: [],
                    excludes: [],
                    generateImgAltText: true,
                    returnOnlyUrls: false,
                    maxDepth: 2,
                    limit: 10
                },
                pageOptions: {
                    onlyMainContent: false,
                    includeHtml: true,
                    includeMarkdown: true
                },
                ...options
            };

            const result = await this.makeFirecrawlRequest('/v0/crawl', requestData);
            
            if (result.success) {
                console.log(`✅ 爬取任务已启动，Job ID: ${result.jobId}`);
                return await this.waitForCrawlCompletion(result.jobId);
            } else {
                throw new Error(result.error || 'Unknown error');
            }

        } catch (error) {
            console.error(`❌ 爬取失败: ${url} - ${error.message}`);
            return null;
        }
    }

    async waitForCrawlCompletion(jobId) {
        console.log(`⏳ 等待爬取完成 (Job ID: ${jobId})...`);
        
        const maxAttempts = 30;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            try {
                const result = await this.checkCrawlStatus(jobId);
                
                if (result.status === 'completed') {
                    console.log(`✅ 爬取完成! 获得 ${result.data.length} 个页面`);
                    return result.data;
                } else if (result.status === 'failed') {
                    throw new Error('Crawl job failed');
                } else {
                    console.log(`📊 爬取进度: ${result.status} (${attempts + 1}/${maxAttempts})`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                }
                
            } catch (error) {
                console.error(`❌ 检查状态失败: ${error.message}`);
                break;
            }
            
            attempts++;
        }
        
        throw new Error('Crawl timeout');
    }

    async checkCrawlStatus(jobId) {
        return new Promise((resolve, reject) => {
            const options = {
                hostname: 'api.firecrawl.dev',
                port: 443,
                path: `/v0/crawl/status/${jobId}`,
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.apiKey}`
                }
            };

            const req = https.request(options, (res) => {
                let data = '';

                res.on('data', (chunk) => {
                    data += chunk;
                });

                res.on('end', () => {
                    try {
                        const result = JSON.parse(data);
                        if (res.statusCode >= 200 && res.statusCode < 300) {
                            resolve(result);
                        } else {
                            reject(new Error(`API Error ${res.statusCode}: ${result.error || data}`));
                        }
                    } catch (error) {
                        reject(new Error(`Parse Error: ${error.message}`));
                    }
                });
            });

            req.on('error', (error) => {
                reject(new Error(`Request Error: ${error.message}`));
            });

            req.end();
        });
    }

    async saveResult(data, filename) {
        const filePath = path.join(this.outputDir, 'pages', filename);
        
        if (data.html) {
            await fs.writeFile(filePath.replace('.json', '.html'), data.html, 'utf8');
        }
        
        if (data.markdown) {
            await fs.writeFile(filePath.replace('.json', '.md'), data.markdown, 'utf8');
        }
        
        // 保存完整的元数据
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
        
        console.log(`💾 已保存: ${filename}`);
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            tool: 'Firecrawl API',
            totalResults: this.results.length,
            successfulPages: this.results.filter(r => r.success).length,
            failedPages: this.results.filter(r => !r.success).length,
            results: this.results
        };

        const reportPath = path.join(this.outputDir, 'firecrawl-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成 Markdown 报告
        const markdown = `# Firecrawl MCP 抓取报告

## 📊 抓取结果

- **抓取时间**: ${report.timestamp}
- **总页面数**: ${report.totalResults}
- **成功页面**: ${report.successfulPages}
- **失败页面**: ${report.failedPages}
- **成功率**: ${((report.successfulPages / report.totalResults) * 100).toFixed(1)}%

## 📝 详细结果

### 成功抓取的页面
${report.results
    .filter(r => r.success)
    .map(r => `- **${r.url}**: ${r.title || 'No title'} (${r.size} bytes)`)
    .join('\n')}

### 失败的页面
${report.results
    .filter(r => !r.success)
    .map(r => `- **${r.url}**: ${r.error}`)
    .join('\n') || '无失败页面'}

---
*报告生成时间: ${report.timestamp}*
`;

        const markdownPath = path.join(this.outputDir, 'FIRECRAWL_REPORT.md');
        await fs.writeFile(markdownPath, markdown, 'utf8');

        console.log('📋 报告已生成');
        return report;
    }

    async run() {
        console.log('🔥 开始 Firecrawl MCP 完整抓取任务...');
        console.log('=====================================');
        
        await this.init();

        // 单页面抓取测试
        console.log('\n📄 单页面抓取测试...');
        const scrapeResult = await this.scrapeUrl('https://potato.im/');
        
        if (scrapeResult) {
            await this.saveResult(scrapeResult, 'potato-homepage.json');
            this.results.push({
                url: 'https://potato.im/',
                success: true,
                title: scrapeResult.metadata?.title || 'No title',
                size: scrapeResult.html ? scrapeResult.html.length : 0,
                timestamp: new Date().toISOString()
            });
        } else {
            this.results.push({
                url: 'https://potato.im/',
                success: false,
                error: 'Scrape failed',
                timestamp: new Date().toISOString()
            });
        }

        // 网站爬取
        console.log('\n🕷️  网站完整爬取...');
        const crawlResults = await this.crawlWebsite('https://potato.im/');
        
        if (crawlResults && crawlResults.length > 0) {
            for (let i = 0; i < crawlResults.length; i++) {
                const result = crawlResults[i];
                const filename = `crawl-page-${i + 1}.json`;
                
                await this.saveResult(result, filename);
                
                this.results.push({
                    url: result.metadata?.sourceURL || 'Unknown URL',
                    success: true,
                    title: result.metadata?.title || 'No title',
                    size: result.html ? result.html.length : 0,
                    timestamp: new Date().toISOString()
                });
            }
        }

        // 生成报告
        const report = await this.generateReport();

        console.log('\n🎉 Firecrawl MCP 抓取任务完成!');
        console.log(`📁 输出目录: ${this.outputDir}`);
        console.log(`📊 成功页面: ${report.successfulPages}`);
        console.log(`❌ 失败页面: ${report.failedPages}`);
        console.log(`📋 查看报告: ${this.outputDir}/FIRECRAWL_REPORT.md`);
    }
}

// 运行抓取
const apiKey = process.env.FIRECRAWL_API_KEY;
if (!apiKey) {
    console.error('❌ 请设置 FIRECRAWL_API_KEY 环境变量');
    process.exit(1);
}

const crawler = new SimpleFirecrawlCrawler(apiKey);
crawler.run().catch(console.error);
