#!/bin/bash

# 🥔 Potato 项目 GitHub 同步脚本

echo "🥔 Potato 项目 GitHub 同步工具"
echo "=================================="
echo ""

# 检查是否有未提交的更改
if [[ -n $(git status --porcelain) ]]; then
    echo "📝 发现未提交的更改，正在提交..."
    git add .
    echo -n "请输入提交信息 (直接回车使用默认信息): "
    read commit_message
    if [[ -z "$commit_message" ]]; then
        commit_message="📱 Update mobile optimization and features"
    fi
    git commit -m "$commit_message"
    echo "✅ 更改已提交"
else
    echo "✅ 没有未提交的更改"
fi

echo ""
echo "🔗 GitHub 仓库连接步骤："
echo ""
echo "1. 访问 https://github.com 并登录"
echo "2. 点击右上角的 '+' 按钮 → 'New repository'"
echo "3. 填写仓库信息："
echo "   - Repository name: potato-website-clone"
echo "   - Description: 🥔 Potato website clone with mobile optimization"
echo "   - 选择 Public"
echo "   - 不要勾选任何初始化选项"
echo "4. 点击 'Create repository'"
echo ""

echo -n "请输入你的 GitHub 用户名: "
read github_username

if [[ -z "$github_username" ]]; then
    echo "❌ 用户名不能为空"
    exit 1
fi

# 设置远程仓库
REPO_URL="https://github.com/$github_username/potato-website-clone.git"
echo ""
echo "🔗 连接到远程仓库: $REPO_URL"

# 检查是否已经有远程仓库
if git remote get-url origin >/dev/null 2>&1; then
    echo "⚠️  远程仓库已存在，正在更新..."
    git remote set-url origin "$REPO_URL"
else
    echo "➕ 添加远程仓库..."
    git remote add origin "$REPO_URL"
fi

echo ""
echo "🚀 推送到 GitHub..."
echo "如果这是第一次推送，可能需要输入 GitHub 用户名和密码/token"
echo ""

# 推送到 GitHub
if git push -u origin main; then
    echo ""
    echo "🎉 成功同步到 GitHub！"
    echo ""
    echo "📱 你的项目现在可以在以下地址访问："
    echo "   仓库地址: https://github.com/$github_username/potato-website-clone"
    echo ""
    echo "🌐 启用 GitHub Pages:"
    echo "   1. 进入仓库页面"
    echo "   2. 点击 Settings → Pages"
    echo "   3. Source 选择 'Deploy from a branch'"
    echo "   4. 选择 'main' 分支和 '/ (root)'"
    echo "   5. 点击 Save"
    echo ""
    echo "🔗 GitHub Pages 地址 (几分钟后可用):"
    echo "   基础版本: https://$github_username.github.io/potato-website-clone/"
    echo "   精确版本: https://$github_username.github.io/potato-website-clone/potato-crawled.html"
    echo "   移动端测试: https://$github_username.github.io/potato-website-clone/mobile-test.html"
    echo ""
    echo "📱 建议在手机上访问 GitHub Pages 链接测试真实的移动端体验！"
    echo ""
    echo "⭐ 不要忘记给项目添加 star 和 topics 标签："
    echo "   web-scraping, responsive-design, mobile-first, css-grid, javascript"
    
else
    echo ""
    echo "❌ 推送失败，可能的原因："
    echo "   1. GitHub 仓库尚未创建"
    echo "   2. 需要先在 GitHub 上创建同名仓库"
    echo "   3. 认证问题（需要设置 Personal Access Token）"
    echo ""
    echo "🔧 解决方案："
    echo "   1. 确保在 GitHub 上创建了 'potato-website-clone' 仓库"
    echo "   2. 如果需要认证，请设置 Personal Access Token:"
    echo "      GitHub Settings → Developer settings → Personal access tokens"
    echo ""
    echo "📖 详细步骤请查看: GITHUB_DEPLOY.md"
fi
