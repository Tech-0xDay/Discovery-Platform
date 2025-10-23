import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-auto w-full rounded-lg border-2 border-black bg-background px-4 py-3.5 text-base font-medium shadow-[2.5px_3px_0_#000] outline-none transition-all duration-250 ease-in-out placeholder:text-muted-foreground focus:shadow-[5.5px_7px_0_#000] disabled:cursor-not-allowed disabled:opacity-50 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
