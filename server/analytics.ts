import { randomUUID } from 'crypto'
import { db } from './db/index.js'
import { analyticsEvents } from './db/schema.js'

export function track(event: string, userId?: string, properties?: Record<string, unknown>) {
  try {
    db.insert(analyticsEvents).values({
      id: randomUUID(),
      userId: userId ?? null,
      event,
      properties: properties ? JSON.stringify(properties) : null,
      createdAt: new Date(),
    }).run()
  } catch {
    // analytics must never throw
  }
}
