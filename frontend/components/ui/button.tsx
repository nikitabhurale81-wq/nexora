import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "outline" | "ghost" | "gradient";
  size?: "default" | "sm" | "lg" | "icon";
  children: React.ReactNode;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          {
            // Variants
            "bg-card text-card-foreground hover:bg-muted": variant === "default",
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg": variant === "primary",
            "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg": variant === "secondary",
            "border border-border bg-transparent hover:bg-muted": variant === "outline",
            "hover:bg-muted hover:text-foreground": variant === "ghost",
            "gradient-primary text-white shadow-lg glow-primary hover:shadow-xl": variant === "gradient",
            
            // Sizes
            "h-10 px-4 py-2 text-sm": size === "default",
            "h-8 px-3 text-xs": size === "sm",
            "h-12 px-6 text-base": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button };
