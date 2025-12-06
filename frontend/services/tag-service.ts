// services/tag-service.ts

// Definimos la interfaz basada en lo que espera y devuelve tu backend
export interface TagData {
  id?: number; // Opcional al crear
  name: string;
  color: string;
}

const API_URL = "http://localhost:8080/api/tag"; 

export const tagService = {
  getAll: async (): Promise<TagData[]> => {
    const res = await fetch(API_URL, {
      credentials: "include",
    });
    
    if (!res.ok) {
        // LEER QUÉ PASÓ
        const errorBody = await res.text();
        console.error("❌ Error Fetching Tags:", res.status, errorBody);
        throw new Error(`Error ${res.status}: ${errorBody}`);
    }
    
    return res.json();
  },

  create: async (tag: { name: string; color: string }): Promise<TagData> => {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(tag),
      credentials: "include",
    });

    if (!res.ok) {
      const errorBody = await res.text();
      console.error("❌ Error Creating Tag:", res.status, errorBody);
      throw new Error(`Error ${res.status}: ${errorBody}`);
    }

    return res.json();
  },
  update: async (id: number, data: { name?: string; color?: string }): Promise<TagData> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error updating tag");
    return res.json();
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (!res.ok) throw new Error("Error deleting tag");
  }
};