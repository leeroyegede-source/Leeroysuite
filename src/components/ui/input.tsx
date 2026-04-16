import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const inputVariants = cva(
    "flex w-full rounded-xl border bg-background text-foreground transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
    {
        variants: {
            variant: {
                default:
                    "border-input focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                filled:
                    "bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
                ghost:
                    "border-transparent bg-transparent hover:bg-muted/50 focus:bg-muted/50 focus:ring-0",
                glass:
                    "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-white/30 dark:border-gray-700/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            },
            inputSize: {
                default: "h-11 px-4 py-2 text-sm",
                sm: "h-9 px-3 py-1.5 text-xs rounded-lg",
                lg: "h-12 px-5 py-3 text-base",
                xl: "h-14 px-6 py-4 text-lg rounded-2xl",
            },
        },
        defaultVariants: {
            variant: "default",
            inputSize: "default",
        },
    }
);

export interface InputProps
    extends Omit<React.ComponentProps<"input">, "size">,
        VariantProps<typeof inputVariants> {
    error?: boolean;
    icon?: React.ReactNode;
    iconPosition?: "left" | "right";
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    (
        {
            className,
            type,
            variant,
            inputSize,
            error = false,
            icon,
            iconPosition = "left",
            ...props
        },
        ref
    ) => {
        if (icon) {
            return (
                <div className="relative">
                    {iconPosition === "left" && (
                        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                    <input
                        type={type}
                        className={cn(
                            inputVariants({ variant, inputSize }),
                            error &&
                                "border-destructive focus:border-destructive focus:ring-destructive/20",
                            iconPosition === "left" && "pl-10",
                            iconPosition === "right" && "pr-10",
                            className
                        )}
                        ref={ref}
                        {...props}
                    />
                    {iconPosition === "right" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            {icon}
                        </div>
                    )}
                </div>
            );
        }

        return (
            <input
                type={type}
                className={cn(
                    inputVariants({ variant, inputSize }),
                    error &&
                        "border-destructive focus:border-destructive focus:ring-destructive/20",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";

// Search Input with icon
const SearchInput = React.forwardRef<
    HTMLInputElement,
    Omit<InputProps, "icon" | "iconPosition">
>(({ className, ...props }, ref) => (
    <div className="relative">
        <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
        >
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
        </svg>
        <Input ref={ref} className={cn("pl-10", className)} {...props} />
    </div>
));
SearchInput.displayName = "SearchInput";

// Textarea with similar styling
const textareaVariants = cva(
    "flex min-h-[100px] w-full rounded-xl border bg-background px-4 py-3 text-sm transition-all duration-200 placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50 resize-none",
    {
        variants: {
            variant: {
                default:
                    "border-input focus:border-primary focus:ring-2 focus:ring-primary/20 focus:outline-none",
                filled:
                    "bg-muted/50 border-transparent focus:bg-background focus:border-primary focus:ring-2 focus:ring-primary/20",
                glass:
                    "bg-white/50 dark:bg-gray-900/50 backdrop-blur-md border-white/30 dark:border-gray-700/50 focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            },
        },
        defaultVariants: {
            variant: "default",
        },
    }
);

export interface TextareaProps
    extends React.ComponentProps<"textarea">,
        VariantProps<typeof textareaVariants> {
    error?: boolean;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ className, variant, error = false, ...props }, ref) => {
        return (
            <textarea
                className={cn(
                    textareaVariants({ variant }),
                    error &&
                        "border-destructive focus:border-destructive focus:ring-destructive/20",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Textarea.displayName = "Textarea";

export { Input, SearchInput, Textarea, inputVariants, textareaVariants };
