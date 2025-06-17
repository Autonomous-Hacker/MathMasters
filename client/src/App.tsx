import { useState, useEffect } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/sonner";
import GameCanvas from "./components/GameCanvas";
import TeacherDashboard from "./components/TeacherDashboard";
import GameUI from "./components/GameUI";
import { useMathGame } from "./lib/stores/useMathGame";
import { useAudio } from "./lib/stores/useAudio";
import "@fontsource/inter";

const queryClient = new QueryClient();

type AppMode = "game" | "teacher";

function App() {
  const [mode, setMode] = useState<AppMode>("game");
  const { gameState, selectedGrade } = useMathGame();
  const { toggleMute, isMuted } = useAudio();

  // Initialize audio on first user interaction
  useEffect(() => {
    const initAudio = () => {
      // Initialize audio context for better browser compatibility
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContext.resume();
      
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };

    document.addEventListener('click', initAudio);
    document.addEventListener('keydown', initAudio);

    return () => {
      document.removeEventListener('click', initAudio);
      document.removeEventListener('keydown', initAudio);
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="w-full h-full bg-gray-900 text-white relative">
        {/* Mode Toggle */}
        <div className="absolute top-4 right-4 z-50 flex gap-2">
          <button
            onClick={() => setMode(mode === "game" ? "teacher" : "game")}
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg transition-colors"
          >
            {mode === "game" ? "Teacher Dashboard" : "Back to Game"}
          </button>
          <button
            onClick={toggleMute}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded-lg transition-colors"
          >
            {isMuted ? "🔇" : "🔊"}
          </button>
        </div>

        {mode === "teacher" ? (
          <TeacherDashboard />
        ) : (
          <>
            {/* Game Canvas Container */}
            <div className="w-full h-full">
              <GameCanvas />
            </div>
            
            {/* Game UI Overlay */}
            <GameUI />
          </>
        )}
        
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}

export default App;
