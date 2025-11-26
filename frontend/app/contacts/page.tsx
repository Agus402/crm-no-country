"use client";

import { useState } from "react";
import { Search, Filter, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactTable } from "@/components/contacts/contact-table";
import { ContactCard } from "@/components/contacts/contact-card";
import { AddContactModal } from "@/components/contacts/add-contact-modal"; 

// Datos Mockeados
const initialContacts = [
  { id: "1", name: "Sarah Chen", email: "sarah.chen@techstartup.io", initials: "SC", stage: "Active Lead", tags: ["Enterprise", "High Priority"], lastContact: "2 hours ago", channel: "WhatsApp" },
  { id: "2", name: "Marcus Brown", email: "marcus@innovate.com", initials: "MB", stage: "Follow-up", tags: ["Demo Requested"], lastContact: "1 day ago", channel: "Email" },
  { id: "3", name: "Jessica Park", email: "j.park@ventures.co", initials: "JP", stage: "Client", tags: ["Paid", "VIP"], lastContact: "3 hours ago", channel: "WhatsApp" },
  { id: "4", name: "David Liu", email: "david.liu@growth.io", initials: "DL", stage: "Active Lead", tags: ["Interested"], lastContact: "5 hours ago", channel: "Email" },
  { id: "5", name: "Emily Rodriguez", email: "emily.r@startups.com", initials: "ER", stage: "Follow-up", tags: ["Onboarding"], lastContact: "1 day ago", channel: "WhatsApp" },
  { id: "6", name: "Thomas Anderson", email: "t.anderson@matrix.io", initials: "TA", stage: "Active Lead", tags: ["Enterprise", "Meeting Scheduled"], lastContact: "30 min ago", channel: "Email" },
];

export default function ContactPage() {
  const [contacts, setContacts] = useState(initialContacts);
  const [searchQuery, setSearchQuery] = useState("");

  const handleAddContact = (newContactData: any) => {
    const newContact = {
      id: Math.random().toString(36).substr(2, 9), 
      ...newContactData,
      initials: newContactData.name
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2), 
      lastContact: "Just now",
    };
    setContacts([newContact, ...contacts]);
  };

  const filteredContacts = contacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 p-4 md:px-8 md:py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-sm md:text-base text-gray-600 mt-1">
              Manage and segment your contacts across the sales funnel.
            </p>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-2 lg:flex lg:gap-3">
             <AddContactModal onAddContact={handleAddContact} />           
             <Button variant="outline">
                <Filter className="h-4 w-4 mr-2" /> Filter
             </Button>
             <Button variant="outline">
                <Download className="h-4 w-4 mr-2" /> Export
             </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-4 md:px-8 md:py-6 overflow-y-auto">
        <div className="hidden xl:block">
            <ContactTable contacts={filteredContacts} />
        </div>
        <div className="xl:hidden space-y-4">
            <p className="text-sm text-gray-500 mb-2">Showing {filteredContacts.length} contacts</p>
            <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
              {filteredContacts.map(contact => (
                  <ContactCard key={contact.id} contact={contact as any} />
              ))}
            </div>
        </div>

      </div>
    </div>
  );
}