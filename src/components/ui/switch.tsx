"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <div className="inline-flex h-[2.75rem] w-[2.75rem] items-center justify-center">
      <SwitchPrimitive.Root
        data-slot="switch"
        className={cn(
          "group peer relative inline-flex h-full w-full shrink-0 items-center justify-center rounded-full border border-transparent bg-transparent transition-all outline-none focus-visible:ring-[3px] disabled:cursor-not-allowed disabled:opacity-50",
          "focus-visible:border-ring focus-visible:ring-ring/50",
          className
        )}
        {...props}
      >
        <span
          className={cn(
            "pointer-events-none absolute left-1/2 top-1/2 block h-6 w-11 -translate-x-1/2 -translate-y-1/2 rounded-full bg-input shadow-xs transition-colors group-data-[state=checked]:bg-primary dark:group-data-[state=unchecked]:bg-input/80"
          )}
        />
        <SwitchPrimitive.Thumb
          data-slot="switch-thumb"
          className={cn(
            "bg-background dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground pointer-events-none absolute left-[2px] top-1/2 block size-5 -translate-y-1/2 rounded-full ring-0 transition-transform data-[state=checked]:translate-x-full data-[state=unchecked]:translate-x-0"
          )}
        />
      </SwitchPrimitive.Root>
    </div>
  )
}

export { Switch }
