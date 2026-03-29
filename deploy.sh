#!/bin/bash

# Timeline 阿里云快速部署脚本
# 用法: ./deploy.sh

set -e

echo "======================================"
echo " Timeline 阿里云部署脚本"
echo " 域名: www.growingysa.com"
echo "======================================"
echo ""

PROJECT_DIR="/var/www/timeline"

# 检查是否以 root 运行
if [ "$EUID" -ne 0 ]; then
    echo "❌ 请使用 sudo 或 root 用户运行此脚本"
    exit 1
fi

# 进入项目目录
if [ ! -d "$PROJECT_DIR" ]; then
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    echo "请先手动克隆代码到该目录"
    exit 1
fi

cd "$PROJECT_DIR"

echo "📦 更新代码..."
if [ -d ".git" ]; then
    git pull origin main
else
    echo "⚠️ 不是 Git 仓库，跳过拉取"
fi

echo ""
echo "📦 安装依赖..."
npm install

echo ""
echo "🔨 构建前端..."
npm run build

echo ""
echo "🔄 重启服务..."
pm2 restart timeline || pm2 start server-mysql.js --name "timeline"
pm2 save

echo ""
echo "✅ 部署完成！"
echo ""
echo "访问地址:"
echo "  - http://www.growingysa.com"
echo "  - http://$(curl -s ip.sb)  (IP直连)"
echo ""
echo "查看日志: pm2 logs timeline"
echo "查看状态: pm2 status"
echo ""
