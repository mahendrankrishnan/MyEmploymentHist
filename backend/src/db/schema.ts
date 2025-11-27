import { pgTable, serial, varchar, text, date, boolean, timestamp } from 'drizzle-orm/pg-core';

export const employmentHistory = pgTable('employment_history', {
  id: serial('id').primaryKey(),
  employer: varchar('employer', { length: 255 }).notNull(),
  from: date('from').notNull(),
  to: date('to'),
  desc: text('desc'),
  client: varchar('client', { length: 255 }),
  position: varchar('position', { length: 255 }).notNull(),
  till: boolean('till').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export type EmploymentHistory = typeof employmentHistory.$inferSelect;
export type NewEmploymentHistory = typeof employmentHistory.$inferInsert;

