#!/usr/bin/env node

/**
 * 使用更新后的 MCP 工具抓取 Potato 网站
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class NewMCPCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.mobileUrl = 'https://m.potato.im/';
        this.outputDir = './new-mcp-content';
        this.results = [];
        this.apiKey = 'fc-c6c470036718491484dfa3b5d8c4d14d';
    }

    async init() {
        console.log('🚀 初始化新的 MCP 抓取任务...');
        
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

    async runMCPCommand(command, args, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔥 执行 MCP 命令: ${command} ${args.join(' ')}`);
            
            const mcp = spawn(command, args, {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: { ...process.env, FIRECRAWL_API_KEY: this.apiKey }
            });

            let stdout = '';
            let stderr = '';
            let startTime = Date.now();

            // 设置超时
            const timeout = setTimeout(() => {
                console.log('⏰ 命令超时（120秒），终止进程...');
                mcp.kill();
                reject(new Error('Command timeout after 120 seconds'));
            }, 120000);

            const progressInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                process.stdout.write(`\r   ⏱️ 执行中... ${elapsed}秒`);
            }, 1000);

            mcp.stdout.on('data', (data) => {
                const dataStr = data.toString();
                stdout += dataStr;
                console.log(`\n   📥 收到数据: ${dataStr.length} 字节`);
            });

            mcp.stderr.on('data', (data) => {
                const dataStr = data.toString();
                stderr += dataStr;
                
                // 显示重要的日志信息
                const lines = dataStr.split('\n');
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.includes('[info]')) {
                        if (trimmedLine.includes('error') || trimmedLine.includes('Error')) {
                            console.log(`\n   ❌ 错误: ${trimmedLine}`);
                        } else if (trimmedLine.includes('success') || trimmedLine.includes('Success')) {
                            console.log(`\n   ✅ 成功: ${trimmedLine}`);
                        } else if (trimmedLine.includes('warning') || trimmedLine.includes('Warning')) {
                            console.log(`\n   ⚠️ 警告: ${trimmedLine}`);
                        }
                    }
                });
            });

            mcp.on('close', (code) => {
                clearTimeout(timeout);
                clearInterval(progressInterval);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`\n   ✅ 命令完成，耗时: ${elapsed}秒，退出码: ${code}`);
                
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        console.log(`   📊 解析结果成功，数据大小: ${JSON.stringify(result).length} 字节`);
                        resolve(result);
                    } catch (error) {
                        console.log(`   📝 使用原始文本内容，大小: ${stdout.length} 字节`);
                        resolve({
                            content: stdout,
                            success: true
                        });
                    }
                } else {
                    console.log(`   ❌ 命令失败，错误信息: ${stderr}`);
                    reject(new Error(`Command failed with code ${code}: ${stderr}`));
                }
            });

            mcp.on('error', (error) => {
                clearTimeout(timeout);
                clearInterval(progressInterval);
                console.log(`\n   💥 启动失败: ${error.message}`);
                reject(new Error(`Failed to start command: ${error.message}`));
            });
        });
    }

    async scrapeWithMCP(url, filename, options = {}) {
        try {
            console.log(`\n📄 抓取页面: ${url}`);
            
            // 尝试不同的MCP命令格式
            let result = null;
            let error = null;
            
            // 方法1: 使用 firecrawl-mcp
            try {
                const args = [
                    'scrape',
                    url,
                    '--format', 'html',
                    '--include-links',
                    '--include-metadata'
                ];

                if (options.mobile) {
                    args.push('--mobile');
                }

                result = await this.runMCPCommand('firecrawl-mcp', args, options);
                console.log(`✅ firecrawl-mcp 抓取成功`);
            } catch (mcpError) {
                error = mcpError;
                console.log(`❌ firecrawl-mcp 失败: ${mcpError.message}`);
                
                // 方法2: 使用 npx firecrawl-mcp
                try {
                    const args = [
                        '-y',
                        'firecrawl-mcp',
                        'scrape',
                        url,
                        '--format', 'html',
                        '--include-links',
                        '--include-metadata'
                    ];

                    if (options.mobile) {
                        args.push('--mobile');
                    }

                    result = await this.runMCPCommand('npx', args, options);
                    console.log(`✅ npx firecrawl-mcp 抓取成功`);
                } catch (npxError) {
                    console.log(`❌ npx firecrawl-mcp 也失败: ${npxError.message}`);
                    throw new Error(`Both MCP methods failed: ${mcpError.message}, ${npxError.message}`);
                }
            }

            if (!result || (!result.html && !result.content)) {
                throw new Error('No HTML content received');
            }

            const htmlContent = result.html || result.content;

            // 确定输出目录
            const outputDir = options.mobile ? 
                path.join(this.outputDir, 'mobile') : 
                path.join(this.outputDir, 'desktop');
            
            // 保存HTML文件
            const htmlPath = path.join(outputDir, filename);
            await fs.writeFile(htmlPath, htmlContent, 'utf8');
            
            // 保存原始结果
            const jsonPath = path.join(outputDir, filename.replace('.html', '.json'));
            await fs.writeFile(jsonPath, JSON.stringify(result, null, 2), 'utf8');

            console.log(`✅ 保存页面: ${filename} (${htmlContent.length} 字节)`);
            
            this.results.push({
                url,
                filename,
                options,
                result: {
                    success: true,
                    size: htmlContent.length,
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
            
            await this.scrapeWithMCP(page.url, page.filename, { mobile: page.mobile });
            
            if (i < pages.length - 1) {
                console.log(`⏳ 等待 3 秒后继续...`);
                await new Promise(resolve => setTimeout(resolve, 3000));
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

        const reportPath = path.join(this.outputDir, 'new-mcp-crawl-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.outputDir, 'NEW_MCP_CRAWL_REPORT.md');
        await fs.writeFile(markdownPath, markdownReport, 'utf8');

        console.log(`✅ 报告已生成: ${reportPath}`);
        console.log(`✅ Markdown报告: ${markdownPath}`);
    }

    generateMarkdownReport(report) {
        return `# 🔥 新 MCP 工具抓取报告

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
├── new-mcp-crawl-report.json # 详细报告
└── NEW_MCP_CRAWL_REPORT.md  # 本报告
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
3. **查看报告**: 查看 \`new-mcp-crawl-report.json\`

---
*报告生成时间: ${report.timestamp}*
`;
    }

    async run() {
        console.log('🚀 开始新 MCP 工具抓取任务...');
        console.log('=====================================');
        
        try {
            await this.init();
            
            // 抓取主要页面
            await this.crawlMainPages();
            
            // 生成报告
            await this.generateReport();
            
            console.log('\n🎉 新 MCP 工具抓取任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 成功页面: ${this.results.filter(r => r.result.success).length}`);
            console.log(`❌ 失败页面: ${this.results.filter(r => !r.result.success).length}`);
            console.log(`📋 查看详细报告: ${this.outputDir}/NEW_MCP_CRAWL_REPORT.md`);

        } catch (error) {
            console.error(`💥 抓取任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行抓取任务
if (require.main === module) {
    const crawler = new NewMCPCrawler();
    crawler.run().catch(console.error);
}

module.exports = NewMCPCrawler;
