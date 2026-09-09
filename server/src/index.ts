import express from 'express'
import { db } from './db.js'
import { habitsRouter } from './routes/habits.js'
import { checkInsRouter } from './routes/check-ins.js'

const app = express()
app.use(express.json())

app.get('/api/health', (_req, res) => {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM habits').get() as { count: number }
  res.json({ status: 'ok', habits: count })
})

app.use('/api/habits', habitsRouter)
app.use('/api/habits/:habitId/check-in', checkInsRouter)

const port = process.env.PORT ?? 3001
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`)
})
