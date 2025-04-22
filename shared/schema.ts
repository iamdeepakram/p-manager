import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Project schema - simplified
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  projectManager: text("project_manager").notNull(),
  isFavorite: boolean("is_favorite").notNull().default(false),
});

// Insert schema
export const insertProjectSchema = createInsertSchema(projects)
  .omit({ id: true })
  .extend({
    startDate: z.string().or(z.date()),
    endDate: z.string().or(z.date()),
  });

// Types
export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;