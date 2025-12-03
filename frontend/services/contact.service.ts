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

export const contactService = {
  async getAll(name?: string, email?: string, stage?: string): Promise<CrmLeadDTO[]> {
    const params = new URLSearchParams();
    if (name) params.append("name", name);
    if (email) params.append("email", email);
    if (stage) params.append("stage", stage);

    const url = `${API_URL}/crmleads${params.toString() ? `?${params.toString()}` : ""}`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener los contactos";
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
};

