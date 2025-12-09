const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface MessageDTO {
    id: number;
    conversationId: number;
    senderType: 'USER' | 'LEAD' | 'SYSTEM';
    messageDirection: 'INBOUND' | 'OUTBOUND';
    messageType: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' | 'STICKER' | 'EMAIL';
    content: string;
    mediaUrl?: string;
    mediaFileName?: string;
    mediaType?: string;
    mediaCaption?: string;
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
    subject?: string; // Para emails
    senderType?: 'USER';
    messageDirection?: 'OUTBOUND';
    messageType?: 'TEXT' | 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT';
    mediaUrl?: string;
    mediaFileName?: string;
    mediaCaption?: string;
}

export interface MediaUploadResponse {
    url: string;
    filename: string;
    storedFilename: string;
    mimeType: string;
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
    },

    async uploadMedia(file: File): Promise<MediaUploadResponse> {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_URL}/media/upload`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!response.ok) {
            const errorBody = await response.text();
            let errorMessage = "Error al subir archivo";
            try {
                const errorJson = JSON.parse(errorBody);
                if (errorJson.error) {
                    errorMessage = errorJson.error;
                }
            } catch {
                if (errorBody) errorMessage = errorBody;
            }
            throw new Error(errorMessage);
        }

        return response.json();
    },

    getMessageTypeFromMime(mimeType: string): 'IMAGE' | 'VIDEO' | 'AUDIO' | 'DOCUMENT' {
        if (mimeType.startsWith('image/')) return 'IMAGE';
        if (mimeType.startsWith('video/')) return 'VIDEO';
        if (mimeType.startsWith('audio/')) return 'AUDIO';
        return 'DOCUMENT';
    }
};
