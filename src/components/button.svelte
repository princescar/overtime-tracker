<script lang="ts">
  import type { HTMLAttributes } from "svelte/elements";
  import clsx from "clsx";
  import Spinner from "./spinner.svelte";
  import type { Snippet } from "svelte";

  interface ButtonProps {
    variant?: keyof typeof buttonVariants;
    loading?: boolean;
    children: Snippet;
  }

  const baseButtonStyles =
    "px-4 py-2 rounded-md font-medium transition-colors cursor-pointer flex items-center justify-center";
  const buttonVariants = {
    default: `${baseButtonStyles} bg-blue-500 text-white hover:bg-blue-600`,
    light: `${baseButtonStyles} bg-gray-100 text-gray-700 hover:bg-gray-200`,
    subtle: `${baseButtonStyles} text-gray-600 hover:bg-gray-100`,
    filled: `${baseButtonStyles} bg-blue-100 text-blue-800 hover:bg-blue-200`,
    danger: `${baseButtonStyles} text-red-500 hover:bg-red-300/25 hover:text-red-600`,
  };

  const {
    variant = "default",
    loading,
    children,
    ...props
  }: ButtonProps & HTMLAttributes<HTMLButtonElement> = $props();
</script>

<button
  class={clsx(
    baseButtonStyles,
    buttonVariants[variant],
    loading && "pointer-events-none opacity-75",
  )}
  {...props}
  disabled={loading}
>
  {#if loading}<Spinner />{/if}
  {@render children()}
</button>
