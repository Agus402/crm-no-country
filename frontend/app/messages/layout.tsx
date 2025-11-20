
"use client";
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      {/* Esto asegura que la vista de mensajes quede a la derecha del sidebar */}
      <div className="ml-64 w-full">
        {children}
      </div>
    </div>
  );
}
