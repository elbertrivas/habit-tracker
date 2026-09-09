export interface Habit {
  id: number
  name: string
  notes: string | null
  created_at: string
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    throw new Error(body.error ?? `Request failed: ${res.status}`)
  }
  return res.status === 204 ? (undefined as T) : res.json()
}

export const getHabits = () => request<Habit[]>('/api/habits')

export const createHabit = (input: { name: string; notes?: string }) =>
  request<Habit>('/api/habits', { method: 'POST', body: JSON.stringify(input) })

export const updateHabit = (id: number, input: { name: string; notes?: string }) =>
  request<Habit>(`/api/habits/${id}`, { method: 'PUT', body: JSON.stringify(input) })

export const deleteHabit = (id: number) =>
  request<void>(`/api/habits/${id}`, { method: 'DELETE' })
