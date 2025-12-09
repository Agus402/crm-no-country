"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle, History } from "lucide-react";
import { useEffect, useState } from "react";
import { conversationService } from "@/services/conversation.service";

type ActivityItem = {
  id: string;
  name: string;
  action: string;
  type: "whatsapp" | "email";
  status: string;
  time: string;
};

// Función auxiliar para calcular tiempo relativo
function getRelativeTime(dateString: string | null): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "hace unos segundos";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} min`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} ${diffInHours === 1 ? 'hora' : 'horas'}`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `hace ${diffInDays} ${diffInDays === 1 ? 'día' : 'días'}`;
}

export function RecentActivity() {
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const conversations = await conversationService.getAll();

        // Ordenamos por fecha del último mensaje (más reciente primero)
        // y tomamos los primeros 5
        const recentConversations = conversations
          .filter(c => c.lastMessageAt) // Solo los que tienen mensajes
          .sort((a, b) => {
            const dateA = new Date(a.lastMessageAt!).getTime();
            const dateB = new Date(b.lastMessageAt!).getTime();
            return dateB - dateA;
          })
          .slice(0, 5);

        const mappedActivities: ActivityItem[] = recentConversations.map(conv => ({
          id: conv.id.toString(),
          name: conv.lead?.name || "Desconocido", // Fallback si no hay lead
          action: conv.lastMessageText || "Sin mensaje",
          type: conv.channel === "WHATSAPP" ? "whatsapp" : "email",
          status: conv.status.toLowerCase(),
          time: getRelativeTime(conv.lastMessageAt),
        }));

        setActivities(mappedActivities);
      } catch (error) {
        console.error("Error fetching recent activity:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8 text-sm text-muted-foreground animate-pulse">
        Cargando actividad reciente...
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
        <div className="p-3 bg-muted rounded-full">
          <History className="h-6 w-6 text-muted-foreground" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">Sin actividad reciente</p>
          <p className="text-xs text-muted-foreground">
            Las nuevas interacciones aparecerán aquí.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {activities.map((item) => (
        <div key={item.id} className="flex items-start justify-between">
          <div className="flex items-center gap-4">
            {/* Icono: Verde para WhatsApp, Azul para Email */}
            <Avatar className="h-9 w-9 bg-transparent">
              <AvatarFallback
                className={
                  item.type === "whatsapp"
                    ? "bg-green-100 text-green-600"
                    : "bg-blue-100 text-blue-600"
                }
              >
                {item.type === "whatsapp" ? (
                  <MessageCircle className="h-5 w-5" />
                ) : (
                  <Mail className="h-5 w-5" />
                )}
              </AvatarFallback>
            </Avatar>

            <div className="space-y-1">
              <p className="text-sm font-medium leading-none text-foreground">
                {item.name}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-1 max-w-[200px]" title={item.action}>
                {item.action}
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end gap-1">
            <Badge
              variant="secondary"
              className={`
                text-[10px] font-medium px-2 py-0.5 rounded-full uppercase
                ${item.status === 'new' ? 'bg-black text-white hover:bg-black/80' : ''}
                ${item.status === 'open' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
                ${item.status === 'pending' ? 'bg-gray-200 text-gray-700 hover:bg-gray-200' : ''}
                ${item.status === 'completed' || item.status === 'closed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-100' : ''}
                ${item.status === 'scheduled' ? 'bg-gray-100 text-gray-500 hover:bg-gray-100' : ''}
              `}
            >
              {item.status}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {item.time}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
