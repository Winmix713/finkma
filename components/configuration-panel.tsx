"use client";

import type { CodeGenerationOptions } from "@/services/advanced-code-generator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface ConfigurationPanelProps {
  options: CodeGenerationOptions;
  onOptionsChange: (options: CodeGenerationOptions) => void;
}

export function ConfigurationPanel({
  options,
  onOptionsChange,
}: ConfigurationPanelProps) {
  const updateOption = <K extends keyof CodeGenerationOptions>(
    key: K,
    value: CodeGenerationOptions[K],
  ) => {
    onOptionsChange({ ...options, [key]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div className="space-y-2">
        <Label htmlFor="framework-select">Framework</Label>
        <Select
          value={options.framework}
          onValueChange={(value: CodeGenerationOptions["framework"]) =>
            updateOption("framework", value)
          }
        >
          <SelectTrigger id="framework-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="react">React</SelectItem>
            <SelectItem value="vue">Vue.js</SelectItem>
            <SelectItem value="html">HTML</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="styling-select">CSS Framework</Label>
        <Select
          value={options.styling}
          onValueChange={(value: CodeGenerationOptions["styling"]) =>
            updateOption("styling", value)
          }
        >
          <SelectTrigger id="styling-select">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="tailwind">Tailwind CSS</SelectItem>
            <SelectItem value="css-modules">CSS Modules</SelectItem>
            <SelectItem value="styled-components">Styled Components</SelectItem>
            <SelectItem value="plain-css">Plain CSS</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        <Label>További Opciók</Label>
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Checkbox
              id="typescript"
              checked={options.typescript}
              onCheckedChange={(checked) =>
                updateOption("typescript", !!checked)
              }
            />
            <Label htmlFor="typescript">TypeScript</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="accessibility"
              checked={options.accessibility}
              onCheckedChange={(checked) =>
                updateOption("accessibility", !!checked)
              }
            />
            <Label htmlFor="accessibility">Accessibility</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="responsive"
              checked={options.responsive}
              onCheckedChange={(checked) =>
                updateOption("responsive", !!checked)
              }
            />
            <Label htmlFor="responsive">Responsive Design</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox
              id="optimize-images"
              checked={options.optimizeImages}
              onCheckedChange={(checked) =>
                updateOption("optimizeImages", !!checked)
              }
            />
            <Label htmlFor="optimize-images">Képek Optimalizálása</Label>
          </div>
        </div>
      </div>
    </div>
  );
}
