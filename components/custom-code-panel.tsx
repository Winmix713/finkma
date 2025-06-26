"use client"

import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { FileCode, Palette, Zap, FileText } from "lucide-react"
import type { CustomCodeInputs } from "@/services/advanced-code-generator"

interface CustomCodePanelProps {
  customCode: CustomCodeInputs
  onCustomCodeChange: (customCode: CustomCodeInputs) => void
}

export function CustomCodePanel({ customCode, onCustomCodeChange }: CustomCodePanelProps) {
  const updateCustomCode = <K extends keyof CustomCodeInputs>(key: K, value: CustomCodeInputs[K]) => {
    onCustomCodeChange({ ...customCode, [key]: value })
  }

  return (
    <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
      <h4 className="font-semibold text-gray-900 mb-3">Egyéni Kód Hozzáadása</h4>

      <div className="space-y-4">
        <div>
          <Label htmlFor="custom-jsx" className="flex items-center space-x-2 mb-2">
            <FileCode className="w-4 h-4" />
            <span>JSX Kód Hozzáadása</span>
          </Label>
          <Textarea
            id="custom-jsx"
            placeholder="// Egyéni JSX kód, amely beépül a generált komponensbe
const customElement = <div>Egyéni tartalom</div>;"
            value={customCode.jsx}
            onChange={(e) => updateCustomCode("jsx", e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            aria-describedby="jsx-help"
          />
          <p id="jsx-help" className="text-xs text-gray-500 mt-1">
            Ez a kód beépül a generált React komponensbe
          </p>
        </div>

        <div>
          <Label htmlFor="custom-css" className="flex items-center space-x-2 mb-2">
            <Palette className="w-4 h-4" />
            <span>CSS Kód Hozzáadása</span>
          </Label>
          <Textarea
            id="custom-css"
            placeholder="/* Egyéni CSS stílusok */
.custom-class {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  border-radius: 8px;
  padding: 16px;
}"
            value={customCode.css}
            onChange={(e) => updateCustomCode("css", e.target.value)}
            className="min-h-[100px] font-mono text-sm"
            aria-describedby="css-help"
          />
          <p id="css-help" className="text-xs text-gray-500 mt-1">
            Egyéni CSS stílusok a komponenshez
          </p>
        </div>

        <div>
          <Label htmlFor="custom-css-advanced" className="flex items-center space-x-2 mb-2">
            <Zap className="w-4 h-4" />
            <span>CSS++ Kód Hozzáadása (Fejlett)</span>
          </Label>
          <Textarea
            id="custom-css-advanced"
            placeholder="/* Fejlett CSS funkciók: animációk, transitions, custom properties */
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.advanced-component {
  --primary-color: #3b82f6;
  animation: fadeInUp 0.6s ease-out;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}"
            value={customCode.cssAdvanced}
            onChange={(e) => updateCustomCode("cssAdvanced", e.target.value)}
            className="min-h-[120px] font-mono text-sm"
            aria-describedby="css-advanced-help"
          />
          <p id="css-advanced-help" className="text-xs text-gray-500 mt-1">
            Fejlett CSS funkciók: animációk, custom properties, stb.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="flex items-start space-x-2">
          <FileText className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Hogyan működik:</p>
            <ul className="space-y-1 text-xs">
              <li>
                • <strong>JSX Kód:</strong> Beépül a generált React komponensbe
              </li>
              <li>
                • <strong>CSS Kód:</strong> Hozzáadódik a komponens stíluslapjához
              </li>
              <li>
                • <strong>CSS++:</strong> Fejlett CSS funkciók (animációk, custom properties)
              </li>
              <li>• A Figma adatok + egyéni kód = teljes React komponens</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
