<script lang="ts">
  import clsx from "clsx";
  import dayjs from "dayjs";
  import type { HTMLAttributes } from "svelte/elements";

  interface DateTimeInputProps {
    value?: Date | null;
    max?: Date | null;
    min?: Date | null;
    className?: string | null;
    placeholder?: string;
    required?: boolean;
  }

  let {
    value = $bindable(),
    max,
    min,
    placeholder,
    required,
    class: className,
    ...props
  }: DateTimeInputProps & HTMLAttributes<HTMLInputElement> = $props();

  export const getValue = () => {
    return value;
  };

  const formatForInput = (date?: Date | null) => {
    if (!date) return "";
    try {
      return dayjs(date).format("YYYY-MM-DDTHH:mm");
    } catch {
      // Ignore invalid date
      console.warn("Invalid date", date);
    }
  };

  const handleChange = (dateString?: string) => {
    if (!dateString) {
      value = null;
      return;
    }
    try {
      const timestamp = Date.parse(dateString);
      if (!isNaN(timestamp)) {
        value = new Date(timestamp);
      }
    } catch {
      // Ignore invalid date string
      console.warn("Invalid date string", dateString);
    }
  };
</script>

<input
  type="datetime-local"
  class={clsx(
    "w-full rounded-md border border-gray-300 p-2 dark:border-gray-700 dark:bg-gray-800",
    className,
  )}
  value={formatForInput(value)}
  onchange={(e) => {
    handleChange(e.currentTarget.value);
  }}
  max={formatForInput(max)}
  min={formatForInput(min)}
  {placeholder}
  {required}
  {...props}
/>
