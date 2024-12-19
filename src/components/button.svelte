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
    default: "bg-emerald-700 text-white hover:bg-emerald-800",
    light: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    subtle: "text-gray-800 hover:bg-gray-200/50",
    filled: "bg-emerald-100 text-emerald-900 hover:bg-emerald-200",
    danger: "text-red-700 hover:bg-red-100 hover:text-red-800",
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
    (!!loading || !!disabled) && "pointer-events-none opacity-75",
  )}
  {...props}
  disabled={!!disabled || !!loading}
>
  {#if loading}<Spinner />{/if}
  {@render children()}
</button>
