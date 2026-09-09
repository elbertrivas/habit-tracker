function daysBetween(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const diffMs = Date.UTC(by, bm - 1, bd) - Date.UTC(ay, am - 1, ad)
  return Math.round(diffMs / 86_400_000)
}

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10)
}

/** sortedDates: unique 'YYYY-MM-DD' strings, ascending. */
export function computeStreaks(sortedDates: string[]): { current: number; best: number } {
  if (sortedDates.length === 0) return { current: 0, best: 0 }

  let best = 1
  let run = 1
  for (let i = 1; i < sortedDates.length; i++) {
    run = daysBetween(sortedDates[i - 1], sortedDates[i]) === 1 ? run + 1 : 1
    best = Math.max(best, run)
  }

  const last = sortedDates[sortedDates.length - 1]
  if (daysBetween(last, todayUTC()) > 1) {
    return { current: 0, best }
  }

  let current = 1
  for (let i = sortedDates.length - 1; i > 0; i--) {
    if (daysBetween(sortedDates[i - 1], sortedDates[i]) === 1) {
      current++
    } else {
      break
    }
  }
  return { current, best }
}
