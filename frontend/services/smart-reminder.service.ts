const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api";

export interface SmartReminderDTO {
  id: number;
  text: string;
  time: string;
  type: string;
  leadId: number | null;
  leadName: string | null;
  createdAt: string;
}

export interface Reminder {
  id: string;
  text: string;
  time: string;
}

export const smartReminderService = {
  async getAll(): Promise<Reminder[]> {
    const response = await fetch(`${API_URL}/smart-reminders`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
    });

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMessage = "Error al obtener los smart reminders";
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

    const reminders: SmartReminderDTO[] = await response.json();
    
    // Convert SmartReminderDTO to Reminder format expected by the component
    return reminders.map((reminder) => ({
      id: reminder.id.toString(),
      text: reminder.text,
      time: reminder.time,
    }));
  },
};

