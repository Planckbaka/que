import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex w-fit items-center rounded-none px-2 py-0.5 font-machine text-[11px] font-bold uppercase tracking-[0.2em]",
  {
    variants: {
      variant: {
        evidence: "relative border-2 border-ink bg-paper pr-2.5 pl-4 text-ink",
        stamp: "border-2 border-ink bg-stamp text-paper",
        ghost: "border border-line bg-transparent text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "stamp",
    },
  },
);

type BadgeProps = React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

function Badge({ className, variant, children, ...props }: BadgeProps) {
  return (
    <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props}>
      {variant === "evidence" && (
        <span
          aria-hidden="true"
          className="absolute top-1/2 left-1 size-1.5 -translate-y-1/2 rounded-full border border-ink bg-background"
        />
      )}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
