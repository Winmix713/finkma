"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Play,
  Pause,
  RotateCcw,
  Settings,
} from "lucide-react";
import type { ProcessingStatus } from "../../types/figma-info-display";

interface ProcessingPipelineProps {
  status: ProcessingStatus;
  onPause?: () => void;
  onResume?: () => void;
  onRestart?: () => void;
  onConfigure?: () => void;
}

export function ProcessingPipeline({
  status,
  onPause,
  onResume,
  onRestart,
  onConfigure,
}: ProcessingPipelineProps) {
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(Date.now() - status.startTime.getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [status.startTime]);

  const formatTime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (hours > 0) {
      return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  };

  const getEstimatedCompletion = () => {
    if (!status.estimatedCompletion) return "Unknown";
    const remaining = status.estimatedCompletion.getTime() - Date.now();
    if (remaining <= 0) return "Completing...";
    return formatTime(remaining);
  };

  const getStageIcon = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStageColor = (stage: string) => {
    switch (stage.toLowerCase()) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200";
      case "error":
        return "bg-red-100 text-red-800 border-red-200";
      case "paused":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      default:
        return "bg-blue-100 text-blue-800 border-blue-200";
    }
  };

  const processingStages = [
    {
      id: "fetch",
      name: "Fetching File",
      description: "Downloading Figma file data",
    },
    {
      id: "parse",
      name: "Parsing Structure",
      description: "Analyzing node hierarchy",
    },
    {
      id: "analyze",
      name: "Quality Analysis",
      description: "Running quality checks",
    },
    {
      id: "accessibility",
      name: "Accessibility Audit",
      description: "Checking WCAG compliance",
    },
    {
      id: "performance",
      name: "Performance Analysis",
      description: "Evaluating optimization opportunities",
    },
    {
      id: "generate",
      name: "Code Generation",
      description: "Creating output code",
    },
    { id: "finalize", name: "Finalizing", description: "Preparing results" },
  ];

  const currentStageIndex = processingStages.findIndex((stage) =>
    stage.name.toLowerCase().includes(status.stage.toLowerCase()),
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStageIcon(status.stage)}
            Processing Pipeline
          </div>
          <div className="flex items-center gap-2">
            {onPause && (
              <Button variant="outline" size="sm" onClick={onPause}>
                <Pause className="h-3 w-3" />
              </Button>
            )}
            {onResume && (
              <Button variant="outline" size="sm" onClick={onResume}>
                <Play className="h-3 w-3" />
              </Button>
            )}
            {onRestart && (
              <Button variant="outline" size="sm" onClick={onRestart}>
                <RotateCcw className="h-3 w-3" />
              </Button>
            )}
            {onConfigure && (
              <Button variant="outline" size="sm" onClick={onConfigure}>
                <Settings className="h-3 w-3" />
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Real-time processing status and pipeline visualization
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current Status */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge className={getStageColor(status.stage)}>
                  {status.stage}
                </Badge>
                <span className="text-sm font-medium">{status.message}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Processing ID: {status.id}
              </p>
            </div>
            <div className="text-right space-y-1">
              <p className="text-sm font-medium">{status.progress}%</p>
              <p className="text-xs text-muted-foreground">
                Elapsed: {formatTime(elapsedTime)}
              </p>
            </div>
          </div>

          <Progress value={status.progress} className="h-2" />

          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Started: {status.startTime.toLocaleTimeString()}</span>
            <span>ETA: {getEstimatedCompletion()}</span>
          </div>
        </div>

        {/* Pipeline Stages */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Pipeline Stages</h4>
          <div className="space-y-2">
            {processingStages.map((stage, index) => {
              const isCompleted = index < currentStageIndex;
              const isCurrent = index === currentStageIndex;
              const isPending = index > currentStageIndex;

              return (
                <div
                  key={stage.id}
                  className={`
                    flex items-center gap-3 p-3 rounded-md border transition-colors
                    ${isCurrent ? "bg-blue-50 border-blue-200" : ""}
                    ${isCompleted ? "bg-green-50 border-green-200" : ""}
                    ${isPending ? "bg-gray-50 border-gray-200" : ""}
                  `}
                >
                  <div className="flex-shrink-0">
                    {isCompleted ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : isCurrent ? (
                      <Clock className="h-4 w-4 text-blue-600 animate-pulse" />
                    ) : (
                      <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <p
                      className={`text-sm font-medium ${isCurrent ? "text-blue-900" : isCompleted ? "text-green-900" : "text-gray-600"}`}
                    >
                      {stage.name}
                    </p>
                    <p
                      className={`text-xs ${isCurrent ? "text-blue-700" : isCompleted ? "text-green-700" : "text-gray-500"}`}
                    >
                      {stage.description}
                    </p>
                  </div>
                  {isCurrent && (
                    <Badge variant="secondary" className="text-xs">
                      In Progress
                    </Badge>
                  )}
                  {isCompleted && (
                    <Badge
                      variant="outline"
                      className="text-xs text-green-700 border-green-300"
                    >
                      Complete
                    </Badge>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Errors and Warnings */}
        {(status.errors.length > 0 || status.warnings.length > 0) && (
          <div className="space-y-3">
            {status.errors.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-red-700">Errors</h4>
                <div className="space-y-1">
                  {status.errors.map((error, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-red-50 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status.warnings.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-yellow-700">
                  Warnings
                </h4>
                <div className="space-y-1">
                  {status.warnings.map((warning, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-2 p-2 bg-yellow-50 rounded-md"
                    >
                      <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-yellow-800">{warning}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
