import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, MessageCircle } from "lucide-react";

// Definimos la estructura de nuestros datos simulados
type ActivityItem = {
  id: string;
  name: string;
  action: string;
  type: "whatsapp" | "email";
  status: "new" | "pending" | "completed" | "scheduled";
  time: string;
};

// Datos Mockeados 
const activities: ActivityItem[] = [
  {
    id: "1",
    name: "Sarah Chen",
    action: "Interested in Enterprise plan",
    type: "whatsapp",
    status: "new",
    time: "5 min ago",
  },
  {
    id: "2",
    name: "Marcus Brown",
    action: "Requested product demo",
    type: "email",
    status: "pending",
    time: "12 min ago",
  },
  {
    id: "3",
    name: "Jessica Park",
    action: "Payment confirmation sent",
    type: "whatsapp",
    status: "completed",
    time: "1 hour ago",
  },
  {
    id: "4",
    name: "David Liu",
    action: "Follow-up scheduled",
    type: "email",
    status: "scheduled",
    time: "2 hours ago",
  },
  {
    id: "5",
    name: "Jon Snow",
    action: "Follow-up scheduled",
    type: "whatsapp",
    status: "scheduled",
    time: "3 hours ago",
  },

];

export function RecentActivity() {
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
              <p className="text-sm text-muted-foreground">
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
                ${item.status === 'pending' ? 'bg-gray-200 text-gray-700 hover:bg-gray-200' : ''}
                ${item.status === 'completed' ? 'bg-gray-100 text-gray-500 hover:bg-gray-100' : ''}
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