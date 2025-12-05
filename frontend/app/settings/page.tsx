import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { TagsTab } from "@/components/settings/tags-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

export default function SettingsPage() {
  return (
    <div className="p-4 md:p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure integrations, tags, and preferences.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList className="flex flex-nowrap md:flex-wrap  h-auto justify-start gap-1 p-1 overflow-x-auto ">
          <TabsTrigger value="integrations" className="flex-1 md:flex-none text-[11px] md:text-sm px-2 py-1">Integrations</TabsTrigger>
          <TabsTrigger value="tags" className="flex-1 md:flex-none text-[11px] md:text-sm px-2 py-1">Tags & Views</TabsTrigger>
          <TabsTrigger value="notifications" className="flex-1 md:flex-none text-[11px] md:text-sm px-2 py-1">Notifications</TabsTrigger>
          <TabsTrigger value="preferences" className="flex-1 md:flex-none text-[11px] md:text-sm px-2 py-1">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="integrations" className="space-y-6">
          <IntegrationsTab />
        </TabsContent>

        <TabsContent value="tags" className="space-y-6">
          <TagsTab />
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}