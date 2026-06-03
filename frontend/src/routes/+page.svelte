<script lang="ts">
  import ChatWidget from "$lib/components/ChatWidget.svelte";
</script>

<svelte:head>
  <title>ShopSpur Support</title>
  <meta name="description" content="Chat with our AI-powered support agent for help with orders, shipping, returns, and more." />
</svelte:head>

<main class="flex-1 flex flex-col items-center justify-center p-0 sm:p-4">
  <ChatWidget />
</main>

<footer class="py-3 text-center text-xs text-gray-400">
  <a href="https://spur.ai" target="_blank" rel="noopener noreferrer" class="hover:text-gray-600 transition-colors">
    Powered by Spur AI
  </a>
</footer>
