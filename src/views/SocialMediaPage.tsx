import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Hash, Copy, Sparkles, Instagram, Twitter, Facebook, Linkedin } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const platforms = [
  { id: "instagram", name: "Instagram", icon: Instagram, color: "text-pink-500" },
  { id: "twitter", name: "Twitter/X", icon: Twitter, color: "text-blue-400" },
  { id: "facebook", name: "Facebook", icon: Facebook, color: "text-blue-600" },
  { id: "linkedin", name: "LinkedIn", icon: Linkedin, color: "text-blue-700" },
];

const contentTypes = [
  "Promotional",
  "Educational",
  "Inspirational",
  "Behind-the-scenes",
  "User-generated content",
  "Announcement",
  "Question/Poll",
  "Tips & Tricks"
];

const tones = [
  "Professional",
  "Casual",
  "Funny",
  "Inspiring",
  "Friendly",
  "Bold",
  "Minimalist",
  "Storytelling"
];

export default function SocialMediaPage() {
  const [formData, setFormData] = useState({
    platform: "",
    contentType: "",
    tone: "",
    topic: "",
    description: "",
    keywords: "",
    targetAudience: ""
  });
  const [results, setResults] = useState({
    caption: "",
    hashtags: [],
    tweetIdeas: []
  });

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateContent = async () => {
    if (!formData.platform || !formData.topic) {
      toast({
        title: "Missing Information",
        description: "Please select a platform and enter a topic.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Create social media content for ${formData.platform}:

Topic: ${formData.topic}
Content Type: ${formData.contentType}
Tone: ${formData.tone}
Description: ${formData.description}
Keywords: ${formData.keywords}
Target Audience: ${formData.targetAudience}

Please provide:
1. An engaging caption optimized for ${formData.platform}
2. Relevant hashtags (mix of popular and niche)
3. ${formData.platform === "twitter" ? "3 tweet variations" : "Alternative caption ideas"}

Make it engaging and platform-appropriate.`;

      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'social');

      // Parse response (simplified - in real app you'd have better parsing)
      const lines = response.text.split('\n');
      const captionStart = lines.findIndex(line => line.toLowerCase().includes('caption'));
      const hashtagStart = lines.findIndex(line => line.toLowerCase().includes('hashtag'));

      const caption = lines.slice(captionStart + 1, hashtagStart).join('\n').trim();
      const hashtagLines = lines.slice(hashtagStart + 1);
      const hashtags = hashtagLines.join(' ').match(/#\w+/g) || [];

      setResults({
        caption,
        hashtags: hashtags.slice(0, 15),
        tweetIdeas: formData.platform === "twitter" ? [caption] : []
      });

      toast({
        title: "Content Generated!",
        description: "Your social media content is ready."
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Content copied to clipboard."
    });
  };

  const selectedPlatform = platforms.find(p => p.id === formData.platform);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Hash className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Social Media Post Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Generate engaging captions, hashtags, and content ideas for all social media platforms
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Content Configuration
            </CardTitle>
            <CardDescription>
              Customize your social media content strategy
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="platform">Platform *</Label>
              <Select value={formData.platform} onValueChange={(value) => handleInputChange("platform", value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select social media platform" />
                </SelectTrigger>
                <SelectContent>
                  {platforms.map((platform) => (
                    <SelectItem key={platform.id} value={platform.id}>
                      <div className="flex items-center gap-2">
                        <platform.icon className={`w-4 h-4 ${platform.color}`} />
                        {platform.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contentType">Content Type</Label>
                <Select value={formData.contentType} onValueChange={(value) => handleInputChange("contentType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select content type" />
                  </SelectTrigger>
                  <SelectContent>
                    {contentTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="tone">Tone</Label>
                <Select value={formData.tone} onValueChange={(value) => handleInputChange("tone", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select tone" />
                  </SelectTrigger>
                  <SelectContent>
                    {tones.map((tone) => (
                      <SelectItem key={tone} value={tone}>
                        {tone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="topic">Topic/Theme *</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange("topic", e.target.value)}
                placeholder="e.g., New product launch, Morning motivation, Weekend tips..."
              />
            </div>

            <div>
              <Label htmlFor="description">Content Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                placeholder="Describe what you want to share, key points to highlight..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="keywords">Keywords</Label>
              <Input
                id="keywords"
                value={formData.keywords}
                onChange={(e) => handleInputChange("keywords", e.target.value)}
                placeholder="productivity, motivation, business, startup..."
              />
            </div>

            <div>
              <Label htmlFor="targetAudience">Target Audience</Label>
              <Input
                id="targetAudience"
                value={formData.targetAudience}
                onChange={(e) => handleInputChange("targetAudience", e.target.value)}
                placeholder="entrepreneurs, students, professionals, creators..."
              />
            </div>

            <Button
              onClick={generateContent}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Generating Content..." : "Generate Social Media Content"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {selectedPlatform && (
            <Card className="ai-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedPlatform.icon className={`w-5 h-5 ${selectedPlatform.color}`} />
                  {selectedPlatform.name} Content
                </CardTitle>
              </CardHeader>
            </Card>
          )}

          <Tabs defaultValue="caption" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="caption">Caption</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              <TabsTrigger value="ideas">Ideas</TabsTrigger>
            </TabsList>

            <TabsContent value="caption">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Generated Caption</CardTitle>
                    {results.caption && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.caption)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {(isStreaming ? streamedText : results.caption) ? (
                    <div className="bg-muted/30 p-4 rounded-lg">
                      <MarkdownRenderer content={isStreaming ? streamedText : results.caption} />
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Configure your content settings and click "Generate" to create an engaging caption
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="hashtags">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Suggested Hashtags</CardTitle>
                    {results.hashtags.length > 0 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.hashtags.join(" "))}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {results.hashtags.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {results.hashtags.map((hashtag, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-ai-primary/20"
                          onClick={() => copyToClipboard(hashtag)}
                        >
                          {hashtag}
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate content to get relevant hashtags for your post
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="ideas">
              <Card className="ai-card">
                <CardHeader>
                  <CardTitle>Content Variations</CardTitle>
                </CardHeader>
                <CardContent>
                  {results.tweetIdeas.length > 0 ? (
                    <div className="space-y-4">
                      {results.tweetIdeas.map((idea, index) => (
                        <div
                          key={index}
                          className="bg-muted/30 p-4 rounded-lg cursor-pointer hover:bg-muted/40 transition-colors"
                          onClick={() => copyToClipboard(idea)}
                        >
                          <p className="whitespace-pre-wrap">{idea}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate content to get alternative ideas and variations
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
