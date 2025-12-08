const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface MessageDTO {
    id: number;
    conversationId: number;
    senderType: 'USER' | 'LEAD' | 'SYSTEM';
    messageDirection: 'INBOUND' | 'OUTBOUND';
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    content: string;
    sentAt: string;
    externalMessageId?: string;
    senderLead?: {
        id: number;
        name: string;
    };
    senderUser?: {
        id: number;
        name: string;
    };
}

export interface SendMessageRequest {
    conversationId: number;
    content: string;
    senderType?: 'USER';
    messageDirection?: 'OUTBOUND';
    messageType?: 'TEXT';
}

export const messageService = {
    async getByConversation(conversationId: number): Promise<MessageDTO[]> {
        const response = await fetch(`${API_URL}/messages?conversationId=${conversationId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al obtener mensajes");
        }

        return response.json();
    },

    async sendMessage(request: SendMessageRequest): Promise<MessageDTO> {
        const response = await fetch(`${API_URL}/messages`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify({
                ...request,
                senderType: request.senderType || 'USER',
                messageDirection: request.messageDirection || 'OUTBOUND',
                messageType: request.messageType || 'TEXT',
            }),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = "Error al enviar mensaje";
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.message) {
                    errorMessage = errorJson.message;
                }
            } catch {
                if (errorBody) errorMessage = errorBody;
            }
            throw new Error(errorMessage);
        }

        return response.json();
    }
};
