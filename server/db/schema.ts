import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core'

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(),
  name: text('name'),
  role: text('role', { enum: ['user', 'admin'] }).default('user').notNull(),
  onboardingStatus: text('onboarding_status', {
    enum: ['not_started', 'in_progress', 'completed'],
  }).default('not_started').notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const businessProfiles = sqliteTable('business_profiles', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),

  // Step 1 — Identity
  name: text('name'),
  profession: text('profession'),
  specialization: text('specialization'),
  country: text('country'),
  language: text('language'),
  workFormat: text('work_format', { enum: ['online', 'offline', 'mixed'] }),

  // Step 2 — Target audience
  clientType: text('client_type'),
  clientGenderAge: text('client_gender_age'),
  clientPains: text('client_pains'),       // JSON array
  clientDesiredResults: text('client_desired_results'),

  // Step 3 — Current services
  currentServices: text('current_services'), // JSON array
  currentPrices: text('current_prices'),

  // Step 4 — Target services
  targetServices: text('target_services'),   // JSON array

  // Step 5 — Work preferences
  idealClients: text('ideal_clients'),
  avoidClients: text('avoid_clients'),

  // Step 6 — Instagram
  instagramUrl: text('instagram_url'),

  // Step 7 — Posts (stored as filenames)
  postScreenshots: text('post_screenshots'),  // JSON array of paths

  // Step 8 — Competitors
  competitors: text('competitors'),           // JSON array

  // Step 9 — Goals
  goals: text('goals'),                       // JSON array
  primaryGoal: text('primary_goal'),

  currentStep: integer('current_step').default(1).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})

export const analyticsEvents = sqliteTable('analytics_events', {
  id: text('id').primaryKey(),
  userId: text('user_id'),
  event: text('event').notNull(),
  properties: text('properties'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const liteSubmissions = sqliteTable('lite_submissions', {
  id: text('id').primaryKey(),
  type: text('type', { enum: ['waitlist', 'beta', 'demo'] }).notNull(),
  data: text('data').notNull(), // JSON
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
})

export const generatedOutputs = sqliteTable('generated_outputs', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id),
  type: text('type', {
    enum: [
      'positioning_summary',
      'profile_audit',
      'offer',
      'profile_packaging',
      'lead_magnet',
      'funnel',
      'content_pack',
      'marketing_pack',
    ],
  }).notNull(),
  content: text('content').notNull(),         // JSON
  qaScore: text('qa_score'),                  // JSON: QAResult
  status: text('status', { enum: ['pending', 'approved', 'needs_review'] })
    .default('pending').notNull(),
  adminNotes: text('admin_notes'),
  approvedBy: text('approved_by'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }),
})
