<script lang="ts">
  import clsx from "clsx";
  import { createToggleGroup, melt } from "@melt-ui/svelte";

  interface ToggleGroupProps {
    value?: string;
    options: {
      value: string;
      label: string;
    }[];
    onValueChange?: (newValue: string) => void;
  }

  let { value = $bindable(), options, onValueChange }: ToggleGroupProps = $props();

  const {
    elements: { root, item },
    states: { value: stateValue },
    helpers: { isPressed },
  } = createToggleGroup({ defaultValue: value });

  // Sync states
  $effect(() => {
    $stateValue = value;
  });
  $effect(() => {
    const newValue = $stateValue as string;
    if (value !== newValue) {
      onValueChange?.(newValue);
    }
    value = newValue;
  });
</script>

<div use:melt={$root} class="flex">
  {#each options as option, index}
    <button
      use:melt={$item(option.value)}
      class={clsx(
        "grow cursor-pointer px-4 py-2 font-medium transition-colors",
        $isPressed(option.value)
          ? "bg-blue-100 text-blue-800"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200",
        { "rounded-l-md": index === 0 },
        { "rounded-r-md": index === options.length - 1 },
      )}
    >
      {option.label}
    </button>
  {/each}
</div>
