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

export interface CreateCrmLeadDTO {
  name: string;
  email: string;
  phone?: string;
  stage?: string;
  channel?: string;
  tagIds?: number[];
  account?: {
    id: number;
    companyName?: string;
    industry?: string;
    website?: string;
    phone?: string;
    address?: string;
    timeZone?: string;
    dateFormat?: string;
  };
}

export interface UpdateCrmLeadDTO {
  name?: string;
  email?: string;
  phone?: string;
  stage?: string;
  channel?: string;
  tagIds?: number[];
  accountId?: number;
  ownerId?: number;
}

// Helper functions to map between frontend and backend enum values
const mapStageToBackend = (stage: string): string => {
  const mapping: Record<string, string> = {
    "Active Lead": "ACTIVE_LEAD",
    "Follow-up": "FOLLOW_UP",
    "Client": "CLIENT",
    "Lost": "LOST",
  };
  return mapping[stage] || stage;
};

const mapStageToFrontend = (stage: string): string => {
  const mapping: Record<string, string> = {
    "ACTIVE_LEAD": "Active Lead",
    "FOLLOW_UP": "Follow-up",
    "CLIENT": "Client",
    "LOST": "Lost",
  };
  return mapping[stage] || stage;
};

const mapChannelToBackend = (channel: string): string => {
  const mapping: Record<string, string> = {
    "WhatsApp": "WHATSAPP",
    "Email": "EMAIL",
  };
  return mapping[channel] || channel;
};

const mapChannelToFrontend = (channel: string): string => {
  const mapping: Record<string, string> = {
    "WHATSAPP": "WhatsApp",
    "EMAIL": "Email",
  };
  return mapping[channel] || channel;
};

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

export const contactService = {
  async getAll(name?: string, email?: string, stage?: string): Promise<CrmLeadDTO[]> {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (email) params.append("email", email);
    if (stage) params.append("stage", mapStageToBackend(stage));

    const url = `${API_URL}/crmleads${params.toString() ? `?${params.toString()}` : ""}`;
    
    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response from /crmleads:", response.status, errorText);
        await handleError(response, "Error al obtener los contactos");
      }

      const data = await response.json();
      
      // Ensure data is an array
      if (!Array.isArray(data)) {
        console.error("Expected array but got:", typeof data, data);
        return [];
      }

      // Map stage and channel values to frontend format
      return data.map((contact: CrmLeadDTO) => ({
        ...contact,
        stage: mapStageToFrontend(contact.stage),
        channel: mapChannelToFrontend(contact.channel),
      }));
    } catch (error: any) {
      console.error("Network error fetching contacts:", error);
      throw new Error(error?.message || "Error de conexión al obtener los contactos");
    }
  },

  async getById(id: number): Promise<CrmLeadDTO> {
    const response = await fetch(`${API_URL}/crmleads/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al obtener el contacto");
    }

    const data = await response.json();
    return {
      ...data,
      stage: mapStageToFrontend(data.stage),
      channel: mapChannelToFrontend(data.channel),
    };
  },

  async create(contact: CreateCrmLeadDTO): Promise<CrmLeadDTO> {
    const payload = {
      ...contact,
      stage: contact.stage ? mapStageToBackend(contact.stage) : undefined,
      channel: contact.channel ? mapChannelToBackend(contact.channel) : undefined,
    };

    const response = await fetch(`${API_URL}/crmleads`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleError(response, "Error al crear el contacto");
    }

    const data = await response.json();
    return {
      ...data,
      stage: mapStageToFrontend(data.stage),
      channel: mapChannelToFrontend(data.channel),
    };
  },

  async update(id: number, contact: UpdateCrmLeadDTO): Promise<CrmLeadDTO> {
    const payload = {
      ...contact,
      stage: contact.stage ? mapStageToBackend(contact.stage) : undefined,
      channel: contact.channel ? mapChannelToBackend(contact.channel) : undefined,
    };

    const response = await fetch(`${API_URL}/crmleads/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      await handleError(response, "Error al actualizar el contacto");
        }

    const data = await response.json();
    return {
      ...data,
      stage: mapStageToFrontend(data.stage),
      channel: mapChannelToFrontend(data.channel),
    };
  },

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/crmleads/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al eliminar el contacto");
    }
  },

  async getDeleted(): Promise<CrmLeadDTO[]> {
    const response = await fetch(`${API_URL}/crmleads/deleted`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      await handleError(response, "Error al obtener los contactos eliminados");
    }

    const data = await response.json();
    return data.map((contact: CrmLeadDTO) => ({
      ...contact,
      stage: mapStageToFrontend(contact.stage),
      channel: mapChannelToFrontend(contact.channel),
    }));
  },
};

