const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export type Priority = "HIGH" | "MEDIUM" | "LOW";

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

export interface TaskDTO {
  id: number;
  title: string;
  description: string | null;
  dueDate: string; // ISO date string
  completed: boolean;
  createdAt: string; // ISO date string
  priority: Priority;
  taskType: "MESSAGE" | "EMAIL"; // Backend enum
  crmLeadDTO: CrmLeadDTO;
  assignedTo: UserDTO;
}

export interface CreateUpdateTaskDTO {
  title: string;
  description?: string;
  dueDate: string; // ISO date string
  priority: Priority;
  taskType: "MESSAGE" | "EMAIL"; // Backend enum: MESSAGE or EMAIL
  crmLead_Id: number;
}

export const taskService = {
  async getAll(completed?: boolean): Promise<TaskDTO[]> {
    const url = completed !== undefined 
      ? `${API_URL}/tasks?completed=${completed}`
      : `${API_URL}/tasks`;
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener las tareas";
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

  async getById(id: number): Promise<TaskDTO> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener la tarea";
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

  async getDueToday(): Promise<TaskDTO[]> {
    const response = await fetch(`${API_URL}/tasks/due-today`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener las tareas vencidas hoy";
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

  async create(task: CreateUpdateTaskDTO): Promise<TaskDTO> {
    const response = await fetch(`${API_URL}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al crear la tarea";
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

  async update(id: number, task: CreateUpdateTaskDTO): Promise<TaskDTO> {
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(task),
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al actualizar la tarea";
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
    const response = await fetch(`${API_URL}/tasks/${id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al eliminar la tarea";
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

  async toggleComplete(id: number): Promise<TaskDTO> {
    const response = await fetch(`${API_URL}/tasks/${id}/complete`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al cambiar el estado de la tarea";
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

