"use client";

import type { Release } from "@repo/backend/types";
import {
  Calendar,
  type DateRange,
} from "@repo/design-system/components/precomposed/calendar";
import { Button } from "@repo/design-system/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@repo/design-system/components/ui/popover";
import { handleError } from "@repo/design-system/lib/handle-error";
import { cn } from "@repo/design-system/lib/utils";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { updateRelease } from "@/actions/release/update";

type ReleaseDatePickerProps = {
  releaseId: Release["id"];
  defaultStartAt: Release["startAt"] | null;
  defaultEndAt: Release["endAt"] | null;
  disabled?: boolean;
};

export const ReleaseDatePicker = ({
  releaseId,
  defaultStartAt,
  defaultEndAt,
  disabled,
}: ReleaseDatePickerProps) => {
  const [date, setDate] = useState<DateRange | undefined>({
    from: defaultStartAt ? new Date(defaultStartAt) : undefined,
    to: defaultEndAt ? new Date(defaultEndAt) : undefined,
  });

  const handleDateChange = async (nextDate: DateRange | undefined) => {
    setDate(nextDate);

    try {
      const response = await updateRelease(releaseId, {
        startAt: nextDate?.from ? nextDate.from.toISOString() : null,
        endAt: nextDate?.to ? nextDate.to.toISOString() : null,
      });

      if (response.error) {
        throw new Error(response.error);
      }
    } catch (error) {
      handleError(error);
    }
  };

  let dateLabel: ReactNode = <span>Pick a date</span>;

  if (date?.from) {
    if (date.to) {
      dateLabel = (
        <>
          {format(date.from, "LLL dd, y")} to {format(date.to, "LLL dd, y")}
        </>
      );
    } else {
      dateLabel = format(date.from, "LLL dd, y");
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          className={cn(
            "flex w-full items-center justify-start gap-2 text-left font-normal",
            !date && "text-muted-foreground"
          )}
          disabled={disabled}
          id="date"
          variant="outline"
        >
          <CalendarIcon size={16} />
          {dateLabel}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto p-0"
        collisionPadding={12}
      >
        <Calendar
          defaultMonth={date?.from}
          initialFocus
          mode="range"
          numberOfMonths={2}
          onSelect={handleDateChange}
          selected={date}
        />
      </PopoverContent>
    </Popover>
  );
};
