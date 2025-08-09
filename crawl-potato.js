#!/usr/bin/env node

/**
 * Potato 网站抓取脚本
 * 使用 Puppeteer 抓取 https://potato.im/ 的完整内容
 * 包括桌面端和移动端版本
 */

const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const url = require('url');

class PotatoCrawler {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.outputDir = './crawled-content';
        this.resources = new Set();
        this.crawledPages = new Set();
    }

    async init() {
        // 创建输出目录
        await this.ensureDir(this.outputDir);
        await this.ensureDir(path.join(this.outputDir, 'desktop'));
        await this.ensureDir(path.join(this.outputDir, 'mobile'));
        await this.ensureDir(path.join(this.outputDir, 'assets'));
        await this.ensureDir(path.join(this.outputDir, 'assets', 'images'));
        await this.ensureDir(path.join(this.outputDir, 'assets', 'css'));
        await this.ensureDir(path.join(this.outputDir, 'assets', 'js'));
    }

    async ensureDir(dirPath) {
        try {
            await fs.access(dirPath);
        } catch {
            await fs.mkdir(dirPath, { recursive: true });
        }
    }

    async downloadResource(resourceUrl, localPath) {
        return new Promise((resolve, reject) => {
            const client = resourceUrl.startsWith('https:') ? https : http;
            
            const request = client.get(resourceUrl, (response) => {
                if (response.statusCode === 200) {
                    const fileStream = require('fs').createWriteStream(localPath);
                    response.pipe(fileStream);
                    
                    fileStream.on('finish', () => {
                        fileStream.close();
                        console.log(`✅ 下载完成: ${path.basename(localPath)}`);
                        resolve();
                    });
                } else if (response.statusCode >= 300 && response.statusCode < 400) {
                    // 处理重定向
                    this.downloadResource(response.headers.location, localPath)
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new Error(`下载失败: ${response.statusCode} ${resourceUrl}`));
                }
            }).on('error', reject);
            
            request.setTimeout(30000, () => {
                request.destroy();
                reject(new Error('下载超时'));
            });
        });
    }

    async crawlPage(pageUrl, device = 'desktop') {
        console.log(`🔍 抓取页面: ${pageUrl} (${device})`);
        
        const browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        try {
            const page = await browser.newPage();
            
            // 设置设备类型
            if (device === 'mobile') {
                await page.emulate({
                    name: 'iPhone 12',
                    userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
                    viewport: {
                        width: 390,
                        height: 844,
                        deviceScaleFactor: 3,
                        isMobile: true,
                        hasTouch: true,
                        isLandscape: false
                    }
                });
            } else {
                await page.setViewport({
                    width: 1920,
                    height: 1080,
                    deviceScaleFactor: 1
                });
            }

            // 监听网络请求，收集资源
            const resources = [];
            page.on('response', async (response) => {
                const resourceUrl = response.url();
                const resourceType = response.request().resourceType();
                
                if (['stylesheet', 'script', 'image', 'font'].includes(resourceType)) {
                    resources.push({
                        url: resourceUrl,
                        type: resourceType,
                        status: response.status()
                    });
                }
            });

            // 访问页面
            await page.goto(pageUrl, {
                waitUntil: 'networkidle2',
                timeout: 60000
            });

            // 等待页面完全加载
            await new Promise(resolve => setTimeout(resolve, 3000));

            // 获取页面内容
            const content = await page.content();
            const title = await page.title();
            
            // 获取页面中的链接
            const links = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('a[href]'))
                    .map(a => a.href)
                    .filter(href => href && !href.startsWith('javascript:') && !href.startsWith('mailto:'))
                    .filter(href => href.includes('potato.im') || href.startsWith('/'))
                    .slice(0, 20); // 限制链接数量
            });

            // 保存页面内容
            const fileName = this.getFileNameFromUrl(pageUrl) || 'index.html';
            const filePath = path.join(this.outputDir, device, fileName);
            await fs.writeFile(filePath, content, 'utf8');
            
            console.log(`📄 保存页面: ${filePath}`);
            console.log(`📊 发现 ${resources.length} 个资源, ${links.length} 个链接`);

            return { content, title, resources, links };

        } finally {
            await browser.close();
        }
    }

    getFileNameFromUrl(url) {
        try {
            const parsed = new URL(url);
            let pathname = parsed.pathname;
            
            if (pathname === '/' || pathname === '') {
                return 'index.html';
            }
            
            if (pathname.endsWith('/')) {
                pathname = pathname.slice(0, -1);
            }
            
            const parts = pathname.split('/');
            const lastPart = parts[parts.length - 1];
            
            if (lastPart.includes('.')) {
                return lastPart;
            } else {
                return lastPart + '.html';
            }
        } catch {
            return 'index.html';
        }
    }

    async downloadPageResources(resources, device) {
        console.log(`📦 开始下载 ${device} 版本的资源文件...`);
        
        for (const resource of resources) {
            if (resource.status !== 200) continue;
            
            try {
                const resourceUrl = resource.url;
                const fileName = path.basename(new URL(resourceUrl).pathname) || `resource_${Date.now()}`;
                
                let subDir = 'assets';
                if (resource.type === 'image') {
                    subDir = path.join('assets', 'images');
                } else if (resource.type === 'stylesheet') {
                    subDir = path.join('assets', 'css');
                } else if (resource.type === 'script') {
                    subDir = path.join('assets', 'js');
                }
                
                const localPath = path.join(this.outputDir, subDir, fileName);
                
                // 避免重复下载
                if (!this.resources.has(resourceUrl)) {
                    await this.downloadResource(resourceUrl, localPath);
                    this.resources.add(resourceUrl);
                }
            } catch (error) {
                console.warn(`⚠️  下载资源失败: ${resource.url} - ${error.message}`);
            }
        }
    }

    async generateReport() {
        const report = {
            timestamp: new Date().toISOString(),
            baseUrl: this.baseUrl,
            crawledPages: Array.from(this.crawledPages),
            totalResources: this.resources.size,
            devices: ['desktop', 'mobile']
        };

        await fs.writeFile(
            path.join(this.outputDir, 'crawl-report.json'),
            JSON.stringify(report, null, 2),
            'utf8'
        );

        console.log('📋 生成抓取报告: crawl-report.json');
    }

    async run() {
        console.log('🥔 开始抓取 Potato 网站...');
        console.log('=====================================');
        
        await this.init();
        
        const pagesToCrawl = [this.baseUrl];
        const devices = ['desktop', 'mobile'];
        
        for (const device of devices) {
            console.log(`\n📱 开始抓取 ${device.toUpperCase()} 版本...`);
            
            for (const pageUrl of pagesToCrawl) {
                try {
                    const result = await this.crawlPage(pageUrl, device);
                    this.crawledPages.add(pageUrl);
                    
                    // 下载资源文件
                    if (result.resources.length > 0) {
                        await this.downloadPageResources(result.resources, device);
                    }
                    
                    // 对于首页，尝试抓取更多页面
                    if (pageUrl === this.baseUrl && device === 'desktop') {
                        const additionalPages = result.links
                            .filter(link => !this.crawledPages.has(link))
                            .slice(0, 5); // 限制额外页面数量
                        
                        for (const additionalPage of additionalPages) {
                            try {
                                await this.crawlPage(additionalPage, device);
                                this.crawledPages.add(additionalPage);
                            } catch (error) {
                                console.warn(`⚠️  抓取页面失败: ${additionalPage} - ${error.message}`);
                            }
                        }
                    }
                    
                } catch (error) {
                    console.error(`❌ 抓取失败: ${pageUrl} (${device}) - ${error.message}`);
                }
            }
        }
        
        await this.generateReport();
        
        console.log('\n✅ 抓取完成!');
        console.log(`📁 输出目录: ${this.outputDir}`);
        console.log(`📄 抓取页面: ${this.crawledPages.size}`);
        console.log(`📦 下载资源: ${this.resources.size}`);
    }
}

// 检查是否直接运行此脚本
if (require.main === module) {
    const crawler = new PotatoCrawler();
    crawler.run().catch(console.error);
}

module.exports = PotatoCrawler;
