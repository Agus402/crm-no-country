"use client"

import {
  CircleCheckIcon,
  InfoIcon,
  Loader2Icon,
  OctagonXIcon,
  TriangleAlertIcon,
} from "lucide-react"
import { Toaster as Sonner, type ToasterProps } from "sonner"

const Toaster = ({ ...props }: ToasterProps) => {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      icons={{
        success: <CircleCheckIcon className="size-4" />,
        info: <InfoIcon className="size-4" />,
        warning: <TriangleAlertIcon className="size-4" />,
        error: <OctagonXIcon className="size-4" />,
        loading: <Loader2Icon className="size-4 animate-spin" />,
      }}
      toastOptions={{
        classNames: {
          toast: "bg-white border border-gray-200 shadow-lg",
          title: "text-gray-900 font-medium",
          description: "text-gray-600",
          success: "!bg-emerald-50 !border-emerald-200 !text-emerald-800 [&_svg]:!text-emerald-600",
          error: "!bg-rose-50 !border-rose-200 !text-rose-800 [&_svg]:!text-rose-600",
          warning: "!bg-amber-50 !border-amber-200 !text-amber-800 [&_svg]:!text-amber-600",
          info: "!bg-sky-50 !border-sky-200 !text-sky-800 [&_svg]:!text-sky-600",
          closeButton: "!bg-gray-100 !border-gray-200 hover:!bg-gray-200 !text-gray-600",
        },
      }}
      style={
        {
          "--normal-bg": "#ffffff",
          "--normal-text": "#1f2937",
          "--normal-border": "#e5e7eb",
          "--border-radius": "0.5rem",
        } as React.CSSProperties
      }
      {...props}
    />
  )
}

export { Toaster }

