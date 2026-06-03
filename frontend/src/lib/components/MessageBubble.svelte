<script lang="ts">
  import type { ChatMessage } from "../types";

  interface Props {
    message: ChatMessage;
  }

  let { message }: Props = $props();

  const isUser = $derived(message.sender === "user");

  function formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }
</script>

<div class="flex {isUser ? 'justify-end' : 'justify-start'} gap-2">
  {#if !isUser}
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A6.065 6.065 0 0112 15.536a6.065 6.065 0 01-6.23-1.843L4.2 15.3m15.6 0l-1.57-5.09A2.25 2.25 0 0016.22 8.1h-1.058a2.25 2.25 0 01-2.212-2.224V4.5M19.8 15.3V17.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.8 17.25V15.3" />
      </svg>
    </div>
  {/if}

  <div
    class="max-w-[80%] px-4 py-2.5 text-sm leading-relaxed break-words {isUser
      ? 'bg-emerald-600 text-white rounded-l-lg rounded-tr-lg'
      : 'bg-gray-100 text-gray-800 rounded-r-lg rounded-tl-lg'}"
    title="{formatTime(message.timestamp)}"
  >
    {message.text}
  </div>

  {#if isUser}
    <div class="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
      <span class="text-xs font-medium text-emerald-700">You</span>
    </div>
  {/if}
</div>
