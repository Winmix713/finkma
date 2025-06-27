"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Wifi, WifiOff, Clock, User, Zap } from "lucide-react";
import type { RateLimit, FigmaUser } from "@/types/figma-api";

interface ConnectionStatusProps {
  isConnected: boolean;
  isConnecting: boolean;
  connectionError?: string;
  lastConnectedAt?: Date;
  rateLimit?: RateLimit;
  userInfo?: FigmaUser;
}

export function ConnectionStatus({
  isConnected,
  isConnecting,
  connectionError,
  lastConnectedAt,
  rateLimit,
  userInfo,
}: ConnectionStatusProps) {
  const getRateLimitColor = () => {
    if (!rateLimit) return "bg-gray-200";
    const percentage = (rateLimit.remaining / rateLimit.limit) * 100;
    if (percentage > 50) return "bg-green-500";
    if (percentage > 20) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getRateLimitPercentage = () => {
    if (!rateLimit) return 0;
    return (rateLimit.remaining / rateLimit.limit) * 100;
  };

  return (
    <Card className="w-full max-w-sm">
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Connection Status */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {isConnecting ? (
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
              ) : isConnected ? (
                <Wifi className="w-4 h-4 text-green-600" />
              ) : (
                <WifiOff className="w-4 h-4 text-red-600" />
              )}
              <span className="text-sm font-medium">
                {isConnecting
                  ? "Connecting..."
                  : isConnected
                    ? "Connected"
                    : "Disconnected"}
              </span>
            </div>
            <Badge variant={isConnected ? "default" : "destructive"}>
              {isConnected ? "Online" : "Offline"}
            </Badge>
          </div>

          {/* User Info */}
          {userInfo && (
            <div className="flex items-center space-x-2">
              <User className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">{userInfo.handle}</span>
            </div>
          )}

          {/* Last Connected */}
          {lastConnectedAt && (
            <div className="flex items-center space-x-2">
              <Clock className="w-4 h-4 text-gray-500" />
              <span className="text-sm text-gray-600">
                {lastConnectedAt.toLocaleTimeString()}
              </span>
            </div>
          )}

          {/* Rate Limit */}
          {rateLimit && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">API Calls</span>
                </div>
                <span className="text-sm font-medium">
                  {rateLimit.remaining}/{rateLimit.limit}
                </span>
              </div>
              <Progress value={getRateLimitPercentage()} className="h-2" />
              <div className="text-xs text-gray-500">
                Resets at {rateLimit.reset.toLocaleTimeString()}
              </div>
            </div>
          )}

          {/* Connection Error */}
          {connectionError && (
            <div className="text-sm text-red-600 bg-red-50 p-2 rounded">
              {connectionError}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
