"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/sidebar/sidebar";
import React from 'react'; // Buena práctica importar React

export default function ClientRoot({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Define las rutas donde se oculta la Sidebar.
  // Puedes añadir más rutas si es necesario, ej: "/register", "/forgot-password"
  const hideSidebar = pathname === "/login";

  return (
    // Aplicamos 'h-screen' y 'flex' al contenedor raíz.
    <div className="flex h-screen bg-slate-50"> 
      
      {/* 1. Sidebar: Solo se renderiza si NO estamos en la ruta de login */}
      {!hideSidebar && <Sidebar />}

      {/* 2. Contenido Principal: Siempre toma el espacio restante. 
          Usamos 'flex-1' y 'overflow-y-auto' para el scroll del contenido. */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}