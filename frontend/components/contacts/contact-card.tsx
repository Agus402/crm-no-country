import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MessageCircle, Mail, Phone, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";

const stageColors: Record<string, string> = {
  "Active Lead": "bg-blue-100 text-blue-700",
  "Follow-up": "bg-orange-100 text-orange-700",
  Client: "bg-green-100 text-green-700",
};

// Definimos la interfaz 
interface Contact {
  id: string;
  name: string;
  email: string;
  initials: string;
  stage: string;
  tags: string[];
  lastContact: string;
  channel: "WhatsApp" | "Email";
}

export function ContactCard({ contact }: { contact: Contact }) {
  return (
    <Card className="mb-4">
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
              {contact.initials}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{contact.name}</h3>
              <p className="text-sm text-gray-500">{contact.email}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreVertical className="h-4 w-4 text-gray-400" />
          </Button>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
                <p className="text-gray-500 text-xs">Stage</p>
                <Badge variant="secondary" className={cn("mt-1", stageColors[contact.stage])}>
                    {contact.stage}
                </Badge>
            </div>
            <div>
                <p className="text-gray-500 text-xs">Last Contact</p>
                <p className="font-medium mt-1 text-gray-700">{contact.lastContact}</p>
            </div>
        </div>

        {/* Footer*/}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
             <div className="flex items-center gap-2 text-xs text-gray-500">
                {contact.channel === "WhatsApp" ? <MessageCircle className="h-3 w-3 text-green-600"/> : <Mail className="h-3 w-3 text-blue-600"/>}
                {contact.channel}
             </div>
             <div className="flex gap-2">
                 <Button size="icon" variant="outline" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                    <MessageCircle className="h-4 w-4" />
                 </Button>
                 <Button size="icon" variant="outline" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                    <Mail className="h-4 w-4" />
                 </Button>
                 <Button size="icon" variant="outline" className="h-8 w-8 text-gray-600 hover:text-gray-700">
                    <Phone className="h-4 w-4" />
                 </Button>
             </div>
        </div>
      </CardContent>
    </Card>
  );
}