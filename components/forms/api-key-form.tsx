"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Key, Loader2, AlertTriangle } from "lucide-react"

interface ApiKeyFormProps {
  initialApiKey?: string
  onSubmit: (apiKey: string, keyName: string) => Promise<void>
  isConnecting: boolean
  isConnected: boolean
  connectionError?: string
}

export function ApiKeyForm({
  initialApiKey = "",
  onSubmit,
  isConnecting,
  isConnected,
  connectionError,
}: ApiKeyFormProps) {
  const [apiKey, setApiKey] = useState(initialApiKey)
  const [keyName, setKeyName] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!apiKey.trim()) {
      newErrors.apiKey = "API key is required"
    } else if (!apiKey.startsWith("figd_")) {
      newErrors.apiKey = "Invalid Figma API key format"
    }

    if (!keyName.trim()) {
      newErrors.keyName = "Key name is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    try {
      await onSubmit(apiKey.trim(), keyName.trim())
    } catch (error) {
      console.error("API key submission failed:", error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="keyName">Key Name</Label>
        <Input
          id="keyName"
          type="text"
          placeholder="e.g., Production Key"
          value={keyName}
          onChange={(e) => setKeyName(e.target.value)}
          disabled={isConnecting || isConnected}
        />
        {errors.keyName && <p className="text-sm text-red-600">{errors.keyName}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">Figma API Key</Label>
        <div className="relative">
          <Input
            id="apiKey"
            type={showApiKey ? "text" : "password"}
            placeholder="figd_..."
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={isConnecting || isConnected}
            className="pr-10"
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowApiKey(!showApiKey)}
            disabled={isConnecting || isConnected}
          >
            {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
        {errors.apiKey && <p className="text-sm text-red-600">{errors.apiKey}</p>}
      </div>

      {connectionError && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{connectionError}</AlertDescription>
        </Alert>
      )}

      <Button type="submit" disabled={isConnecting || isConnected} className="w-full">
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Connecting...
          </>
        ) : isConnected ? (
          <>
            <Key className="w-4 h-4 mr-2" />
            Connected
          </>
        ) : (
          <>
            <Key className="w-4 h-4 mr-2" />
            Connect to Figma
          </>
        )}
      </Button>

      <div className="text-xs text-gray-500 space-y-1">
        <p>• Get your API key from Figma Settings → Personal Access Tokens</p>
        <p>• Keys are stored securely and encrypted</p>
        <p>• You can revoke access anytime from your Figma account</p>
      </div>
    </form>
  )
}
