import express from 'express'
import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import cors from 'cors'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

const DATA_DIR = path.join(__dirname, 'public', 'data')
const PEOPLE_FILE = path.join(DATA_DIR, 'people.json')
const TIMELINE_FILE = path.join(DATA_DIR, 'timeline.json')

// 读取人物数据
app.get('/api/people', async (req, res) => {
  try {
    const data = await fs.readFile(PEOPLE_FILE, 'utf8')
    res.json(JSON.parse(data))
  } catch (error) {
    res.status(500).json({ error: 'Failed to read people data' })
  }
})

// 保存人物数据
app.post('/api/people', async (req, res) => {
  try {
    const { people } = req.body
    await fs.writeFile(PEOPLE_FILE, JSON.stringify({ people }, null, 2))
    res.json({ success: true, message: 'People data saved successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save people data' })
  }
})

// 读取时间轴数据
app.get('/api/timeline', async (req, res) => {
  try {
    const data = await fs.readFile(TIMELINE_FILE, 'utf8')
    res.json(JSON.parse(data))
  } catch (error) {
    res.status(500).json({ error: 'Failed to read timeline data' })
  }
})

// 保存时间轴数据
app.post('/api/timeline', async (req, res) => {
  try {
    const { nodes } = req.body
    await fs.writeFile(TIMELINE_FILE, JSON.stringify({ nodes }, null, 2))
    res.json({ success: true, message: 'Timeline data saved successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save timeline data' })
  }
})

// 备份数据
app.post('/api/backup', async (req, res) => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
    const backupDir = path.join(__dirname, 'backups')

    await fs.mkdir(backupDir, { recursive: true })

    const peopleData = await fs.readFile(PEOPLE_FILE, 'utf8')
    const timelineData = await fs.readFile(TIMELINE_FILE, 'utf8')

    await fs.writeFile(
      path.join(backupDir, `people-${timestamp}.json`),
      peopleData
    )
    await fs.writeFile(
      path.join(backupDir, `timeline-${timestamp}.json`),
      timelineData
    )

    res.json({ success: true, message: 'Backup created successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to create backup' })
  }
})

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`)
  console.log(`📁 Data directory: ${DATA_DIR}`)
  console.log('')
  console.log('Available endpoints:')
  console.log(`  GET  http://localhost:${PORT}/api/people`)
  console.log(`  POST http://localhost:${PORT}/api/people`)
  console.log(`  GET  http://localhost:${PORT}/api/timeline`)
  console.log(`  POST http://localhost:${PORT}/api/timeline`)
  console.log(`  POST http://localhost:${PORT}/api/backup`)
})
