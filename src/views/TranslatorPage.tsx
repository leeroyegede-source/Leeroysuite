import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Languages, ArrowRightLeft, Copy, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const languages = [
  { code: "en", name: "English" },
  { code: "es", name: "Spanish" },
  { code: "fr", name: "French" },
  { code: "de", name: "German" },
  { code: "it", name: "Italian" },
  { code: "pt", name: "Portuguese" },
  { code: "ru", name: "Russian" },
  { code: "ja", name: "Japanese" },
  { code: "ko", name: "Korean" },
  { code: "zh", name: "Chinese" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "nl", name: "Dutch" },
  { code: "sv", name: "Swedish" },
  { code: "no", name: "Norwegian" }
];

export default function TranslatorPage() {
  const [sourceText, setSourceText] = useState("");
  const [translatedText, setTranslatedText] = useState("");
  const [sourceLang, setSourceLang] = useState("");
  const [targetLang, setTargetLang] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleTranslate = async () => {
    if (!sourceText.trim()) {
      toast({
        title: "Error",
        description: "Please enter text to translate.",
        variant: "destructive"
      });
      return;
    }

    if (!targetLang) {
      toast({
        title: "Error",
        description: "Please select a target language.",
        variant: "destructive"
      });
      return;
    }

    const targetLanguage = languages.find(l => l.code === targetLang)?.name;
    const sourceLanguage = languages.find(l => l.code === sourceLang)?.name || "Auto-detect";

    try {
      const prompt = `Translate the following text from ${sourceLanguage} to ${targetLanguage}. Provide only the translation, maintaining the original meaning and tone:

"${sourceText}"`;

      const response = await generateStream("You are a professional translator. Provide accurate, natural-sounding translations that preserve the original meaning and tone.", prompt);
      setTranslatedText(response.text);

    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message || "Failed to translate text. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSwapLanguages = () => {
    if (sourceLang && targetLang) {
      setSourceLang(targetLang);
      setTargetLang(sourceLang);
      setSourceText(translatedText);
      setTranslatedText(sourceText);
    }
  };

  const handleCopyTranslation = () => {
    if (translatedText) {
      navigator.clipboard.writeText(translatedText);
      toast({
        title: "Copied",
        description: "Translation copied to clipboard.",
      });
    }
  };

  const exampleTexts = [
    "Hello, how are you today?",
    "Thank you for your help and support.",
    "I would like to schedule a meeting for next week."
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">AI Translation Tool</h1>
        <p className="text-muted-foreground mt-2">
          Translate text between multiple languages with high accuracy and natural language processing.
        </p>
      </div>

      {/* Language Selection */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Languages className="w-5 h-5 text-ai-primary" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">From (Optional)</label>
              <Select value={sourceLang} onValueChange={setSourceLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-detect" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={handleSwapLanguages}
              disabled={!sourceLang || !targetLang}
              className="mt-6"
            >
              <ArrowRightLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1 space-y-2">
              <label className="text-sm font-medium">To *</label>
              <Select value={targetLang} onValueChange={setTargetLang}>
                <SelectTrigger>
                  <SelectValue placeholder="Select language" />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages className="w-5 h-5 text-ai-primary" />
              Original Text
            </CardTitle>
            <CardDescription>
              Enter the text you want to translate.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Enter text to translate..."
              value={sourceText}
              onChange={(e) => setSourceText(e.target.value)}
              className="min-h-[200px] resize-none"
            />

            <div className="space-y-2">
              <p className="text-sm font-medium">Quick examples:</p>
              <div className="space-y-1">
                {exampleTexts.map((example, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    className="w-full text-left justify-start text-xs h-auto p-2"
                    onClick={() => setSourceText(example)}
                  >
                    {example}
                  </Button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleTranslate}
              disabled={isStreaming || !sourceText.trim() || !targetLang}
              className="w-full"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Translating...
                </>
              ) : (
                <>
                  <Languages className="w-4 h-4 mr-2" />
                  Translate
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card className="ai-card flex flex-col h-full">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Languages className="w-5 h-5 text-ai-secondary" />
                Translation
              </div>
            </CardTitle>
            <CardDescription>
              Your translated text will appear here.
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

              <div className="flex-1 min-h-[300px] border rounded-md p-4 bg-background overflow-auto">
                {(isStreaming ? streamedText : translatedText) ? (
                  <>
                    <TabsContent value="preview" className="mt-0 h-full">
                      <MarkdownRenderer content={isStreaming ? streamedText : translatedText} />
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0 h-full">
                      <div className="space-y-4 h-full flex flex-col">
                        <Textarea
                          value={isStreaming ? streamedText : translatedText}
                          onChange={(e) => setTranslatedText(e.target.value)}
                          className="flex-1 resize-none border-0 focus-visible:ring-0 p-0"
                          readOnly={isStreaming}
                        />
                        {!isStreaming && (
                          <Button
                            onClick={handleCopyTranslation}
                            variant="outline"
                            className="w-full shrink-0"
                          >
                            <Copy className="w-4 h-4 mr-2" />
                            Copy Translation
                          </Button>
                        )}
                      </div>
                    </TabsContent>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-muted-foreground">
                    <div className="text-center">
                      <Languages className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Your translation will appear here</p>
                    </div>
                  </div>
                )}
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Supported Languages */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>Supported Languages</CardTitle>
          <CardDescription>
            We support translation between {languages.length} languages
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
            {languages.map((lang) => (
              <div key={lang.code} className="text-center p-2 bg-muted/20 rounded">
                <span className="text-sm font-medium">{lang.name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
