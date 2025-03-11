<script lang="ts">
  import { Button, Spinner, type ButtonColorType } from "flowbite-svelte";
  import clsx from "clsx";
  import type { HTMLButtonAttributes } from "svelte/elements";
  import type { Snippet } from "svelte";

  interface ButtonProps {
    variant?: keyof typeof buttonVariants;
    loading?: boolean;
    disabled?: boolean;
    compact?: boolean;
    children: Snippet;
  }

  const buttonVariants: Record<string, { color?: ButtonColorType; class?: string }> = {
    default: {},
    light: { color: "alternative" },
    subtle: {
      color: "light",
      class:
        "border-transparent bg-transparent dark:border-transparent dark:bg-transparent dark:hover:border-transparent",
    },
    danger: { color: "light", class: "text-red-600 hover:text-red-700" },
  };

  const {
    variant = "default",
    loading,
    disabled,
    compact,
    children,
    class: className,
    ...props
  }: ButtonProps & HTMLButtonAttributes = $props();
</script>

<Button
  {...props}
  class={clsx(buttonVariants[variant].class, { "py-1": compact }, className)}
  size={compact ? "xs" : "md"}
  color={buttonVariants[variant].color}
  disabled={!!disabled || !!loading}
>
  {#if loading}<Spinner class="mr-1" size={compact ? 2 : 4} />{/if}
  {@render children()}
</Button>
