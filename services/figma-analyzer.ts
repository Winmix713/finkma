import type { FigmaNode } from "@/types/figma"
import type { NodeAnalysis, StyleAnalysis, QualityMetrics } from "@/types/figma-info-display"

export class FigmaAnalyzer {
  static analyzeNodes(document: FigmaNode): NodeAnalysis {
    const analysis: NodeAnalysis = {
      totalNodes: 0,
      nodeTypes: {},
      componentInstances: 0,
      textNodes: 0,
      imageNodes: 0,
      vectorNodes: 0,
      frameNodes: 0,
      groupNodes: 0,
      maxDepth: 0,
      averageDepth: 0,
    }

    const depths: number[] = []

    const traverse = (node: FigmaNode, depth = 0) => {
      analysis.totalNodes++
      depths.push(depth)

      // Count node types
      analysis.nodeTypes[node.type] = (analysis.nodeTypes[node.type] || 0) + 1

      // Count specific node types
      switch (node.type) {
        case "INSTANCE":
          analysis.componentInstances++
          break
        case "TEXT":
          analysis.textNodes++
          break
        case "RECTANGLE":
        case "ELLIPSE":
        case "POLYGON":
        case "STAR":
        case "VECTOR":
          analysis.vectorNodes++
          break
        case "FRAME":
          analysis.frameNodes++
          break
        case "GROUP":
          analysis.groupNodes++
          break
      }

      // Traverse children
      if (node.children) {
        node.children.forEach((child) => traverse(child, depth + 1))
      }
    }

    traverse(document)

    analysis.maxDepth = Math.max(...depths, 0)
    analysis.averageDepth = depths.length > 0 ? depths.reduce((sum, d) => sum + d, 0) / depths.length : 0

    return analysis
  }

  static analyzeStyles(document: FigmaNode, styles: Record<string, any> = {}): StyleAnalysis {
    const colorMap = new Map<string, number>()
    const typographyMap = new Map<string, number>()
    const effectsMap = new Map<string, number>()

    const traverse = (node: FigmaNode) => {
      // Analyze fills (colors)
      if (node.fills) {
        node.fills.forEach((fill) => {
          if (fill.type === "SOLID" && fill.color) {
            const colorKey = `${Math.round(fill.color.r * 255)},${Math.round(fill.color.g * 255)},${Math.round(fill.color.b * 255)}`
            colorMap.set(colorKey, (colorMap.get(colorKey) || 0) + 1)
          }
        })
      }

      // Analyze text styles
      if (node.type === "TEXT" && node.style) {
        const styleKey = `${node.style.fontFamily}-${node.style.fontSize}`
        typographyMap.set(styleKey, (typographyMap.get(styleKey) || 0) + 1)
      }

      // Analyze effects
      if (node.effects) {
        node.effects.forEach((effect) => {
          effectsMap.set(effect.type, (effectsMap.get(effect.type) || 0) + 1)
        })
      }

      // Traverse children
      if (node.children) {
        node.children.forEach((child) => traverse(child))
      }
    }

    traverse(document)

    return {
      colors: Array.from(colorMap.entries())
        .map(([color, usage]) => ({
          name: `Color ${color}`,
          value: `rgb(${color})`,
          usage,
        }))
        .sort((a, b) => b.usage - a.usage),

      typography: Array.from(typographyMap.entries())
        .map(([style, usage]) => {
          const [fontFamily, fontSize] = style.split("-")
          return {
            name: `${fontFamily} ${fontSize}px`,
            fontFamily,
            fontSize: Number.parseInt(fontSize),
            usage,
          }
        })
        .sort((a, b) => b.usage - a.usage),

      effects: Array.from(effectsMap.entries())
        .map(([type, usage]) => ({
          name: type,
          type,
          usage,
        }))
        .sort((a, b) => b.usage - a.usage),

      grids: [], // Simplified for now
    }
  }

  static analyzeQuality(document: FigmaNode, analysis: NodeAnalysis): QualityMetrics {
    const issues: QualityMetrics["issues"] = []
    let score = 100

    // Check for naming conventions
    const checkNaming = (node: FigmaNode) => {
      if (!node.name || node.name.startsWith("Rectangle") || node.name.startsWith("Ellipse")) {
        issues.push({
          type: "warning",
          message: `Node "${node.name}" uses default naming`,
          nodeId: node.id,
          severity: 2,
        })
        score -= 1
      }

      if (node.children) {
        node.children.forEach(checkNaming)
      }
    }

    checkNaming(document)

    // Check for accessibility
    const accessibilityScore = this.calculateAccessibilityScore(document)
    const performanceScore = this.calculatePerformanceScore(analysis)
    const consistencyScore = this.calculateConsistencyScore(document)

    return {
      score: Math.max(0, Math.min(100, score)),
      issues,
      accessibility: {
        score: accessibilityScore,
        issues: accessibilityScore < 80 ? ["Missing alt text", "Poor color contrast"] : [],
      },
      performance: {
        score: performanceScore,
        metrics: {
          nodeCount: analysis.totalNodes,
          maxDepth: analysis.maxDepth,
          imageCount: analysis.imageNodes,
        },
      },
      consistency: {
        score: consistencyScore,
        violations: consistencyScore < 80 ? ["Inconsistent spacing", "Mixed font sizes"] : [],
      },
    }
  }

  private static calculateAccessibilityScore(document: FigmaNode): number {
    let score = 100
    let textNodes = 0
    let textNodesWithContrast = 0

    const traverse = (node: FigmaNode) => {
      if (node.type === "TEXT") {
        textNodes++
        // Simplified contrast check
        if (node.fills && node.fills.length > 0) {
          textNodesWithContrast++
        }
      }

      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    traverse(document)

    if (textNodes > 0) {
      const contrastRatio = textNodesWithContrast / textNodes
      score = Math.round(contrastRatio * 100)
    }

    return Math.max(0, Math.min(100, score))
  }

  private static calculatePerformanceScore(analysis: NodeAnalysis): number {
    let score = 100

    // Penalize for too many nodes
    if (analysis.totalNodes > 1000) {
      score -= Math.min(30, (analysis.totalNodes - 1000) / 100)
    }

    // Penalize for too deep nesting
    if (analysis.maxDepth > 10) {
      score -= Math.min(20, (analysis.maxDepth - 10) * 2)
    }

    // Penalize for too many images
    if (analysis.imageNodes > 50) {
      score -= Math.min(20, (analysis.imageNodes - 50) / 5)
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }

  private static calculateConsistencyScore(document: FigmaNode): number {
    const fontSizes = new Set<number>()
    const colors = new Set<string>()
    const spacings = new Set<number>()

    const traverse = (node: FigmaNode) => {
      if (node.type === "TEXT" && node.style?.fontSize) {
        fontSizes.add(node.style.fontSize)
      }

      if (node.fills) {
        node.fills.forEach((fill) => {
          if (fill.type === "SOLID" && fill.color) {
            const colorKey = `${Math.round(fill.color.r * 255)},${Math.round(fill.color.g * 255)},${Math.round(fill.color.b * 255)}`
            colors.add(colorKey)
          }
        })
      }

      if (node.children) {
        node.children.forEach(traverse)
      }
    }

    traverse(document)

    let score = 100

    // Penalize for too many unique font sizes
    if (fontSizes.size > 8) {
      score -= Math.min(30, (fontSizes.size - 8) * 3)
    }

    // Penalize for too many unique colors
    if (colors.size > 20) {
      score -= Math.min(30, (colors.size - 20) * 2)
    }

    return Math.max(0, Math.min(100, Math.round(score)))
  }
}
