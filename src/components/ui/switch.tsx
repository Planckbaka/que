import * as SwitchPrimitive from "@radix-ui/react-switch";
import { cn } from "@/lib/utils";

function Switch({ className, ...props }: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer inline-flex h-8 w-16 shrink-0 cursor-pointer items-center rounded-none border-2 border-ink bg-paper transition-colors duration-150 ease-print data-[state=checked]:bg-ink disabled:cursor-not-allowed disabled:opacity-45",
        className,
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none relative ml-1 block size-6 overflow-hidden rounded-none border-2 border-ink transition-transform duration-200 ease-print data-[state=checked]:translate-x-7",
        )}
      >
        <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1/2 bg-stamp" />
        <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1/2 bg-paper" />
      </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
  );
}

export { Switch };
