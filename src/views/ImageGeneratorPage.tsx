import { useState } from "react";
import { generateImageAction } from "@/actions/image-generator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Download, Image as ImageIcon, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

export default function ImageGeneratorPage() {
  const [prompt, setPrompt] = useState("");
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [numberOfImages, setNumberOfImages] = useState("1");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const { refreshUser } = useAuth();

  const generateImage = async () => {

    if (true) {
      toast({
        title: "Demo Mode",
        description: "In the demo, we are not accepting this request.",
        variant: "default",
      });
      return;
    }

    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt to generate an image.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    setGeneratedImage(null);

    try {
      // Call the Server Action
      const result = await generateImageAction(prompt, {
        numberOfImages: parseInt(numberOfImages),
        aspectRatio: aspectRatio,
      });

      if (result.error) {
        throw new Error(result.error);
      }

      if (result.image) {
        setGeneratedImage(result.image);
        await refreshUser(); // Update token balance UI

        toast({
          title: "Success",
          description: "Image generated successfully!",
        });
      } else {
        throw new Error("No image data received.");
      }

    } catch (error: any) {
      console.error("Image generation error:", error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate image.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };



  const downloadImage = () => {
    if (!generatedImage) return;

    const link = document.createElement('a');
    link.href = `data:image/jpeg;base64,${generatedImage}`;
    link.download = `generated-image-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Downloaded",
      description: "Image saved successfully!",
    });
  };

  return (
    <div className="container mx-auto p-4 lg:p-6 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">AI Image Generator</h1>
        <p className="text-muted-foreground">
          Create stunning images using AI-powered generation with Gemini
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-ai-primary" />
              Image Configuration
            </CardTitle>
            <CardDescription>
              Enter your prompt and select options to generate images
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="prompt">Prompt</Label>
              <Textarea
                id="prompt"
                placeholder="Describe the image you want to generate..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className="min-h-[120px]"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="aspectRatio">Aspect Ratio</Label>
              <Select value={aspectRatio} onValueChange={setAspectRatio}>
                <SelectTrigger id="aspectRatio">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1:1">1:1 (Square)</SelectItem>
                  <SelectItem value="3:4">3:4 (Portrait)</SelectItem>
                  <SelectItem value="4:3">4:3 (Landscape)</SelectItem>
                  <SelectItem value="9:16">9:16 (Tall)</SelectItem>
                  <SelectItem value="16:9">16:9 (Wide)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="numberOfImages">Number of Images</Label>
              <Select value={numberOfImages} onValueChange={setNumberOfImages}>
                <SelectTrigger id="numberOfImages">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Image</SelectItem>
                  <SelectItem value="2">2 Images</SelectItem>
                  <SelectItem value="3">3 Images</SelectItem>
                  <SelectItem value="4">4 Images</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button
              onClick={generateImage}
              disabled={isLoading || !prompt.trim()}
              className="w-full"
              size="lg"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Generate Image
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Output Section */}
        <Card>
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated image will appear here
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <div className="text-center space-y-3">
                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-ai-primary" />
                  <p className="text-sm text-muted-foreground">Generating your image...</p>
                </div>
              </div>
            ) : generatedImage ? (
              <div className="space-y-4">
                <div className="relative rounded-lg overflow-hidden bg-muted/30">
                  <img
                    src={`data:image/jpeg;base64,${generatedImage}`}
                    alt="Generated"
                    className="w-full h-auto"
                  />
                </div>
                <Button
                  onClick={downloadImage}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download Image
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[400px] bg-muted/30 rounded-lg">
                <div className="text-center space-y-2">
                  <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground/50" />
                  <p className="text-sm text-muted-foreground">
                    No image generated yet
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
