#!/bin/bash

# Timeline 阿里云服务器初始化安装脚本
# 在全新服务器上运行此脚本配置环境

set -e

echo "======================================"
echo " Timeline 服务器初始化脚本"
echo "======================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查 root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用 sudo 或 root 用户运行${NC}"
    exit 1
fi

# 检测系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo -e "${RED}❌ 无法检测操作系统${NC}"
    exit 1
fi

echo -e "${YELLOW}检测到系统: $OS${NC}"
echo ""

# 更新系统
echo "📦 更新系统..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt update && apt upgrade -y
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum update -y
else
    echo -e "${YELLOW}⚠️ 不支持的系统，请手动安装${NC}"
    exit 1
fi

# 安装 Node.js
echo ""
echo "📦 安装 Node.js 20.x..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    yum install -y nodejs
fi

# 安装 PM2
echo ""
echo "📦 安装 PM2..."
npm install -g pm2

# 安装 MySQL
echo ""
echo "📦 安装 MySQL..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt install -y mysql-server
    systemctl start mysql
    systemctl enable mysql
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum install -y mysql-server
    systemctl start mysqld
    systemctl enable mysqld
fi

# 安装 Nginx
echo ""
echo "📦 安装 Nginx..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt install -y nginx
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum install -y nginx
fi

systemctl start nginx
systemctl enable nginx

# 安装 Git
echo ""
echo "📦 安装 Git..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    apt install -y git
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    yum install -y git
fi

# 创建项目目录
echo ""
echo "📁 创建项目目录..."
mkdir -p /var/www/timeline
mkdir -p /var/www/timeline/logs
mkdir -p /var/www/timeline/backups

# 设置权限
echo ""
echo "🔐 设置目录权限..."
if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
    chown -R www-data:www-data /var/www/timeline
elif [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
    chown -R nginx:nginx /var/www/timeline
fi
chmod -R 755 /var/www/timeline

# 验证安装
echo ""
echo "======================================"
echo -e "${GREEN}✅ 安装完成！${NC}"
echo "======================================"
echo ""
echo "版本信息:"
echo "  Node.js: $(node -v)"
echo "  NPM: $(npm -v)"
echo "  MySQL: $(mysql --version | head -1)"
echo "  Nginx: $(nginx -v 2>&1 | head -1)"
echo ""
echo "下一步操作:"
echo "  1. 上传代码到 /var/www/timeline/"
echo "  2. 运行 MySQL 安全设置: mysql_secure_installation"
echo "  3. 初始化数据库: mysql -u root -p < database/init.sql"
echo "  4. 创建 .env 配置文件"
echo "  5. 运行部署脚本: ./deploy.sh"
echo ""
echo -e "${YELLOW}详细步骤请参考 DEPLOY_ALIYUN.md${NC}"
echo ""
