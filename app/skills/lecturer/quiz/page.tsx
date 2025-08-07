'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Loader2, 
  Zap, 
  BookOpen, 
  CheckCircle, 
  AlertCircle,
  Brain,
  Target,
  Settings
} from 'lucide-react';

interface Skill {
  id: number;
  name: string;
  description: string;
  difficultyLevel: string;
  category: {
    name: string;
  };
}

interface GeneratedQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: string;
  skillId: number;
}

export default function QuizGenerationPage() {
  const { data: session } = useSession();
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkillId, setSelectedSkillId] = useState<string>('');
  const [questionCount, setQuestionCount] = useState<string>('5');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    fetchSkills();
  }, []);

  const fetchSkills = async () => {
    try {
      const response = await fetch('/api/categories?includeSkills=true');
      if (response.ok) {
        const categories = await response.json();
        const allSkills = categories.flatMap((cat: any) => 
          cat.skills ? cat.skills.map((skill: any) => ({
            ...skill,
            category: { name: cat.name }
          })) : []
        );
        setSkills(allSkills);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
    } finally {
      setSkillsLoading(false);
    }
  };

  const handleGenerateQuiz = async () => {
    if (!selectedSkillId) {
      setError('Please select a skill');
      return;
    }

    if (!questionCount || parseInt(questionCount) < 1 || parseInt(questionCount) > 10) {
      setError('Question count must be between 1 and 10');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          skillId: selectedSkillId,
          questionCount: parseInt(questionCount)
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedQuestions(data.questions || []);
        setSuccess(`Successfully generated ${data.questions?.length || 0} quiz questions!`);
      } else {
        setError(data.error || 'Failed to generate quiz questions');
      }
    } catch (error) {
      console.error('Error generating quiz:', error);
      setError('An error occurred while generating questions');
    } finally {
      setLoading(false);
    }
  };

  const selectedSkill = skills.find(skill => skill.id.toString() === selectedSkillId);

  if (session?.user?.role !== 'LECTURER' && session?.user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Access denied. Only lecturers can generate quiz questions.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-6 sm:space-y-8 p-4 sm:p-6 max-w-7xl mx-auto">
        
        {/* Modern Header */}
        <div className="relative">
          <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/30 dark:border-slate-800/50 p-4 sm:p-6 lg:p-8 shadow-2xl shadow-slate-200/50 dark:shadow-slate-950/50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex items-center space-x-4 sm:space-x-6">
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg">
                    <Brain className="h-6 w-6 sm:h-7 sm:w-7 lg:h-8 lg:w-8 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl sm:rounded-2xl blur opacity-30"></div>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl sm:text-3xl lg:text-4xl font-light text-slate-900 dark:text-white tracking-tight">AI Quiz Generator</h1>
                  <p className="text-sm sm:text-base lg:text-lg text-slate-600 dark:text-slate-300 mt-1 font-light">
                    Generate intelligent quiz questions using Gemini AI
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right flex-shrink-0">
                <div className="text-xl sm:text-2xl lg:text-3xl font-light text-slate-900 dark:text-white">{new Date().toLocaleDateString('en-US', { weekday: 'long' })}</div>
                <div className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Generation Form */}
        <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-800/50 shadow-xl">
          <CardHeader>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Settings className="h-5 w-5 text-white" />
              </div>
              <div>
                <CardTitle className="text-xl text-slate-900 dark:text-white">Generate Quiz Questions</CardTitle>
                <CardDescription className="text-slate-600 dark:text-slate-400">
                  Select a skill and generate AI-powered quiz questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive" className="bg-red-500/90 backdrop-blur-sm border-red-400/50">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-white">{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="bg-green-500/90 backdrop-blur-sm border-green-400/50">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription className="text-white">{success}</AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="skill" className="text-sm font-medium text-slate-900 dark:text-white">
                  Select Skill
                </Label>
                <Select value={selectedSkillId} onValueChange={setSelectedSkillId} disabled={skillsLoading}>
                  <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/30">
                    <SelectValue placeholder={skillsLoading ? "Loading skills..." : "Choose a skill to generate questions for"} />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-700/30">
                    {skills.map((skill) => (
                      <SelectItem key={skill.id} value={skill.id.toString()}>
                        <div className="flex flex-col">
                          <span className="font-medium">{skill.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {skill.category.name} • {skill.difficultyLevel}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="count" className="text-sm font-medium text-slate-900 dark:text-white">
                  Number of Questions
                </Label>
                <Select value={questionCount} onValueChange={setQuestionCount}>
                  <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border-white/30 dark:border-slate-700/30">
                    <SelectValue placeholder="Select question count" />
                  </SelectTrigger>
                  <SelectContent className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-white/30 dark:border-slate-700/30">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((count) => (
                      <SelectItem key={count} value={count.toString()}>
                        {count} questions
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {selectedSkill && (
              <div className="bg-slate-50 dark:bg-slate-800 rounded-lg p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900 dark:text-white">Selected Skill</h4>
                  <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                    {selectedSkill.difficultyLevel}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  <strong>{selectedSkill.category.name}:</strong> {selectedSkill.description}
                </p>
              </div>
            )}

            <Button
              onClick={handleGenerateQuiz}
              disabled={loading || !selectedSkillId}
              className="w-full h-12 text-base font-medium bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  <Zap className="mr-2 h-5 w-5" />
                  Generate Quiz Questions
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Questions */}
        {generatedQuestions.length > 0 && (
          <Card className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/30 dark:border-slate-800/50 shadow-xl">
            <CardHeader>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Target className="h-5 w-5 text-white" />
                </div>
                <div>
                  <CardTitle className="text-xl text-slate-900 dark:text-white">Generated Questions</CardTitle>
                  <CardDescription className="text-slate-600 dark:text-slate-400">
                    {generatedQuestions.length} questions successfully generated and saved
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {generatedQuestions.map((question, index) => (
                <div key={question.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-6 space-y-4">
                  <div className="flex items-start justify-between">
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white">
                      Question {index + 1}
                    </h4>
                    <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200 dark:border-purple-700">
                      {question.difficulty}
                    </Badge>
                  </div>
                  
                  <p className="text-slate-700 dark:text-slate-300 font-medium">
                    {question.question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {question.options.map((option, optionIndex) => (
                      <div
                        key={optionIndex}
                        className={`p-3 rounded-lg border text-sm ${
                          optionIndex === question.correctAnswer
                            ? 'bg-green-50 border-green-300 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-200'
                            : 'bg-white border-slate-300 text-slate-700 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {String.fromCharCode(65 + optionIndex)}:
                          </span>
                          <span>{option}</span>
                          {optionIndex === question.correctAnswer && (
                            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                    <h5 className="font-medium text-blue-900 dark:text-blue-200 mb-2">Explanation:</h5>
                    <p className="text-blue-800 dark:text-blue-300 text-sm">
                      {question.explanation}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}