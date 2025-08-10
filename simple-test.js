#!/usr/bin/env node

/**
 * 简单的 Firecrawl MCP 连接测试
 */

const { spawn } = require('child_process');

async function simpleTest() {
    console.log('🧪 简单连接测试...');
    
    return new Promise((resolve, reject) => {
        // 设置更短的超时时间
        const timeout = setTimeout(() => {
            console.log('⏰ 连接超时（10秒）');
            reject(new Error('Connection timeout'));
        }, 10000);

        const firecrawl = spawn('firecrawl-mcp', ['--help'], {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: { ...process.env, FIRECRAWL_API_KEY: 'fc-c6c470036718491484dfa3b5d8c4d14d' }
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
            clearTimeout(timeout);
            if (code === 0) {
                console.log('✅ Firecrawl MCP 可用');
                resolve(true);
            } else {
                console.log('❌ Firecrawl MCP 不可用');
                reject(new Error(`Exit code: ${code}`));
            }
        });

        firecrawl.on('error', (error) => {
            clearTimeout(timeout);
            console.log('❌ 启动失败');
            reject(error);
        });
    });
}

// 运行测试
simpleTest()
    .then(() => {
        console.log('🎉 测试成功！');
        process.exit(0);
    })
    .catch(error => {
        console.log('❌ 测试失败:', error.message);
        process.exit(1);
    });
