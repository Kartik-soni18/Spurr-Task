export interface ChatMessage {
  id: number;
  sender: "user" | "ai";
  text: string;
  timestamp: string; // ISO 8601
}

export interface Conversation {
  id: string; // UUID
  createdAt: string;
  updatedAt: string;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string | null;
}

export interface SendMessageResponse {
  reply: string;
  sessionId: string;
}

export interface ChatHistoryResponse {
  sessionId: string;
  messages: ChatMessage[];
}
