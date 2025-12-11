import { MessageCircle, Mail, MoreVertical, Pencil, Trash, FileDown, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { generateContactPDF } from "@/utils/pdf-generator";

const stageColors: Record<string, string> = {
  "Active Lead": "bg-blue-100 text-blue-700",
  "Follow-up": "bg-orange-100 text-orange-700",
  Client: "bg-green-100 text-green-700",
};

interface TagData {
  id?: number;
  name: string;
  color: string;
}

interface ContactTableProps {
  contacts: any[];
  onEdit: (contact: any) => void;
  onDelete?: (id: number) => void;
  onWhatsApp?: (contact: any) => void;
  onEmail?: (contact: any) => void;
  onCreateTask?: (contact: any) => void;
}

export function ContactTable({ contacts, onEdit, onDelete, onWhatsApp, onEmail, onCreateTask }: ContactTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="px-6 py-4  border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Todos los contactos ({contacts.length})</h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Etapa</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Etiquetas</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Último contacto</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Canal</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-black uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {contacts.map((contact) => (
              <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">{contact.initials}</div><div><div className="text-sm font-medium text-gray-900">{contact.name}</div><div className="text-sm text-gray-500">{contact.email}</div></div></div></td>
                <td className="px-6 py-4 whitespace-nowrap"><span className={cn("inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium", stageColors[contact.stage] || "bg-gray-100 text-gray-700")}>{contact.stage}</span></td>
                <td className="px-6 py-4"><div className="flex flex-wrap gap-1">{(contact.tags || []).map((tag: TagData) => (<span key={tag.id || tag.name} className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${tag.color}`}>{tag.name}</span>))}</div></td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{contact.lastContact}</td>
                <td className="px-6 py-4 whitespace-nowrap"><div className="flex items-center gap-2 text-sm text-gray-700">{contact.channel === "WhatsApp" ? <MessageCircle className="h-4 w-4 text-green-600" /> : <Mail className="h-4 w-4 text-blue-600" />}<span>{contact.channel}</span></div></td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex items-center justify-end gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-green-600 hover:text-green-700 hover:bg-green-50"
                      onClick={() => onWhatsApp && onWhatsApp(contact)}
                      title="Abrir WhatsApp"
                    >
                      <MessageCircle className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                      onClick={() => onEmail && onEmail(contact)}
                      title="Abrir Email"
                    >
                      <Mail className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-500 hover:text-gray-900"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>

                        <DropdownMenuItem onClick={() => onEdit(contact)}>
                          <Pencil className="mr-2 h-4 w-4" /> Editar contacto
                        </DropdownMenuItem>

                        {onCreateTask && (
                          <DropdownMenuItem onClick={() => onCreateTask(contact)}>
                            <CheckSquare className="mr-2 h-4 w-4" /> Crear tarea
                          </DropdownMenuItem>
                        )}

                        <DropdownMenuItem onClick={() => generateContactPDF(contact)}>
                          <FileDown className="mr-2 h-4 w-4" /> Exportar a PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-red-600 focus:text-red-600 focus:bg-red-50"
                          onClick={() => onDelete && onDelete(contact.id)}
                        >
                          <Trash className="mr-2 h-4 w-4" /> Eliminar
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
