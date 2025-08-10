#!/usr/bin/env node

/**
 * 简单的 npx firecrawl-mcp 测试脚本
 */

const { spawn } = require('child_process');

async function testNpxFirecrawl() {
    console.log('🧪 测试 npx firecrawl-mcp...');
    
    return new Promise((resolve, reject) => {
        const args = [
            '-y',
            'firecrawl-mcp',
            'scrape',
            'https://potato.im/',
            '--format', 'html'
        ];

        console.log(`🔧 执行命令: npx ${args.join(' ')}`);
        console.log(`⏳ 开始时间: ${new Date().toLocaleTimeString()}`);

        const npx = spawn('npx', args, {
            stdio: ['inherit', 'pipe', 'pipe'],
            env: { ...process.env, FIRECRAWL_API_KEY: 'fc-c6c470036718491484dfa3b5d8c4d14d' }
        });

        let stdout = '';
        let stderr = '';
        let startTime = Date.now();

        // 设置超时
        const timeout = setTimeout(() => {
            console.log('⏰ 测试超时（30秒），终止进程...');
            npx.kill();
            reject(new Error('Test timeout after 30 seconds'));
        }, 30000);

        const progressInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            process.stdout.write(`\r   ⏱️ 测试中... ${elapsed}秒`);
        }, 1000);

        npx.stdout.on('data', (data) => {
            const dataStr = data.toString();
            stdout += dataStr;
            console.log(`\n   📥 收到数据: ${dataStr.length} 字节`);
        });

        npx.stderr.on('data', (data) => {
            const dataStr = data.toString();
            stderr += dataStr;
            console.log(`\n   📝 日志: ${dataStr.trim()}`);
        });

        npx.on('close', (code) => {
            clearTimeout(timeout);
            clearInterval(progressInterval);
            const elapsed = Math.floor((Date.now() - startTime) / 1000);
            console.log(`\n   ✅ 测试完成，耗时: ${elapsed}秒，退出码: ${code}`);
            
            if (code === 0) {
                console.log('🎉 npx firecrawl-mcp 测试成功！');
                console.log(`📊 输出数据大小: ${stdout.length} 字节`);
                resolve({ success: true, data: stdout, elapsed });
            } else {
                console.log('❌ npx firecrawl-mcp 测试失败！');
                console.log(`📝 错误信息: ${stderr}`);
                reject(new Error(`Test failed with code ${code}: ${stderr}`));
            }
        });

        npx.on('error', (error) => {
            clearTimeout(timeout);
            clearInterval(progressInterval);
            console.log(`\n   💥 启动失败: ${error.message}`);
            reject(error);
        });
    });
}

// 运行测试
if (require.main === module) {
    testNpxFirecrawl()
        .then(result => {
            console.log('\n✅ 测试通过！');
            console.log(`⏱️ 总耗时: ${result.elapsed} 秒`);
            
            // 保存结果
            const fs = require('fs');
            fs.writeFileSync('npx-test-result.json', JSON.stringify(result, null, 2));
            console.log('💾 结果已保存到 npx-test-result.json');
            
            process.exit(0);
        })
        .catch(error => {
            console.log('\n❌ 测试失败！');
            console.log(`💥 错误: ${error.message}`);
            process.exit(1);
        });
}

module.exports = testNpxFirecrawl;
