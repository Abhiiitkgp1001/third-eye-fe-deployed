import { sql } from "drizzle-orm";
import { bigint, boolean, integer, jsonb, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Shared defaults
const uuid  = () => text().default(sql`gen_random_uuid()`);
const dates = {
  createdAt: timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updatedAt", { withTimezone: true }).defaultNow().notNull(),
};
const ordinal = bigint("ordinal", { mode: "number" }).generatedAlwaysAsIdentity().notNull();

// ── enums ──────────────────────────────────────────────────────────────────
// syncStatus: lifecycle of a list's build/sync pipeline.
// DRAFT → not yet submitted, BUILDING → actively being populated,
// NORMAL → healthy and running, FAILED → last sync encountered an error.
export const syncStatusEnum = pgEnum("syncStatus", ["DRAFT", "BUILDING", "NORMAL", "FAILED"]);

// cadence: how often the list's signal jobs are scheduled to run.
export const cadenceEnum = pgEnum("cadence", ["MANUAL", "DAILY", "WEEKLY", "MONTHLY"]);

// ── organizations ──────────────────────────────────────────────────────────
export const organizations = pgTable("organizations", {
  id:        uuid().primaryKey(),
  ...dates,
  name:      text("name").notNull(),
  domain:    text("domain").unique(),
  ordinal,
});

export type Organization       = typeof organizations.$inferSelect;
export type InsertOrganization = typeof organizations.$inferInsert;

// ── peopleLists ────────────────────────────────────────────────────────────
// Container for a tracked set of profiles. 1 list → many profiles.
export const peopleLists = pgTable("peopleLists", {
  id:               uuid().primaryKey(),
  orgId:            text("orgId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:             text("name").notNull(),
  // Capacity bounds — optional soft limits on how many profiles this list should hold.
  min:              integer("min"),
  max:              integer("max"),
  // enabled: true means the list is live; signal jobs run on it and usage is billable.
  enabled:          boolean("enabled").default(false).notNull(),
  // syncStatus: tracks where this list is in its build/sync pipeline.
  syncStatus:       syncStatusEnum("syncStatus").default("DRAFT").notNull(),
  // allowedMovements: which movement types (from movementsProfileList.movement) are
  // processed for this list. Null = all movements allowed.
  allowedMovements: text("allowedMovements").array(),
  // prompt: optional natural-language description of what this list is tracking.
  prompt:           text("prompt"),
  // cadence + nextRunAt: scheduling config — how often to re-run, and when next.
  cadence:          cadenceEnum("cadence").default("MANUAL").notNull(),
  nextRunAt:        timestamp("nextRunAt", { withTimezone: true }),
  lastRunAt:        timestamp("lastRunAt", { withTimezone: true }),
  ...dates,
  ordinal,
});

export type PeopleList       = typeof peopleLists.$inferSelect;
export type InsertPeopleList = typeof peopleLists.$inferInsert;

// ── companyLists ───────────────────────────────────────────────────────────
// Container for a tracked set of companies. 1 list → many companies.
export const companyLists = pgTable("companyLists", {
  id:               uuid().primaryKey(),
  orgId:            text("orgId").notNull().references(() => organizations.id, { onDelete: "cascade" }),
  name:             text("name").notNull(),
  // Capacity bounds — optional soft limits on how many companies this list should hold.
  min:              integer("min"),
  max:              integer("max"),
  // enabled: true means the list is live; signal jobs run on it and usage is billable.
  enabled:          boolean("enabled").default(false).notNull(),
  // syncStatus: tracks where this list is in its build/sync pipeline.
  syncStatus:       syncStatusEnum("syncStatus").default("DRAFT").notNull(),
  // allowedMovements: which movement types (from movementsCompanyList.movement) are
  // processed for this list. Null = all movements allowed.
  allowedMovements: text("allowedMovements").array(),
  // prompt: optional natural-language description of what this list is tracking.
  prompt:           text("prompt"),
  // cadence + nextRunAt: scheduling config — how often to re-run, and when next.
  cadence:          cadenceEnum("cadence").default("MANUAL").notNull(),
  nextRunAt:        timestamp("nextRunAt", { withTimezone: true }),
  lastRunAt:        timestamp("lastRunAt", { withTimezone: true }),
  ...dates,
  ordinal,
});

export type CompanyList       = typeof companyLists.$inferSelect;
export type InsertCompanyList = typeof companyLists.$inferInsert;

// ── profiles ───────────────────────────────────────────────────────────────
// A tracked LinkedIn profile belonging to a people list.
// movements: 1 profile → many MovementsProfileList rows.
export const profiles = pgTable("profiles", {
  id:             uuid().primaryKey(),
  peopleListId:   text("peopleListId").notNull().references(() => peopleLists.id, { onDelete: "no action" }),
  linkedinUrl:    text("linkedinUrl").notNull(),
  latestMetadata: jsonb("latestMetadata"),
  ...dates,
  ordinal,
});

export type Profile       = typeof profiles.$inferSelect;
export type InsertProfile = typeof profiles.$inferInsert;

// ── companies ──────────────────────────────────────────────────────────────
// A tracked LinkedIn company belonging to a company list.
// movements: 1 company → many MovementsCompanyList rows.
export const companies = pgTable("companies", {
  id:             uuid().primaryKey(),
  companyListId:  text("companyListId").notNull().references(() => companyLists.id, { onDelete: "no action" }),
  linkedinUrl:    text("linkedinUrl").notNull(),
  latestMetadata: jsonb("latestMetadata"),
  ...dates,
  ordinal,
});

export type Company       = typeof companies.$inferSelect;
export type InsertCompany = typeof companies.$inferInsert;

// ── movementsProfileList ───────────────────────────────────────────────────
// One movement event for a tracked profile (job change, title change, etc.).
export const movementsProfileList = pgTable("movementsProfileList", {
  id:          uuid().primaryKey(),
  profileId:   text("profileId").notNull().references(() => profiles.id, { onDelete: "no action" }),
  linkedinUrl: text("linkedinUrl").notNull(),
  movement:    text("movement").notNull(),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type MovementsProfileList       = typeof movementsProfileList.$inferSelect;
export type InsertMovementsProfileList = typeof movementsProfileList.$inferInsert;

// ── movementsCompanyList ───────────────────────────────────────────────────
// One movement event for a tracked company (headcount change, exec hire, etc.).
export const movementsCompanyList = pgTable("movementsCompanyList", {
  id:          uuid().primaryKey(),
  companyId:   text("companyId").notNull().references(() => companies.id, { onDelete: "no action" }),
  linkedinUrl: text("linkedinUrl").notNull(),
  movement:    text("movement").notNull(),
  metadata:    jsonb("metadata"),
  createdAt:   timestamp("createdAt", { withTimezone: true }).defaultNow().notNull(),
});

export type MovementsCompanyList       = typeof movementsCompanyList.$inferSelect;
export type InsertMovementsCompanyList = typeof movementsCompanyList.$inferInsert;
