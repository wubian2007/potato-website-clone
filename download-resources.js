#!/usr/bin/env node

/**
 * 下载 Potato 网站资源文件脚本
 * 从抓取到的HTML中提取并下载CSS、JS、图片等资源
 */

const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');
const { URL } = require('url');

class ResourceDownloader {
    constructor() {
        this.baseUrl = 'https://potato.im/';
        this.mobileUrl = 'https://m.potato.im/';
        this.outputDir = './curl-potato-content';
        this.results = [];
    }

    async downloadFile(url, outputPath) {
        return new Promise((resolve, reject) => {
            const protocol = url.startsWith('https:') ? https : http;
            
            const request = protocol.get(url, (response) => {
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
            });

            request.setTimeout(10000, () => {
                request.destroy();
                reject(new Error(`Timeout: ${url}`));
            });

            request.on('error', (error) => {
                reject(error);
            });
        });
    }

    async extractResources(htmlContent, baseUrl) {
        const resources = [];
        
        // 提取CSS文件
        const cssRegex = /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi;
        let cssMatch;
        while ((cssMatch = cssRegex.exec(htmlContent)) !== null) {
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
        while ((jsMatch = jsRegex.exec(htmlContent)) !== null) {
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
        while ((imgMatch = imgRegex.exec(htmlContent)) !== null) {
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

        // 提取字体文件
        const fontRegex = /<link[^>]+href=["']([^"']+\.(woff|woff2|ttf|eot)[^"']*)["'][^>]*>/gi;
        let fontMatch;
        while ((fontMatch = fontRegex.exec(htmlContent)) !== null) {
            const fontUrl = new URL(fontMatch[1], baseUrl).href;
            resources.push({
                type: 'font',
                url: fontUrl,
                filename: path.basename(fontUrl.split('?')[0])
            });
        }

        return resources;
    }

    async downloadResources(htmlContent, baseUrl, outputDir) {
        console.log(`🔍 从 ${baseUrl} 提取资源...`);
        
        const resources = await this.extractResources(htmlContent, baseUrl);
        
        // 去重
        const uniqueResources = resources.filter((resource, index, self) => 
            index === self.findIndex(r => r.url === resource.url)
        );

        console.log(`📊 发现 ${uniqueResources.length} 个唯一资源:`);
        const cssCount = uniqueResources.filter(r => r.type === 'css').length;
        const jsCount = uniqueResources.filter(r => r.type === 'js').length;
        const imgCount = uniqueResources.filter(r => r.type === 'image').length;
        const fontCount = uniqueResources.filter(r => r.type === 'font').length;
        
        console.log(`   📄 CSS文件: ${cssCount} 个`);
        console.log(`   📜 JS文件: ${jsCount} 个`);
        console.log(`   🖼️ 图片文件: ${imgCount} 个`);
        console.log(`   🔤 字体文件: ${fontCount} 个`);

        if (uniqueResources.length === 0) {
            console.log(`⚠️ 未发现需要下载的资源文件`);
            return [];
        }

        console.log(`\n📥 开始下载资源文件...`);
        let successCount = 0;
        let failCount = 0;
        const downloadedResources = [];

        for (let i = 0; i < uniqueResources.length; i++) {
            const resource = uniqueResources[i];
            console.log(`   [${i + 1}/${uniqueResources.length}] 下载: ${resource.filename}`);
            
            try {
                const resourceDir = path.join(outputDir, 'assets', resource.type === 'image' ? 'images' : resource.type);
                await fs.mkdir(resourceDir, { recursive: true });
                
                const outputPath = path.join(resourceDir, resource.filename);
                
                await this.downloadFile(resource.url, outputPath);
                console.log(`   ✅ 下载成功: ${resource.filename}`);
                successCount++;
                
                downloadedResources.push({
                    ...resource,
                    localPath: outputPath
                });
                
            } catch (error) {
                console.log(`   ❌ 下载失败: ${resource.filename} - ${error.message}`);
                failCount++;
            }
        }

        console.log(`\n📊 资源下载完成:`);
        console.log(`   ✅ 成功: ${successCount} 个`);
        console.log(`   ❌ 失败: ${failCount} 个`);
        console.log(`   📈 成功率: ${((successCount / uniqueResources.length) * 100).toFixed(1)}%`);

        return downloadedResources;
    }

    async updateHtmlPaths(htmlContent, baseUrl, outputDir) {
        console.log(`🔄 更新HTML中的资源路径...`);
        
        let updatedHtml = htmlContent;
        
        // 更新CSS路径
        updatedHtml = updatedHtml.replace(
            /<link[^>]+href=["']([^"']+\.css[^"']*)["'][^>]*>/gi,
            (match, href) => {
                const url = new URL(href, baseUrl);
                const filename = path.basename(url.href.split('?')[0]);
                return match.replace(href, `./assets/css/${filename}`);
            }
        );

        // 更新JS路径
        updatedHtml = updatedHtml.replace(
            /<script[^>]+src=["']([^"']+\.js[^"']*)["'][^>]*>/gi,
            (match, src) => {
                const url = new URL(src, baseUrl);
                const filename = path.basename(url.href.split('?')[0]);
                return match.replace(src, `./assets/js/${filename}`);
            }
        );

        // 更新图片路径
        updatedHtml = updatedHtml.replace(
            /<img[^>]+src=["']([^"']+)["'][^>]*>/gi,
            (match, src) => {
                const url = new URL(src, baseUrl);
                const ext = path.extname(url.href.split('?')[0]);
                if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico'].includes(ext.toLowerCase())) {
                    const filename = path.basename(url.href.split('?')[0]);
                    return match.replace(src, `./assets/images/${filename}`);
                }
                return match;
            }
        );

        console.log(`✅ HTML路径更新完成`);
        return updatedHtml;
    }

    async processHtmlFile(htmlPath, baseUrl, outputDir) {
        console.log(`\n📄 处理HTML文件: ${htmlPath}`);
        
        try {
            // 读取HTML文件
            const htmlContent = await fs.readFile(htmlPath, 'utf8');
            
            // 下载资源
            const downloadedResources = await this.downloadResources(htmlContent, baseUrl, outputDir);
            
            // 更新HTML中的路径
            const updatedHtml = await this.updateHtmlPaths(htmlContent, baseUrl, outputDir);
            
            // 保存更新后的HTML
            const updatedHtmlPath = htmlPath.replace('.html', '-with-assets.html');
            await fs.writeFile(updatedHtmlPath, updatedHtml, 'utf8');
            
            console.log(`✅ 处理完成，更新后的HTML已保存为: ${updatedHtmlPath}`);
            
            return {
                originalPath: htmlPath,
                updatedPath: updatedHtmlPath,
                resources: downloadedResources
            };
            
        } catch (error) {
            console.error(`❌ 处理HTML文件失败: ${error.message}`);
            throw error;
        }
    }

    async run() {
        console.log('🚀 开始下载 Potato 网站资源文件...');
        console.log('=====================================');
        
        try {
            // 处理桌面端HTML
            const desktopHtmlPath = path.join(this.outputDir, 'desktop', 'index.html');
            const desktopResult = await this.processHtmlFile(desktopHtmlPath, this.baseUrl, this.outputDir);
            
            // 处理移动端HTML
            const mobileHtmlPath = path.join(this.outputDir, 'mobile', 'index.html');
            const mobileResult = await this.processHtmlFile(mobileHtmlPath, this.mobileUrl, this.outputDir);
            
            // 生成报告
            const report = {
                timestamp: new Date().toISOString(),
                desktop: {
                    originalPath: desktopResult.originalPath,
                    updatedPath: desktopResult.updatedPath,
                    resourcesCount: desktopResult.resources.length
                },
                mobile: {
                    originalPath: mobileResult.originalPath,
                    updatedPath: mobileResult.updatedPath,
                    resourcesCount: mobileResult.resources.length
                },
                totalResources: desktopResult.resources.length + mobileResult.resources.length
            };
            
            const reportPath = path.join(this.outputDir, 'resource-download-report.json');
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf8');
            
            console.log('\n🎉 资源下载任务完成!');
            console.log(`📁 输出目录: ${this.outputDir}`);
            console.log(`📊 桌面端资源: ${desktopResult.resources.length} 个`);
            console.log(`📊 移动端资源: ${mobileResult.resources.length} 个`);
            console.log(`📊 总资源数: ${report.totalResources} 个`);
            console.log(`📋 查看报告: ${reportPath}`);

        } catch (error) {
            console.error(`💥 资源下载任务失败: ${error.message}`);
            throw error;
        }
    }
}

// 运行资源下载任务
if (require.main === module) {
    const downloader = new ResourceDownloader();
    downloader.run().catch(console.error);
}

module.exports = ResourceDownloader;
