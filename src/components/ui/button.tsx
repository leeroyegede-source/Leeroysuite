import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
    {
        variants: {
            variant: {
                default:
                    "bg-primary text-primary-foreground shadow-sm shadow-primary/20 hover:bg-primary/90 hover:shadow-md hover:shadow-primary/25 active:scale-[0.98]",
                destructive:
                    "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:scale-[0.98]",
                outline:
                    "border border-input bg-background hover:bg-accent hover:text-accent-foreground active:scale-[0.98]",
                secondary:
                    "bg-secondary text-secondary-foreground hover:bg-secondary/80 active:scale-[0.98]",
                ghost:
                    "hover:bg-accent hover:text-accent-foreground",
                link:
                    "text-primary underline-offset-4 hover:underline",
                premium:
                    "relative bg-gradient-to-r from-primary to-ai-secondary text-white shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98] overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-primary/80 before:to-ai-secondary/80 before:opacity-0 before:transition-opacity hover:before:opacity-100 [&>*]:relative [&>*]:z-10",
                glass:
                    "bg-white/10 backdrop-blur-md border border-white/20 text-foreground hover:bg-white/20",
                success:
                    "bg-success text-success-foreground shadow-sm shadow-success/20 hover:bg-success/90 active:scale-[0.98]",
                soft:
                    "bg-primary/10 text-primary hover:bg-primary/15 active:scale-[0.98]",
                white:
                    "bg-white text-gray-900 shadow-sm hover:bg-gray-50 active:scale-[0.98]",
                dark:
                    "bg-gray-900 text-white hover:bg-gray-800 active:scale-[0.98]",
                glow:
                    "bg-primary text-primary-foreground shadow-lg shadow-primary/40 hover:shadow-xl hover:shadow-primary/50 active:scale-[0.98] relative before:absolute before:inset-0 before:rounded-xl before:bg-primary before:blur-lg before:opacity-50 before:-z-10",
            },
            size: {
                default: "h-10 px-5 py-2",
                sm: "h-8 rounded-lg px-3.5 text-xs",
                lg: "h-12 rounded-xl px-8 text-base",
                xl: "h-14 rounded-xl px-10 text-base font-semibold",
                icon: "h-10 w-10 rounded-lg",
                "icon-sm": "h-8 w-8 rounded-lg",
                "icon-lg": "h-12 w-12 rounded-xl",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
    asChild?: boolean;
    loading?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant, size, asChild = false, loading, children, disabled, ...props }, ref) => {
        const Comp = asChild ? Slot : "button";
        return (
            <Comp
                className={cn(buttonVariants({ variant, size, className }))}
                ref={ref}
                disabled={disabled || loading}
                {...props}
            >
                {loading ? (
                    <>
                        <Loader2 className="animate-spin" />
                        <span className="sr-only">Loading...</span>
                    </>
                ) : (
                    children
                )}
            </Comp>
        );
    }
);
Button.displayName = "Button";

export { Button, buttonVariants };
