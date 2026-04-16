import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FileText, Users, Calendar, Clock, CheckSquare, Copy } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

const meetingTypes = [
  "Team Standup", "Project Review", "Client Meeting", "Board Meeting",
  "One-on-One", "Brainstorming", "Strategy Session", "Training Session"
];

const outputFormats = [
  "Executive Summary", "Detailed Notes", "Action Items Focus", "Decision Log"
];

export default function MeetingNotesPage() {
  const [formData, setFormData] = useState({
    meetingTitle: "",
    meetingType: "",
    participants: "",
    date: "",
    duration: "",
    transcript: "",
    outputFormat: ""
  });
  const [results, setResults] = useState({
    summary: "",
    actionItems: "",
    keyDecisions: "",
    nextSteps: ""
  });

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateNotes = async () => {
    if (!formData.transcript.trim()) {
      toast({
        title: "Missing Transcript",
        description: "Please provide the meeting transcript or notes.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Analyze this meeting transcript and create comprehensive meeting notes:

MEETING DETAILS:
- Title: ${formData.meetingTitle || "Meeting"}
- Type: ${formData.meetingType || "General Meeting"}
- Participants: ${formData.participants || "Not specified"}
- Date: ${formData.date || "Not specified"}
- Duration: ${formData.duration || "Not specified"}
- Output Format: ${formData.outputFormat || "Detailed Notes"}

TRANSCRIPT/NOTES:
${formData.transcript}

Please provide:
1. EXECUTIVE SUMMARY: Key highlights and outcomes
2. ACTION ITEMS: Specific tasks assigned with owners and deadlines
3. KEY DECISIONS: Important decisions made during the meeting
4. DISCUSSION POINTS: Main topics and conclusions
5. NEXT STEPS: Follow-up actions and next meeting plans

Format the output clearly with bullet points and organize by sections. Be concise but comprehensive.`;

      const response = await generateStream(systemPrompts.summarizer, prompt, undefined, undefined, 'meeting');

      // Simple parsing for better organization
      const text = response.text;
      const sections = text.split(/\d+\.\s*[A-Z\s]+:/);

      setResults({
        summary: sections[1] || text.substring(0, text.length / 4),
        actionItems: sections[2] || "",
        keyDecisions: sections[3] || "",
        nextSteps: sections[5] || ""
      });

      toast({
        title: "Meeting Notes Generated!",
        description: "Your structured meeting notes are ready."
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

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <FileText className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Meeting Notes Generator</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform meeting transcripts into structured, actionable notes with AI-powered analysis
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Meeting Information
            </CardTitle>
            <CardDescription>
              Provide meeting details and transcript for analysis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="meetingTitle">Meeting Title</Label>
              <Input
                id="meetingTitle"
                value={formData.meetingTitle}
                onChange={(e) => handleInputChange("meetingTitle", e.target.value)}
                placeholder="Weekly Team Standup"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="meetingType">Meeting Type</Label>
                <Select value={formData.meetingType} onValueChange={(value) => handleInputChange("meetingType", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {meetingTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="outputFormat">Output Format</Label>
                <Select value={formData.outputFormat} onValueChange={(value) => handleInputChange("outputFormat", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select format" />
                  </SelectTrigger>
                  <SelectContent>
                    {outputFormats.map((format) => (
                      <SelectItem key={format} value={format}>
                        {format}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="participants">Participants</Label>
              <Input
                id="participants"
                value={formData.participants}
                onChange={(e) => handleInputChange("participants", e.target.value)}
                placeholder="John Doe, Jane Smith, Alex Johnson"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date">Meeting Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleInputChange("date", e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  value={formData.duration}
                  onChange={(e) => handleInputChange("duration", e.target.value)}
                  placeholder="1 hour"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="transcript">Meeting Transcript/Notes *</Label>
              <Textarea
                id="transcript"
                value={formData.transcript}
                onChange={(e) => handleInputChange("transcript", e.target.value)}
                placeholder="Paste your meeting transcript, audio transcription, or rough notes here..."
                rows={12}
                className="min-h-[300px]"
              />
            </div>

            <Button
              onClick={generateNotes}
              disabled={isStreaming}
              className="w-full"
            >
              {isStreaming ? "Analyzing Meeting..." : "Generate Meeting Notes"}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          <Tabs defaultValue="summary" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="summary">Summary</TabsTrigger>
              <TabsTrigger value="actions">Actions</TabsTrigger>
              <TabsTrigger value="decisions">Decisions</TabsTrigger>
              <TabsTrigger value="next">Next Steps</TabsTrigger>
            </TabsList>

            <TabsContent value="summary">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Executive Summary
                    </CardTitle>
                    {results.summary && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.summary)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {(isStreaming ? streamedText : results.summary) ? (
                    <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                      <div className="flex justify-end mb-2">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="preview" className="mt-0">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <MarkdownRenderer content={isStreaming ? streamedText : results.summary} />
                        </div>
                      </TabsContent>
                      <TabsContent value="edit" className="mt-0">
                        <Textarea
                          value={isStreaming ? streamedText : results.summary}
                          onChange={(e) => setResults(prev => ({ ...prev, summary: e.target.value }))}
                          className="min-h-[300px] resize-y"
                          readOnly={isStreaming}
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Provide meeting transcript to generate executive summary
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="actions">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <CheckSquare className="w-5 h-5" />
                      Action Items
                    </CardTitle>
                    {results.actionItems && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.actionItems)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {results.actionItems ? (
                    <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                      <div className="flex justify-end mb-2">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="preview" className="mt-0">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <MarkdownRenderer content={results.actionItems} />
                        </div>
                      </TabsContent>
                      <TabsContent value="edit" className="mt-0">
                        <Textarea
                          value={results.actionItems}
                          onChange={(e) => setResults(prev => ({ ...prev, actionItems: e.target.value }))}
                          className="min-h-[300px] resize-y"
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate notes to extract action items and assignments
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="decisions">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Key Decisions
                    </CardTitle>
                    {results.keyDecisions && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.keyDecisions)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {results.keyDecisions ? (
                    <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                      <div className="flex justify-end mb-2">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="preview" className="mt-0">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <MarkdownRenderer content={results.keyDecisions} />
                        </div>
                      </TabsContent>
                      <TabsContent value="edit" className="mt-0">
                        <Textarea
                          value={results.keyDecisions}
                          onChange={(e) => setResults(prev => ({ ...prev, keyDecisions: e.target.value }))}
                          className="min-h-[300px] resize-y"
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate notes to identify key decisions made
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="next">
              <Card className="ai-card">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      Next Steps
                    </CardTitle>
                    {results.nextSteps && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(results.nextSteps)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col">
                  {results.nextSteps ? (
                    <Tabs defaultValue="preview" className="flex-1 flex flex-col">
                      <div className="flex justify-end mb-2">
                        <TabsList>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                        </TabsList>
                      </div>
                      <TabsContent value="preview" className="mt-0">
                        <div className="bg-muted/30 p-4 rounded-lg">
                          <MarkdownRenderer content={results.nextSteps} />
                        </div>
                      </TabsContent>
                      <TabsContent value="edit" className="mt-0">
                        <Textarea
                          value={results.nextSteps}
                          onChange={(e) => setResults(prev => ({ ...prev, nextSteps: e.target.value }))}
                          className="min-h-[300px] resize-y"
                        />
                      </TabsContent>
                    </Tabs>
                  ) : (
                    <div className="text-center text-muted-foreground py-8">
                      Generate notes to plan follow-up actions and next meetings
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Meeting Info Display */}
          {(formData.meetingTitle || formData.participants) && (
            <Card className="ai-card">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {formData.meetingTitle && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{formData.meetingTitle}</span>
                    </div>
                  )}
                  {formData.participants && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formData.participants}</span>
                    </div>
                  )}
                  {formData.duration && (
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm">{formData.duration}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
