const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface ConversationDTO {
    id: number;
    lead: {
        id: number;
        name: string;
        phone: string;
        email: string;
    } | null;
    channel: string;
    assignedUser: {
        id: number;
        name: string;
    } | null;
    status: string;
    lastMessageText: string | null;
    lastMessageAt: string | null;
    lastMessageDirection: string | null;
    unreadCount: number;
    startedAt: string;
}

export const conversationService = {
    async getAll(): Promise<ConversationDTO[]> {
        const response = await fetch(`${API_URL}/conversations`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al obtener conversaciones");
        }

        return response.json();
    },

    async getById(id: number): Promise<ConversationDTO> {
        const response = await fetch(`${API_URL}/conversations/${id}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al obtener conversación");
        }

        return response.json();
    },

    async markAsRead(conversationId: number): Promise<void> {
        await fetch(`${API_URL}/conversations/${conversationId}/read`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });
    }
};
