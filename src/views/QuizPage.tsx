import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Brain, HelpCircle, CheckCircle, X, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const subjects = [
  { value: "science", label: "Science" },
  { value: "history", label: "History" },
  { value: "literature", label: "Literature" },
  { value: "mathematics", label: "Mathematics" },
  { value: "geography", label: "Geography" },
  { value: "technology", label: "Technology" },
  { value: "art", label: "Art" },
  { value: "sports", label: "Sports" },
  { value: "music", label: "Music" },
  { value: "general", label: "General Knowledge" }
];

const difficulties = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" }
];

const questionCounts = [
  { value: "5", label: "5 Questions" },
  { value: "10", label: "10 Questions" },
  { value: "15", label: "15 Questions" },
  { value: "20", label: "20 Questions" }
];

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation?: string;
}

export default function QuizPage() {
  const [subject, setSubject] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [customTopic, setCustomTopic] = useState("");
  const [quiz, setQuiz] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);

  const [quizStarted, setQuizStarted] = useState(false);
  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerateQuiz = async () => {
    if (!subject || !difficulty || !questionCount) {
      toast({
        title: "Error",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    try {
      const topic = customTopic || subjects.find(s => s.value === subject)?.label || subject;

      const prompt = `Create a ${difficulty} level quiz about ${topic} with exactly ${questionCount} multiple choice questions.

Format each question as:
Q[number]: [question]
A) [option 1]
B) [option 2] 
C) [option 3]
D) [option 4]
Correct: [A/B/C/D]
Explanation: [brief explanation]

Make the questions educational, engaging, and appropriate for the ${difficulty} difficulty level.`;

      const response = await generateStream("You are an educational quiz creator. Generate well-crafted multiple choice questions with clear, unambiguous answers and helpful explanations.", prompt);

      // Parse the response into questions
      const questions = parseQuizResponse(response.text);

      if (questions.length > 0) {
        setQuiz(questions);
        setCurrentQuestion(0);
        setUserAnswers([]);
        setShowResults(false);
        setQuizStarted(true);
      } else {
        throw new Error("Failed to parse quiz questions");
      }

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to generate quiz. Please try again.",
        variant: "destructive"
      });
    }
  };

  const parseQuizResponse = (response: string): Question[] => {
    // This is a simplified parser - in production, you'd want more robust parsing
    const questions: Question[] = [];
    const questionBlocks = response.split(/Q\d+:/);

    for (let i = 1; i < questionBlocks.length; i++) {
      const block = questionBlocks[i].trim();
      const lines = block.split('\n');

      if (lines.length >= 6) {
        const question = lines[0].trim();
        const options = [
          lines[1]?.replace(/^A\)\s*/, '').trim(),
          lines[2]?.replace(/^B\)\s*/, '').trim(),
          lines[3]?.replace(/^C\)\s*/, '').trim(),
          lines[4]?.replace(/^D\)\s*/, '').trim()
        ].filter(Boolean);

        const correctLine = lines.find(line => line?.startsWith('Correct:'));
        const correctLetter = correctLine?.split(':')[1]?.trim();
        const correctAnswer = correctLetter === 'A' ? 0 : correctLetter === 'B' ? 1 : correctLetter === 'C' ? 2 : 3;

        const explanationLine = lines.find(line => line?.startsWith('Explanation:'));
        const explanation = explanationLine?.split(':')[1]?.trim();

        if (question && options.length === 4) {
          questions.push({
            question,
            options,
            correctAnswer,
            explanation
          });
        }
      }
    }

    return questions;
  };

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...userAnswers];
    newAnswers[currentQuestion] = answerIndex;
    setUserAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    return userAnswers.filter((answer, index) => answer === quiz[index]?.correctAnswer).length;
  };

  const resetQuiz = () => {
    setQuiz([]);
    setCurrentQuestion(0);
    setUserAnswers([]);
    setShowResults(false);
    setQuizStarted(false);
  };

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / quiz.length) * 100);

    return (
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold ai-gradient-text">Quiz Results</h1>
          <p className="text-muted-foreground mt-2">
            Here's how you performed on the {subject} quiz
          </p>
        </div>

        <Card className="ai-card">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Final Score</CardTitle>
            <div className="text-4xl font-bold ai-gradient-text mt-4">
              {score} / {quiz.length}
            </div>
            <div className="text-xl text-muted-foreground">
              {percentage}% Correct
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-4">
          {quiz.map((question, index) => (
            <Card key={index} className="ai-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="text-sm">Question {index + 1}</span>
                  {userAnswers[index] === question.correctAnswer ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <X className="w-5 h-5 text-red-500" />
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium mb-4">{question.question}</p>
                <div className="space-y-2">
                  {question.options.map((option, optIndex) => (
                    <div
                      key={optIndex}
                      className={`p-2 rounded border ${optIndex === question.correctAnswer
                        ? 'bg-green-500/20 border-green-500/50 text-green-700 dark:text-green-300'
                        : userAnswers[index] === optIndex
                          ? 'bg-red-500/20 border-red-500/50 text-red-700 dark:text-red-300'
                          : 'bg-muted/30 border-border'
                        }`}
                    >
                      {String.fromCharCode(65 + optIndex)}) {option}
                      {optIndex === question.correctAnswer && (
                        <Badge variant="default" className="ml-2">Correct</Badge>
                      )}
                    </div>
                  ))}
                </div>
                {question.explanation && (
                  <div className="mt-4 p-3 bg-ai-primary/10 border border-ai-primary/20 rounded">
                    <p className="text-sm"><strong>Explanation:</strong> {question.explanation}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <Button onClick={resetQuiz} className="w-full">
          <Brain className="w-4 h-4 mr-2" />
          Create New Quiz
        </Button>
      </div>
    );
  }

  if (quizStarted && quiz.length > 0) {
    const question = quiz[currentQuestion];

    return (
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold ai-gradient-text">Quiz in Progress</h1>
            <p className="text-muted-foreground">Question {currentQuestion + 1} of {quiz.length}</p>
          </div>
          <Button variant="outline" onClick={resetQuiz}>
            Exit Quiz
          </Button>
        </div>

        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-ai-primary" />
              Question {currentQuestion + 1}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-lg font-medium">{question.question}</p>

            <div className="space-y-3">
              {question.options.map((option, index) => (
                <Button
                  key={index}
                  variant={userAnswers[currentQuestion] === index ? "default" : "outline"}
                  className="w-full text-left justify-start h-auto p-4"
                  onClick={() => handleAnswerSelect(index)}
                >
                  <span className="font-medium mr-3">
                    {String.fromCharCode(65 + index)})
                  </span>
                  {option}
                </Button>
              ))}
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={handlePrevQuestion}
                disabled={currentQuestion === 0}
              >
                Previous
              </Button>
              <Button
                onClick={handleNextQuestion}
                disabled={userAnswers[currentQuestion] === undefined}
              >
                {currentQuestion === quiz.length - 1 ? 'Finish Quiz' : 'Next'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">AI Knowledge Quiz Generator</h1>
        <p className="text-muted-foreground mt-2">
          Create custom quizzes on any topic to test your knowledge and study effectively.
        </p>
      </div>

      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-ai-primary" />
            Quiz Settings
          </CardTitle>
          <CardDescription>
            Customize your quiz parameters to create the perfect study session.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject *</Label>
              <Select value={subject} onValueChange={setSubject}>
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulty *</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent>
                  {difficulties.map((d) => (
                    <SelectItem key={d.value} value={d.value}>
                      {d.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="count">Questions *</Label>
              <Select value={questionCount} onValueChange={setQuestionCount}>
                <SelectTrigger>
                  <SelectValue placeholder="Select count" />
                </SelectTrigger>
                <SelectContent>
                  {questionCounts.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="custom-topic">Custom Topic (Optional)</Label>
            <Input
              id="custom-topic"
              placeholder="e.g., World War II, Photosynthesis, Shakespeare..."
              value={customTopic}
              onChange={(e) => setCustomTopic(e.target.value)}
            />
          </div>

          <Button
            onClick={handleGenerateQuiz}
            disabled={isStreaming || !subject || !difficulty || !questionCount}
            className="w-full"
          >
            {isStreaming ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Quiz...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Generate Quiz
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Streaming Preview */}
      {isStreaming && streamedText && (
        <Card className="ai-card">
          <CardHeader>
            <CardTitle>Generating Quiz Questions...</CardTitle>
            <CardDescription>Your quiz questions are being created</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 p-4 rounded-lg max-h-[300px] overflow-y-auto">
              <MarkdownRenderer content={streamedText} />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Subject Quick Select */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Popular Subjects</CardTitle>
          <CardDescription>
            Click on any subject to select it quickly
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {subjects.map((s) => (
              <Badge
                key={s.value}
                variant={subject === s.value ? "default" : "outline"}
                className="cursor-pointer hover:bg-ai-primary/10"
                onClick={() => setSubject(s.value)}
              >
                {s.label}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
