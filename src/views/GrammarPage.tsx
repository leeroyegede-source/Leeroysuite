import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Copy, Loader2, AlertCircle } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GrammarPage() {
  const [originalText, setOriginalText] = useState("");
  const [correctedText, setCorrectedText] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleCheckGrammar = async () => {
    if (!originalText.trim()) {
      toast({
        title: "Error",
        description: "Please enter some text to check.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Please improve this text by correcting grammar, spelling, and style while maintaining the original tone and meaning:

"${originalText}"

Please provide:
1. The corrected text
2. A list of specific improvements made

Format your response as:
CORRECTED TEXT:
[corrected version]

IMPROVEMENTS:
- [list of specific changes made]`;

      const response = await generateStream(systemPrompts.grammar, prompt, undefined, undefined, 'grammar');

      // Parse the response to extract corrected text and suggestions
      const sections = response.text.split('IMPROVEMENTS:');
      const corrected = sections[0]?.replace('CORRECTED TEXT:', '').trim() || response.text;
      const improvements = sections[1]?.split('\n').filter(line => line.trim()?.startsWith('-')).map(line => line.trim().substring(1).trim()) || [];

      setCorrectedText(corrected);
      setSuggestions(improvements);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to check grammar. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleCopyText = () => {
    if (correctedText) {
      navigator.clipboard.writeText(correctedText);
      toast({
        title: "Copied",
        description: "Corrected text copied to clipboard.",
      });
    }
  };

  const exampleTexts = [
    "I am writting this email to inform you about the meeting that will be held tommorrow at 10 AM.",
    "The team have been working hard on this project and they has made significant progress.",
    "Thank you for you're time and consideration. I look forward to hearing from you soon."
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">AI Grammar Check</h1>
        <p className="text-muted-foreground mt-2">
          Improve grammar, style, and readability of your text while maintaining your voice.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-ai-primary" />
              Original Text
            </CardTitle>
            <CardDescription>
              Paste your text below to check grammar and style.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter your text here..."
              value={originalText}
              onChange={(e) => setOriginalText(e.target.value)}
              className="min-h-[250px] resize-none"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Try these examples:</p>
              <div className="space-y-1">
                {exampleTexts.slice(0, 2).map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-auto p-2"
                    onClick={() => setOriginalText(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleCheckGrammar}
              disabled={isStreaming || !originalText.trim()}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Checking...
                </>
              ) : (
                <>
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Check Grammar
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckSquare className="w-5 h-5 text-ai-secondary" />
              Improved Text
            </CardTitle>
            <CardDescription>
              Your corrected text will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col">
            <Tabs defaultValue="preview" className="flex-1 flex flex-col">
              <div className="flex justify-end mb-2">
                <TabsList>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                  <TabsTrigger value="edit">Edit</TabsTrigger>
                </TabsList>
              </div>

              <div className="flex-1 min-h-[250px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : correctedText) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : correctedText} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <Textarea
                          value={isStreaming ? streamedText : correctedText}
                          onChange={(e) => setCorrectedText(e.target.value)}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-0"
                          readOnly={isStreaming}
                        />
                        {!isStreaming && (
                          <Button
                            onClick={handleCopyText}
                            variant="outline"
                            className="w-full shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Corrected Text
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <CheckSquare className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your improved text will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Suggestions Section */}
      {suggestions.length > 0 && (
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-ai-primary" />
              Improvements Made
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {suggestions.map((suggestion, index) => (
                <div key={index} className="flex items-start gap-2 p-2 bg-muted/30 rounded">
                  <CheckSquare className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  <span className="text-sm">{suggestion}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Features Section */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Grammar Check Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <CheckSquare className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">Grammar Correction</h3>
              <p className="text-sm text-muted-foreground">Fix grammar and spelling errors</p>
            </div>
            <div className="text-center p-4">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 text-ai-secondary" />
              <h3 className="font-semibold mb-1">Style Enhancement</h3>
              <p className="text-sm text-muted-foreground">Improve clarity and readability</p>
            </div>
            <div className="text-center p-4">
              <Copy className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">Voice Preservation</h3>
              <p className="text-sm text-muted-foreground">Maintain your original tone</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
