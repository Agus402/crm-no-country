import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { IntegrationsTab } from "@/components/settings/integrations-tab";
import { TagsTab } from "@/components/settings/tags-tab";
import { NotificationsTab } from "@/components/settings/notifications-tab";
import { PreferencesTab } from "@/components/settings/preferences-tab";

export default function SettingsPage() {
  return (
    <div className="p-6 space-y-6 bg-gray-50/50 min-h-screen">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure integrations, tags, and preferences.
        </p>
      </div>

      <Tabs defaultValue="integrations" className="space-y-6">
        <TabsList>
          <TabsTrigger value="integrations">Integrations</TabsTrigger>
          <TabsTrigger value="tags">Tags & Views</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
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