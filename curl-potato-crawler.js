#!/usr/bin/env node

/**
 * 使用 curl 和 wget 的 Potato 网站抓取脚本
 * 替代 Firecrawl MCP 的方案
 */

const { spawn, exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class CurlPotatoCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.mobileUrl = 'https://m.potato.im/';
        this.outputDir = './curl-potato-content';
        this.results = [];
    }

    async init() {
        console.log('🚀 初始化 curl 抓取任务...');
        
        const dirs = [
            this.outputDir,
            path.join(this.outputDir, 'desktop'),
            path.join(this.outputDir, 'mobile'),
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

    async curlScrape(url, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🌐 使用 curl 抓取: ${url}`);
            
            const args = [
                '-s',  // 静默模式
                '-L',  // 跟随重定向
                '-H', 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
                '--connect-timeout', '10',
                '--max-time', '30'
            ];

            if (options.mobile) {
                args.push('-H', 'User-Agent: Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/604.1');
            }

            args.push(url);

            const curl = spawn('curl', args, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';
            let startTime = Date.now();

            const progressInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                process.stdout.write(`\r   ⏱️ 抓取中... ${elapsed}秒`);
            }, 1000);

            curl.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            curl.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            curl.on('close', (code) => {
                clearInterval(progressInterval);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`\n   ✅ 完成，耗时: ${elapsed}秒`);
                
                if (code === 0 && stdout.length > 0) {
                    resolve({
                        html: stdout,
                        url: url,
                        success: true,
                        size: stdout.length
                    });
                } else {
                    reject(new Error(`curl failed with code ${code}: ${stderr}`));
                }
            });

            curl.on('error', (error) => {
                clearInterval(progressInterval);
                reject(new Error(`Failed to start curl: ${error.message}`));
            });
        });
    }

    async wgetScrape(url, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`📥 使用 wget 抓取: ${url}`);
            
            const args = [
                '--quiet',
                '--timeout=30',
                '--tries=3',
                '--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
            ];

            if (options.mobile) {
                args.push('--user-agent=Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15');
            }

            args.push('-O', '-', url);

            const wget = spawn('wget', args, {
                stdio: ['inherit', 'pipe', 'pipe']
            });

            let stdout = '';
            let stderr = '';
            let startTime = Date.now();

            const progressInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                process.stdout.write(`\r   ⏱️ 抓取中... ${elapsed}秒`);
            }, 1000);

            wget.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            wget.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            wget.on('close', (code) => {
                clearInterval(progressInterval);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`\n   ✅ 完成，耗时: ${elapsed}秒`);
                
                if (code === 0 && stdout.length > 0) {
                    resolve({
                        html: stdout,
                        url: url,
                        success: true,
                        size: stdout.length
                    });
                } else {
                    reject(new Error(`wget failed with code ${code}: ${stderr}`));
                }
            });

            wget.on('error', (error) => {
                clearInterval(progressInterval);
                reject(new Error(`Failed to start wget: ${error.message}`));
            });
        });
    }

    async scrapeWithFallback(url, filename, options = {}) {
        try {
            console.log(`\n📄 抓取页面: ${url}`);
            
            let result = null;
            
            // 首先尝试 curl
            try {
                result = await this.curlScrape(url, options);
                console.log(`✅ curl 抓取成功`);
            } catch (curlError) {
                console.log(`❌ curl 失败: ${curlError.message}`);
                
                // 如果 curl 失败，尝试 wget
                try {
                    result = await this.wgetScrape(url, options);
                    console.log(`✅ wget 抓取成功`);
                } catch (wgetError) {
                    console.log(`❌ wget 也失败: ${wgetError.message}`);
                    throw new Error(`Both curl and wget failed: ${curlError.message}, ${wgetError.message}`);
                }
            }

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
            
            // 保存元数据
            const metadata = {
                url: url,
                filename: filename,
                size: result.html.length,
                timestamp: new Date().toISOString(),
                method: result.method || 'curl/wget'
            };
            
            const jsonPath = path.join(outputDir, filename.replace('.html', '.json'));
            await fs.writeFile(jsonPath, JSON.stringify(metadata, null, 2), 'utf8');

            console.log(`✅ 保存页面: ${filename} (${result.html.length} 字节)`);
            
            this.results.push({
                url,
                filename,
                options,
                result: {
                    success: true,
                    size: result.html.length,
                    method: result.method || 'curl/wget'
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
        console.log('\n🔥 开始抓取主要页面...');
        
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
            
            await this.scrapeWithFallback(page.url, page.filename, { mobile: page.mobile });
            
            if (i < pages.length - 1) {
                console.log(`⏳ 等待 1 秒后继续...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
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

        const reportPath = path.join(this.outputDir, 'curl-crawl-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.outputDir, 'CURL_CRAWL_REPORT.md');
        await fs.writeFile(markdownPath, markdownReport, 'utf8');

        console.log(`✅ 报告已生成: ${reportPath}`);
        console.log(`✅ Markdown报告: ${markdownPath}`);
    }

    generateMarkdownReport(report) {
        return `# 🌐 Curl/Wget Potato 网站抓取报告

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
├── assets/           # 静态资源
├── curl-crawl-report.json # 详细报告
└── CURL_CRAWL_REPORT.md  # 本报告
\`\`\`

## 📝 详细结果

### 成功抓取的页面
${this.results.filter(r => r.result.success).map(r => 
`- **${r.filename}**: ${r.url} (${r.result.size} 字节) - ${r.result.method}`
).join('\n')}

### 失败的页面
${this.results.filter(r => !r.result.success).map(r => 
`- **${r.filename}**: ${r.url} - ${r.result.error}`
).join('\n')}

## 🎯 抓取内容

### 包含的内容类型
- ✅ HTML页面结构
- ✅ 桌面端和移动端版本
- ✅ 使用 curl/wget 作为备选方案

## 🚀 使用说明

1. **查看桌面端**: 打开 \`desktop/index.html\`
2. **查看移动端**: 打开 \`mobile/index.html\`
3. **查看报告**: 查看 \`curl-crawl-report.json\`

---
*报告生成时间: ${report.timestamp}*
`;
    }

    async run() {
        console.log('🚀 开始 Curl/Wget Potato 网站抓取任务...');
        console.log('=====================================');
        
        try {
            await this.init();
            
            // 抓取主要页面
            await this.crawlMainPages();
            
            // 生成报告
            await this.generateReport();
            
            console.log('\n🎉 Curl/Wget 抓取任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 成功页面: ${this.results.filter(r => r.result.success).length}`);
            console.log(`❌ 失败页面: ${this.results.filter(r => !r.result.success).length}`);
            console.log(`📋 查看详细报告: ${this.outputDir}/CURL_CRAWL_REPORT.md`);

        } catch (error) {
            console.error(`💥 抓取任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行抓取任务
if (require.main === module) {
    const crawler = new CurlPotatoCrawler();
    crawler.run().catch(console.error);
}

module.exports = CurlPotatoCrawler;
