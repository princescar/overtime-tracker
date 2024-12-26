<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import clsx from "clsx";
  import Spinner from "./spinner.svelte";
  import type { Snippet } from "svelte";

  interface ButtonProps {
    variant?: keyof typeof buttonVariants;
    loading?: boolean;
    disabled?: boolean;
    compact?: boolean;
    children: Snippet;
  }

  const baseButtonStyles =
    "px-4 py-2 rounded-md font-medium cursor-pointer flex items-center justify-center gap-2";
  const compactButtonStyles =
    "px-1 py-0.5 rounded-md text-sm cursor-pointer flex items-center justify-center gap-1";
  const buttonVariants = {
    default: "bg-emerald-700 text-white hover:bg-emerald-800 dark:hover:bg-emerald-600",
    light:
      "bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600",
    subtle:
      "text-gray-800 hover:bg-gray-200/50 dark:text-gray-300 dark:hover:text-gray-200 dark:hover:bg-gray-600/25",
    filled:
      "bg-emerald-100 text-emerald-900 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-700",
    danger:
      "text-red-700 hover:bg-red-100 hover:text-red-800 dark:hover:bg-red-100/10 dark:hover:text-red-500",
  };

  const {
    variant = "default",
    loading,
    disabled,
    compact,
    children,
    class: className,
    ...props
  }: ButtonProps & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<button
  class={clsx(
    className,
    compact ? compactButtonStyles : baseButtonStyles,
    buttonVariants[variant],
    (!!loading || !!disabled) && "pointer-events-none opacity-75 dark:opacity-50",
  )}
  {...props}
  disabled={!!disabled || !!loading}
>
  {#if loading}<Spinner />{/if}
  {@render children()}
</button>
