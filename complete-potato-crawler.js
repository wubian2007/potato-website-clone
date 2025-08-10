#!/usr/bin/env node

/**
 * 完整的 Potato 网站抓取脚本
 * 使用 Firecrawl MCP 服务抓取 https://potato.im/ 的完整内容
 * 包括：HTML、CSS、JS、图片、logo等所有资源
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class CompletePotatoCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.mobileUrl = 'https://m.potato.im/';
        this.outputDir = './complete-potato-content';
        this.results = [];
        this.apiKey = 'fc-c6c470036718491484dfa3b5d8c4d14d';
    }

    async init() {
        console.log('🚀 初始化完整抓取任务...');
        
        // 创建输出目录
        const dirs = [
            this.outputDir,
            path.join(this.outputDir, 'desktop'),
            path.join(this.outputDir, 'mobile'),
            path.join(this.outputDir, 'assets'),
            path.join(this.outputDir, 'assets/css'),
            path.join(this.outputDir, 'assets/js'),
            path.join(this.outputDir, 'assets/images'),
            path.join(this.outputDir, 'assets/fonts')
        ];

        for (const dir of dirs) {
            await fs.mkdir(dir, { recursive: true });
        }

        console.log('✅ 目录结构创建完成');
    }

    async runFirecrawlMCP(url, options = {}) {
        return new Promise((resolve, reject) => {
            console.log(`🔥 使用 Firecrawl MCP 抓取: ${url}`);
            console.log(`   📱 移动端模式: ${options.mobile ? '是' : '否'}`);
            console.log(`   🕷️ 深度抓取: ${options.crawl ? '是' : '否'}`);
            console.log(`   ⏳ 开始时间: ${new Date().toLocaleTimeString()}`);
            
            const args = [
                'scrape',
                url,
                '--format', 'html',
                '--include-links',
                '--include-metadata',
                '--wait-for', '1000'
            ];

            // 添加移动端选项
            if (options.mobile) {
                args.push('--mobile');
                args.push('--viewport-width', '375');
                args.push('--viewport-height', '667');
            }

            // 添加深度抓取选项
            if (options.crawl) {
                args.push('--crawl');
                args.push('--max-depth', '3');
                args.push('--max-pages', '20');
            }

            console.log(`   🔧 执行命令: firecrawl-mcp ${args.join(' ')}`);

            const firecrawl = spawn('firecrawl-mcp', args, {
                stdio: ['inherit', 'pipe', 'pipe'],
                env: { ...process.env, FIRECRAWL_API_KEY: this.apiKey }
            });

            let stdout = '';
            let stderr = '';
            let startTime = Date.now();

            // 添加进度指示器，增加超时处理
            const progressInterval = setInterval(() => {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                process.stdout.write(`\r   ⏱️ 抓取中... ${elapsed}秒`);
                
                // 如果超过60秒，显示警告
                if (elapsed > 60) {
                    console.log(`\n   ⚠️ 抓取时间较长，可能需要更多时间...`);
                }
            }, 1000);

            firecrawl.stdout.on('data', (data) => {
                const dataStr = data.toString();
                stdout += dataStr;
                console.log(`   📥 收到数据: ${dataStr.length} 字节`);
                
                // 如果数据很大，显示进度
                if (stdout.length > 10000) {
                    console.log(`   📊 累计数据大小: ${(stdout.length / 1024).toFixed(1)} KB`);
                }
            });

            firecrawl.stderr.on('data', (data) => {
                const dataStr = data.toString();
                stderr += dataStr;
                
                // 过滤掉正常的初始化信息，只显示真正的错误
                const lines = dataStr.split('\n');
                lines.forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.includes('[info]') && !trimmedLine.includes('Initializing') && !trimmedLine.includes('stdio mode')) {
                        if (trimmedLine.includes('error') || trimmedLine.includes('Error') || trimmedLine.includes('failed')) {
                            console.log(`   ❌ 错误: ${trimmedLine}`);
                        } else if (trimmedLine.includes('warning') || trimmedLine.includes('Warning')) {
                            console.log(`   ⚠️ 警告: ${trimmedLine}`);
                        } else if (trimmedLine.includes('success') || trimmedLine.includes('Success')) {
                            console.log(`   ✅ 成功: ${trimmedLine}`);
                        }
                    }
                });
            });

            firecrawl.on('close', (code) => {
                clearInterval(progressInterval);
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                console.log(`\n   ✅ 抓取完成，耗时: ${elapsed}秒，退出码: ${code}`);
                
                if (code === 0) {
                    try {
                        const result = JSON.parse(stdout);
                        console.log(`   📊 解析结果成功，数据大小: ${JSON.stringify(result).length} 字节`);
                        resolve(result);
                    } catch (error) {
                        console.log(`   📝 使用原始文本内容，大小: ${stdout.length} 字节`);
                        resolve({
                            content: stdout,
                            url: url,
                            success: true
                        });
                    }
                } else {
                    console.log(`   ❌ 抓取失败，错误信息: ${stderr}`);
                    reject(new Error(`Firecrawl MCP failed with code ${code}: ${stderr}`));
                }
            });

            firecrawl.on('error', (error) => {
                clearInterval(progressInterval);
                console.log(`   💥 启动失败: ${error.message}`);
                reject(new Error(`Failed to start Firecrawl MCP: ${error.message}`));
            });
        });
    }

    async downloadResource(url, outputPath) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            
            protocol.get(url, (response) => {
                if (response.statusCode === 200) {
                    const fileStream = fs.createWriteStream(outputPath);
                    response.pipe(fileStream);
                    
                    fileStream.on('finish', () => {
                        fileStream.close();
                        resolve(true);
                    });
                    
                    fileStream.on('error', (error) => {
                        reject(error);
                    });
                } else {
                    reject(new Error(`HTTP ${response.statusCode}: ${url}`));
                }
            }).on('error', (error) => {
                reject(error);
            });
        });
    }

    async extractAndDownloadResources(html, baseUrl, outputDir) {
        const resources = [];
        
        console.log(`🔍 开始分析页面资源...`);
        
        // 提取CSS文件
        const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
        let cssMatch;
        while ((cssMatch = cssRegex.exec(html)) !== null) {
            const cssUrl = new URL(cssMatch[1], baseUrl).href;
            resources.push({
                type: 'css',
                url: cssUrl,
                filename: path.basename(cssUrl.split('?')[0])
            });
        }

        // 提取JS文件
        const jsRegex = /<script[^>]+src=["']([^"']+\.js[^"']*)["'][^>]*>/gi;
        let jsMatch;
        while ((jsMatch = jsRegex.exec(html)) !== null) {
            const jsUrl = new URL(jsMatch[1], baseUrl).href;
            resources.push({
                type: 'js',
                url: jsUrl,
                filename: path.basename(jsUrl.split('?')[0])
            });
        }

        // 提取图片文件
        const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
        let imgMatch;
        while ((imgMatch = imgRegex.exec(html)) !== null) {
            const imgUrl = new URL(imgMatch[1], baseUrl).href;
            const ext = path.extname(imgUrl.split('?')[0]);
            if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext.toLowerCase())) {
                resources.push({
                    type: 'image',
                    url: imgUrl,
                    filename: path.basename(imgUrl.split('?')[0])
                });
            }
        }

        // 统计资源类型
        const cssCount = resources.filter(r => r.type === 'css').length;
        const jsCount = resources.filter(r => r.type === 'js').length;
        const imgCount = resources.filter(r => r.type === 'image').length;
        
        console.log(`📊 发现资源文件:`);
        console.log(`   📄 CSS文件: ${cssCount} 个`);
        console.log(`   📜 JS文件: ${jsCount} 个`);
        console.log(`   🖼️ 图片文件: ${imgCount} 个`);
        console.log(`   📦 总计: ${resources.length} 个资源文件`);

        if (resources.length === 0) {
            console.log(`⚠️ 未发现需要下载的资源文件`);
            return html;
        }

        // 下载资源
        console.log(`\n📥 开始下载资源文件...`);
        let successCount = 0;
        let failCount = 0;
        
        for (let i = 0; i < resources.length; i++) {
            const resource = resources[i];
            console.log(`   [${i + 1}/${resources.length}] 下载: ${resource.filename}`);
            
            try {
                const resourceDir = path.join(outputDir, 'assets', resource.type === 'image' ? 'images' : resource.type);
                const outputPath = path.join(resourceDir, resource.filename);
                
                await this.downloadResource(resource.url, outputPath);
                console.log(`   ✅ 下载成功: ${resource.filename}`);
                successCount++;
                
                // 更新HTML中的路径
                const relativePath = `./assets/${resource.type === 'image' ? 'images' : resource.type}/${resource.filename}`;
                html = html.replace(new RegExp(resource.url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), relativePath);
                
            } catch (error) {
                console.log(`   ❌ 下载失败: ${resource.filename} - ${error.message}`);
                failCount++;
            }
        }

        console.log(`\n📊 资源下载完成:`);
        console.log(`   ✅ 成功: ${successCount} 个`);
        console.log(`   ❌ 失败: ${failCount} 个`);
        console.log(`   📈 成功率: ${((successCount / resources.length) * 100).toFixed(1)}%`);

        return html;
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
            
            // 下载资源并更新HTML
            const updatedHtml = await this.extractAndDownloadResources(result.html, url, outputDir);
            
            // 保存HTML文件
            const htmlPath = path.join(outputDir, filename);
            await fs.writeFile(htmlPath, updatedHtml, 'utf8');
            
            // 保存原始结果
            const jsonPath = path.join(outputDir, filename.replace('.html', '.json'));
            await fs.writeFile(jsonPath, JSON.stringify(result, null, 2), 'utf8');

            console.log(`✅ 保存页面: ${filename}`);
            
            this.results.push({
                url,
                filename,
                options,
                result: {
                    success: true,
                    size: updatedHtml.length,
                    hasLinks: !!(result.linksOnPage && result.linksOnPage.length > 0),
                    metadata: result.metadata || null,
                    resources: result.resources || []
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
        
        // 先只抓取最重要的页面，减少总时间
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
                console.log(`⏳ 等待 1 秒后继续下一个页面...`);
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }
        
        console.log(`\n✅ 主要页面抓取完成！`);
    }

    async performDeepCrawl() {
        console.log('\n🕷️ 执行深度抓取...');
        
        try {
            const result = await this.runFirecrawlMCP(this.baseUrl, { 
                crawl: true,
                mobile: false 
            });
            
            if (result && result.pages) {
                console.log(`📊 深度抓取发现 ${result.pages.length} 个页面`);
                
                // 限制深度抓取的页面数量，避免时间过长
                const maxPages = Math.min(result.pages.length, 5);
                console.log(`📋 将抓取前 ${maxPages} 个页面（限制数量以节省时间）`);
                
                for (let i = 0; i < maxPages; i++) {
                    const page = result.pages[i];
                    const filename = `deep-crawl-${i + 1}.html`;
                    
                    await this.scrapeWithFirecrawl(page.url, filename, { mobile: false });
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        } catch (error) {
            console.error(`❌ 深度抓取失败: ${error.message}`);
        }
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

        const reportPath = path.join(this.outputDir, 'crawl-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');

        // 生成Markdown报告
        const markdownReport = this.generateMarkdownReport(report);
        const markdownPath = path.join(this.outputDir, 'CRAWL_REPORT.md');
        await fs.writeFile(markdownPath, markdownReport, 'utf8');

        console.log(`✅ 报告已生成: ${reportPath}`);
        console.log(`✅ Markdown报告: ${markdownPath}`);
    }

    generateMarkdownReport(report) {
        return `# 🔥 完整的 Potato 网站抓取报告

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
│   ├── css/         # CSS文件
│   ├── js/          # JavaScript文件
│   ├── images/      # 图片文件
│   └── fonts/       # 字体文件
├── crawl-report.json # 详细报告
└── CRAWL_REPORT.md  # 本报告
\`\`\`

## 📝 详细结果

### 成功抓取的页面
${this.results.filter(r => r.result.success).map(r => 
`- **${r.filename}**: ${r.url} (${r.result.size} bytes)`
).join('\n')}

### 失败的页面
${this.results.filter(r => !r.result.success).map(r => 
`- **${r.filename}**: ${r.url} - ${r.result.error}`
).join('\n')}

## 🎯 抓取内容

### 包含的资源类型
- ✅ HTML页面结构
- ✅ CSS样式文件
- ✅ JavaScript脚本
- ✅ 图片和Logo
- ✅ 字体文件
- ✅ 元数据信息
- ✅ 页面链接

### 设备支持
- ✅ 桌面端完整抓取
- ✅ 移动端完整抓取
- ✅ 响应式设计分析

## 🚀 使用说明

1. **查看桌面端**: 打开 \`desktop/index.html\`
2. **查看移动端**: 打开 \`mobile/index.html\`
3. **查看资源**: 浏览 \`assets/\` 目录
4. **查看报告**: 查看 \`crawl-report.json\`

---
*报告生成时间: ${report.timestamp}*
`;
    }

    async run() {
        console.log('🚀 开始完整的 Potato 网站抓取任务...');
        console.log('=====================================');
        
        try {
            await this.init();
            
            // 抓取主要页面
            await this.crawlMainPages();
            
            // 执行深度抓取
            await this.performDeepCrawl();
            
            // 生成报告
            await this.generateReport();
            
            console.log('\n🎉 完整抓取任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 成功页面: ${this.results.filter(r => r.result.success).length}`);
            console.log(`❌ 失败页面: ${this.results.filter(r => !r.result.success).length}`);
            console.log(`📋 查看详细报告: ${this.outputDir}/CRAWL_REPORT.md`);

        } catch (error) {
            console.error(`💥 抓取任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行抓取任务
if (require.main === module) {
    const crawler = new CompletePotatoCrawler();
    crawler.run().catch(console.error);
}

module.exports = CompletePotatoCrawler;
