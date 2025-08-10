#!/usr/bin/env node

/**
 * 简单的 Firecrawl MCP 测试脚本
 * 测试API连接和基本功能
 */

const { spawn } = require('child_process');

async function testFirecrawlMCP() {
    console.log('🧪 开始测试 Firecrawl MCP...');
    
    return new Promise((resolve, reject) => {
        const args = [
            'scrape',
            'https://example.com',
            '--format', 'html',
            '--wait-for', '1000'
        ];

        console.log(`🔧 执行命令: firecrawl-mcp ${args.join(' ')}`);
        console.log(`⏳ 开始时间: ${new Date().toLocaleTimeString()}`);

        const firecrawl = spawn('firecrawl-mcp', args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: { ...process.env, FIRECRAWL_API_KEY: 'fc-c6c470036718491484dfa3b5d8c4d14d' }
        });

        let stdout = '';
        let stderr = '';
        let startTime = Date.now();

        // 设置超时
        const timeout = setTimeout(() => {
            console.log('⏰ 测试超时（30秒），终止进程...');
            firecrawl.kill();
            reject(new Error('Test timeout after 30 seconds'));
        }, 30000);

        const progressInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            process.stdout.write(`\r   ⏱️ 测试中... ${elapsed}秒`);
        }, 1000);

        firecrawl.stdout.on('data', (data) => {
            const dataStr = data.toString();
            stdout += dataStr;
            console.log(`\n   📥 收到数据: ${dataStr.length} 字节`);
        });

        firecrawl.stderr.on('data', (data) => {
            const dataStr = data.toString();
            stderr += dataStr;
            
            // 只显示重要信息
            const lines = dataStr.split('\n');
            lines.forEach(line => {
                const trimmedLine = line.trim();
                if (trimmedLine && !trimmedLine.includes('[info]') && !trimmedLine.includes('stdio mode')) {
                    if (trimmedLine.includes('error') || trimmedLine.includes('Error')) {
                        console.log(`\n   ❌ 错误: ${trimmedLine}`);
                    }
                }
            });
        });

        firecrawl.on('close', (code) => {
            clearTimeout(timeout);
            clearInterval(progressInterval);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`\n   ✅ 测试完成，耗时: ${elapsed}秒，退出码: ${code}`);
            
            if (code === 0) {
                console.log('🎉 Firecrawl MCP 测试成功！');
                console.log(`📊 输出数据大小: ${stdout.length} 字节`);
                resolve({ success: true, data: stdout, elapsed });
            } else {
                console.log('❌ Firecrawl MCP 测试失败！');
                console.log(`📝 错误信息: ${stderr}`);
                reject(new Error(`Test failed with code ${code}: ${stderr}`));
            }
        });

        firecrawl.on('error', (error) => {
            clearTimeout(timeout);
            clearInterval(progressInterval);
            console.log(`\n   💥 启动失败: ${error.message}`);
            reject(error);
        });
    });
}

// 运行测试
if (require.main === module) {
    testFirecrawlMCP()
        .then(result => {
            console.log('\n✅ 测试通过！');
            console.log(`⏱️ 总耗时: ${result.elapsed} 秒`);
            process.exit(0);
        })
        .catch(error => {
            console.log('\n❌ 测试失败！');
            console.log(`💥 错误: ${error.message}`);
            process.exit(1);
        });
}

module.exports = testFirecrawlMCP;
