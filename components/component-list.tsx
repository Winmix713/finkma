"use client";

import { Badge } from "@/components/ui/badge";
import { Plus } from "lucide-react";
import type { GeneratedComponent } from "@/types/figma";

interface ComponentListProps {
  components: GeneratedComponent[];
  selectedComponent: GeneratedComponent | null;
  onSelectComponent: (component: GeneratedComponent) => void;
  hasCustomCode: boolean;
}

export function ComponentList({
  components,
  selectedComponent,
  onSelectComponent,
  hasCustomCode,
}: ComponentListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {components.map((component) => (
        <div
          key={component.id}
          onClick={() => onSelectComponent(component)}
          className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
            selectedComponent?.id === component.id
              ? "border-blue-500 bg-blue-50 shadow-md"
              : "border-gray-200 hover:border-gray-300"
          }`}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onSelectComponent(component);
            }
          }}
          aria-pressed={selectedComponent?.id === component.id}
        >
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold truncate">{component.name}</h4>
            <Badge variant="outline">{component.metadata.componentType}</Badge>
          </div>

          <div className="text-sm text-gray-600 mb-3">
            Pontosság: {component.metadata.estimatedAccuracy}%
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-2 h-2 rounded-full ${
                  component.accessibility.score >= 80
                    ? "bg-green-500"
                    : component.accessibility.score >= 60
                      ? "bg-yellow-500"
                      : "bg-red-500"
                }`}
                aria-label={`Accessibility score: ${component.accessibility.score}%`}
              ></div>
              <span className="text-xs text-gray-500">
                WCAG {component.accessibility.wcagCompliance}
              </span>
            </div>

            {hasCustomCode && (
              <Badge variant="secondary" className="text-xs">
                <Plus className="w-3 h-3 mr-1" />
                Egyéni
              </Badge>
            )}
          </div>

          <div className="mt-2 text-xs text-gray-500">
            Komplexitás: {component.metadata.complexity}
          </div>
        </div>
      ))}
    </div>
  );
}
