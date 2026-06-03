import { Router } from "express";
import { z } from "zod";
import {
  createConversation,
  getMessages,
  addMessage,
  conversationExists,
} from "../services/conversation.js";
import { generateReply } from "../services/llm.js";
import type { Request, Response, NextFunction } from "express";

const router = Router();

const sendMessageSchema = z.object({
  message: z
    .string()
    .min(1, "Message is required")
    .max(2000, "Message too long")
    .transform((s) => s.trim()),
  sessionId: z.string().uuid().optional().nullable(),
});

const sessionIdSchema = z.string().uuid();

router.post(
  "/message",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = sendMessageSchema.safeParse(req.body);

      if (!parseResult.success) {
        const issue = parseResult.error.issues[0];
        const message = issue ? `${issue.path.join(".")}: ${issue.message}` : "Invalid request";
        const error = new Error(message);
        (error as Error & { statusCode: number }).statusCode = 400;
        throw error;
      }

      const { message, sessionId } = parseResult.data;

      if (!message || message.length === 0) {
        const error = new Error("Message is required and must be between 1 and 2000 characters");
        (error as Error & { statusCode: number }).statusCode = 400;
        throw error;
      }

      let conversationId: string;

      if (sessionId) {
        if (!conversationExists(sessionId)) {
          const error = new Error("Conversation not found");
          (error as Error & { statusCode: number }).statusCode = 404;
          throw error;
        }
        conversationId = sessionId;
      } else {
        conversationId = createConversation();
      }

      addMessage(conversationId, "user", message);

      const history = getMessages(conversationId);

      const reply = await generateReply(history, message);

      addMessage(conversationId, "ai", reply);

      res.json({ reply, sessionId: conversationId });
    } catch (err) {
      next(err);
    }
  }
);

router.get(
  "/history/:sessionId",
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const parseResult = sessionIdSchema.safeParse(req.params.sessionId);

      if (!parseResult.success) {
        const error = new Error("Invalid sessionId format");
        (error as Error & { statusCode: number }).statusCode = 400;
        throw error;
      }

      const sessionId = parseResult.data;

      if (!conversationExists(sessionId)) {
        const error = new Error("Conversation not found");
        (error as Error & { statusCode: number }).statusCode = 404;
        throw error;
      }

      const messages = getMessages(sessionId);

      res.json({ sessionId, messages });
    } catch (err) {
      next(err);
    }
  }
);

export default router;
