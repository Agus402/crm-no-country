import { MessageCircle, Mail, MoreVertical, Pencil, Trash, FileDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu,  DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button"; 

const stageColors: Record<string, string> = {
  "Active Lead": "bg-blue-100 text-blue-700",
  "Follow-up": "bg-orange-100 text-orange-700",
  Client: "bg-green-100 text-green-700",
};

const tagColors: Record<string, string> = {
  Enterprise: "bg-purple-100 text-purple-700",
  "High Priority": "bg-red-100 text-red-700",
  "Demo Requested": "bg-yellow-100 text-yellow-700",
  Paid: "bg-green-100 text-green-700",
  VIP: "bg-pink-100 text-pink-700",
  Interested: "bg-blue-100 text-blue-700",
  Onboarding: "bg-indigo-100 text-indigo-700",
  "Meeting Scheduled": "bg-teal-100 text-teal-700",
};

export function ContactTable({ contacts }: { contacts: any[] }) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          All Contacts ({contacts.length})
        </h2>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Stage</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Tags</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Last Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Channel</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                      {contact.initials}
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{contact.name}</div>
                      <div className="text-sm text-gray-500">{contact.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", stageColors[contact.stage] || "bg-gray-100 text-gray-700")}>
                    {contact.stage}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {contact.tags.map((tag: string) => (
                      <span key={tag} className={cn("inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium", tagColors[tag] || "bg-gray-100 text-gray-700")}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.lastContact}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2 text-sm text-gray-700">
                    {contact.channel === "WhatsApp" ? <MessageCircle className="h-4 w-4 text-green-600" /> : <Mail className="h-4 w-4 text-blue-600" />}
                    <span>{contact.channel}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    {/* Acciones Rápidas */}
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50">
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                      <Mail className="h-4 w-4" />
                    </Button>
                    
                    {/* DROPDOWN MENU */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900">
                          <MoreVertical className="h-4 w-4" />
                          <span className="sr-only">Open menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log("Edit clicked", contact.id)}>
                          <Pencil className="mr-2 h-4 w-4" /> Edit Contact
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => console.log("PDF clicked", contact.id)}>
                          <FileDown className="mr-2 h-4 w-4" /> Export to PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600 focus:text-red-600 focus:bg-red-50" onClick={() => console.log("Delete clicked", contact.id)}>
                          <Trash className="mr-2 h-4 w-4" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}