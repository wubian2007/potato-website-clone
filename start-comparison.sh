#!/bin/bash

# Potato 网站版本对比启动脚本

echo "🥔 Potato 网站版本对比工具"
echo "=================================="
echo ""
echo "本项目包含两个版本的 Potato 网站副本："
echo ""
echo "1. 📋 基础版本 (index.html)"
echo "   - 基于网站描述创建的初始版本"
echo "   - 现代化的响应式设计"
echo "   - 完整的交互功能"
echo ""
echo "2. 🎯 精确版本 (potato-crawled.html)" 
echo "   - 基于 Puppeteer 抓取的真实内容"
echo "   - 保持原网站的设计风格"
echo "   - 移动端和桌面端差异分析"
echo ""
echo "3. 📱 移动端测试页面 (mobile-test.html)"
echo "   - 移动端兼容性测试工具"
echo "   - 设备信息检测"
echo "   - 性能监控"
echo ""

# 检查 Python 或 Node.js
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动本地服务器..."
    echo ""
    echo "🌐 访问地址："
    echo "   基础版本: http://localhost:8000/index.html"
    echo "   精确版本: http://localhost:8000/potato-crawled.html"
    echo "   移动端测试: http://localhost:8000/mobile-test.html"
    echo "   抓取内容: http://localhost:8000/crawled-content/"
    echo ""
    echo "📱 移动端测试建议："
    echo "   1. 在浏览器中按 F12 打开开发者工具"
    echo "   2. 点击设备模拟器图标"
    echo "   3. 选择不同设备进行测试"
    echo ""
    echo "📊 查看抓取分析报告："
    echo "   cat CRAWL_ANALYSIS.md"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动本地服务器..."
    echo ""
    echo "🌐 访问地址："
    echo "   基础版本: http://localhost:8000/index.html"
    echo "   精确版本: http://localhost:8000/potato-crawled.html"
    echo "   移动端测试: http://localhost:8000/mobile-test.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "检测到 Node.js，尝试使用 npx serve..."
    if command -v npx &> /dev/null; then
        echo ""
        echo "🌐 访问地址："
        echo "   基础版本: http://localhost:3000/index.html"
        echo "   精确版本: http://localhost:3000/potato-crawled.html"
        echo "   移动端测试: http://localhost:3000/mobile-test.html"
        echo ""
        echo "按 Ctrl+C 停止服务器"
        echo "=================================="
        npx serve . -p 3000
    else
        echo "❌ 未找到 npx，请安装 Node.js 或 Python"
        exit 1
    fi
else
    echo "❌ 未找到 Python 或 Node.js"
    echo ""
    echo "请安装以下任一工具："
    echo "- Python 3: https://python.org"
    echo "- Node.js: https://nodejs.org"
    echo ""
    echo "或者直接在浏览器中打开 HTML 文件："
    echo "- 基础版本: $(pwd)/index.html"
    echo "- 精确版本: $(pwd)/potato-crawled.html"
    echo "- 移动端测试: $(pwd)/mobile-test.html"
    echo ""
    echo "📋 查看项目文档："
    echo "- README.md - 项目介绍"
    echo "- CRAWL_ANALYSIS.md - 抓取分析报告"
    exit 1
fi
