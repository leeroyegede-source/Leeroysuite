"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PenTool, Copy, Download, Wand2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

const contentTypes = [
  { value: "blog", label: "Blog Post" },
  { value: "marketing", label: "Marketing Copy" },
  { value: "product", label: "Product Description" },
  { value: "social", label: "Social Media Post" },
  { value: "email", label: "Email Newsletter" },
  { value: "article", label: "Article" },
];

export default function WriterPage() {
  const [topic, setTopic] = useState("");
  const [contentType, setContentType] = useState("");
  const [keywords, setKeywords] = useState("");
  const [tone, setTone] = useState("");
  const [output, setOutput] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerate = async () => {
    if (!topic.trim() || !contentType) {
      toast({
        title: "Missing Information",
        description: "Please provide a topic and select a content type.",
        variant: "destructive",
      });
      return;
    }

    const prompt = `Create ${contentType} content about: ${topic}
${keywords ? `Keywords: ${keywords}` : ""}
${tone ? `Tone: ${tone}` : ""}

Make it engaging, SEO-friendly, and professional.`;

    try {
      // ✅ FIX: no response.error anymore
      const response = await generateStream(
        systemPrompts.writer,
        prompt,
        undefined,
        undefined,
        "writer"
      );

      setOutput(response.text);

      toast({
        title: "Success",
        description: "Content generated successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Generation failed",
        variant: "destructive",
      });
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
    toast({
      title: "Copied",
      description: "Content copied to clipboard",
    });
  };

  const downloadText = () => {
    const file = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(file);
    a.download = `${contentType || "content"}-${topic
      .replace(/\s+/g, "-")
      .toLowerCase()}.txt`;
    a.click();
  };

  return (
    <div className="p-6 h-full">
      <div className="mb-6 flex items-center gap-3">
        <PenTool className="w-6 h-6 text-ai-primary" />
        <h1 className="text-2xl font-bold">AI Content Writer</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100%-100px)]">
        {/* INPUT */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 /> Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />

            <Select value={contentType} onValueChange={setContentType}>
              <SelectTrigger>
                <SelectValue placeholder="Content Type" />
              </SelectTrigger>
              <SelectContent>
                {contentTypes.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              placeholder="Keywords (optional)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />

            <Select value={tone} onValueChange={setTone}>
              <SelectTrigger>
                <SelectValue placeholder="Tone (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="casual">Casual</SelectItem>
                <SelectItem value="friendly">Friendly</SelectItem>
                <SelectItem value="persuasive">Persuasive</SelectItem>
              </SelectContent>
            </Select>

            <Button onClick={handleGenerate} disabled={isStreaming}>
              {isStreaming ? "Generating..." : "Generate"}
            </Button>
          </CardContent>
        </Card>

        {/* OUTPUT */}
        <Card className="flex flex-col">
          <CardHeader>
            <CardTitle className="flex justify-between">
              Output
              {output && (
                <div className="flex gap-2">
                  <Button size="sm" onClick={copyToClipboard}>
                    <Copy />
                  </Button>
                  <Button size="sm" onClick={downloadText}>
                    <Download />
                  </Button>
                </div>
              )}
            </CardTitle>
          </CardHeader>

          <CardContent className="flex-1">
            <Tabs defaultValue="preview">
              <TabsList>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="edit">Edit</TabsTrigger>
              </TabsList>

              <TabsContent value="preview">
                <MarkdownRenderer
                  content={isStreaming ? streamedText : output}
                />
              </TabsContent>

              <TabsContent value="edit">
                <Textarea
                  value={isStreaming ? streamedText : output}
                  onChange={(e) => setOutput(e.target.value)}
                  className="h-[400px]"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}