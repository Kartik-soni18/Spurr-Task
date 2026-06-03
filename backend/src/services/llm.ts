import OpenAI from "openai";
import { config } from "../config.js";
import type { ChatMessage } from "../types.js";
import { buildSystemPrompt } from "./faq.js";

export class LLMError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.name = "LLMError";
    this.statusCode = statusCode;
  }
}

export class RateLimitError extends LLMError {
  constructor() {
    super("Rate limited", 429);
    this.name = "RateLimitError";
  }
}

export class ServiceUnavailableError extends LLMError {
  constructor() {
    super("Service unavailable", 503);
    this.name = "ServiceUnavailableError";
  }
}

export class AuthError extends LLMError {
  constructor() {
    super("Auth failed", 500);
    this.name = "AuthError";
  }
}

const openai = new OpenAI({
  apiKey: config.LLM_API_KEY,
  baseURL: config.LLM_BASE_URL,
});

export async function generateReply(
  history: ChatMessage[],
  userMessage: string
): Promise<string> {
  try {
    const systemPrompt = buildSystemPrompt();
    const recentHistory = history.slice(-10);

    const messages: Array<{ role: "system" | "user" | "assistant"; content: string }> = [
      { role: "system", content: systemPrompt },
      ...recentHistory.map((m) => ({
        role: m.sender === "user" ? "user" as const : "assistant" as const,
        content: m.text,
      })),
      { role: "user" as const, content: userMessage },
    ];

    const response = await openai.chat.completions.create({
      model: config.LLM_MODEL,
      messages,
      max_tokens: config.MAX_TOKENS,
      temperature: 0.7,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new LLMError("Empty response from LLM", 500);
    }

    return content;
  } catch (error) {
    console.error("LLM error:", error);

    if (error instanceof LLMError) {
      throw error;
    }

    if (error instanceof OpenAI.APIError) {
      const status = error.status;

      if (status === 429) {
        throw new RateLimitError();
      }

      if (status === 401 || status === 403) {
        throw new AuthError();
      }

      if (status >= 500) {
        throw new ServiceUnavailableError();
      }

      throw new LLMError(error.message || "LLM API error", status || 500);
    }

    if (
      error instanceof TypeError &&
      (error.message.includes("fetch") ||
        error.message.includes("network") ||
        error.message.includes("ECONNREFUSED") ||
        error.message.includes("ETIMEDOUT"))
    ) {
      throw new ServiceUnavailableError();
    }

    throw new LLMError(
      error instanceof Error ? error.message : "Unknown LLM error",
      500
    );
  }
}
