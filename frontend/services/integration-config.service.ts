const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface IntegrationConfigDTO {
    id: number;
    integrationType: 'WHATSAPP' | 'EMAIL';
    accountId: number;
    credentials: string;
    isConnected: boolean;
    createdAt: string;
}

export interface WhatsAppCredentials {
    apiToken: string;
    baseUrl: string;
    verifyToken: string;
}

export interface CreateUpdateIntegrationConfigDTO {
    integrationType: 'WHATSAPP' | 'EMAIL';
    accountId: number;
    credentials: string;
    isConnected: boolean;
}

export const integrationConfigService = {
    async getAll(): Promise<IntegrationConfigDTO[]> {
        const response = await fetch(`${API_URL}/integration-configs`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al obtener configuraciones de integración");
        }

        return response.json();
    },

    async getByType(type: 'WHATSAPP' | 'EMAIL'): Promise<IntegrationConfigDTO | null> {
        try {
            const configs = await this.getAll();
            return configs.find(c => c.integrationType === type) || null;
        } catch {
            return null;
        }
    },

    async create(config: CreateUpdateIntegrationConfigDTO): Promise<IntegrationConfigDTO> {
        const response = await fetch(`${API_URL}/integration-configs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            throw new Error("Error al crear configuración de integración");
        }

        return response.json();
    },

    async update(id: number, config: CreateUpdateIntegrationConfigDTO): Promise<IntegrationConfigDTO> {
        const response = await fetch(`${API_URL}/integration-configs/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
            body: JSON.stringify(config),
        });

        if (!response.ok) {
            throw new Error("Error al actualizar configuración de integración");
        }

        return response.json();
    },

    async delete(id: number): Promise<void> {
        const response = await fetch(`${API_URL}/integration-configs/${id}`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
            },
            credentials: "include",
        });

        if (!response.ok) {
            throw new Error("Error al eliminar configuración de integración");
        }
    },

    // Helper para parsear credenciales de WhatsApp
    parseWhatsAppCredentials(credentials: string): WhatsAppCredentials | null {
        try {
            return JSON.parse(credentials);
        } catch {
            return null;
        }
    },

    // Helper para serializar credenciales de WhatsApp
    serializeWhatsAppCredentials(credentials: WhatsAppCredentials): string {
        return JSON.stringify(credentials);
    }
};
