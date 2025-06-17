import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface StudentStats {
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

export default function TeacherDashboard() {
  const [students, setStudents] = useState<StudentStats[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<StudentStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStudentStats();
  }, []);

  const fetchStudentStats = async () => {
    try {
      const response = await fetch("/api/teacher/students");
      if (response.ok) {
        const data = await response.json();
        setStudents(data);
        if (data.length > 0) {
          setSelectedStudent(data[0]);
        }
      }
    } catch (error) {
      console.error("Failed to fetch student stats:", error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 h-full bg-gray-900">
        <div className="text-center text-white">Loading teacher dashboard...</div>
      </div>
    );
  }

  return (
    <div className="p-8 h-full bg-gray-900 text-white overflow-auto">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">📊 Teacher Dashboard</h1>
        
        {students.length === 0 ? (
          <Card className="bg-gray-800 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="text-gray-400">
                No student data available yet. Students need to play the game to generate analytics.
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Student List */}
            <div className="lg:col-span-1">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Students ({students.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {students.map((student) => (
                    <div
                      key={student.id}
                      onClick={() => setSelectedStudent(student)}
                      className={`p-3 rounded-md cursor-pointer transition-colors ${
                        selectedStudent?.id === student.id
                          ? "bg-blue-600"
                          : "bg-gray-700 hover:bg-gray-600"
                      }`}
                    >
                      <div className="font-medium">{student.name}</div>
                      <div className="text-sm text-gray-300">
                        Grade {student.grade} • {Math.round((student.correctAnswers / student.totalQuestions) * 100)}% accuracy
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Student Details */}
            <div className="lg:col-span-2">
              {selectedStudent && (
                <Tabs defaultValue="overview" className="space-y-4">
                  <TabsList className="bg-gray-800">
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                    <TabsTrigger value="progress">Progress</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview" className="space-y-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle>{selectedStudent.name} - Grade {selectedStudent.grade}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-400">
                              {selectedStudent.totalQuestions}
                            </div>
                            <div className="text-sm text-gray-400">Total Questions</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-400">
                              {Math.round((selectedStudent.correctAnswers / selectedStudent.totalQuestions) * 100)}%
                            </div>
                            <div className="text-sm text-gray-400">Accuracy</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-yellow-400">
                              {selectedStudent.currentStreak}
                            </div>
                            <div className="text-sm text-gray-400">Current Streak</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-400">
                              {selectedStudent.averageTime.toFixed(1)}s
                            </div>
                            <div className="text-sm text-gray-400">Avg Time</div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium mb-2">Accuracy Progress</h4>
                          <Progress 
                            value={(selectedStudent.correctAnswers / selectedStudent.totalQuestions) * 100} 
                            className="h-2"
                          />
                        </div>

                        {selectedStudent.weakAreas.length > 0 && (
                          <div>
                            <h4 className="font-medium mb-2">Areas for Improvement</h4>
                            <div className="flex flex-wrap gap-2">
                              {selectedStudent.weakAreas.map((area, index) => (
                                <Badge key={index} variant="destructive">
                                  {area}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="activity" className="space-y-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedStudent.recentActivity.length === 0 ? (
                          <div className="text-center text-gray-400 py-4">
                            No recent activity
                          </div>
                        ) : (
                          <div className="space-y-3">
                            {selectedStudent.recentActivity.slice(0, 10).map((activity, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                                <div>
                                  <div className="font-medium">{activity.question}</div>
                                  <div className="text-sm text-gray-400">
                                    Answer: {activity.answer} • {activity.timeSpent.toFixed(1)}s
                                  </div>
                                </div>
                                <div className="text-right">
                                  <Badge variant={activity.correct ? "default" : "destructive"}>
                                    {activity.correct ? "✓" : "✗"}
                                  </Badge>
                                  <div className="text-xs text-gray-400 mt-1">
                                    {new Date(activity.timestamp).toLocaleTimeString()}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="progress" className="space-y-4">
                    <Card className="bg-gray-800 border-gray-700">
                      <CardHeader>
                        <CardTitle>Progress Over Time</CardTitle>
                      </CardHeader>
                      <CardContent>
                        {selectedStudent.progressOverTime.length === 0 ? (
                          <div className="text-center text-gray-400 py-4">
                            Not enough data for progress tracking
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {selectedStudent.progressOverTime.slice(-7).map((progress, index) => (
                              <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                                <div>
                                  <div className="font-medium">{progress.date}</div>
                                  <div className="text-sm text-gray-400">
                                    Accuracy: {progress.accuracy}%
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-lg font-bold text-green-400">
                                    {progress.score}
                                  </div>
                                  <div className="text-xs text-gray-400">Score</div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
