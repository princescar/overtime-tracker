<script lang="ts">
  interface MultiLineTextProps {
    text: string;
  }

  const { text }: MultiLineTextProps = $props();

  const lines = text.split("\n");
  const length = lines.length;
</script>

{#each lines as line, i (i)}
  {line}
  {#if i + 1 !== length}
    <br />
  {/if}
{/each}
