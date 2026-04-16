
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface AgentWorkspaceProps {
    files: Map<string, string>;
}

export const AgentWorkspace: React.FC<AgentWorkspaceProps> = ({ files }) => {
    const fileList = Array.from(files.keys());
    const [activeFile, setActiveFile] = React.useState<string>(fileList[0] || '');

    React.useEffect(() => {
        if (fileList.length > 0 && !activeFile) {
            setActiveFile(fileList[0]);
        }
    }, [fileList, activeFile]);

    return (
        <Card className="h-full flex flex-col">
            <CardHeader className="py-2">
                <CardTitle className="text-sm font-medium">Workspace</CardTitle>
            </CardHeader>
            <CardContent className="flex-1 p-0 overflow-hidden flex flex-col">
                {fileList.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">
                        No files generated.
                    </div>
                ) : (
                    <Tabs value={activeFile} onValueChange={setActiveFile} className="flex-1 flex flex-col h-full">
                        <div className="border-b px-2">
                            <TabsList className="bg-transparent h-auto p-0 flex flex-wrap justify-start gap-2">
                                {fileList.map(file => (
                                    <TabsTrigger
                                        key={file}
                                        value={file}
                                        className="data-[state=active]:bg-muted data-[state=active]:shadow-none border border-transparent data-[state=active]:border-border rounded-t-md rounded-b-none px-3 py-1.5 h-auto text-xs"
                                    >
                                        {file}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                        <div className="flex-1 overflow-hidden relative">
                            {fileList.map(file => (
                                <TabsContent key={file} value={file} className="m-0 h-full absolute inset-0">
                                    <ScrollArea className="h-full w-full">
                                        <SyntaxHighlighter
                                            language={file.endsWith('tsx') ? 'tsx' : 'typescript'}
                                            style={vscDarkPlus}
                                            customStyle={{ margin: 0, height: '100%', borderRadius: 0 }}
                                        >
                                            {files.get(file) || ''}
                                        </SyntaxHighlighter>
                                    </ScrollArea>
                                </TabsContent>
                            ))}
                        </div>
                    </Tabs>
                )}
            </CardContent>
        </Card>
    );
};
