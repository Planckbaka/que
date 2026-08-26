import { cn } from "@/lib/utils";

type InputProps = React.ComponentProps<"input">;

function Input({ className, type, ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 w-full min-w-0 rounded-none border-0 border-b-2 border-input bg-transparent px-1 py-1 text-lg text-foreground transition-colors duration-150 caret-stamp outline-none placeholder:font-machine placeholder:text-xs placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-muted-foreground focus-visible:border-stamp disabled:opacity-45",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
