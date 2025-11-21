
"use client";
export default function MessagesLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex">
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
