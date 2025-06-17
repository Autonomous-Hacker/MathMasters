import { useEffect, useRef } from "react";
import { initGame, destroyGame } from "../lib/gameEngine";
import { useMathGame } from "../lib/stores/useMathGame";

export default function GameCanvas() {
  const gameRef = useRef<HTMLDivElement>(null);
  const { gameState, selectedGrade } = useMathGame();

  useEffect(() => {
    if (gameRef.current && gameState === "playing") {
      // Initialize Phaser game
      const game = initGame(gameRef.current, selectedGrade);
      
      return () => {
        destroyGame(game);
      };
    }
  }, [gameState, selectedGrade]);

  return (
    <div 
      ref={gameRef} 
      className="w-full h-full bg-gradient-to-b from-blue-800 to-blue-900"
      id="phaser-game"
    />
  );
}
