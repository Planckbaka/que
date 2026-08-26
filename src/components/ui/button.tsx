import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-none border-2 font-machine text-sm font-bold uppercase tracking-[0.18em] transition-all duration-150 ease-print disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        stamp:
          "border-ink bg-stamp text-paper shadow-print hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-print-lg active:translate-y-0.5 active:shadow-print-sm",
        ink: "border-ink bg-ink text-paper shadow-print hover:-translate-y-0.5 hover:shadow-print-lg active:translate-y-0.5 active:shadow-print-sm",
        outline:
          "border-line bg-transparent text-foreground hover:bg-foreground/10 active:translate-y-0.5",
        type: "h-auto border-0 p-0 tracking-[0.22em] underline decoration-2 underline-offset-4 hover:text-stamp",
      },
      size: {
        sm: "h-9 px-4 text-xs",
        default: "h-11 px-6",
        lg: "h-13 px-8 text-base",
        icon: "size-10",
      },
    },
    defaultVariants: {
      variant: "stamp",
      size: "default",
    },
  },
);

type ButtonProps = React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  };

function Button({ className, variant, size, asChild = false, ...props }: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
