#!/usr/bin/env node

/**
 * 使用 Firecrawl MCP 下载更多 Potato 官方图片资源
 */

const https = require('https');
const fs = require('fs').promises;
const path = require('path');

class ImageDownloader {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.baseUrl = 'https://api.firecrawl.dev/v0';
        
        // 从 Firecrawl MCP 抓取结果中发现的图片 URLs
        this.imageUrls = [
            // 官方 Logo 相关
            'https://www.potato.im/resources/images/logo1024.png',
            'https://potato.im/resources/images/logo@2x.png',
            'https://potato.im/resources/images/email/logo@2x.png',
            'https://potato.im/resources/images/ico.ico',
            
            // 平台图标
            'https://potato.im/resources/images/email/icon_apps_android.png',
            'https://potato.im/resources/images/email/icon_apps_ios.png',
            'https://potato.im/resources/images/email/icon_apps_win.png',
            'https://potato.im/resources/images/email/icon_apps_macos.png',
            'https://potato.im/resources/images/email/icon_apps_linux.png',
            
            // UI 界面图片
            'https://potato.im/resources/images/index/image_ui_web@2x.png',
            
            // 按钮和图标
            'https://potato.im/resources/images/btn_addphoto.png',
            'https://potato.im/resources/images/email/icon_refresh.png'
        ];
    }

    async downloadImage(url, filename) {
        return new Promise((resolve, reject) => {
            console.log(`📥 正在下载: ${url}`);
            
            https.get(url, (response) => {
                if (response.statusCode === 302 || response.statusCode === 301) {
                    // 处理重定向
                    return this.downloadImage(response.headers.location, filename);
                }
                
                if (response.statusCode !== 200) {
                    console.log(`⚠️  HTTP ${response.statusCode}: ${url}`);
                    resolve(null);
                    return;
                }

                const chunks = [];
                let totalSize = 0;
                
                response.on('data', (chunk) => {
                    chunks.push(chunk);
                    totalSize += chunk.length;
                });
                
                response.on('end', async () => {
                    try {
                        const buffer = Buffer.concat(chunks);
                        await fs.writeFile(filename, buffer);
                        console.log(`✅ 下载成功: ${path.basename(filename)} (${totalSize} bytes)`);
                        resolve({ url, filename, size: totalSize, success: true });
                    } catch (error) {
                        console.error(`❌ 保存失败: ${filename} - ${error.message}`);
                        resolve({ url, filename, error: error.message, success: false });
                    }
                });
            }).on('error', (error) => {
                console.error(`❌ 下载失败: ${url} - ${error.message}`);
                resolve({ url, filename, error: error.message, success: false });
            });
        });
    }

    async run() {
        console.log('🔥 开始下载 Potato 官方图片资源...');
        console.log('==========================================');
        
        // 确保 images 目录存在
        const imagesDir = './images';
        try {
            await fs.access(imagesDir);
        } catch {
            await fs.mkdir(imagesDir, { recursive: true });
            console.log('📁 创建 images 目录');
        }

        console.log(`\n📥 开始下载 ${this.imageUrls.length} 个图片文件...`);
        
        const results = [];
        for (const url of this.imageUrls) {
            try {
                // 生成本地文件名
                const urlPath = new URL(url).pathname;
                let filename = path.basename(urlPath);
                
                // 处理特殊文件名
                if (filename.includes('@2x')) {
                    filename = filename.replace('@2x', '-2x');
                }
                
                const localPath = path.join(imagesDir, filename);
                const result = await this.downloadImage(url, localPath);
                
                if (result) {
                    results.push(result);
                }
                
                // 添加小延迟避免请求过快
                await new Promise(resolve => setTimeout(resolve, 500));
                
            } catch (error) {
                console.error(`❌ 处理失败: ${url} - ${error.message}`);
                results.push({ url, error: error.message, success: false });
            }
        }

        // 生成下载报告
        const report = {
            timestamp: new Date().toISOString(),
            totalRequested: this.imageUrls.length,
            successful: results.filter(r => r.success).length,
            failed: results.filter(r => !r.success).length,
            totalSize: results.filter(r => r.success).reduce((sum, r) => sum + (r.size || 0), 0),
            results: results
        };

        await fs.writeFile('./images/download-report.json', JSON.stringify(report, null, 2));
        
        console.log('\n📋 下载报告:');
        console.log(`✅ 成功下载: ${report.successful} 个文件`);
        console.log(`❌ 下载失败: ${report.failed} 个文件`);
        console.log(`📦 总大小: ${(report.totalSize / 1024).toFixed(1)} KB`);
        console.log(`📁 文件保存在: ${imagesDir}/`);
        
        // 显示成功下载的文件
        console.log('\n📸 成功下载的图片:');
        results.filter(r => r.success).forEach(r => {
            console.log(`  ✅ ${path.basename(r.filename)} (${(r.size / 1024).toFixed(1)} KB)`);
        });
        
        // 显示失败的文件
        if (report.failed > 0) {
            console.log('\n❌ 下载失败的图片:');
            results.filter(r => !r.success).forEach(r => {
                console.log(`  ❌ ${r.url}`);
            });
        }
        
        return report;
    }
}

// 运行下载
const apiKey = process.env.FIRECRAWL_API_KEY || 'fc-c6c470036718491484dfa3b5d8c4d14d';

const downloader = new ImageDownloader(apiKey);
downloader.run().catch(console.error);
