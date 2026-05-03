"use client";

import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

export function DatePicker({
  value,
  onChange,
}: {
  value: Date | undefined;
  onChange: (d: Date | undefined) => void;
}) {
  return (
    <Popover>
      <PopoverTrigger
        className={cn(
          "h-12 w-full inline-flex items-center justify-start gap-2 px-3 rounded-lg border border-input bg-background text-base hover:bg-muted transition",
          !value && "text-muted-foreground"
        )}
      >
        <CalendarIcon className="h-4 w-4" />
        {value ? format(value, "MMMM d, yyyy") : "Pick your birthday"}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value}
          onSelect={onChange}
          captionLayout="dropdown"
          startMonth={new Date(1900, 0)}
          endMonth={new Date()}
          disabled={(d) => d > new Date()}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  );
}
