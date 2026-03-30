#!/bin/bash

# Timeline 阿里云打包脚本
# 打包必要的文件用于上传到服务器

set -e

PROJECT_NAME="timeline-aliyun"
VERSION=$(date +%Y%m%d-%H%M%S)
ARCHIVE_NAME="${PROJECT_NAME}-${VERSION}.tar.gz"

echo "======================================"
echo " Timeline 阿里云打包脚本"
echo "======================================"
echo ""

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 请在项目根目录运行此脚本"
    exit 1
fi

cd "$(dirname "$0")"

echo "📦 创建打包目录..."
mkdir -p "dist-package/${PROJECT_NAME}"

# 复制必要文件
echo "📁 复制源代码..."
cp -r src "dist-package/${PROJECT_NAME}/"
cp -r public "dist-package/${PROJECT_NAME}/"
cp -r database "dist-package/${PROJECT_NAME}/"
cp -r nginx "dist-package/${PROJECT_NAME}/"
cp -r scripts "dist-package/${PROJECT_NAME}/"

echo "📁 复制配置文件..."
cp server-mysql.js "dist-package/${PROJECT_NAME}/"
cp server.js "dist-package/${PROJECT_NAME}/"
cp ecosystem.config.js "dist-package/${PROJECT_NAME}/"
cp deploy.sh "dist-package/${PROJECT_NAME}/"
cp package.json "dist-package/${PROJECT_NAME}/"
cp package-lock.json "dist-package/${PROJECT_NAME}/"
cp vite.config.ts "dist-package/${PROJECT_NAME}/" 2>/dev/null || true
cp tsconfig.json "dist-package/${PROJECT_NAME}/" 2>/dev/null || true
cp index.html "dist-package/${PROJECT_NAME}/"
cp .env.example "dist-package/${PROJECT_NAME}/"

echo "📁 复制文档..."
cp DEPLOY_ALIYUN.md "dist-package/${PROJECT_NAME}/"
cp README.md "dist-package/${PROJECT_NAME}/"
cp .gitignore "dist-package/${PROJECT_NAME}/"

echo "📁 复制已构建的前端..."
if [ -d "dist" ]; then
    cp -r dist "dist-package/${PROJECT_NAME}/"
fi

# 创建目录结构
echo "📁 创建必要目录..."
mkdir -p "dist-package/${PROJECT_NAME}/logs"
mkdir -p "dist-package/${PROJECT_NAME}/backups"
mkdir -p "dist-package/${PROJECT_NAME}/public/uploads"

# 打包
echo ""
echo "📦 创建压缩包..."
cd dist-package
tar -czf "../${ARCHIVE_NAME}" "${PROJECT_NAME}"
cd ..

# 计算文件大小
SIZE=$(du -h "${ARCHIVE_NAME}" | cut -f1)

echo ""
echo "======================================"
echo "✅ 打包完成！"
echo "======================================"
echo ""
echo "文件名: ${ARCHIVE_NAME}"
echo "大小: ${SIZE}"
echo ""
echo "上传方式:"
echo ""
echo "方式1 - SCP 命令上传:"
echo "  scp ${ARCHIVE_NAME} root@你的服务器IP:/root/"
echo ""
echo "方式2 - 使用 FileZilla/SFTP 上传"
echo ""
echo "上传后在服务器上执行:"
echo "  1. cd /var/www"
echo "  2. tar -xzf /root/${ARCHIVE_NAME}"
echo "  3. mv ${PROJECT_NAME} timeline"
echo "  4. cd timeline && ./scripts/install.sh"
echo "  5. cp .env.example .env  # 修改数据库密码"
echo "  6. ./deploy.sh"
echo ""

# 清理临时目录
rm -rf dist-package
