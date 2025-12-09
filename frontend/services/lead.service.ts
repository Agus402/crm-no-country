
export interface LeadData {
  id: number;
  name: string;
  email: string;
  phone: string;
  stage: string;
  channel: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  tagIds: number[];
  account: any;
}

export interface CreateLeadRequest {
  name: string;
  email?: string;
  phone: string;
  stage?: string;
  channel?: 'WHATSAPP' | 'EMAIL';
  tagIds?: number[];
  account?: { id: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export const leadService = {
  getAll: async (): Promise<LeadData[]> => {
    const res = await fetch(API_URL + "/crmleads", {
      credentials: "include",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Error Fetching Leads:", res.status, errorBody);
      throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    return res.json();
  },

  create: async (data: CreateLeadRequest): Promise<LeadData> => {
    const res = await fetch(API_URL + "/crmleads", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        ...data,
        stage: data.stage || 'ACTIVE_LEAD',
        channel: data.channel || 'WHATSAPP',
      }),
    });

    if (!res.ok) {
      const errorBody = await res.text();
      throw new Error(errorBody || "Error al crear contacto");
    }

    return res.json();
  },
};

