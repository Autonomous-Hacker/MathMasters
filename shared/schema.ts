import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const students = pgTable("students", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  grade: integer("grade").notNull(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const gameSessions = pgTable("game_sessions", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  studentId: integer("student_id").references(() => students.id),
  grade: integer("grade").notNull(),
  startTime: timestamp("start_time").defaultNow(),
  endTime: timestamp("end_time"),
  totalQuestions: integer("total_questions").default(0),
  correctAnswers: integer("correct_answers").default(0),
  finalScore: integer("final_score").default(0),
});

export const studentAnswers = pgTable("student_answers", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull(),
  questionId: text("question_id").notNull(),
  question: text("question").notNull(),
  userAnswer: integer("user_answer").notNull(),
  correctAnswer: integer("correct_answer").notNull(),
  isCorrect: boolean("is_correct").notNull(),
  operation: text("operation").notNull(), // addition, subtraction, multiplication, division
  difficulty: integer("difficulty").default(1),
  timeSpent: decimal("time_spent").default("0"), // in seconds
  timestamp: timestamp("timestamp").defaultNow(),
});

export const leaderboard = pgTable("leaderboard", {
  id: serial("id").primaryKey(),
  studentId: integer("student_id").references(() => students.id),
  sessionId: text("session_id").notNull(),
  score: integer("score").notNull(),
  grade: integer("grade").notNull(),
  streak: integer("streak").default(0),
  achievedAt: timestamp("achieved_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertStudentSchema = createInsertSchema(students).pick({
  name: true,
  grade: true,
  userId: true,
});

export const insertGameSessionSchema = createInsertSchema(gameSessions).pick({
  sessionId: true,
  studentId: true,
  grade: true,
});

export const insertStudentAnswerSchema = createInsertSchema(studentAnswers).pick({
  sessionId: true,
  questionId: true,
  question: true,
  userAnswer: true,
  correctAnswer: true,
  isCorrect: true,
  operation: true,
  difficulty: true,
  timeSpent: true,
});

export const insertLeaderboardSchema = createInsertSchema(leaderboard).pick({
  studentId: true,
  sessionId: true,
  score: true,
  grade: true,
  streak: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type Student = typeof students.$inferSelect;
export type GameSession = typeof gameSessions.$inferSelect;
export type StudentAnswer = typeof studentAnswers.$inferSelect;
export type LeaderboardEntry = typeof leaderboard.$inferSelect;
