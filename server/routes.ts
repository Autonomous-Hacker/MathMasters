import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateAIHint } from "./services/aiHints";
import { saveStudentProgress, getStudentStats, getLeaderboard } from "./services/studentProgress";
import { generateQuestion } from "../client/src/lib/mathQuestions";

export async function registerRoutes(app: Express): Promise<Server> {
  // Game API routes
  app.post("/api/game/question", async (req, res) => {
    try {
      const { grade, level } = req.body;
      
      if (!grade || grade < 1 || grade > 6) {
        return res.status(400).json({ message: "Invalid grade level" });
      }

      const question = generateQuestion(grade, level || 1);
      res.json(question);
    } catch (error) {
      console.error("Error generating question:", error);
      res.status(500).json({ message: "Failed to generate question" });
    }
  });

  app.post("/api/game/answer", async (req, res) => {
    try {
      const {
        sessionId,
        questionId,
        question,
        userAnswer,
        correctAnswer,
        isCorrect,
        grade,
        timeSpent
      } = req.body;

      // Save the answer to storage
      await saveStudentProgress({
        sessionId,
        questionId,
        question,
        userAnswer,
        correctAnswer,
        isCorrect,
        grade,
        timeSpent: timeSpent || 0,
        timestamp: new Date().toISOString()
      });

      res.json({ success: true, correct: isCorrect });
    } catch (error) {
      console.error("Error saving answer:", error);
      res.status(500).json({ message: "Failed to save answer" });
    }
  });

  app.post("/api/game/hint", async (req, res) => {
    try {
      const { question, operation, grade } = req.body;
      
      if (!question) {
        return res.status(400).json({ message: "Question is required" });
      }

      // Try to get AI-generated hint
      let hint = "Try breaking the problem into smaller parts!";
      try {
        hint = await generateAIHint(question, operation, grade);
      } catch (aiError) {
        console.error("AI hint generation failed:", aiError);
        // Fall back to generic hints based on operation
        switch (operation) {
          case "addition":
            hint = "Try counting up from the larger number!";
            break;
          case "subtraction":
            hint = "Think about what you need to take away!";
            break;
          case "multiplication":
            hint = "Remember your times tables, or try adding the number to itself!";
            break;
          case "division":
            hint = "How many times does the smaller number fit into the larger one?";
            break;
          default:
            hint = "Break the problem down step by step!";
        }
      }

      res.json({ hint });
    } catch (error) {
      console.error("Error generating hint:", error);
      res.status(500).json({ message: "Failed to generate hint" });
    }
  });

  // Leaderboard API
  app.get("/api/leaderboard", async (req, res) => {
    try {
      const leaderboard = await getLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      console.error("Error fetching leaderboard:", error);
      res.json([]); // Return empty array instead of error
    }
  });

  // Teacher Dashboard API
  app.get("/api/teacher/students", async (req, res) => {
    try {
      const students = await getStudentStats();
      res.json(students);
    } catch (error) {
      console.error("Error fetching student stats:", error);
      res.json([]); // Return empty array instead of error
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}
