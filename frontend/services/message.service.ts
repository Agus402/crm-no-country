const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

import { ConversationDTO } from "./conversation.service";

export interface MessageDTO {
  id: number;
  conversation: ConversationDTO;
  senderType: "USER" | "LEAD";
  senderLeadId: number | null;
  messageDirection: "INBOUND" | "OUTBOUND";
  messageType: "TEXT" | "MEDIA" | "EMAIL";
  content: string;
  mediaType: string | null;
  mediaCaption: string | null;
  externalMessageId: string | null;
  sentAt: string;
}

export interface CreateMessageDTO {
  conversationId: number;
  senderType: "USER" | "LEAD";
  senderLeadId?: number | null;
  messageDirection: "INBOUND" | "OUTBOUND";
  messageType: "TEXT" | "MEDIA" | "EMAIL";
  content: string;
  emailTemplateId?: number | null;
}

const handleError = async (response: Response, defaultMessage: string): Promise<never> => {
  const errorBody = await response.text();
  let errorMessage = defaultMessage;
  try {
    const errorJson = JSON.parse(errorBody);
    if (errorJson.message) {
      errorMessage = errorJson.message;
    }
  } catch {
    if (errorBody) errorMessage = errorBody;
  }
  throw new Error(errorMessage);
};

export const messageService = {
  /**
   * Obtiene todos los mensajes de una conversación específica
   * @param conversationId - ID de la conversación
   * @returns Lista de mensajes de la conversación
   */
  async getByConversationId(conversationId: number): Promise<MessageDTO[]> {
    const response = await fetch(`${API_URL}/messages?conversationId=${conversationId}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al obtener los mensajes");
    }

    return await response.json();
  },

  /**
   * Crea un nuevo mensaje
   * @param message - Datos del mensaje a crear
   * @returns Mensaje creado
   */
  async create(message: CreateMessageDTO): Promise<MessageDTO> {
    const response = await fetch(`${API_URL}/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      await handleError(response, "Error al crear el mensaje");
    }

    return await response.json();
  },
};

