import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface MathQuestion {
  id: string;
  question: string;
  answer: number;
  difficulty: number;
  operation: "addition" | "subtraction" | "multiplication" | "division";
  grade: number;
}

export type GameState = "menu" | "playing" | "paused" | "ended";

// Calculate time limit based on question difficulty
function calculateTimeLimit(question: MathQuestion, grade: number, level: number): number {
  let baseTime = 30; // Base time in seconds
  
  // Adjust base time by grade level
  if (grade <= 2) baseTime = 45; // Lower Primary gets more time
  else if (grade <= 4) baseTime = 35; // Upper Primary
  else baseTime = 25; // Form levels get less time
  
  // Adjust by operation complexity
  switch (question.operation) {
    case "addition":
      baseTime *= 1.0;
      break;
    case "subtraction":
      baseTime *= 1.1;
      break;
    case "multiplication":
      baseTime *= 1.3;
      break;
    case "division":
      baseTime *= 1.5;
      break;
  }
  
  // Adjust by difficulty level
  baseTime *= (1 + (level - 1) * 0.1);
  
  // Adjust by number size (rough estimation)
  const numbers = question.question.match(/\d+/g);
  if (numbers) {
    const maxNumber = Math.max(...numbers.map(n => parseInt(n)));
    if (maxNumber > 100) baseTime *= 1.2;
    if (maxNumber > 500) baseTime *= 1.3;
    if (maxNumber > 1000) baseTime *= 1.4;
  }
  
  return Math.round(Math.max(15, Math.min(120, baseTime))); // Min 15s, Max 2 minutes
}

interface MathGameState {
  gameState: GameState;
  selectedGrade: number;
  currentQuestion: MathQuestion | null;
  score: number;
  streak: number;
  level: number;
  progress: number;
  totalQuestions: number;
  correctAnswers: number;
  sessionId: string;
  isLoading: boolean;
  timeRemaining: number;
  timeLimit: number;
  questionStartTime: number;
  
  // Actions
  setGrade: (grade: number) => void;
  startGame: () => void;
  pauseGame: () => void;
  resumeGame: () => void;
  endGame: () => void;
  submitAnswer: (answer: number) => Promise<boolean>;
  getHint: (question: MathQuestion) => Promise<string>;
  generateNewQuestion: () => Promise<void>;
  updateTimer: () => void;
  handleTimeUp: () => void;
}

export const useMathGame = create<MathGameState>()(
  subscribeWithSelector((set, get) => ({
    gameState: "menu",
    selectedGrade: 1,
    currentQuestion: null,
    score: 0,
    streak: 0,
    level: 1,
    progress: 0,
    totalQuestions: 0,
    correctAnswers: 0,
    sessionId: "",
    isLoading: false,
    timeRemaining: 0,
    timeLimit: 0,
    questionStartTime: 0,

    setGrade: (grade) => set({ selectedGrade: grade }),

    startGame: async () => {
      set({ isLoading: true });
      try {
        // Generate session ID
        const sessionId = Date.now().toString();
        
        set({
          gameState: "playing",
          score: 0,
          streak: 0,
          level: 1,
          progress: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          sessionId,
          currentQuestion: null
        });

        // Generate first question
        await get().generateNewQuestion();
      } catch (error) {
        console.error("Failed to start game:", error);
      } finally {
        set({ isLoading: false });
      }
    },

    pauseGame: () => set({ gameState: "paused" }),
    resumeGame: () => set({ gameState: "playing" }),
    endGame: () => set({ gameState: "ended" }),

    updateTimer: () => {
      const { gameState, questionStartTime, timeLimit, timeRemaining: prevTimeRemaining } = get();
      if (gameState !== "playing" || questionStartTime === 0) return;
      
      const now = Date.now();
      const elapsed = (now - questionStartTime) / 1000;
      const remaining = Math.max(0, timeLimit - elapsed);
      
      set({ timeRemaining: remaining });
      
      // Trigger visual warnings
      if (remaining <= 10 && prevTimeRemaining > 10) {
        // Import game engine functions dynamically to avoid circular dependencies
        import("../gameEngine").then(({ triggerTimeWarning }) => {
          triggerTimeWarning();
        });
      }
      
      if (remaining === 0) {
        get().handleTimeUp();
      }
    },

    handleTimeUp: async () => {
      const { currentQuestion } = get();
      if (!currentQuestion) return;
      
      // Trigger time up visual effect
      import("../gameEngine").then(({ triggerTimeUp }) => {
        triggerTimeUp();
      });
      
      // Submit as incorrect answer when time runs out
      await get().submitAnswer(-1); // Use -1 to indicate timeout
    },

    submitAnswer: async (answer) => {
      const { currentQuestion, score, streak, correctAnswers, totalQuestions, sessionId, selectedGrade, questionStartTime } = get();
      
      if (!currentQuestion) return false;

      set({ isLoading: true });

      try {
        const isCorrect = answer === currentQuestion.answer && answer !== -1; // -1 indicates timeout
        const newCorrectAnswers = isCorrect ? correctAnswers + 1 : correctAnswers;
        const newTotalQuestions = totalQuestions + 1;
        const newStreak = isCorrect ? streak + 1 : 0;
        const newScore = isCorrect ? score + (10 * (streak + 1)) : score;
        const newProgress = Math.min(100, (newCorrectAnswers / newTotalQuestions) * 100);

        // Calculate actual time spent
        const timeSpent = questionStartTime > 0 ? (Date.now() - questionStartTime) / 1000 : 0;

        // Save answer to backend
        await fetch("/api/game/answer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            sessionId,
            questionId: currentQuestion.id,
            question: currentQuestion.question,
            userAnswer: answer === -1 ? 0 : answer, // Convert timeout to 0 for storage
            correctAnswer: currentQuestion.answer,
            isCorrect,
            grade: selectedGrade,
            timeSpent
          })
        });

        set({
          score: newScore,
          streak: newStreak,
          correctAnswers: newCorrectAnswers,
          totalQuestions: newTotalQuestions,
          progress: newProgress,
          level: Math.floor(newScore / 100) + 1
        });

        // Generate next question
        setTimeout(() => {
          get().generateNewQuestion();
        }, 1000);

        return isCorrect;
      } catch (error) {
        console.error("Failed to submit answer:", error);
        return false;
      } finally {
        set({ isLoading: false });
      }
    },

    getHint: async (question) => {
      try {
        const response = await fetch("/api/game/hint", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            question: question.question,
            operation: question.operation,
            grade: question.grade
          })
        });

        if (response.ok) {
          const data = await response.json();
          return data.hint;
        }
        
        return "Try breaking the problem into smaller parts!";
      } catch (error) {
        console.error("Failed to get hint:", error);
        return "Think step by step and try again!";
      }
    },

    generateNewQuestion: async () => {
      const { selectedGrade, level } = get();
      
      try {
        const response = await fetch("/api/game/question", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            grade: selectedGrade,
            level: level
          })
        });

        if (response.ok) {
          const question = await response.json();
          const timeLimit = calculateTimeLimit(question, selectedGrade, level);
          const now = Date.now();
          
          set({ 
            currentQuestion: question,
            timeLimit,
            timeRemaining: timeLimit,
            questionStartTime: now
          });
        } else {
          // Fallback to local question generation
          const localQuestion = generateLocalQuestion(selectedGrade, level);
          const timeLimit = calculateTimeLimit(localQuestion, selectedGrade, level);
          const now = Date.now();
          
          set({ 
            currentQuestion: localQuestion,
            timeLimit,
            timeRemaining: timeLimit,
            questionStartTime: now
          });
        }
      } catch (error) {
        console.error("Failed to generate question:", error);
        // Fallback to local question generation
        const localQuestion = generateLocalQuestion(selectedGrade, level);
        const timeLimit = calculateTimeLimit(localQuestion, selectedGrade, level);
        const now = Date.now();
        
        set({ 
          currentQuestion: localQuestion,
          timeLimit,
          timeRemaining: timeLimit,
          questionStartTime: now
        });
      }
    }
  }))
);

// Fallback local question generation
function generateLocalQuestion(grade: number, level: number): MathQuestion {
  const operations = grade <= 2 ? ["addition", "subtraction"] : 
                    grade <= 4 ? ["addition", "subtraction", "multiplication"] :
                    ["addition", "subtraction", "multiplication", "division"];
  
  const operation = operations[Math.floor(Math.random() * operations.length)] as MathQuestion["operation"];
  const difficulty = Math.min(grade * level, 10);
  
  let num1: number, num2: number, answer: number, question: string;
  
  switch (operation) {
    case "addition":
      num1 = Math.floor(Math.random() * (difficulty * 10)) + 1;
      num2 = Math.floor(Math.random() * (difficulty * 10)) + 1;
      answer = num1 + num2;
      question = `${num1} + ${num2} = ?`;
      break;
    case "subtraction":
      num1 = Math.floor(Math.random() * (difficulty * 10)) + 10;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
      question = `${num1} - ${num2} = ?`;
      break;
    case "multiplication":
      num1 = Math.floor(Math.random() * 12) + 1;
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = num1 * num2;
      question = `${num1} × ${num2} = ?`;
      break;
    case "division":
      num2 = Math.floor(Math.random() * 12) + 1;
      answer = Math.floor(Math.random() * 12) + 1;
      num1 = num2 * answer;
      question = `${num1} ÷ ${num2} = ?`;
      break;
    default:
      num1 = 1;
      num2 = 1;
      answer = 2;
      question = "1 + 1 = ?";
  }
  
  return {
    id: Date.now().toString(),
    question,
    answer,
    difficulty,
    operation,
    grade
  };
}
