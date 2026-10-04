import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-md text-[1.0625rem] font-medium tracking-tight transition-[background-color,transform,border-color,color] duration-[var(--dt-motion)] ease-out disabled:pointer-events-none disabled:opacity-50 min-h-14 px-8 active:not-disabled:scale-[0.96] border-[length:var(--dt-border-w)] border-transparent",
  {
    variants: {
      variant: {
        default: "bg-primary text-on-primary hover:bg-primary-hover",
        primary: "bg-primary text-on-primary hover:bg-primary-hover",
        outline:
          "border-rule bg-transparent text-fg hover:border-primary hover:text-primary",
        ghost: "text-fg hover:text-primary min-h-11 px-3",
        link: "text-patina underline-offset-4 hover:underline h-auto min-h-0 px-0 text-base",
      },
      size: {
        default: "min-h-14",
        sm: "min-h-11 px-5 text-base",
        lg: "min-h-14 px-10",
        icon: "size-11 min-h-11 p-0",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot : "button";
  return <Comp className={cn(buttonVariants({ variant, size, className }))} {...props} />;
}
