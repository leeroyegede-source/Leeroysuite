"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Code, Copy, Download, Terminal } from "lucide-react";
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

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "csharp", label: "C#" },
  { value: "cpp", label: "C++" },
  { value: "php", label: "PHP" },
  { value: "go", label: "Go" },
  { value: "rust", label: "Rust" },
  { value: "sql", label: "SQL" },
];

const taskTypes = [
  { value: "generate", label: "Generate Code" },
  { value: "debug", label: "Debug Code" },
  { value: "explain", label: "Explain Code" },
  { value: "optimize", label: "Optimize Code" },
  { value: "convert", label: "Convert Language" },
];

export default function CodePage() {
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [taskType, setTaskType] = useState("");
  const [existingCode, setExistingCode] = useState("");
  const [output, setOutput] = useState("");

  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleGenerate = async () => {
    if (!description.trim() || !language || !taskType) {
      toast({
        title: "Missing Information",
        description:
          "Please provide a description, select a language and task type.",
        variant: "destructive",
      });
      return;
    }

    try {
      let prompt = "";

      switch (taskType) {
        case "generate":
          prompt = `Generate ${language} code for: ${description}`;
          break;
        case "debug":
          prompt = `Debug this ${language} code and fix issues:\n${existingCode}\nProblem: ${description}`;
          break;
        case "explain":
          prompt = `Explain this ${language} code:\n${existingCode}\nFocus: ${description}`;
          break;
        case "optimize":
          prompt = `Optimize this ${language} code:\n${existingCode}\nGoals: ${description}`;
          break;
        case "convert":
          prompt = `Convert this code to ${language}:\n${existingCode}\nRequirements: ${description}`;
          break;
      }

      // ✅ FIX: no more response.error
      const response = await generateStream(
        systemPrompts.code,
        prompt,
        undefined,
        undefined,
        "code"
      );

      setOutput(response.text);

      toast({
        title: "Success",
        description: "Code generated successfully",
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
      description: "Code copied to clipboard",
    });
  };

  const downloadCode = () => {
    const extMap: Record<string, string> = {
      javascript: "js",
      typescript: "ts",
      python: "py",
      java: "java",
      csharp: "cs",
      cpp: "cpp",
      php: "php",
      go: "go",
      rust: "rs",
      sql: "sql",
    };

    const blob = new Blob([output], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `code.${extMap[language] || "txt"}`;
    a.click();
  };

  return (
    <div className="p-6 h-full">
      <div className="mb-6 flex items-center gap-3">
        <Code />
        <h1 className="text-2xl font-bold">AI Code Generator</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 h-[calc(100%-100px)]">
        {/* INPUT */}
        <Card>
          <CardHeader>
            <CardTitle>
              <Terminal /> Settings
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <Select value={taskType} onValueChange={setTaskType}>
              <SelectTrigger>
                <SelectValue placeholder="Task Type" />
              </SelectTrigger>
              <SelectContent>
                {taskTypes.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((l) => (
                  <SelectItem key={l.value} value={l.value}>
                    {l.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Textarea
              placeholder="Describe what you want..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />

            {(taskType !== "generate") && (
              <Textarea
                placeholder="Paste existing code..."
                value={existingCode}
                onChange={(e) => setExistingCode(e.target.value)}
              />
            )}

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
                  <Button size="sm" onClick={downloadCode}>
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
                  className="h-[400px] font-mono"
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}