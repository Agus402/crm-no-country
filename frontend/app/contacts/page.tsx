"use client";

import { useState } from "react";
import { Search, UserPlus, Filter, Download, Check } from "lucide-react"; 
import { Button } from "@/components/ui/button";
import { ContactTable } from "@/components/contacts/contact-table";
import { ContactCard } from "@/components/contacts/contact-card";
import { AddContactModal, NewContactData } from "@/components/contacts/add-contact-modal";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Mock inicial 
const initialContacts = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@techstartup.io", phone: "", initials: "SC", stage: "Active Lead", tags: ["Enterprise", "High Priority"], lastContact: "2 hours ago", channel: "WhatsApp" },
  { id: "2", name: "Marcus Brown", email: "marcus@innovate.com", phone: "", initials: "MB", stage: "Follow-up", tags: ["Demo Requested"], lastContact: "1 day ago", channel: "Email" },
  { id: "3", name: "Jessica Park", email: "j.park@ventures.co", phone: "", initials: "JP", stage: "Client", tags: ["Paid", "VIP"], lastContact: "3 hours ago", channel: "WhatsApp" },
  { id: "4", name: "David Liu", email: "david.liu@growth.io", phone: "", initials: "DL", stage: "Active Lead", tags: ["Interested"], lastContact: "5 hours ago", channel: "Email" },
  { id: "5", name: "Emily Rodriguez", email: "emily.r@startups.com", phone: "", initials: "ER", stage: "Follow-up", tags: ["Onboarding"], lastContact: "1 day ago", channel: "WhatsApp" },
  { id: "6", name: "Thomas Anderson", email: "t.anderson@matrix.io", phone: "", initials: "TA", stage: "Active Lead", tags: ["Enterprise", "Meeting Scheduled"], lastContact: "30 min ago", channel: "Email" },
];

const STAGES = ["All Stages", "Active Lead", "Follow-up", "Client"];

export default function ContactPage() {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("All Stages");

  // ESTADOS DEL MODAL
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<NewContactData | null>(null);

  const handleOpenCreate = () => {
    setEditingContact(null); 
    setIsModalOpen(true);
  };

  const handleOpenEdit = (contact: any) => {
    setEditingContact(contact); 
    setIsModalOpen(true);
  };

  const handleSaveContact = (contactData: NewContactData) => {
    if (editingContact?.id) {
      setContacts(contacts.map((c) => 
        c.id === editingContact.id 
          ? { 
              ...c, 
              ...contactData, 
              initials: contactData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
            } 
          : c
      ));
    } else {
      const newContact = {
        id: Math.random().toString(36).substr(2, 9),
        ...contactData,
        initials: contactData.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2),
        lastContact: "Just now",
        phone: contactData.phone || "",
      };
      setContacts([newContact as any, ...contacts]);
    }
    setIsModalOpen(false);
  };

  const filteredContacts = contacts.filter((contact) => {
    const matchesSearch =
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStage = stageFilter === "All Stages" || contact.stage === stageFilter;
    return matchesSearch && matchesStage;
  });

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div><h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contacts</h1><p className="text-sm md:text-base text-gray-600 mt-1">Manage and segment your contacts across the sales funnel.</p></div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input type="text" placeholder="Search contacts..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500" />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
             <Button onClick={handleOpenCreate} className="bg-purple-600 hover:bg-purple-700 text-white col-span-2 lg:col-span-1">
                <UserPlus className="h-4 w-4 mr-2" /> Add Contact
             </Button>

             <AddContactModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveContact}
                contactToEdit={editingContact}
             />

             <DropdownMenu>
               <DropdownMenuTrigger asChild><Button variant="outline" className={stageFilter !== "All Stages" ? "bg-purple-50 border-purple-200 text-purple-700" : ""}><Filter className="h-4 w-4 mr-2" />{stageFilter === "All Stages" ? "Filter" : stageFilter}</Button></DropdownMenuTrigger>
               <DropdownMenuContent align="end" className="w-48"><DropdownMenuLabel>Filter by Stage</DropdownMenuLabel><DropdownMenuSeparator />{STAGES.map((stage) => (<DropdownMenuItem key={stage} onClick={() => setStageFilter(stage)} className="justify-between">{stage}{stageFilter === stage && <Check className="h-4 w-4 text-purple-600" />}</DropdownMenuItem>))}</DropdownMenuContent>
             </DropdownMenu>

             <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:px-8 md:py-6 overflow-y-auto">
        <div className="hidden xl:block">
            <ContactTable contacts={filteredContacts} onEdit={handleOpenEdit} />
        </div>
        <div className="xl:hidden space-y-4">
            <p className="text-sm text-gray-500 mb-2">Showing {filteredContacts.length} contacts {stageFilter !== "All Stages" && ` in ${stageFilter}`}</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {filteredContacts.map(contact => (
                  <ContactCard key={contact.id} contact={contact as any} onEdit={handleOpenEdit} />
              ))}
              {filteredContacts.length === 0 && <div className="col-span-full text-center py-12 text-gray-500">No contacts found matching your filters.</div>}
            </div>
        </div>
      </div>
    </div>
  );
}