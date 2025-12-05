// services/lead-stats-service.ts

const API_URL = "http://localhost:8080/api/crmleads";

export type StageKey = "ACTIVE_LEAD" | "FOLLOW_UP" | "CLIENT" | "LOST";

export interface StageStats {
  active: number;
  followup: number;
  client: number;
  inactive: number;
}

async function fetchByStage(stage: StageKey): Promise<number> {
  try {
    const res = await fetch(`${API_URL}?stage=${stage}`, {
      credentials: "include",
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`❌ Error fetching stage ${stage}:`, res.status, body);
      return 0;
    }

    const data = await res.json();
    return data.length;
  } catch (err) {
    console.error(`❌ Error fetching stage ${stage}:`, err);
    return 0;
  }
}

export const leadStatsService = {
  getStageStats: async (): Promise<StageStats> => {
    const [active, followup, client, inactive] = await Promise.all([
      fetchByStage("ACTIVE_LEAD"),
      fetchByStage("FOLLOW_UP"),
      fetchByStage("CLIENT"), 
      fetchByStage("LOST"),   
    ]);

    return {
      active,
      followup,
      client,
      inactive,
    };
  },
};
