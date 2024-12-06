import React from "react";
import clsx from "clsx";
import dayjs from "dayjs";

interface DateTimeInputProps {
  value?: Date | null;
  onChange?: (date: Date | null) => void;
  max?: Date | null;
  min?: Date | null;
  className?: string | null;
  placeholder?: string;
  required?: boolean;
}

export function DateTimeInput({
  value,
  onChange,
  max,
  min,
  className,
  placeholder,
  required,
}: DateTimeInputProps) {
  const formatForInput = (date?: Date | null) => {
    if (!date) return "";
    try {
      return dayjs(date).format("YYYY-MM-DDTHH:mm");
    } catch {
      return ""; // Handle invalid date objects gracefully
    }
  };

  const _onChange = (dateString?: string) => {
    if (!onChange) return;
    if (!dateString) {
      onChange(null);
      return;
    }
    try {
      onChange(new Date(dateString));
    } catch {
      // Handle invalid date strings gracefully
      onChange(null);
    }
  };

  return (
    <input
      type="datetime-local"
      className={clsx(
        "w-full rounded-md border border-gray-300 p-2",
        className,
      )}
      value={formatForInput(value)}
      onChange={(e) => _onChange(e.target.value)}
      max={formatForInput(max)}
      min={formatForInput(min)}
      placeholder={placeholder}
      required={required}
    />
  );
}
