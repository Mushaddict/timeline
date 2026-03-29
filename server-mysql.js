import express from 'express'
import cors from 'cors'
import mysql from 'mysql2/promise'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 3001

// 中间件
app.use(cors())
app.use(express.json({ limit: '10mb' }))
app.use(express.static(path.join(__dirname, 'dist')))

// 数据库配置 - 从环境变量读取
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'timeline_user',
  password: process.env.DB_PASSWORD || 'your_password',
  database: process.env.DB_NAME || 'timeline_db',
  charset: 'utf8mb4'
}

// 创建数据库连接池
const pool = mysql.createPool({
  ...dbConfig,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
})

// 初始化数据库
async function initDatabase() {
  try {
    const connection = await pool.getConnection()

    // 创建人物表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS people (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        birthday DATE,
        avatar TEXT,
        meet_date DATE,
        memo TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `)

    // 创建时间节点表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS timeline_nodes (
        id VARCHAR(50) PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        node_date DATE NOT NULL,
        end_date DATE,
        type ENUM('point', 'range') DEFAULT 'point',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `)

    // 创建内容框架表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS frames (
        id VARCHAR(50) PRIMARY KEY,
        node_id VARCHAR(50) NOT NULL,
        person_id VARCHAR(50),
        content TEXT,
        images JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (node_id) REFERENCES timeline_nodes(id) ON DELETE CASCADE,
        FOREIGN KEY (person_id) REFERENCES people(id) ON DELETE SET NULL
      ) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `)

    connection.release()
    console.log('✅ Database initialized successfully')
  } catch (error) {
    console.error('❌ Database initialization failed:', error.message)
    process.exit(1)
  }
}

// ===== API 路由 =====

// 获取所有人物
app.get('/api/people', async (req, res) => {
  try {
    const [rows] = await pool.execute('SELECT * FROM people ORDER BY created_at ASC')
    const people = rows.map(row => ({
      id: row.id,
      name: row.name,
      birthday: row.birthday,
      avatar: row.avatar,
      meetDate: row.meet_date,
      memo: row.memo
    }))
    res.json({ people })
  } catch (error) {
    console.error('Error fetching people:', error)
    res.status(500).json({ error: 'Failed to fetch people data' })
  }
})

// 保存人物数据（全量替换）
app.post('/api/people', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { people } = req.body

    // 清空现有数据
    await connection.execute('DELETE FROM frames WHERE person_id IS NOT NULL')
    await connection.execute('DELETE FROM people')

    // 插入新数据
    for (const person of people) {
      await connection.execute(
        'INSERT INTO people (id, name, birthday, avatar, meet_date, memo) VALUES (?, ?, ?, ?, ?, ?)',
        [person.id, person.name, person.birthday, person.avatar, person.meetDate, person.memo]
      )
    }

    await connection.commit()
    res.json({ success: true, message: 'People data saved successfully' })
  } catch (error) {
    await connection.rollback()
    console.error('Error saving people:', error)
    res.status(500).json({ error: 'Failed to save people data' })
  } finally {
    connection.release()
  }
})

// 添加单个人物
app.post('/api/people/add', async (req, res) => {
  try {
    const { id, name, birthday, avatar, meetDate, memo } = req.body
    await pool.execute(
      'INSERT INTO people (id, name, birthday, avatar, meet_date, memo) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, birthday, avatar, meetDate, memo]
    )
    res.json({ success: true, message: 'Person added successfully' })
  } catch (error) {
    console.error('Error adding person:', error)
    res.status(500).json({ error: 'Failed to add person' })
  }
})

// 获取所有时间轴数据
app.get('/api/timeline', async (req, res) => {
  try {
    const [nodes] = await pool.execute(`
      SELECT n.*, f.id as frame_id, f.person_id, f.content, f.images
      FROM timeline_nodes n
      LEFT JOIN frames f ON n.id = f.node_id
      ORDER BY n.node_date DESC, f.created_at ASC
    `)

    // 组织数据结构
    const nodeMap = new Map()
    for (const row of nodes) {
      if (!nodeMap.has(row.id)) {
        nodeMap.set(row.id, {
          id: row.id,
          title: row.title,
          date: row.node_date,
          endDate: row.end_date,
          type: row.type,
          frames: []
        })
      }
      if (row.frame_id) {
        nodeMap.get(row.id).frames.push({
          id: row.frame_id,
          personId: row.person_id,
          content: row.content,
          images: JSON.parse(row.images || '[]')
        })
      }
    }

    res.json({ nodes: Array.from(nodeMap.values()) })
  } catch (error) {
    console.error('Error fetching timeline:', error)
    res.status(500).json({ error: 'Failed to fetch timeline data' })
  }
})

// 保存时间轴数据（全量替换）
app.post('/api/timeline', async (req, res) => {
  const connection = await pool.getConnection()
  try {
    await connection.beginTransaction()

    const { nodes } = req.body

    // 清空现有数据
    await connection.execute('DELETE FROM frames')
    await connection.execute('DELETE FROM timeline_nodes')

    // 插入新数据
    for (const node of nodes) {
      await connection.execute(
        'INSERT INTO timeline_nodes (id, title, node_date, end_date, type) VALUES (?, ?, ?, ?, ?)',
        [node.id, node.title, node.date, node.endDate, node.type]
      )

      for (const frame of node.frames || []) {
        await connection.execute(
          'INSERT INTO frames (id, node_id, person_id, content, images) VALUES (?, ?, ?, ?, ?)',
          [frame.id, node.id, frame.personId, frame.content, JSON.stringify(frame.images || [])]
        )
      }
    }

    await connection.commit()
    res.json({ success: true, message: 'Timeline data saved successfully' })
  } catch (error) {
    await connection.rollback()
    console.error('Error saving timeline:', error)
    res.status(500).json({ error: 'Failed to save timeline data' })
  } finally {
    connection.release()
  }
})

// 添加单个时间节点
app.post('/api/timeline/add', async (req, res) => {
  try {
    const { id, title, date, endDate, type, frames } = req.body

    await pool.execute(
      'INSERT INTO timeline_nodes (id, title, node_date, end_date, type) VALUES (?, ?, ?, ?, ?)',
      [id, title, date, endDate, type]
    )

    for (const frame of frames || []) {
      await pool.execute(
        'INSERT INTO frames (id, node_id, person_id, content, images) VALUES (?, ?, ?, ?, ?)',
        [frame.id, id, frame.personId, frame.content, JSON.stringify(frame.images || [])]
      )
    }

    res.json({ success: true, message: 'Timeline node added successfully' })
  } catch (error) {
    console.error('Error adding timeline node:', error)
    res.status(500).json({ error: 'Failed to add timeline node' })
  }
})

// 删除时间节点
app.delete('/api/timeline/:id', async (req, res) => {
  try {
    const { id } = req.params
    await pool.execute('DELETE FROM timeline_nodes WHERE id = ?', [id])
    res.json({ success: true, message: 'Timeline node deleted successfully' })
  } catch (error) {
    console.error('Error deleting timeline node:', error)
    res.status(500).json({ error: 'Failed to delete timeline node' })
  }
})

// 创建备份
app.post('/api/backup', async (req, res) => {
  try {
    const fs = await import('fs/promises')
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(__dirname, 'backups')

    await fs.mkdir(backupDir, { recursive: true })

    // 获取当前数据
    const [people] = await pool.execute('SELECT * FROM people')
    const [nodes] = await pool.execute('SELECT * FROM timeline_nodes')
    const [frames] = await pool.execute('SELECT * FROM frames')

    const backup = {
      timestamp: new Date().toISOString(),
      people,
      nodes,
      frames
    }

    await fs.writeFile(
      path.join(backupDir, `backup-${timestamp}.json`),
      JSON.stringify(backup, null, 2)
    )

    res.json({ success: true, message: 'Backup created successfully' })
  } catch (error) {
    console.error('Error creating backup:', error)
    res.status(500).json({ error: 'Failed to create backup' })
  }
})

// 健康检查
app.get('/api/health', async (req, res) => {
  try {
    await pool.execute('SELECT 1')
    res.json({ status: 'ok', database: 'connected' })
  } catch (error) {
    res.status(500).json({ status: 'error', database: 'disconnected' })
  }
})

// 前端路由处理 - 所有其他路由都返回 index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'))
})

// 错误处理
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 启动服务器
async function startServer() {
  await initDatabase()

  app.listen(PORT, () => {
    console.log('')
    console.log('╔════════════════════════════════════════════════════════╗')
    console.log('║        Timeline Server with MySQL Database             ║')
    console.log('╠════════════════════════════════════════════════════════╣')
    console.log(`║  Server running at: http://localhost:${PORT}              ║`)
    console.log(`║  Database: ${dbConfig.database.padEnd(43)} ║`)
    console.log('╠════════════════════════════════════════════════════════╣')
    console.log('║  Available endpoints:                                  ║')
    console.log(`║  GET  /api/health     - Health check                   ║`)
    console.log(`║  GET  /api/people     - Get all people                 ║`)
    console.log(`║  POST /api/people     - Save all people                ║`)
    console.log(`║  GET  /api/timeline   - Get all timeline nodes         ║`)
    console.log(`║  POST /api/timeline   - Save all timeline nodes        ║`)
    console.log(`║  POST /api/backup     - Create backup                  ║`)
    console.log('╚════════════════════════════════════════════════════════╝')
    console.log('')
  })
}

startServer().catch(console.error)

// 优雅关闭
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing pool...')
  await pool.end()
  process.exit(0)
})

process.on('SIGINT', async () => {
  console.log('SIGINT received, closing pool...')
  await pool.end()
  process.exit(0)
})
