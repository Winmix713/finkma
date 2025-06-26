"use client"

import { useEffect } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { X, CheckCircle, AlertTriangle, Info, AlertCircle } from "lucide-react"
import type { Toast } from "@/types/figma"

interface ToastContainerProps {
  toasts: Toast[]
  onRemoveToast: (id: string) => void
}

export function ToastContainer({ toasts, onRemoveToast }: ToastContainerProps) {
  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const timer = setTimeout(() => {
          onRemoveToast(toast.id)
        }, toast.duration)

        return () => clearTimeout(timer)
      }
    })
  }, [toasts, onRemoveToast])

  const getIcon = (type: Toast["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircle className="h-4 w-4" />
      case "error":
        return <AlertCircle className="h-4 w-4" />
      case "warning":
        return <AlertTriangle className="h-4 w-4" />
      case "info":
        return <Info className="h-4 w-4" />
      default:
        return <Info className="h-4 w-4" />
    }
  }

  const getVariant = (type: Toast["type"]) => {
    switch (type) {
      case "error":
        return "destructive" as const
      default:
        return "default" as const
    }
  }

  if (toasts.length === 0) return null

  return (
    <div className="fixed top-4 right-4 z-50 space-y-2 max-w-sm">
      {toasts.map((toast) => (
        <Alert
          key={toast.id}
          variant={getVariant(toast.type)}
          className={`shadow-lg border ${
            toast.type === "success"
              ? "border-green-200 bg-green-50"
              : toast.type === "warning"
                ? "border-yellow-200 bg-yellow-50"
                : toast.type === "info"
                  ? "border-blue-200 bg-blue-50"
                  : ""
          }`}
        >
          {getIcon(toast.type)}
          <AlertDescription className="flex items-center justify-between">
            <span className="flex-1">{toast.message}</span>
            <Button variant="ghost" size="sm" onClick={() => onRemoveToast(toast.id)} className="ml-2 h-auto p-1">
              <X className="h-3 w-3" />
            </Button>
          </AlertDescription>
        </Alert>
      ))}
    </div>
  )
}
