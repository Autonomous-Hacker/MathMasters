import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface LeaderboardEntry {
  id: string;
  name: string;
  score: number;
  grade: number;
  streak: number;
}

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch("/api/leaderboard");
      if (response.ok) {
        const data = await response.json();
        setEntries(data);
      }
    } catch (error) {
      console.error("Failed to fetch leaderboard:", error);
      // Show empty state instead of error
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="w-64 bg-gray-800/95 border-gray-600 backdrop-blur-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg text-white">🏆 Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-gray-400">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-64 bg-gray-800/95 border-gray-600 backdrop-blur-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg text-white">🏆 Leaderboard</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {entries.length === 0 ? (
          <div className="text-center text-gray-400 py-4">
            No scores yet. Be the first to play!
          </div>
        ) : (
          entries.slice(0, 5).map((entry, index) => (
            <div
              key={entry.id}
              className="flex items-center justify-between p-2 rounded-md bg-gray-700/50"
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`}
                </span>
                <div>
                  <div className="text-sm font-medium text-white">{entry.name}</div>
                  <Badge variant="outline" className="text-xs">
                    Grade {entry.grade}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-bold text-green-400">{entry.score}</div>
                <div className="text-xs text-gray-400">🔥{entry.streak}</div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
