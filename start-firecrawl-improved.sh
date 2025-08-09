#!/bin/bash

# 启动 Firecrawl 改进版本的本地服务器
# Start local server for Firecrawl improved version

echo "🔥 启动 Potato Firecrawl 改进版本..."
echo "🔥 Starting Potato Firecrawl Improved Version..."
echo "=================================="

# 检查是否有 Python 3
if command -v python3 &> /dev/null; then
    echo "✅ 使用 Python 3 启动服务器..."
    echo "✅ Starting server with Python 3..."
    
    # 启动本地服务器
    echo "🌐 服务器启动在: http://localhost:8000"
    echo "🌐 Server running at: http://localhost:8000"
    echo ""
    echo "📄 页面链接 / Page Links:"
    echo "├── 🏠 主页 (Firecrawl 改进版): http://localhost:8000/potato-firecrawl-improved.html"
    echo "├── 📱 原版主页: http://localhost:8000/index.html"
    echo "├── 🎯 精确版本: http://localhost:8000/potato-crawled.html"
    echo "└── 📱 移动端测试: http://localhost:8000/mobile-test.html"
    echo ""
    echo "🔍 特性对比:"
    echo "├── 🔥 Firecrawl 版本: 基于 Firecrawl MCP 抓取的真实内容"
    echo "├── 🎯 精确版本: 基于 Puppeteer 分析的完整结构"
    echo "└── 📱 移动端版本: 专门的移动端适配测试"
    echo ""
    echo "按 Ctrl+C 停止服务器 / Press Ctrl+C to stop server"
    echo "=================================="
    
    # 自动打开浏览器 (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2
        open "http://localhost:8000/potato-firecrawl-improved.html"
    fi
    
    python3 -m http.server 8000
    
elif command -v python &> /dev/null; then
    echo "✅ 使用 Python 2 启动服务器..."
    echo "✅ Starting server with Python 2..."
    
    echo "🌐 服务器启动在: http://localhost:8000"
    echo "🌐 Server running at: http://localhost:8000"
    echo "📄 主页: http://localhost:8000/potato-firecrawl-improved.html"
    
    # 自动打开浏览器 (macOS)
    if [[ "$OSTYPE" == "darwin"* ]]; then
        sleep 2
        open "http://localhost:8000/potato-firecrawl-improved.html"
    fi
    
    python -m SimpleHTTPServer 8000
    
else
    echo "❌ 未找到 Python，请安装 Python 后重试"
    echo "❌ Python not found, please install Python first"
    exit 1
fi
