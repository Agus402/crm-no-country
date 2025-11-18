"use client";

import { useState } from "react";
import {
  Search,
  UserPlus,
  Filter,
  Download,
  MessageCircle,
  Mail,
  MoreVertical,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

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

const mockContacts: Contact[] = [
  {
    id: "1",
    name: "Sarah Chen",
    email: "sarah.chen@techstartup.io",
    initials: "SC",
    stage: "Active Lead",
    tags: ["Enterprise", "High Priority"],
    lastContact: "2 hours ago",
    channel: "WhatsApp",
  },
  {
    id: "2",
    name: "Marcus Brown",
    email: "marcus@innovate.com",
    initials: "MB",
    stage: "Follow-up",
    tags: ["Demo Requested"],
    lastContact: "1 day ago",
    channel: "Email",
  },
  {
    id: "3",
    name: "Jessica Park",
    email: "j.park@ventures.co",
    initials: "JP",
    stage: "Client",
    tags: ["Paid", "VIP"],
    lastContact: "3 hours ago",
    channel: "WhatsApp",
  },
  {
    id: "4",
    name: "David Liu",
    email: "david.liu@growth.io",
    initials: "DL",
    stage: "Active Lead",
    tags: ["Interested"],
    lastContact: "5 hours ago",
    channel: "Email",
  },
  {
    id: "5",
    name: "Emily Rodriguez",
    email: "emily.r@startups.com",
    initials: "ER",
    stage: "Follow-up",
    tags: ["Onboarding"],
    lastContact: "1 day ago",
    channel: "WhatsApp",
  },
  {
    id: "6",
    name: "Thomas Anderson",
    email: "t.anderson@matrix.io",
    initials: "TA",
    stage: "Active Lead",
    tags: ["Enterprise", "Meeting Scheduled"],
    lastContact: "30 min ago",
    channel: "Email",
  },
  {
    id: "7",
    name: "Olivia Martinez",
    email: "olivia@digital.com",
    initials: "OM",
    stage: "Client",
    tags: ["Paid"],
    lastContact: "2 days ago",
    channel: "WhatsApp",
  },
  {
    id: "8",
    name: "James Wilson",
    email: "james.w@cloud9.io",
    initials: "JW",
    stage: "Active Lead",
    tags: ["High Priority"],
    lastContact: "4 hours ago",
    channel: "WhatsApp",
  },
];

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

export default function ContactPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredContacts = mockContacts.filter(
    (contact) =>
      contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      contact.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
            <p className="text-gray-600 mt-1">
              Manage and segment your contacts across the sales funnel.
            </p>
          </div>
        </div>

        {/* Search and Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search contacts by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Action Buttons */}
          <Button className="bg-purple-600 hover:bg-purple-700 text-white">
            <UserPlus className="h-4 w-4" />
            Add Contact
          </Button>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
          </Button>
          <Button variant="outline">
            All Stages
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Contacts Table */}
      <div className="flex-1 overflow-auto px-8 py-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              All Contacts ({filteredContacts.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Stage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tags
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Channel
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContacts.map((contact) => (
                  <tr
                    key={contact.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Contact */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600 text-sm font-semibold text-white">
                          {contact.initials}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {contact.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {contact.email}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Stage */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                          stageColors[contact.stage] ||
                            "bg-gray-100 text-gray-700"
                        )}
                      >
                        {contact.stage}
                      </span>
                    </td>

                    {/* Tags */}
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {contact.tags.map((tag) => (
                          <span
                            key={tag}
                            className={cn(
                              "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
                              tagColors[tag] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </td>

                    {/* Last Contact */}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {contact.lastContact}
                    </td>

                    {/* Channel */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        {contact.channel === "WhatsApp" ? (
                          <MessageCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Mail className="h-4 w-4 text-blue-600" />
                        )}
                        <span>{contact.channel}</span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <MessageCircle className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Mail className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
