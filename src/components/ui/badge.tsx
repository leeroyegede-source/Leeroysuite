import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
    "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
    {
        variants: {
            variant: {
                // Default primary badge
                default:
                    "border-transparent bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",

                // Secondary/muted badge
                secondary:
                    "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",

                // Destructive/error badge
                destructive:
                    "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/90",

                // Outline badge
                outline: "text-foreground border-border hover:bg-muted",

                // Success badge
                success:
                    "border-transparent bg-success text-success-foreground hover:bg-success/90",

                // Warning badge
                warning:
                    "border-transparent bg-warning text-warning-foreground hover:bg-warning/90",

                // Info badge
                info: "border-transparent bg-info text-info-foreground hover:bg-info/90",

                // Premium gradient badge
                premium:
                    "border-0 bg-gradient-to-r from-primary to-ai-secondary text-white shadow-md hover:shadow-lg",

                // New feature badge
                new: "border-0 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-sm",

                // Pro badge
                pro: "border-0 bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-sm",

                // Glass badge
                glass:
                    "border-white/20 bg-white/10 backdrop-blur-md text-foreground hover:bg-white/20",

                // Soft badges
                "soft-primary":
                    "border-transparent bg-primary/10 text-primary hover:bg-primary/20",
                "soft-success":
                    "border-transparent bg-success/10 text-success hover:bg-success/20",
                "soft-warning":
                    "border-transparent bg-warning/10 text-warning hover:bg-warning/20",
                "soft-destructive":
                    "border-transparent bg-destructive/10 text-destructive hover:bg-destructive/20",
                "soft-info":
                    "border-transparent bg-info/10 text-info hover:bg-info/20",
            },
            size: {
                default: "px-2.5 py-0.5 text-xs",
                sm: "px-2 py-0.5 text-[10px]",
                lg: "px-3 py-1 text-sm",
            },
        },
        defaultVariants: {
            variant: "default",
            size: "default",
        },
    }
);

export interface BadgeProps
    extends React.HTMLAttributes<HTMLDivElement>,
        VariantProps<typeof badgeVariants> {
    dot?: boolean;
    pulse?: boolean;
}

function Badge({
    className,
    variant,
    size,
    dot = false,
    pulse = false,
    children,
    ...props
}: BadgeProps) {
    return (
        <div className={cn(badgeVariants({ variant, size }), className)} {...props}>
            {dot && (
                <span className="relative mr-1.5">
                    <span
                        className={cn(
                            "w-1.5 h-1.5 rounded-full bg-current inline-block",
                            pulse && "animate-ping absolute"
                        )}
                    />
                    {pulse && (
                        <span className="w-1.5 h-1.5 rounded-full bg-current inline-block relative" />
                    )}
                </span>
            )}
            {children}
        </div>
    );
}

export { Badge, badgeVariants };
