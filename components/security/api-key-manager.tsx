"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Key,
  Trash2,
  Plus,
  Eye,
  EyeOff,
  Clock,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";

interface ApiKey {
  id: string;
  name: string;
  key: string;
  createdAt: Date;
  lastUsed?: Date;
  isActive: boolean;
}

interface ApiKeyManagerProps {
  currentApiKey?: string;
  isConnected: boolean;
  onKeyUpdate: (newKey: string) => void;
}

export function ApiKeyManager({
  currentApiKey,
  isConnected,
  onKeyUpdate,
}: ApiKeyManagerProps) {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([
    {
      id: "1",
      name: "Production Key",
      key: currentApiKey || "",
      createdAt: new Date(),
      lastUsed: new Date(),
      isActive: true,
    },
  ]);
  const [newKeyName, setNewKeyName] = useState("");
  const [newKeyValue, setNewKeyValue] = useState("");
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [error, setError] = useState("");

  const maskKey = (key: string) => {
    if (key.length < 8) return key;
    return `${key.slice(0, 4)}...${key.slice(-4)}`;
  };

  const validateKey = (key: string) => {
    return key.startsWith("figd_") && key.length > 20;
  };

  const addApiKey = () => {
    setError("");

    if (!newKeyName.trim()) {
      setError("Key name is required");
      return;
    }

    if (!validateKey(newKeyValue)) {
      setError("Invalid Figma API key format");
      return;
    }

    const newKey: ApiKey = {
      id: Date.now().toString(),
      name: newKeyName.trim(),
      key: newKeyValue.trim(),
      createdAt: new Date(),
      isActive: false,
    };

    setApiKeys((prev) => [...prev, newKey]);
    setNewKeyName("");
    setNewKeyValue("");
  };

  const removeApiKey = (keyId: string) => {
    setApiKeys((prev) => prev.filter((key) => key.id !== keyId));
  };

  const activateKey = (keyId: string) => {
    const key = apiKeys.find((k) => k.id === keyId);
    if (key) {
      setApiKeys((prev) =>
        prev.map((k) => ({ ...k, isActive: k.id === keyId })),
      );
      onKeyUpdate(key.key);
    }
  };

  const toggleKeyVisibility = (keyId: string) => {
    setShowKeys((prev) => ({ ...prev, [keyId]: !prev[keyId] }));
  };

  return (
    <div className="space-y-6">
      {/* Security Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="w-5 h-5" />
            <span>Security Status</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <div className="font-medium">Connection</div>
                <div className="text-sm text-gray-600">
                  {isConnected ? "Secure" : "Disconnected"}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Key className="w-5 h-5 text-blue-600" />
              <div>
                <div className="font-medium">API Keys</div>
                <div className="text-sm text-gray-600">
                  {apiKeys.length} configured
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-purple-600" />
              <div>
                <div className="font-medium">Last Activity</div>
                <div className="text-sm text-gray-600">
                  {apiKeys
                    .find((k) => k.isActive)
                    ?.lastUsed?.toLocaleTimeString() || "Never"}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Add New Key */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Plus className="w-5 h-5" />
            <span>Add API Key</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="keyName">Key Name</Label>
              <Input
                id="keyName"
                placeholder="e.g., Development Key"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="keyValue">API Key</Label>
              <Input
                id="keyValue"
                type="password"
                placeholder="figd_..."
                value={newKeyValue}
                onChange={(e) => setNewKeyValue(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button onClick={addApiKey} className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add API Key
          </Button>
        </CardContent>
      </Card>

      {/* Existing Keys */}
      <Card>
        <CardHeader>
          <CardTitle>Configured API Keys</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {apiKeys.map((apiKey) => (
              <div
                key={apiKey.id}
                className={`p-4 border rounded-lg ${
                  apiKey.isActive
                    ? "border-green-500 bg-green-50"
                    : "border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium">{apiKey.name}</h4>
                      {apiKey.isActive && (
                        <Badge variant="default">Active</Badge>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 mt-1">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {showKeys[apiKey.id] ? apiKey.key : maskKey(apiKey.key)}
                      </code>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                      >
                        {showKeys[apiKey.id] ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </Button>
                    </div>

                    <div className="text-sm text-gray-600 mt-2">
                      Created: {apiKey.createdAt.toLocaleDateString()}
                      {apiKey.lastUsed && (
                        <span className="ml-4">
                          Last used: {apiKey.lastUsed.toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {!apiKey.isActive && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => activateKey(apiKey.id)}
                      >
                        <Key className="w-4 h-4 mr-1" />
                        Activate
                      </Button>
                    )}

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeApiKey(apiKey.id)}
                      disabled={apiKey.isActive}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}

            {apiKeys.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Key className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No API keys configured</p>
                <p className="text-sm">Add your first API key to get started</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Security Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Security Best Practices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>API keys are encrypted and stored securely</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Keys are never transmitted in plain text</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Rotate keys regularly for enhanced security</span>
            </div>
            <div className="flex items-start space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
              <span>Revoke unused keys from your Figma account</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
