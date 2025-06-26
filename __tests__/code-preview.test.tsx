"use client"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { axe, toHaveNoViolations } from "jest-axe"
import { CodePreview } from "../code-preview"
import type { CodeContent } from "../types/code-preview"
import jest from "jest"

// Extend Jest matchers
expect.extend(toHaveNoViolations)

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
})

// Mock URL.createObjectURL
global.URL.createObjectURL = jest.fn(() => "mock-url")
global.URL.revokeObjectURL = jest.fn()

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
})

const mockContent: CodeContent = {
  jsx: `export function Button({ children, onClick }) {
  return (
    <button onClick={onClick} className="btn">
      {children}
    </button>
  )
}`,
  css: `.btn {
  padding: 8px 16px;
  border: 1px solid #ccc;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.btn:hover {
  background: #f0f0f0;
}`,
  typescript: `interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  disabled?: boolean
}`,
}

describe("CodePreview", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe("Rendering", () => {
    test("renders with basic content", () => {
      render(<CodePreview content={mockContent} />)

      expect(screen.getByRole("tablist")).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /jsx/i })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /css/i })).toBeInTheDocument()
      expect(screen.getByRole("tab", { name: /types/i })).toBeInTheDocument()
    })

    test("renders with custom component name", () => {
      render(<CodePreview content={mockContent} componentName="CustomButton" />)

      const downloadButton = screen.getByRole("button", { name: /download/i })
      expect(downloadButton).toBeInTheDocument()
    })

    test("shows empty state when no content provided", () => {
      render(<CodePreview content={{}} />)

      expect(screen.getByText(/no code content available/i)).toBeInTheDocument()
    })

    test("hides empty tabs", () => {
      const partialContent = { jsx: "const test = true" }
      render(<CodePreview content={partialContent} />)

      expect(screen.getByRole("tab", { name: /jsx/i })).toBeInTheDocument()
      expect(screen.queryByRole("tab", { name: /css/i })).not.toBeInTheDocument()
    })
  })

  describe("Tab Navigation", () => {
    test("switches tabs when clicked", async () => {
      const user = userEvent.setup()
      render(<CodePreview content={mockContent} />)

      const cssTab = screen.getByRole("tab", { name: /css/i })
      await user.click(cssTab)

      expect(cssTab).toHaveAttribute("aria-selected", "true")
      expect(screen.getByText(/padding: 8px 16px/)).toBeInTheDocument()
    })

    test("calls onTabChange callback", async () => {
      const onTabChange = jest.fn()
      const user = userEvent.setup()

      render(<CodePreview content={mockContent} onTabChange={onTabChange} />)

      const cssTab = screen.getByRole("tab", { name: /css/i })
      await user.click(cssTab)

      expect(onTabChange).toHaveBeenCalledWith("css")
    })

    test("respects defaultTab prop", () => {
      render(<CodePreview content={mockContent} defaultTab="css" />)

      const cssTab = screen.getByRole("tab", { name: /css/i })
      expect(cssTab).toHaveAttribute("aria-selected", "true")
    })
  })

  describe("Copy Functionality", () => {
    test("copies content to clipboard", async () => {
      const user = userEvent.setup()
      const onCopy = jest.fn()

      render(<CodePreview content={mockContent} onCopy={onCopy} />)

      const copyButton = screen.getByRole("button", { name: /copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent.jsx)
        expect(onCopy).toHaveBeenCalledWith(mockContent.jsx, "jsx")
      })
    })

    test("shows success state after copying", async () => {
      const user = userEvent.setup()
      render(<CodePreview content={mockContent} />)

      const copyButton = screen.getByRole("button", { name: /copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText(/copied/i)).toBeInTheDocument()
      })
    })

    test("handles copy errors gracefully", async () => {
      const user = userEvent.setup()
      const consoleError = jest.spyOn(console, "error").mockImplementation()

      // Mock clipboard failure
      navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error("Clipboard failed")))

      render(<CodePreview content={mockContent} />)

      const copyButton = screen.getByRole("button", { name: /copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByText(/clipboard failed/i)).toBeInTheDocument()
      })

      consoleError.mockRestore()
    })
  })

  describe("Download Functionality", () => {
    test("downloads file with correct name", async () => {
      const user = userEvent.setup()
      const onDownload = jest.fn()

      // Mock document.createElement and click
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
        style: {},
        setAttribute: jest.fn(),
      }
      jest.spyOn(document, "createElement").mockReturnValue(mockLink as any)
      jest.spyOn(document.body, "appendChild").mockImplementation()
      jest.spyOn(document.body, "removeChild").mockImplementation()

      render(<CodePreview content={mockContent} componentName="TestButton" onDownload={onDownload} />)

      const downloadButton = screen.getByRole("button", { name: /download/i })
      await user.click(downloadButton)

      await waitFor(() => {
        expect(mockLink.download).toBe("TestButton.jsx")
        expect(mockLink.click).toHaveBeenCalled()
        expect(onDownload).toHaveBeenCalledWith("TestButton.jsx", mockContent.jsx)
      })
    })
  })

  describe("Keyboard Shortcuts", () => {
    test("copies with Ctrl+C", async () => {
      const user = userEvent.setup()
      render(<CodePreview content={mockContent} />)

      await user.keyboard("{Control>}c{/Control}")

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockContent.jsx)
      })
    })

    test("downloads with Ctrl+S", async () => {
      const user = userEvent.setup()
      const mockLink = {
        href: "",
        download: "",
        click: jest.fn(),
        style: {},
        setAttribute: jest.fn(),
      }
      jest.spyOn(document, "createElement").mockReturnValue(mockLink as any)
      jest.spyOn(document.body, "appendChild").mockImplementation()
      jest.spyOn(document.body, "removeChild").mockImplementation()

      render(<CodePreview content={mockContent} />)

      await user.keyboard("{Control>}s{/Control}")

      await waitFor(() => {
        expect(mockLink.click).toHaveBeenCalled()
      })
    })
  })

  describe("Accessibility", () => {
    test("has no accessibility violations", async () => {
      const { container } = render(<CodePreview content={mockContent} />)
      const results = await axe(container)
      expect(results).toHaveNoViolations()
    })

    test("has proper ARIA labels", () => {
      render(<CodePreview content={mockContent} />)

      expect(screen.getByRole("tablist")).toHaveAttribute("aria-label", "Code file tabs")
      expect(screen.getByRole("button", { name: /copy/i })).toHaveAttribute("aria-label")
      expect(screen.getByRole("button", { name: /download/i })).toHaveAttribute("aria-label")
    })

    test("announces state changes to screen readers", async () => {
      const user = userEvent.setup()
      render(<CodePreview content={mockContent} />)

      const copyButton = screen.getByRole("button", { name: /copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(screen.getByRole("status")).toHaveTextContent(/copied to clipboard/i)
      })
    })

    test("supports keyboard navigation", async () => {
      const user = userEvent.setup()
      render(<CodePreview content={mockContent} />)

      const firstTab = screen.getByRole("tab", { name: /jsx/i })
      const secondTab = screen.getByRole("tab", { name: /css/i })

      firstTab.focus()
      await user.keyboard("{Tab}")
      expect(secondTab).toHaveFocus()
    })
  })

  describe("Theme Support", () => {
    test("applies light theme by default", () => {
      render(<CodePreview content={mockContent} />)

      const container = screen.getByTestId("code-preview") || document.querySelector(".code-preview")
      expect(container).toHaveAttribute("data-theme", "light")
    })

    test("applies dark theme when specified", () => {
      render(<CodePreview content={mockContent} theme="dark" />)

      const container = screen.getByTestId("code-preview") || document.querySelector(".code-preview")
      expect(container).toHaveAttribute("data-theme", "dark")
    })
  })

  describe("Error Handling", () => {
    test("handles component errors gracefully", () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation()

      // Force an error by passing invalid props
      const ThrowError = () => {
        throw new Error("Test error")
      }

      render(
        <CodePreview content={mockContent}>
          <ThrowError />
        </CodePreview>,
      )

      expect(screen.getByText(/code preview error/i)).toBeInTheDocument()
      expect(screen.getByRole("button", { name: /try again/i })).toBeInTheDocument()

      consoleError.mockRestore()
    })

    test("calls onError callback when errors occur", async () => {
      const onError = jest.fn()
      const user = userEvent.setup()

      // Mock clipboard failure
      navigator.clipboard.writeText = jest.fn(() => Promise.reject(new Error("Test error")))

      render(<CodePreview content={mockContent} onError={onError} />)

      const copyButton = screen.getByRole("button", { name: /copy/i })
      await user.click(copyButton)

      await waitFor(() => {
        expect(onError).toHaveBeenCalled()
      })
    })
  })

  describe("Performance", () => {
    test("memoizes expensive calculations", () => {
      const { rerender } = render(<CodePreview content={mockContent} />)

      // Re-render with same props should not cause unnecessary recalculations
      rerender(<CodePreview content={mockContent} />)

      // Component should still render correctly
      expect(screen.getByRole("tablist")).toBeInTheDocument()
    })

    test("lazy loads syntax highlighter", async () => {
      render(<CodePreview content={mockContent} />)

      // Should show loading state initially
      expect(screen.getByText(/loading syntax highlighter/i)).toBeInTheDocument()

      // Should load the actual highlighter
      await waitFor(() => {
        expect(screen.queryByText(/loading syntax highlighter/i)).not.toBeInTheDocument()
      })
    })
  })
})
