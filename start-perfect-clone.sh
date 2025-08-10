#!/bin/bash

# 启动 Potato 完美复刻版本的本地服务器
# Start local server for Potato Perfect Clone

echo "🥔 启动 Potato 完美复刻版本..."
echo "🥔 Starting Potato Perfect Clone..."
echo "=================================="

# 检查是否有 Python 3
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器..."
    echo "✅ Starting server with Python 3..."
    
    # 启动本地服务器
    echo "🌐 服务器启动在: http://localhost:8001"
    echo "🌐 Server running at: http://localhost:8001"
    echo ""
    echo "📄 页面链接 / Page Links:"
    echo "├── 🏠 完美复刻版 (默认中文): http://localhost:8001/potato-perfect-clone.html"
    echo "├── 🔥 Firecrawl 改进版: http://localhost:8001/potato-firecrawl-improved.html"
    echo "├── 📱 原版主页: http://localhost:8001/index.html"
    echo "├── 🎯 精确版本: http://localhost:8001/potato-crawled.html"
    echo "├── 📱 移动端测试: http://localhost:8001/mobile-test.html"
    echo "└── 🖼️ 图片展示: http://localhost:8001/optimize-images.html"
    echo ""
    echo "🔍 版本特色:"
    echo "├── 🥔 完美复刻版: 基于真实内容的1:1复刻，默认简体中文"
    echo "├── 🔥 Firecrawl 版本: 基于 Firecrawl MCP 抓取的真实内容"
    echo "├── 🎯 精确版本: 基于 Puppeteer 分析的完整结构"
    echo "└── 📱 移动端版本: 专门的移动端适配测试"
    echo ""
    echo "✨ 完美复刻版特点:"
    echo "├── 🇨🇳 默认简体中文界面"
    echo "├── 🎨 完美复刻原站视觉风格"
    echo "├── 🖼️ 使用官方下载的高清 logo"
    echo "├── 🌍 支持多语言切换 (中文/英文/繁体)"
    echo "├── 📱 完美的移动端适配"
    echo "├── ⚡ 流畅的动画和交互效果"
    echo "└── 🔧 完整的功能实现"
    echo ""
    echo "按 Ctrl+C 停止服务器 / Press Ctrl+C to stop server"
    echo "=================================="
    
    # 自动打开浏览器 (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2
        open "http://localhost:8001/potato-perfect-clone.html"
    fi
    
    python3 -m http.server 8001
    
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 2 启动服务器..."
    echo "✅ Starting server with Python 2..."
    
    echo "🌐 服务器启动在: http://localhost:8001"
    echo "🌐 Server running at: http://localhost:8001"
    echo "📄 完美复刻版: http://localhost:8001/potato-perfect-clone.html"
    
    # 自动打开浏览器 (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2
        open "http://localhost:8001/potato-perfect-clone.html"
    fi
    
    python -m SimpleHTTPServer 8001
    
else
    echo "❌ 未找到 Python，请安装 Python 后重试"
    echo "❌ Python not found, please install Python first"
    exit 1
fi
