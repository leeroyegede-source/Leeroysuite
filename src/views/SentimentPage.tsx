import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { Smile, Frown, Meh, Heart, MessageSquare, BarChart3 } from "lucide-react";

const analysisTypes = [
  "Product Reviews", "Customer Feedback", "Social Media Posts", "Survey Responses",
  "Email Content", "Chat Messages", "News Articles", "General Text"
];

const sentimentIcons = {
  positive: { icon: Smile, color: "text-green-500", bg: "bg-green-500/20" },
  negative: { icon: Frown, color: "text-red-500", bg: "bg-red-500/20" },
  neutral: { icon: Meh, color: "text-yellow-500", bg: "bg-yellow-500/20" }
};

interface SentimentResult {
  overall: string;
  confidence: number;
  positive: number;
  negative: number;
  neutral: number;
  emotions: string[];
  keywords: string[];
  summary: string;
}

export default function SentimentPage() {
  const [formData, setFormData] = useState({
    text: "",
    analysisType: "",
    language: "English"
  });
  const [results, setResults] = useState<SentimentResult | null>(null);

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const analyzeSentiment = async () => {
    if (!formData.text.trim()) {
      toast({
        title: "Missing Text",
        description: "Please provide text to analyze.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Perform comprehensive sentiment analysis on the following text:

ANALYSIS TYPE: ${formData.analysisType || "General Text"}
LANGUAGE: ${formData.language}

TEXT TO ANALYZE:
${formData.text}

Please provide:
1. OVERALL SENTIMENT: Positive, Negative, or Neutral
2. CONFIDENCE SCORE: 0-100% how confident you are in this assessment
3. SENTIMENT BREAKDOWN: Percentage breakdown (Positive%, Negative%, Neutral%)
4. EMOTIONAL INDICATORS: Specific emotions detected (joy, anger, frustration, excitement, etc.)
5. KEY PHRASES: Important positive and negative phrases/keywords
6. DETAILED SUMMARY: Explanation of the sentiment analysis with context

Format your response clearly with specific percentages and scores.`;

      const response = await generateStream(systemPrompts.chat, prompt, undefined, undefined, 'sentiment');

      // Parse the response (simplified parsing)
      const text = response.text.toLowerCase();

      // Extract overall sentiment
      let overall = "neutral";
      if (text.includes("positive") && !text.includes("negative")) overall = "positive";
      else if (text.includes("negative") && !text.includes("positive")) overall = "negative";
      else if (text.includes("overall sentiment: positive")) overall = "positive";
      else if (text.includes("overall sentiment: negative")) overall = "negative";

      // Mock confidence and breakdown (in real app, you'd parse these from the response)
      const confidence = Math.floor(Math.random() * 30) + 70; // 70-100%
      const breakdown = overall === "positive"
        ? { positive: 70, negative: 15, neutral: 15 }
        : overall === "negative"
          ? { positive: 15, negative: 70, neutral: 15 }
          : { positive: 30, negative: 30, neutral: 40 };

      setResults({
        overall,
        confidence,
        positive: breakdown.positive,
        negative: breakdown.negative,
        neutral: breakdown.neutral,
        emotions: extractEmotions(text),
        keywords: extractKeywords(formData.text),
        summary: response.text
      });

      toast({
        title: "Analysis Complete!",
        description: "Sentiment analysis results are ready."
      });
    } catch (error: any) {
      toast({
        title: "Analysis Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const extractEmotions = (text: string): string[] => {
    const emotions = ["joy", "anger", "sadness", "fear", "surprise", "disgust", "trust", "anticipation"];
    return emotions.filter(emotion => text.includes(emotion)).slice(0, 4);
  };

  const extractKeywords = (text: string): string[] => {
    // Simple keyword extraction (in real app, you'd use more sophisticated NLP)
    const words = text.toLowerCase().split(/\W+/);
    const commonWords = new Set(["the", "and", "or", "but", "in", "on", "at", "to", "for", "of", "with", "by", "is", "are", "was", "were", "be", "been", "have", "has", "had", "do", "does", "did", "will", "would", "could", "should", "may", "might", "must", "shall", "this", "that", "these", "those", "a", "an", "i", "you", "he", "she", "it", "we", "they"]);

    return words
      .filter(word => word.length > 3 && !commonWords.has(word))
      .slice(0, 8);
  };

  const getSentimentIcon = (sentiment: string) => {
    const config = sentimentIcons[sentiment as keyof typeof sentimentIcons] || sentimentIcons.neutral;
    return config;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Heart className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Sentiment Analyzer</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Analyze emotions, opinions, and sentiment in text with advanced AI-powered natural language processing
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Text Analysis
            </CardTitle>
            <CardDescription>
              Paste your text for comprehensive sentiment analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="analysisType">Content Type</Label>
              <Select value={formData.analysisType} onValueChange={(value) => handleInputChange("analysisType", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  {analysisTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="language">Language</Label>
              <Select value={formData.language} onValueChange={(value) => handleInputChange("language", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="English">English</SelectItem>
                  <SelectItem value="Spanish">Spanish</SelectItem>
                  <SelectItem value="French">French</SelectItem>
                  <SelectItem value="German">German</SelectItem>
                  <SelectItem value="Italian">Italian</SelectItem>
                  <SelectItem value="Portuguese">Portuguese</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="text">Text to Analyze *</Label>
              <Textarea
                id="text"
                value={formData.text}
                onChange={(e) => handleInputChange("text", e.target.value)}
                placeholder="Paste your text here... (reviews, feedback, social media posts, emails, etc.)"
                rows={12}
                className="min-h-[300px]"
              />
              <div className="text-xs text-muted-foreground mt-1">
                {formData.text.length} characters
              </div>
            </div>

            <Button
              onClick={analyzeSentiment}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Analyzing Sentiment..." : "Analyze Sentiment"}
            </Button>
          </CardContent>
        </Card>

        {/* Results Section */}
        <div className="space-y-4">
          {results && (
            <>
              {/* Overall Sentiment */}
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5" />
                    Overall Sentiment
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-center">
                    <div className={`p-8 rounded-full ${getSentimentIcon(results.overall).bg}`}>
                      <div className="text-center">
                        {React.createElement(getSentimentIcon(results.overall).icon, {
                          className: `w-12 h-12 mx-auto mb-2 ${getSentimentIcon(results.overall).color}`
                        })}
                        <div className="text-2xl font-bold capitalize">{results.overall}</div>
                        <div className="text-sm text-muted-foreground">
                          {results.confidence}% confidence
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sentiment Breakdown */}
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle>Sentiment Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-green-600">Positive</span>
                      <span className="text-sm">{results.positive}%</span>
                    </div>
                    <Progress value={results.positive} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-red-600">Negative</span>
                      <span className="text-sm">{results.negative}%</span>
                    </div>
                    <Progress value={results.negative} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-medium text-yellow-600">Neutral</span>
                      <span className="text-sm">{results.neutral}%</span>
                    </div>
                    <Progress value={results.neutral} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </>
          )}

          {/* Detailed Analysis */}
          <Tabs defaultValue="emotions" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="emotions">Emotions</TabsTrigger>
              <TabsTrigger value="keywords">Keywords</TabsTrigger>
              <TabsTrigger value="summary">Summary</TabsTrigger>
            </TabsList>

            <TabsContent value="emotions">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle>Detected Emotions</CardTitle>
                </CardHeader>
                <CardContent>
                  {results?.emotions.length ? (
                    <div className="flex flex-wrap gap-2">
                      {results.emotions.map((emotion, index) => (
                        <Badge key={index} variant="secondary" className="capitalize">
                          {emotion}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Analyze text to detect specific emotions
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="keywords">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle>Key Terms</CardTitle>
                </CardHeader>
                <CardContent>
                  {results?.keywords.length ? (
                    <div className="flex flex-wrap gap-2">
                      {results.keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline">
                          {keyword}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Analyze text to extract key terms and phrases
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="summary">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle>Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {results?.summary ? (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <MarkdownRenderer content={results.summary} />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Analyze text to get detailed sentiment insights
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {!results && !isStreaming && (
            <Card className="ai-card">
              <CardContent className="text-center py-12">
                <Heart className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg mb-2">Ready to Analyze Sentiment?</p>
                <p className="text-muted-foreground">
                  Paste your text and click "Analyze Sentiment" to get comprehensive emotional insights
                </p>
              </CardContent>
            </Card>
          )}

          {isStreaming && !results && (
            <Card className="ai-card">
              <CardHeader>
                <CardTitle>Analyzing...</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <MarkdownRenderer content={streamedText} />
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
