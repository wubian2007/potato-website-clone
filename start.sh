#!/bin/bash

# Potato 网站本地服务器启动脚本

echo "🥔 启动 Potato 网站本地服务器..."
echo "=================================="

# 检查 Python 是否可用
if command -v python3 &> /dev/null; then
    echo "使用 Python 3 启动服务器..."
    echo "访问地址: http://localhost:8000"
    echo "移动端测试页面: http://localhost:8000/mobile-test.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python3 -m http.server 8000
elif command -v python &> /dev/null; then
    echo "使用 Python 2 启动服务器..."
    echo "访问地址: http://localhost:8000"
    echo "移动端测试页面: http://localhost:8000/mobile-test.html"
    echo ""
    echo "按 Ctrl+C 停止服务器"
    echo "=================================="
    python -m SimpleHTTPServer 8000
elif command -v node &> /dev/null; then
    echo "检测到 Node.js，尝试使用 npx serve..."
    if command -v npx &> /dev/null; then
        echo "访问地址: http://localhost:3000"
        echo "移动端测试页面: http://localhost:3000/mobile-test.html"
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
    echo "请安装以下任一工具："
    echo "- Python 3: https://python.org"
    echo "- Node.js: https://nodejs.org"
    echo ""
    echo "或者直接在浏览器中打开 index.html 文件"
    exit 1
fi
