import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileText, Download, Copy, Briefcase } from "lucide-react";
import { useGeminiStream } from "@/hooks/useGeminiStream";
import { systemPrompts } from "@/config/prompts";
import { useToast } from "@/hooks/use-toast";
import { MarkdownRenderer } from "@/components/MarkdownRenderer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import jsPDF from 'jspdf';

export default function ResumePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    position: "",
    experience: "",
    skills: "",
    education: "",
    coverLetterJob: "",
    coverLetterCompany: ""
  });
  const [resume, setResume] = useState("");
  const [coverLetter, setCoverLetter] = useState("");
  const [activeTab, setActiveTab] = useState<"resume" | "cover">("resume");
  const { toast } = useToast();
  const { generateStream, isStreaming, streamedText } = useGeminiStream();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const generateResume = async () => {
    if (!formData.name || !formData.position) {
      toast({
        title: "Missing Information",
        description: "Please fill in at least your name and desired position.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Create a professional resume for:
Name: ${formData.name}
Email: ${formData.email}
Phone: ${formData.phone}
Position: ${formData.position}
Experience: ${formData.experience}
Skills: ${formData.skills}
Education: ${formData.education}

Please format it professionally with clear sections.`;

      const response = await generateStream(systemPrompts.writer, prompt, undefined, undefined, 'resume');
      setResume(response.text);
      toast({
        title: "Resume Generated!",
        description: "Your professional resume is ready."
      });
    } catch (error: any) {
      toast({
        title: "Generation Failed",
        description: "Please try again.",
        variant: "destructive"
      });
    }
  };

  const generateCoverLetter = async () => {
    if (!formData.name || !formData.coverLetterJob || !formData.coverLetterCompany) {
      toast({
        title: "Missing Information",
        description: "Please fill in your name, job title, and company name.",
        variant: "destructive"
      });
      return;
    }

    try {
      const prompt = `Create a professional cover letter for:
Applicant: ${formData.name}
Job Position: ${formData.coverLetterJob}
Company: ${formData.coverLetterCompany}
Experience: ${formData.experience}
Skills: ${formData.skills}

Make it compelling and tailored to the position.`;

      const response = await generateStream(systemPrompts.email, prompt, undefined, undefined, 'resume');
      setCoverLetter(response.text);
      toast({
        title: "Cover Letter Generated!",
        description: "Your tailored cover letter is ready."
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

  const downloadAsPDF = (content: string, filename: string) => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 20;
      const maxWidth = pageWidth - 2 * margin;

      // Set font
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);

      // Split content into lines
      const lines = doc.splitTextToSize(content, maxWidth);

      let y = margin;
      const lineHeight = 5;

      for (let i = 0; i < lines.length; i++) {
        if (y + lineHeight > pageHeight - margin) {
          doc.addPage();
          y = margin;
        }
        doc.text(lines[i], margin, y);
        y += lineHeight;
      }

      doc.save(`${filename}.pdf`);
      toast({
        title: "Downloaded!",
        description: `${filename} has been downloaded as PDF.`
      });
    } catch (error: any) {
      toast({
        title: "Download Failed",
        description: error?.message || "Failed to generate PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Briefcase className="w-8 h-8 text-ai-primary" />
          <h1 className="text-3xl font-bold ai-gradient-text">AI Resume & Cover Letter Builder</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Create professional resumes and personalized cover letters with AI assistance
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Form */}
        <Card className="ai-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Personal Information
            </CardTitle>
            <CardDescription>
              Fill in your details to generate professional documents
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="john@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
              <div>
                <Label htmlFor="position">Desired Position *</Label>
                <Input
                  id="position"
                  value={formData.position}
                  onChange={(e) => handleInputChange("position", e.target.value)}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="experience">Work Experience</Label>
              <Textarea
                id="experience"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                placeholder="Describe your work experience, achievements, and responsibilities..."
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="skills">Skills</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="JavaScript, React, Node.js, Python, SQL..."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="education">Education</Label>
              <Textarea
                id="education"
                value={formData.education}
                onChange={(e) => handleInputChange("education", e.target.value)}
                placeholder="Degree, University, Graduation Year..."
                rows={2}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3">Cover Letter Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coverLetterJob">Job Title</Label>
                  <Input
                    id="coverLetterJob"
                    value={formData.coverLetterJob}
                    onChange={(e) => handleInputChange("coverLetterJob", e.target.value)}
                    placeholder="Senior Developer"
                  />
                </div>
                <div>
                  <Label htmlFor="coverLetterCompany">Company Name</Label>
                  <Input
                    id="coverLetterCompany"
                    value={formData.coverLetterCompany}
                    onChange={(e) => handleInputChange("coverLetterCompany", e.target.value)}
                    placeholder="Tech Corp"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Output Section */}
        <div className="space-y-4">
          {/* Tabs */}
          <div className="flex gap-2">
            <Button
              variant={activeTab === "resume" ? "default" : "outline"}
              onClick={() => setActiveTab("resume")}
            >
              Resume
            </Button>
            <Button
              variant={activeTab === "cover" ? "default" : "outline"}
              onClick={() => setActiveTab("cover")}
            >
              Cover Letter
            </Button>
          </div>

          {/* Generate Buttons */}
          <div className="flex gap-2">
            {activeTab === "resume" ? (
              <Button
                onClick={generateResume}
                disabled={isStreaming}
                className="flex-1"
              >
                {isStreaming ? "Generating..." : "Generate Resume"}
              </Button>
            ) : (
              <Button
                onClick={generateCoverLetter}
                disabled={isStreaming}
                className="flex-1"
              >
                {isStreaming ? "Generating..." : "Generate Cover Letter"}
              </Button>
            )}
          </div>

          {/* Output */}
          <Card className="ai-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>
                  {activeTab === "resume" ? "Generated Resume" : "Generated Cover Letter"}
                </CardTitle>
                {(activeTab === "resume" ? resume : coverLetter) && (
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(activeTab === "resume" ? resume : coverLetter)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadAsPDF(
                        activeTab === "resume" ? resume : coverLetter,
                        activeTab === "resume" ? "resume" : "cover-letter"
                      )}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {activeTab === "resume" ? (
                (isStreaming ? streamedText : resume) ? (
                  <Tabs defaultValue="preview" className="w-full">
                    <div className="flex justify-end mb-2">
                      <TabsList>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="preview" className="mt-0">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <MarkdownRenderer content={isStreaming ? streamedText : resume} />
                      </div>
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0">
                      <Textarea
                        value={isStreaming ? streamedText : resume}
                        onChange={(e) => setResume(e.target.value)}
                        className="min-h-[500px] resize-y font-mono text-sm"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Fill in your information and click "Generate Resume" to create your professional resume
                  </div>
                )
              ) : (
                (isStreaming ? streamedText : coverLetter) ? (
                  <Tabs defaultValue="preview" className="w-full">
                    <div className="flex justify-end mb-2">
                      <TabsList>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                        <TabsTrigger value="edit">Edit</TabsTrigger>
                      </TabsList>
                    </div>
                    <TabsContent value="preview" className="mt-0">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <MarkdownRenderer content={isStreaming ? streamedText : coverLetter} />
                      </div>
                    </TabsContent>
                    <TabsContent value="edit" className="mt-0">
                      <Textarea
                        value={isStreaming ? streamedText : coverLetter}
                        onChange={(e) => setCoverLetter(e.target.value)}
                        className="min-h-[500px] resize-y font-mono text-sm"
                        readOnly={isStreaming}
                      />
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Fill in the cover letter details and click "Generate Cover Letter" to create your personalized letter
                  </div>
                )
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
