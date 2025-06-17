import { useState, useEffect, useRef } from "react";
import { useMathGame } from "../lib/stores/useMathGame";
import { useAudio } from "../lib/stores/useAudio";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Leaderboard from "./Leaderboard";
import { startVoiceRecognition, stopVoiceRecognition } from "../lib/voiceRecognition";

const gradeOptions = [
  { value: 1, label: "Lower Primary (Grade 1-2)" },
  { value: 2, label: "Upper Primary (Grade 3-4)" },
  { value: 3, label: "Form 1 (Grade 5)" },
  { value: 4, label: "Form 2 (Grade 6)" },
  { value: 5, label: "Form 3 (Grade 7)" },
  { value: 6, label: "Form 4 (Grade 8)" },
];

export default function GameUI() {
  const {
    gameState,
    selectedGrade,
    currentQuestion,
    score,
    streak,
    level,
    progress,
    timeRemaining,
    timeLimit,
    startGame,
    setGrade,
    submitAnswer,
    getHint,
    updateTimer,
    isLoading
  } = useMathGame();
  
  const { playHit, playSuccess } = useAudio();
  const [answer, setAnswer] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [hint, setHint] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle voice recognition
  const handleVoiceInput = async () => {
    if (!isListening) {
      setIsListening(true);
      try {
        const result = await startVoiceRecognition();
        if (result) {
          setAnswer(result);
          setIsListening(false);
        }
      } catch (error) {
        console.error("Voice recognition error:", error);
        setIsListening(false);
      }
    } else {
      stopVoiceRecognition();
      setIsListening(false);
    }
  };

  // Handle answer submission
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    
    const isCorrect = await submitAnswer(parseInt(answer));
    if (isCorrect) {
      playSuccess();
    } else {
      playHit();
    }
    setAnswer("");
    setShowHint(false);
    setHint("");
  };

  // Handle hint request
  const handleGetHint = async () => {
    if (currentQuestion) {
      const hintText = await getHint(currentQuestion);
      setHint(hintText);
      setShowHint(true);
    }
  };

  // Timer effect - update every second when playing
  useEffect(() => {
    if (gameState === "playing" && currentQuestion) {
      timerRef.current = setInterval(() => {
        updateTimer();
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [gameState, currentQuestion, updateTimer]);

  // Handle Enter key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === "Enter" && gameState === "playing" && answer) {
        handleSubmit();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [answer, gameState]);

  if (gameState === "menu") {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <Card className="w-full max-w-md mx-4 bg-gray-800 border-gray-700">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-white mb-2">
              🧮 Math Quest
            </CardTitle>
            <p className="text-gray-300">Choose your grade level and start learning!</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Select Grade Level
              </label>
              <Select value={selectedGrade.toString()} onValueChange={(value) => setGrade(parseInt(value))}>
                <SelectTrigger className="bg-gray-700 border-gray-600">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-700 border-gray-600">
                  {gradeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={startGame} 
              className="w-full bg-green-600 hover:bg-green-700 text-lg py-3"
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Start Game! 🚀"}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (gameState === "playing") {
    return (
      <div className="absolute inset-0 pointer-events-none">
        {/* Top HUD */}
        <div className="absolute top-4 left-4 space-y-2 pointer-events-auto">
          <div className="flex gap-4">
            <Badge variant="secondary" className="text-lg px-3 py-1">
              Score: {score}
            </Badge>
            <Badge variant="outline" className="text-lg px-3 py-1">
              Level: {level}
            </Badge>
            <Badge variant="destructive" className="text-lg px-3 py-1">
              Streak: {streak}
            </Badge>
            <Badge 
              variant={timeRemaining <= 5 ? "destructive" : timeRemaining <= 10 ? "secondary" : "default"} 
              className="text-lg px-3 py-1"
            >
              ⏰ {Math.ceil(timeRemaining)}s
            </Badge>
          </div>
          <Progress value={progress} className="w-48" />
          {/* Timer Progress Bar */}
          <Progress 
            value={timeLimit > 0 ? (timeRemaining / timeLimit) * 100 : 0} 
            className="w-48 h-2"
            style={{
              '--progress-foreground': timeRemaining <= 5 ? 'hsl(0 84.2% 60.2%)' : 
                                      timeRemaining <= 10 ? 'hsl(47.9 95.8% 53.1%)' : 
                                      'hsl(142.1 76.2% 36.3%)'
            } as React.CSSProperties}
          />
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 pointer-events-auto">
            <Card className="bg-gray-800/95 border-gray-600 backdrop-blur-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-center text-xl text-white">
                  {currentQuestion.question}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="number"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    placeholder="Your answer..."
                    className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleVoiceInput}
                    variant={isListening ? "destructive" : "secondary"}
                    className="px-3"
                  >
                    {isListening ? "🛑" : "🎤"}
                  </Button>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleSubmit} 
                    disabled={!answer || isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    Submit Answer
                  </Button>
                  <Button 
                    onClick={handleGetHint}
                    variant="outline"
                    disabled={isLoading}
                  >
                    💡 Hint
                  </Button>
                </div>

                {showHint && hint && (
                  <div className="p-3 bg-blue-900/50 rounded-md border border-blue-700">
                    <p className="text-sm text-blue-200">
                      <strong>Hint:</strong> {hint}
                    </p>
                  </div>
                )}

                {isListening && (
                  <div className="text-center text-sm text-yellow-400">
                    🎤 Listening... Speak your answer clearly
                  </div>
                )}

                {timeRemaining <= 10 && timeRemaining > 0 && (
                  <div className={`text-center text-sm font-bold ${
                    timeRemaining <= 5 ? 'text-red-400 animate-pulse' : 'text-yellow-400'
                  }`}>
                    ⚠️ {timeRemaining <= 5 ? 'Hurry up!' : 'Time running out!'} {Math.ceil(timeRemaining)} seconds left
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Leaderboard */}
        <div className="absolute top-4 right-20 pointer-events-auto">
          <Leaderboard />
        </div>
      </div>
    );
  }

  return null;
}
