import { Router, type Request, type Response } from 'express'
import { db } from '../db.js'

export const checkInsRouter = Router({ mergeParams: true })

type Params = { habitId: string }

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

const habitExistsStmt = db.prepare<[number]>('SELECT id FROM habits WHERE id = ?')
const insertStmt = db.prepare<[number, string]>(
  'INSERT OR IGNORE INTO check_ins (habit_id, date) VALUES (?, ?)',
)
const deleteStmt = db.prepare<[number, string]>(
  'DELETE FROM check_ins WHERE habit_id = ? AND date = ?',
)

checkInsRouter.post('/', (req: Request<Params>, res: Response) => {
  const habitId = Number(req.params.habitId)
  if (!habitExistsStmt.get(habitId)) {
    res.status(404).json({ error: 'habit not found' })
    return
  }
  const date = today()
  insertStmt.run(habitId, date)
  res.status(201).json({ habit_id: habitId, date, checked_in: true })
})

checkInsRouter.delete('/', (req: Request<Params>, res: Response) => {
  const habitId = Number(req.params.habitId)
  if (!habitExistsStmt.get(habitId)) {
    res.status(404).json({ error: 'habit not found' })
    return
  }
  const date = today()
  deleteStmt.run(habitId, date)
  res.json({ habit_id: habitId, date, checked_in: false })
})
