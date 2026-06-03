/**
 * Input sanitization and prompt guardrails.
 * These prevent user input from breaking the backend or manipulating the LLM.
 */

const CONTROL_CHAR_REGEX = /[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g;

// Common prompt injection patterns — we detect and log, but don't block outright
// (to avoid false positives on legitimate questions about AI/instructions)
const INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompt|commands?)/gi,
  /ignore\s+(the\s+)?system\s+(prompt|instructions?)/gi,
  /you\s+are\s+now\s+(a|an)\s+/gi,
  /jailbreak/gi,
  /DAN\s*\(Do\s+Anything\s+Now\)/gi,
  /new\s+instructions?:/gi,
  /system\s+override/gi,
];

/**
 * Remove control characters and normalize whitespace.
 * Prevents JSON breakage, DB issues, and weird LLM behavior.
 */
export function sanitizeUserInput(input: string): string {
  let cleaned = input.replace(CONTROL_CHAR_REGEX, "");
  // Collapse multiple whitespace to single space, preserve newlines
  cleaned = cleaned.replace(/[ \t]+/g, " ");
  cleaned = cleaned.replace(/\n{3,}/g, "\n\n"); // max 2 consecutive newlines
  return cleaned.trim();
}

/**
 * Detect obvious prompt injection attempts.
 * Returns true if suspicious patterns found.
 */
export function detectPromptInjection(input: string): boolean {
  return INJECTION_PATTERNS.some((pattern) => pattern.test(input));
}

/**
 * Rough token estimator: ~4 characters per token for English text.
 * Good enough for budget guards.
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

/**
 * Trim conversation history to fit within a token budget.
 * Ensures system prompt + history + user message + max_tokens <= budget.
 */
export function trimHistoryByTokenBudget(
  history: Array<{ text: string }>,
  systemPrompt: string,
  userMessage: string,
  maxResponseTokens: number,
  maxContextTokens: number
): Array<{ text: string }> {
  const systemTokens = estimateTokens(systemPrompt);
  const userTokens = estimateTokens(userMessage);
  let historyTokens = history.reduce((sum, m) => sum + estimateTokens(m.text), 0);

  const total = systemTokens + historyTokens + userTokens + maxResponseTokens;
  if (total <= maxContextTokens) {
    return history;
  }

  // Trim from the oldest messages first
  const trimmed = [...history];
  while (trimmed.length > 0 && systemTokens + historyTokens + userTokens + maxResponseTokens > maxContextTokens) {
    const removed = trimmed.shift();
    if (removed) {
      historyTokens -= estimateTokens(removed.text);
    }
  }

  console.log(`[GUARDRAIL] Trimmed history from ${history.length} to ${trimmed.length} messages due to token budget`);
  return trimmed;
}

/**
 * Validate that an LLM response is safe to return to the user.
 */
export function validateLLMResponse(response: string): { valid: boolean; reason?: string } {
  if (!response || response.trim().length === 0) {
    return { valid: false, reason: "empty" };
  }

  // Cap extremely long responses (shouldn't happen with max_tokens, but defense in depth)
  if (response.length > 10000) {
    return { valid: false, reason: "too_long" };
  }

  return { valid: true };
}
