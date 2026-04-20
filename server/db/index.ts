import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema.js'
import { existsSync, mkdirSync } from 'fs'

const DB_PATH = process.env.DATABASE_PATH ?? './data/naukroom.db'
const DB_DIR = DB_PATH.substring(0, DB_PATH.lastIndexOf('/'))

if (DB_DIR && !existsSync(DB_DIR)) mkdirSync(DB_DIR, { recursive: true })

const sqlite = new Database(DB_PATH)
sqlite.pragma('journal_mode = WAL')
sqlite.pragma('foreign_keys = ON')

// Auto-create tables on first run
sqlite.exec(`
  CREATE TABLE IF NOT EXISTS analytics_events (
    id TEXT PRIMARY KEY,
    user_id TEXT,
    event TEXT NOT NULL,
    properties TEXT,
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    name TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    onboarding_status TEXT NOT NULL DEFAULT 'not_started',
    created_at INTEGER NOT NULL
  );

  CREATE TABLE IF NOT EXISTS business_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    name TEXT,
    profession TEXT,
    specialization TEXT,
    country TEXT,
    language TEXT,
    work_format TEXT,
    client_type TEXT,
    client_gender_age TEXT,
    client_pains TEXT,
    client_desired_results TEXT,
    current_services TEXT,
    current_prices TEXT,
    target_services TEXT,
    ideal_clients TEXT,
    avoid_clients TEXT,
    instagram_url TEXT,
    post_screenshots TEXT,
    competitors TEXT,
    goals TEXT,
    primary_goal TEXT,
    current_step INTEGER NOT NULL DEFAULT 1,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS generated_outputs (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    type TEXT NOT NULL,
    content TEXT NOT NULL,
    qa_score TEXT,
    status TEXT NOT NULL DEFAULT 'pending',
    admin_notes TEXT,
    approved_by TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER
  );

  CREATE TABLE IF NOT EXISTS lite_submissions (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    data TEXT NOT NULL,
    created_at INTEGER NOT NULL
  );
`)

// Migrate existing databases: add qa_score if missing
const existingCols = sqlite.prepare('PRAGMA table_info(generated_outputs)').all() as { name: string }[]
if (!existingCols.some(c => c.name === 'qa_score')) {
  sqlite.exec('ALTER TABLE generated_outputs ADD COLUMN qa_score TEXT')
}

export const db = drizzle(sqlite, { schema })
