"use client";

import { TagsSection } from "@/components/settings/tags-section";
import { ViewsSection } from "@/components/settings/views-section";

export function TagsTab() {
  return (
    <div className="space-y-6">
      {/* Sección de Etiquetas */}
      <TagsSection />

      {/* Sección de Vistas Guardadas */}
      <ViewsSection />
    </div>
  );
}