# 阿里云部署指南 - Timeline 时光轴应用

## 域名: www.growingysa.com

## 一、准备工作

### 1. 购买阿里云服务器（ECS）
- 推荐配置：1核2G 或以上
- 操作系统：Ubuntu 22.04 LTS 或 CentOS 8
- 带宽：按流量或固定带宽（建议 3Mbps 以上）
- 地域：选择靠近你用户群体的区域

### 2. 购买域名并完成备案
- 域名：www.growingysa.com（已完成购买）
- 在阿里云完成 ICP 备案
- 配置域名解析到服务器公网 IP

### 3. 开放端口
在阿里云安全组中开放以下端口：
- 22 (SSH)
- 80 (HTTP)
- 443 (HTTPS)
- 3306 (MySQL，可选，建议限制 IP)
- 3001 (Node.js 后端，可选，建议只开放内网)

---

## 二、服务器环境配置

### 1. SSH 连接服务器
```bash
ssh root@你的服务器IP
```

### 2. 安装必要软件

**Ubuntu/Debian:**
```bash
# 更新系统
apt update && apt upgrade -y

# 安装 Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# 安装 MySQL
apt install -y mysql-server

# 安装 Nginx
apt install -y nginx

# 安装 Git
apt install -y git

# 安装 PM2（进程管理器）
npm install -g pm2
```

**CentOS/RHEL:**
```bash
# 更新系统
yum update -y

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
yum install -y nodejs

# 安装 MySQL
yum install -y mysql-server
systemctl start mysqld
systemctl enable mysqld

# 安装 Nginx
yum install -y nginx
systemctl start nginx
systemctl enable nginx

# 安装 Git
yum install -y git

# 安装 PM2
npm install -g pm2
```

### 3. 验证安装
```bash
node -v    # 应显示 v20.x.x
npm -v     # 应显示 10.x.x
mysql --version
nginx -v
```

---

## 三、数据库配置

### 1. 安全设置 MySQL
```bash
mysql_secure_installation
```
按提示设置 root 密码，其他选项建议选 Yes。

### 2. 创建数据库和用户
```bash
mysql -u root -p
```

在 MySQL 命令行中执行：
```sql
-- 创建数据库
CREATE DATABASE timeline_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（修改密码！）
CREATE USER 'timeline_user'@'localhost' IDENTIFIED BY '你的强密码';
CREATE USER 'timeline_user'@'%' IDENTIFIED BY '你的强密码';

-- 授权
GRANT ALL PRIVILEGES ON timeline_db.* TO 'timeline_user'@'localhost';
GRANT ALL PRIVILEGES ON timeline_db.* TO 'timeline_user'@'%';

FLUSH PRIVILEGES;
EXIT;
```

或者使用提供的 SQL 文件：
```bash
mysql -u root -p < database/init.sql
```

### 3. 修改 MySQL 绑定（可选）
如需远程连接 MySQL：
```bash
nano /etc/mysql/mysql.conf.d/mysqld.cnf
# 修改 bind-address = 0.0.0.0
systemctl restart mysql
```

---

## 四、部署应用代码

### 1. 创建项目目录
```bash
mkdir -p /var/www/timeline
cd /var/www/timeline
```

### 2. 上传代码
**方式一：Git 克隆（推荐）**
```bash
git clone https://github.com/你的用户名/timeline.git .
```

**方式二：SCP 上传（本地操作）**
```bash
# 在本地执行
scp -r /本地路径/timeline/* root@服务器IP:/var/www/timeline/
```

### 3. 安装依赖
```bash
cd /var/www/timeline
npm install
```

### 4. 配置环境变量
```bash
cp .env.example .env
nano .env
```

修改 `.env` 文件：
```env
DB_HOST=localhost
DB_USER=timeline_user
DB_PASSWORD=你的强密码
DB_NAME=timeline_db
PORT=3001
NODE_ENV=production
```

### 5. 构建前端
```bash
npm run build
```

### 6. 创建上传目录
```bash
mkdir -p /var/www/timeline/public/uploads
chmod 755 /var/www/timeline/public/uploads
```

---

## 五、配置 Nginx

### 1. 复制配置文件
```bash
cp /var/www/timeline/nginx/growingysa.conf /etc/nginx/sites-available/
```

**CentOS 路径不同：**
```bash
cp /var/www/timeline/nginx/growingysa.conf /etc/nginx/conf.d/
```

### 2. 创建软链接（Ubuntu/Debian）
```bash
ln -s /etc/nginx/sites-available/growingysa.conf /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default  # 删除默认配置
```

### 3. 测试并重载 Nginx
```bash
nginx -t
systemctl reload nginx
```

---

## 六、启动后端服务

### 1. 使用 PM2 启动
```bash
cd /var/www/timeline
pm2 start server-mysql.js --name "timeline"
pm2 save
pm2 startup  # 按提示设置开机自启
```

### 2. 查看状态
```bash
pm2 status
pm2 logs timeline
```

### 3. 常用 PM2 命令
```bash
pm2 restart timeline    # 重启
pm2 stop timeline       # 停止
pm2 delete timeline     # 删除
pm2 monit               # 监控
```

---

## 七、配置 HTTPS（SSL 证书）

### 方式一：Let's Encrypt 免费证书（推荐）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d www.growingysa.com -d growingysa.com

# 自动续期测试
certbot renew --dry-run
```

### 方式二：阿里云 SSL 证书
1. 在阿里云 SSL 证书控制台购买/申请证书
2. 下载 Nginx 格式的证书文件
3. 上传到服务器 `/etc/nginx/ssl/`
4. 修改 Nginx 配置启用 HTTPS

---

## 八、域名解析配置

在阿里云域名控制台：

1. 进入域名解析设置
2. 添加 A 记录：
   - 主机记录：`www`
   - 记录值：服务器公网 IP
   - TTL：默认 10 分钟
3. 添加 A 记录（可选）：
   - 主机记录：`@`（根域名）
   - 记录值：服务器公网 IP

---

## 九、验证部署

### 1. 测试后端 API
```bash
curl http://localhost:3001/api/health
```
应返回：`{"status":"ok","database":"connected"}`

### 2. 测试前端
浏览器访问 `http://www.growingysa.com`

### 3. 测试 API 接口
浏览器访问 `http://www.growingysa.com/api/people`
应返回人物数据 JSON

---

## 十、日常维护

### 更新代码
```bash
cd /var/www/timeline
git pull origin main
npm install
npm run build
pm2 restart timeline
```

### 备份数据库
```bash
# 创建备份脚本
mkdir -p /var/www/timeline/backups
mysqldump -u timeline_user -p timeline_db > /var/www/timeline/backups/backup-$(date +%Y%m%d).sql
```

### 查看日志
```bash
# Nginx 日志
tail -f /var/log/nginx/growingysa.error.log

# 应用日志
pm2 logs timeline

# 系统日志
journalctl -u nginx -f
```

---

## 十一、故障排查

### 1. 502 Bad Gateway
- 检查后端是否运行：`pm2 status`
- 检查端口是否正确：查看 `.env` 中的 PORT
- 检查防火墙：`ufw status` 或 `iptables -L`

### 2. 数据库连接失败
- 检查 MySQL 是否运行：`systemctl status mysql`
- 检查数据库凭据：查看 `.env` 配置
- 测试连接：`mysql -u timeline_user -p -h localhost timeline_db`

### 3. 前端空白页
- 检查是否正确构建：`ls -la /var/www/timeline/dist/`
- 检查 Nginx 配置中的 root 路径
- 查看浏览器控制台报错

### 4. 权限问题
```bash
# 修复目录权限
chown -R www-data:www-data /var/www/timeline
chmod -R 755 /var/www/timeline
```

---

## 十二、安全建议

1. **修改默认 SSH 端口**
2. **禁用 root 登录，使用普通用户**
3. **配置 fail2ban 防止暴力破解**
4. **定期更新系统和软件**
5. **启用阿里云云防火墙**
6. **配置定期数据库备份**
7. **使用 HTTPS 强制跳转**

---

## 快速部署脚本（可选）

创建 `deploy.sh`：
```bash
#!/bin/bash
cd /var/www/timeline
echo "Pulling latest code..."
git pull origin main
echo "Installing dependencies..."
npm install
echo "Building..."
npm run build
echo "Restarting server..."
pm2 restart timeline
echo "Done!"
```

赋予权限：`chmod +x deploy.sh`
执行：`./deploy.sh`

---

**部署完成！访问 https://www.growingysa.com 查看你的时光轴应用。**
