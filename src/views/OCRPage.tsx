import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Upload, Copy, Loader2 } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";

export default function OCRPage() {
  const [extractedText, setExtractedText] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const [selectedImage, setSelectedImage] = useState<string>("");
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type?.startsWith("image/")) {
      toast({
        title: "Error",
        description: "Please select a valid image file.",
        variant: "destructive",
      });
      return;
    }

    // Display image preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    try {
      // Convert file to base64 (strip "data:image/...;base64," prefix)
      const base64 = await fileToBase64(file);

      // Call Gemini API
      await generateStream(
        "You are an OCR assistant.",
        "Extract all text from this image clearly and accurately. Format the output in a readable way and note if any text is unclear or partially visible.",
        base64,
        undefined,
        "ocr"
      );

      // The streamedText will be updated by useGeminiStream, no need to set here.
      // The success toast might be premature as text streams in.
      // toast({
      //   title: "Success",
      //   description: "Text extraction started.",
      // });
    } catch (error: any) {
      console.error(error);
      toast({
        title: "Error",
        description: error?.message || "Failed to extract text from image. Please try again.",
        variant: "destructive",
      });
    }
  };


  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // remove the "data:image/...;base64," prefix
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleCopyText = () => {
    if (streamedText) {
      navigator.clipboard.writeText(streamedText);
      toast({
        title: "Copied",
        description: "Text copied to clipboard.",
      });
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold ai-gradient-text">AI OCR Tool</h1>
        <p className="text-muted-foreground mt-2">
          Extract text from images and documents with high accuracy using advanced OCR technology.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upload Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5 text-ai-primary" />
              Upload Image
            </CardTitle>
            <CardDescription>
              Select an image file to extract text from it.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />

            <Button
              onClick={() => fileInputRef.current?.click()}
              disabled={isStreaming}
              className="w-full h-32 border-2 border-dashed border-muted-foreground/25 hover:border-ai-primary/50"
              variant="outline"
            >
              {isStreaming ? (
                <>
                  <Loader2 className="w-8 h-8 mr-2 animate-spin" />
                  Processing Image...
                </>
              ) : (
                <div className="text-center">
                  <Image className="w-8 h-8 mx-auto mb-2" />
                  <p>Click to upload image</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Supports JPG, PNG, GIF, WebP
                  </p>
                </div>
              )}
            </Button>

            {selectedImage && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Preview:</Label>
                <div className="border rounded-lg overflow-hidden">
                  <img
                    src={selectedImage}
                    alt="Selected image"
                    className="w-full h-48 object-cover"
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Results Section */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Image className="w-5 h-5 text-ai-secondary" />
              Extracted Text
            </CardTitle>
            <CardDescription>
              Text extracted from your image will appear here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {streamedText ? (
              <div className="space-y-4">
                <div className="bg-background border p-4 rounded-lg min-h-[300px] max-h-[500px] overflow-auto shadow-inner">
                  <MarkdownRenderer content={streamedText} />
                  {isStreaming && (
                    <div className="flex gap-1 mt-2">
                      <div className="w-1.5 h-1.5 bg-ai-secondary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                      <div className="w-1.5 h-1.5 bg-ai-secondary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                      <div className="w-1.5 h-1.5 bg-ai-secondary rounded-full animate-bounce"></div>
                    </div>
                  )}
                </div>
                <Button
                  onClick={handleCopyText}
                  variant="outline"
                  className="w-full"
                >
                  <Copy className="w-4 h-4 mr-2" />
                  Copy Text
                </Button>
              </div>
            ) : (
              <div className="bg-muted/30 p-8 rounded-lg min-h-[300px] flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <Image className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>Upload an image to extract text</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card className="ai-card">
        <CardHeader>
          <CardTitle>OCR Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4">
              <Image className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">High Accuracy</h3>
              <p className="text-sm text-muted-foreground">Advanced AI for precise text recognition</p>
            </div>
            <div className="text-center p-4">
              <Upload className="w-8 h-8 mx-auto mb-2 text-ai-secondary" />
              <h3 className="font-semibold mb-1">Multiple Formats</h3>
              <p className="text-sm text-muted-foreground">Supports various image formats</p>
            </div>
            <div className="text-center p-4">
              <Copy className="w-8 h-8 mx-auto mb-2 text-ai-primary" />
              <h3 className="font-semibold mb-1">Easy Export</h3>
              <p className="text-sm text-muted-foreground">Copy text with one click</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}
