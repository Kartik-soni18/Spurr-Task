<script lang="ts">
</script>

<div class="flex items-center gap-3 px-1 py-2">
  <div class="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200">
    <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A6.065 6.065 0 0112 15.536a6.065 6.065 0 01-6.23-1.843L4.2 15.3m15.6 0l-1.57-5.09A2.25 2.25 0 0016.22 8.1h-1.058a2.25 2.25 0 01-2.212-2.224V4.5M19.8 15.3V17.25a2.25 2.25 0 01-2.25 2.25h-10.5A2.25 2.25 0 014.8 17.25V15.3" />
    </svg>
  </div>
  <div class="flex items-center gap-2 bg-gray-100 rounded-r-lg rounded-tl-lg px-4 py-3">
    <div class="flex items-center gap-1">
      <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 0ms;"></span>
      <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 150ms;"></span>
      <span class="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style="animation-delay: 300ms;"></span>
    </div>
    <span class="text-xs text-gray-500 ml-1">Agent is typing...</span>
  </div>
</div>

<style>
  .animate-bounce {
    animation: bounce 1s infinite;
  }

  @keyframes bounce {
    0%, 80%, 100% {
      transform: translateY(0);
    }
    40% {
      transform: translateY(-6px);
    }
  }
</style>
