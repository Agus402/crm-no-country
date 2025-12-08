const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface CrmLeadDTO {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  stage: string;
  channel: string;
  status: string | null;
  createdAt: string;
  updatedAt: string;
  tagIds: number[];
  account: {
    id: number;
    companyName: string;
    industry: string | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    timeZone: string | null;
    dateFormat: string | null;
    createdAt: string;
  } | null;
}

export interface UserDTO {
  id: number;
  name: string;
  email: string;
  role: string;
  active: boolean;
  account: {
    id: number;
    companyName: string;
    industry: string | null;
    website: string | null;
    phone: string | null;
    address: string | null;
    timeZone: string | null;
    dateFormat: string | null;
    createdAt: string;
  } | null;
  createdAt: string;
}

export interface ConversationDTO {
  id: number;
  lead: CrmLeadDTO | null;
  assignedUser: UserDTO | null;
  externalId: string | null;
  lastMessageText: string | null;
  lastMessageDirection: "INBOUND" | "OUTBOUND";
  unreadCount: number;
  startedAt: string;
  lastMessageAt: string | null;
  status: "OPEN" | "CLOSED" | "ARCHIVED";
  firstInbound: string | null;
}

export interface CreateConversationDTO {
  leadId: number;
  assignedUserId: number;
  channel: "WHATSAPP" | "EMAIL";
  status?: "OPEN" | "CLOSED" | "ARCHIVED";
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

export const conversationService = {
  /**
   * Obtiene todas las conversaciones
   * @returns Lista de todas las conversaciones
   */
  async getAll(): Promise<ConversationDTO[]> {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al obtener las conversaciones");
    }

    return await response.json();
  },

  /**
   * Obtiene una conversación por ID
   * @param id - ID de la conversación
   * @returns Conversación encontrada
   */
  async getById(id: number): Promise<ConversationDTO> {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al obtener la conversación");
    }

    return await response.json();
  },

  /**
   * Crea una nueva conversación
   * @param conversation - Datos de la conversación a crear
   * @returns Conversación creada
   */
  async create(conversation: CreateConversationDTO): Promise<ConversationDTO> {
    const response = await fetch(`${API_URL}/conversations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(conversation),
    });

    if (!response.ok) {
      await handleError(response, "Error al crear la conversación");
    }

    return await response.json();
  },

  /**
   * Elimina (cierra) una conversación
   * @param id - ID de la conversación a eliminar
   */
  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/conversations/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al eliminar la conversación");
    }
  },
};

