import { storage } from "../storage";

export interface StudentAnswer {
  sessionId: string;
  questionId: string;
  question: string;
  userAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  grade: number;
  timeSpent: number;
  timestamp: string;
}

export interface StudentStats {
  id: string;
  name: string;
  grade: number;
  totalQuestions: number;
  correctAnswers: number;
  currentStreak: number;
  bestStreak: number;
  averageTime: number;
  weakAreas: string[];
  recentActivity: Array<{
    question: string;
    answer: number;
    correct: boolean;
    timeSpent: number;
    timestamp: string;
  }>;
  progressOverTime: Array<{
    date: string;
    score: number;
    accuracy: number;
  }>;
}

export interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  grade: number;
  streak: number;
}

// In-memory storage for demo purposes
// In production, this would use a proper database
const studentAnswers: Map<string, StudentAnswer[]> = new Map();
const studentSessions: Map<string, { grade: number; startTime: string }> = new Map();

export async function saveStudentProgress(answer: StudentAnswer): Promise<void> {
  // Store the answer
  const sessionAnswers = studentAnswers.get(answer.sessionId) || [];
  sessionAnswers.push(answer);
  studentAnswers.set(answer.sessionId, sessionAnswers);

  // Store session info
  if (!studentSessions.has(answer.sessionId)) {
    studentSessions.set(answer.sessionId, {
      grade: answer.grade,
      startTime: answer.timestamp
    });
  }

  console.log(`Saved answer for session ${answer.sessionId}: ${answer.question} = ${answer.userAnswer} (${answer.isCorrect ? 'correct' : 'incorrect'})`);
}

export async function getStudentStats(): Promise<StudentStats[]> {
  const stats: StudentStats[] = [];
  
  for (const [sessionId, answers] of studentAnswers.entries()) {
    const sessionInfo = studentSessions.get(sessionId);
    if (!sessionInfo) continue;

    const totalQuestions = answers.length;
    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const averageTime = answers.reduce((sum, a) => sum + a.timeSpent, 0) / totalQuestions;

    // Calculate current streak
    let currentStreak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Calculate best streak
    let bestStreak = 0;
    let tempStreak = 0;
    for (const answer of answers) {
      if (answer.isCorrect) {
        tempStreak++;
        bestStreak = Math.max(bestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    // Identify weak areas
    const operationStats: { [key: string]: { total: number; correct: number } } = {};
    answers.forEach(answer => {
      // Extract operation from question (simple heuristic)
      let operation = "addition";
      if (answer.question.includes("×") || answer.question.includes("times")) operation = "multiplication";
      else if (answer.question.includes("÷") || answer.question.includes("divide")) operation = "division";
      else if (answer.question.includes("-") || answer.question.includes("minus")) operation = "subtraction";

      if (!operationStats[operation]) {
        operationStats[operation] = { total: 0, correct: 0 };
      }
      operationStats[operation].total++;
      if (answer.isCorrect) {
        operationStats[operation].correct++;
      }
    });

    const weakAreas: string[] = [];
    Object.entries(operationStats).forEach(([operation, stat]) => {
      const accuracy = stat.correct / stat.total;
      if (accuracy < 0.7 && stat.total >= 3) {
        weakAreas.push(operation);
      }
    });

    // Recent activity
    const recentActivity = answers.slice(-10).map(answer => ({
      question: answer.question,
      answer: answer.userAnswer,
      correct: answer.isCorrect,
      timeSpent: answer.timeSpent,
      timestamp: answer.timestamp
    }));

    // Progress over time (group by date)
    const progressByDate: { [date: string]: { correct: number; total: number; score: number } } = {};
    answers.forEach((answer, index) => {
      const date = answer.timestamp.split('T')[0];
      if (!progressByDate[date]) {
        progressByDate[date] = { correct: 0, total: 0, score: 0 };
      }
      progressByDate[date].total++;
      if (answer.isCorrect) {
        progressByDate[date].correct++;
        progressByDate[date].score += 10; // Simple scoring
      }
    });

    const progressOverTime = Object.entries(progressByDate).map(([date, data]) => ({
      date,
      score: data.score,
      accuracy: Math.round((data.correct / data.total) * 100)
    }));

    stats.push({
      id: sessionId,
      name: `Student ${sessionId.slice(-4)}`, // Generate a simple name
      grade: sessionInfo.grade,
      totalQuestions,
      correctAnswers,
      currentStreak,
      bestStreak,
      averageTime: Math.round(averageTime * 10) / 10,
      weakAreas,
      recentActivity,
      progressOverTime
    });
  }

  return stats.sort((a, b) => b.correctAnswers - a.correctAnswers);
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  const leaderboard: LeaderboardEntry[] = [];
  
  for (const [sessionId, answers] of studentAnswers.entries()) {
    const sessionInfo = studentSessions.get(sessionId);
    if (!sessionInfo) continue;

    const correctAnswers = answers.filter(a => a.isCorrect).length;
    const score = correctAnswers * 10; // Simple scoring

    // Calculate current streak
    let currentStreak = 0;
    for (let i = answers.length - 1; i >= 0; i--) {
      if (answers[i].isCorrect) {
        currentStreak++;
      } else {
        break;
      }
    }

    leaderboard.push({
      id: sessionId,
      name: `Player ${sessionId.slice(-4)}`,
      score,
      grade: sessionInfo.grade,
      streak: currentStreak
    });
  }

  return leaderboard.sort((a, b) => b.score - a.score);
}
