
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

const API_URL = "http://localhost:8080/api/crmleads";

export const leadService = {
  getAll: async (): Promise<LeadData[]> => {
    const res = await fetch(API_URL, {
      credentials: "include",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Error Fetching Leads:", res.status, errorBody);
      throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    return res.json();
  },
};
