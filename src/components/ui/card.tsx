import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "flex flex-col rounded-none border-2 border-ink text-card-foreground shadow-print",
  {
    variants: {
      variant: {
        file: "bg-card",
        evidence: "relative bg-card",
        clipping: "bg-paper text-ink",
      },
    },
    defaultVariants: {
      variant: "file",
    },
  },
);

type CardProps = React.ComponentProps<"div"> & VariantProps<typeof cardVariants>;

function Card({ className, variant, children, ...props }: CardProps) {
  return (
    <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props}>
      {variant === "evidence" && (
        <span
          aria-hidden="true"
          className="absolute -top-[9px] left-8 z-10 size-4 rounded-full border-2 border-ink bg-background"
        />
      )}
      {children}
    </div>
  );
}

function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn("flex flex-col gap-1.5 p-6 pb-3", className)}
      {...props}
    />
  );
}

function CardTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      data-slot="card-title"
      className={cn("font-display text-xl uppercase leading-none tracking-wide", className)}
      {...props}
    />
  );
}

function CardDescription({ className, ...props }: React.ComponentProps<"p">) {
  return (
    <p
      data-slot="card-description"
      className={cn(
        "font-machine text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}

function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return <div data-slot="card-content" className={cn("p-6 pt-2", className)} {...props} />;
}

function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-auto flex items-center gap-3 px-6 pb-6", className)}
      {...props}
    />
  );
}

export { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle };
