import { Router } from 'express'
import { db } from '../db.js'

export const habitsRouter = Router()

interface Habit {
  id: number
  name: string
  notes: string | null
  created_at: string
}

const listStmt = db.prepare<[], Habit>('SELECT * FROM habits ORDER BY created_at ASC, id ASC')
const getStmt = db.prepare<[number], Habit>('SELECT * FROM habits WHERE id = ?')
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
  res.json(listStmt.all())
})

habitsRouter.post('/', (req, res) => {
  const name = normalizeName(req.body?.name)
  if (!name) {
    res.status(400).json({ error: 'name is required' })
    return
  }
  const notes = typeof req.body?.notes === 'string' ? req.body.notes : null
  const { lastInsertRowid } = insertStmt.run(name, notes)
  res.status(201).json(getStmt.get(lastInsertRowid as number))
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
  res.json(getStmt.get(id))
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
