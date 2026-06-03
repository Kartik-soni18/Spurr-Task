<script lang="ts">
  import { tick } from "svelte";

  interface Props {
    disabled: boolean;
    onSend: (text: string) => void;
  }

  let { disabled, onSend }: Props = $props();

  let text = $state("");
  let textareaElement: HTMLTextAreaElement;

  const MAX_LENGTH = 2000;
  const WARNING_THRESHOLD = 1800;

  const charCount = $derived(text.length);
  const showWarning = $derived(charCount > WARNING_THRESHOLD);
  const isOverLimit = $derived(charCount > MAX_LENGTH);
  const canSend = $derived(text.trim().length > 0 && !isOverLimit && !disabled);

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  }

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || isOverLimit || disabled) return;

    onSend(trimmed);
    text = "";

    await tick();
    adjustTextareaHeight();
  }

  function adjustTextareaHeight() {
    if (!textareaElement) return;
    textareaElement.style.height = "auto";
    const lineHeight = 20;
    const maxHeight = lineHeight * 3 + 16;
    textareaElement.style.height = Math.min(textareaElement.scrollHeight, maxHeight) + "px";
  }

  $effect(() => {
    if (textareaElement) {
      adjustTextareaHeight();
    }
  });
</script>

<div class="border-t border-gray-200 bg-gray-50 px-4 py-3 rounded-b-2xl">
  <div class="flex items-end gap-2">
    <div class="flex-1 relative">
      <textarea
        bind:this={textareaElement}
        bind:value={text}
        onkeydown={handleKeydown}
        {disabled}
        placeholder="Type your message..."
        rows="1"
        maxlength={MAX_LENGTH}
        class="w-full resize-none rounded-xl border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-gray-800 placeholder-gray-400 focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
        style="overflow-y: auto;"
      ></textarea>
      {#if showWarning}
        <div class="absolute -bottom-5 right-0 text-xs {isOverLimit ? 'text-red-500' : 'text-amber-600'}">
          {charCount}/{MAX_LENGTH}
        </div>
      {/if}
    </div>
    <button
      onclick={handleSend}
      disabled={!canSend}
      aria-label="Send message"
      class="flex-shrink-0 rounded-xl bg-emerald-600 p-2.5 text-white transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
      </svg>
    </button>
  </div>
</div>
