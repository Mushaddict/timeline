-- Timeline 数据库初始化脚本
-- 用于阿里云服务器部署

-- 创建数据库
CREATE DATABASE IF NOT EXISTS timeline_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE timeline_db;

-- 人物表
CREATE TABLE IF NOT EXISTS people (
    id VARCHAR(50) PRIMARY KEY COMMENT '人物唯一ID',
    name VARCHAR(100) NOT NULL COMMENT '姓名',
    birthday DATE COMMENT '生日',
    avatar TEXT COMMENT '头像图片URL',
    meet_date DATE COMMENT '相识日期',
    memo TEXT COMMENT '备注',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
COMMENT='人物信息表';

-- 时间节点表
CREATE TABLE IF NOT EXISTS timeline_nodes (
    id VARCHAR(50) PRIMARY KEY COMMENT '节点唯一ID',
    title VARCHAR(200) NOT NULL COMMENT '事件标题',
    node_date DATE NOT NULL COMMENT '事件日期',
    end_date DATE COMMENT '结束日期（时间段类型）',
    type ENUM('point', 'range') DEFAULT 'point' COMMENT '节点类型：point时间点/range时间段',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    INDEX idx_node_date (node_date)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
COMMENT='时间节点表';

-- 内容框架表
CREATE TABLE IF NOT EXISTS frames (
    id VARCHAR(50) PRIMARY KEY COMMENT '框架唯一ID',
    node_id VARCHAR(50) NOT NULL COMMENT '所属节点ID',
    person_id VARCHAR(50) COMMENT '关联人物ID',
    content TEXT COMMENT '内容描述',
    images JSON COMMENT '图片数组',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    FOREIGN KEY (node_id) REFERENCES timeline_nodes(id) ON DELETE CASCADE,
    FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL,
    INDEX idx_node_id (node_id),
    INDEX idx_person_id (person_id)
) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
COMMENT='内容框架表';

-- 创建数据库用户（请修改密码）
CREATE USER IF NOT EXISTS 'timeline_user'@'localhost' IDENTIFIED BY 'your_strong_password';
CREATE USER IF NOT EXISTS 'timeline_user'@'%' IDENTIFIED BY 'your_strong_password';

-- 授予权限
GRANT ALL PRIVILEGES ON timeline_db.* TO 'timeline_user'@'localhost';
GRANT ALL PRIVILEGES ON timeline_db.* TO 'timeline_user'@'%';

FLUSH PRIVILEGES;

-- 插入示例数据（可选）
-- INSERT INTO people (id, name, birthday, avatar, meet_date, memo) VALUES
-- ('p001', '张三', '1995-06-15', '/uploads/avatar1.jpg', '2020-03-10', '大学同学');

-- INSERT INTO timeline_nodes (id, title, node_date, type) VALUES
-- ('t001', '第一次聚会', '2024-03-25', 'point');

-- INSERT INTO frames (id, node_id, person_id, content, images) VALUES
-- ('f001', 't001', 'p001', '我们在一起度过了愉快的时光', '["/uploads/img1.jpg"]');
