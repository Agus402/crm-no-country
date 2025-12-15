const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type TriggerEvent =
  | "LEAD_CREATED"
  | "DEMO_COMPLETED"
  | "INVOICE_SENT"
  | "NO_RESPONSE_7_DAYS"
  | "CONTRACT_SIGNED"
  | "PAYMENT_RECEIVED"
  | "STAGE_CHANGED";

export interface AutomationRuleDTO {
  id: number;
  name: string;
  triggerEvent: TriggerEvent;
  triggerValue: string | null;
  waitDays: number | null;
  waitHours: number | null;
  actions: string; // JSON string
  isActive: boolean;
  createdById: number | null;
  createdAt: string;
}

export interface CreateUpdateAutomationRuleDTO {
  name: string;
  triggerEvent: TriggerEvent;
  triggerValue?: string | null;
  waitDays?: number;
  waitHours?: number;
  actions: string; // JSON string
  isActive: boolean;
}

export const automationRuleService = {
  async getAll(): Promise<AutomationRuleDTO[]> {
    const response = await fetch(`${API_URL}/automation-rules`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener las reglas de automatización";
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

  async getById(id: number): Promise<AutomationRuleDTO> {
    const response = await fetch(`${API_URL}/automation-rules/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener la regla de automatización";
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

  async create(rule: CreateUpdateAutomationRuleDTO): Promise<AutomationRuleDTO> {
    const response = await fetch(`${API_URL}/automation-rules`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rule),
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al crear la regla de automatización";
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

  async update(id: number, rule: CreateUpdateAutomationRuleDTO): Promise<AutomationRuleDTO> {
    const response = await fetch(`${API_URL}/automation-rules/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(rule),
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al actualizar la regla de automatización";
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

  async delete(id: number): Promise<void> {
    const response = await fetch(`${API_URL}/automation-rules/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al eliminar la regla de automatización";
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
  },

  async assignContacts(ruleId: number, contactIds: number[]): Promise<void> {
    const response = await fetch(`${API_URL}/automation-rules/${ruleId}/contacts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ contactIds }),
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al asignar contactos al flujo de trabajo";
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
  },

  async getAssignedContacts(ruleId: number): Promise<number[]> {
    const response = await fetch(`${API_URL}/automation-rules/${ruleId}/contacts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener los contactos asignados";
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

    const data = await response.json();
    return data.contactIds || [];
  },
};

