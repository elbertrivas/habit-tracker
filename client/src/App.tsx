import { useEffect, useState } from 'react'
import './App.css'
import {
  checkIn,
  createHabit,
  deleteHabit,
  getHabits,
  undoCheckIn,
  updateHabit,
  type Habit,
} from './api'

function App() {
  const [habits, setHabits] = useState<Habit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newName, setNewName] = useState('')
  const [newNotes, setNewNotes] = useState('')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editNotes, setEditNotes] = useState('')

  useEffect(() => {
    getHabits()
      .then(setHabits)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      const habit = await createHabit({ name: newName, notes: newNotes || undefined })
      setHabits((prev) => [...prev, habit])
      setNewName('')
      setNewNotes('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add habit')
    }
  }

  function startEdit(habit: Habit) {
    setEditingId(habit.id)
    setEditName(habit.name)
    setEditNotes(habit.notes ?? '')
  }

  async function handleSaveEdit(id: number) {
    setError(null)
    try {
      const updated = await updateHabit(id, { name: editName, notes: editNotes || undefined })
      setHabits((prev) => prev.map((h) => (h.id === id ? updated : h)))
      setEditingId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update habit')
    }
  }

  async function handleToggleCheckIn(habit: Habit) {
    setError(null)
    try {
      if (habit.checked_in_today) {
        await undoCheckIn(habit.id)
      } else {
        await checkIn(habit.id)
      }
      // Re-fetch rather than flip locally: current/best streak are server-computed
      // and depend on more than just this habit's checked_in_today flag.
      setHabits(await getHabits())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update check-in')
    }
  }

  async function handleDelete(id: number) {
    setError(null)
    try {
      await deleteHabit(id)
      setHabits((prev) => prev.filter((h) => h.id !== id))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete habit')
    }
  }

  const pendingHabits = habits.filter((h) => !h.checked_in_today)

  return (
    <main>
      <h1>Habit Tracker</h1>

      {!loading && pendingHabits.length > 0 && (
        <div className="reminder">
          Still to do today: {pendingHabits.map((h) => h.name).join(', ')}
        </div>
      )}

      <form onSubmit={handleAdd} className="add-form">
        <input
          type="text"
          placeholder="Habit name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          required
        />
        <input
          type="text"
          placeholder="Notes (optional)"
          value={newNotes}
          onChange={(e) => setNewNotes(e.target.value)}
        />
        <button type="submit">Add habit</button>
      </form>

      {error && <p className="error">{error}</p>}

      {loading ? (
        <p>Loading...</p>
      ) : habits.length === 0 ? (
        <p>No habits yet — add one above.</p>
      ) : (
        <ul className="habit-list">
          {habits.map((habit) =>
            editingId === habit.id ? (
              <li key={habit.id} className="habit-row">
                <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input value={editNotes} onChange={(e) => setEditNotes(e.target.value)} />
                <button type="button" onClick={() => handleSaveEdit(habit.id)}>
                  Save
                </button>
                <button type="button" onClick={() => setEditingId(null)}>
                  Cancel
                </button>
              </li>
            ) : (
              <li key={habit.id} className={habit.checked_in_today ? 'habit-row checked' : 'habit-row'}>
                <div>
                  <strong>{habit.name}</strong>
                  {habit.notes && <span className="notes"> — {habit.notes}</span>}
                  <div className="streaks">
                    🔥 {habit.current_streak} day{habit.current_streak === 1 ? '' : 's'}
                    <span className="best"> · best {habit.best_streak}</span>
                  </div>
                </div>
                <button type="button" onClick={() => handleToggleCheckIn(habit)}>
                  {habit.checked_in_today ? 'Done today ✓' : 'Mark done'}
                </button>
                <button type="button" onClick={() => startEdit(habit)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(habit.id)}>
                  Delete
                </button>
              </li>
            ),
          )}
        </ul>
      )}
    </main>
  )
}

export default App
