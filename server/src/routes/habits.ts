import { Router } from 'express'
import { db } from '../db.js'
import { computeStreaks } from '../streak.js'

export const habitsRouter = Router()

interface HabitRow {
  id: number
  name: string
  notes: string | null
  created_at: string
  checked_in_today: number
  check_in_dates: string | null
}

interface Habit {
  id: number
  name: string
  notes: string | null
  created_at: string
  checked_in_today: boolean
  current_streak: number
  best_streak: number
}

function mapHabit(row: HabitRow): Habit {
  const dates = row.check_in_dates ? row.check_in_dates.split(',') : []
  const { current, best } = computeStreaks(dates)
  return {
    id: row.id,
    name: row.name,
    notes: row.notes,
    created_at: row.created_at,
    checked_in_today: Boolean(row.checked_in_today),
    current_streak: current,
    best_streak: best,
  }
}

const SELECT_WITH_STATUS = `
  SELECT h.*,
    EXISTS(
      SELECT 1 FROM check_ins c WHERE c.habit_id = h.id AND c.date = date('now')
    ) AS checked_in_today,
    (
      SELECT GROUP_CONCAT(date) FROM (
        SELECT date FROM check_ins WHERE habit_id = h.id ORDER BY date
      )
    ) AS check_in_dates
  FROM habits h
`

const listStmt = db.prepare<[], HabitRow>(`${SELECT_WITH_STATUS} ORDER BY h.created_at ASC, h.id ASC`)
const getStmt = db.prepare<[number], HabitRow>(`${SELECT_WITH_STATUS} WHERE h.id = ?`)
const insertStmt = db.prepare<[string, string | null]>('INSERT INTO habits (name, notes) VALUES (?, ?)')
const updateStmt = db.prepare<[string, string | null, number]>(
  'UPDATE habits SET name = ?, notes = ? WHERE id = ?',
)
const deleteStmt = db.prepare<[number]>('DELETE FROM habits WHERE id = ?')

function normalizeName(input: unknown): string | null {
  if (typeof input !== 'string') return null
  const name = input.trim()
  return name.length > 0 ? name : null
}

habitsRouter.get('/', (_req, res) => {
  res.json(listStmt.all().map(mapHabit))
})

habitsRouter.post('/', (req, res) => {
  const name = normalizeName(req.body?.name)
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const notes = typeof req.body?.notes === 'string' ? req.body.notes : null
  const { lastInsertRowid } = insertStmt.run(name, notes)
  res.status(201).json(mapHabit(getStmt.get(lastInsertRowid as number)!))
})

habitsRouter.put('/:id', (req, res) => {
  const id = Number(req.params.id)
  const existing = getStmt.get(id)
  if (!existing) {
    res.status(404).json({ error: 'habit not found' })
    return
  }
  const name = normalizeName(req.body?.name)
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const notes = typeof req.body?.notes === 'string' ? req.body.notes : null
  updateStmt.run(name, notes, id)
  res.json(mapHabit(getStmt.get(id)!))
})

habitsRouter.delete('/:id', (req, res) => {
  const id = Number(req.params.id)
  const { changes } = deleteStmt.run(id)
  if (changes === 0) {
    res.status(404).json({ error: 'habit not found' })
    return
  }
  res.status(204).end()
})
