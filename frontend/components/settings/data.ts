// components/settings/data.ts

export const INITIAL_TAGS = [
  { name: "Enterprise", count: 23, color: "bg-purple-300 text-purple-700" },
  { name: "High Priority", count: 15, color: "bg-orange-300 text-orange-700" },
  { name: "Demo Requested", count: 31, color: "bg-purple-300 text-purple-700" },
  { name: "Paid", count: 4, color: "bg-green-300 text-green-700" },
  { name: "VIP", count: 13, color: "bg-green-300 text-green-700" },
  { name: "Onboarding", count: 53, color: "bg-green-300 text-green-700" },
];

export const INITIAL_VIEWS = [
  { 
    name: "High Priority Leads", 
    desc: "Stage: Lead + Tag: High Priority", 
    used: "2 hours ago",
    filters: { stages: ["lead"], tags: ["High Priority"], isDefault: false }
  },
  { 
    name: "VIP Clients", 
    desc: "Stage: Client + Tag: VIP", 
    used: "1 day ago",
    filters: { stages: ["client"], tags: ["VIP"], isDefault: true } 
  },
   { 
    name: "Onboarding + VIP", 
    desc: "Stage: Onboarding + Tag: VIP", 
    used: "3 day ago",
    filters: { stages: ["client"], tags: ["VIP"], isDefault: false } 
  },
];