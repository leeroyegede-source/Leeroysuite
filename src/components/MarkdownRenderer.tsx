import React from 'react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
    content: string;
    className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
    return (
        <div className={cn("prose prose-sm max-w-none dark:prose-invert", className)}>
            <ReactMarkdown
                components={{
                    p: ({ children }) => <p className="text-sm leading-relaxed mb-4 last:mb-0 text-foreground/90">{children}</p>,
                    code({ node, inline, className, children, ...props }: any) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                            <div className="rounded-lg overflow-hidden my-4 border border-border/50 shadow-sm">
                                <div className="bg-muted px-4 py-1 text-[10px] font-mono text-muted-foreground border-b border-border/50 flex justify-between items-center">
                                    <span>{match[1].toUpperCase()}</span>
                                </div>
                                <SyntaxHighlighter
                                    style={vscDarkPlus}
                                    language={match[1]}
                                    PreTag="div"
                                    customStyle={{
                                        margin: 0,
                                        padding: '1rem',
                                        fontSize: '0.8rem',
                                        background: 'transparent',
                                    }}
                                    {...props}
                                >
                                    {String(children).replace(/\n$/, '')}
                                </SyntaxHighlighter>
                            </div>
                        ) : (
                            <code className="bg-muted px-1.5 py-0.5 rounded text-[13px] font-mono text-primary border border-border/50" {...props}>
                                {children}
                            </code>
                        );
                    },
                    pre: ({ children }) => <div className="not-prose">{children}</div>,
                    ul: ({ children }) => <ul className="text-sm list-disc list-outside ml-4 space-y-2 mb-4">{children}</ul>,
                    ol: ({ children }) => <ol className="text-sm list-decimal list-outside ml-4 space-y-2 mb-4">{children}</ol>,
                    li: ({ children }) => <li className="pl-1 text-foreground/90">{children}</li>,
                    h1: ({ children }) => <h1 className="text-2xl font-bold mb-4 mt-6 text-foreground first:mt-0">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-xl font-semibold mb-3 mt-5 text-foreground/90">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-lg font-medium mb-2 mt-4 text-foreground/80">{children}</h3>,
                    blockquote: ({ children }) => (
                        <blockquote className="border-l-4 border-primary/30 pl-4 py-1 my-4 italic text-muted-foreground bg-muted/30 rounded-r-lg">
                            {children}
                        </blockquote>
                    ),
                    hr: () => <hr className="my-6 border-border/50" />,
                    table: ({ children }) => (
                        <div className="overflow-x-auto my-4 rounded-lg border border-border/50">
                            <table className="w-full text-sm text-left border-collapse">
                                {children}
                            </table>
                        </div>
                    ),
                    thead: ({ children }) => <thead className="bg-muted/50 text-muted-foreground uppercase text-[10px] font-bold">{children}</thead>,
                    th: ({ children }) => <th className="px-4 py-2 border-b border-border/50">{children}</th>,
                    td: ({ children }) => <td className="px-4 py-2 border-b border-border/50">{children}</td>,
                }}
            >
                {content}
            </ReactMarkdown>
        </div>
    );
}
