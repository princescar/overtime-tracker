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
    "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center gap-2";
  const compactButtonStyles =
    "px-1 py-0.5 rounded-md text-sm transition-colors cursor-pointer flex items-center justify-center gap-1";
  const buttonVariants = {
    default: "bg-blue-500 text-white hover:bg-blue-600",
    light: "bg-gray-100 text-gray-700 hover:bg-gray-200",
    subtle: "text-gray-600 hover:bg-neutral-300/50",
    filled: "bg-blue-100 text-blue-800 hover:bg-blue-200",
    danger: "text-red-500 hover:bg-red-300/25 hover:text-red-600",
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
    (loading || disabled) && "pointer-events-none opacity-75",
  )}
  {...props}
  disabled={disabled || loading}
>
  {#if loading}<Spinner />{/if}
  {@render children()}
</button>
