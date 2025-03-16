<script lang="ts">
  import clsx from "clsx";
  import type { HTMLAttributes } from "svelte/elements";

  interface ToggleGroupProps {
    value?: string;
    options: {
      value: string;
      label: string;
    }[];
    onValueChange?: (newValue: string) => void;
  }

  let {
    value = $bindable(),
    options,
    onValueChange,
    class: className,
    ...props
  }: ToggleGroupProps & HTMLAttributes<HTMLDivElement> = $props();

  const handleValueChange = (newValue: string) => {
    value = newValue;
    onValueChange?.(newValue);
  };
</script>

<div class={clsx("flex", className)} {...props}>
  {#each options as option, index (index)}
    <button
      class={clsx(
        "grow cursor-pointer px-4 py-2 font-medium",
        value === option.value
          ? "bg-primary-300 text-primary-800 dark:bg-primary-800 dark:text-primary-300"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-600 dark:text-gray-300 dark:hover:bg-gray-500",
        { "rounded-l-md": index === 0 },
        { "rounded-r-md": index === options.length - 1 },
      )}
      onclick={() => handleValueChange(option.value)}
    >
      {option.label}
    </button>
  {/each}
</div>
