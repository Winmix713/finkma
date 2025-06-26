"use client";

/**
 * Tests for custom hooks
 */

import { renderHook, act } from "@testing-library/react";
import { useClipboard } from "../hooks/use-clipboard";
import { useFileDownload } from "../hooks/use-file-download";
import { useTabConfig } from "../hooks/use-tab-config";
import { useTheme } from "../hooks/use-theme";
import jest from "jest"; // Import jest to declare the variable

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: jest.fn(() => Promise.resolve()),
  },
});

// Mock URL methods
global.URL.createObjectURL = jest.fn(() => "mock-url");
global.URL.revokeObjectURL = jest.fn();

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: query.includes("dark"),
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe("useClipboard", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("copies text successfully", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard("test content", "test-tab");
    });

    expect(navigator.clipboard.writeText).toHaveBeenCalledWith("test content");
    expect(result.current.success).toBe("test-tab");
    expect(result.current.error).toBeNull();
  });

  test("handles clipboard errors", async () => {
    navigator.clipboard.writeText = jest.fn(() =>
      Promise.reject(new Error("Clipboard failed")),
    );

    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      try {
        await result.current.copyToClipboard("test content", "test-tab");
      } catch (error) {
        // Expected error
      }
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.success).toBeNull();
  });

  test("clears state", async () => {
    const { result } = renderHook(() => useClipboard());

    await act(async () => {
      await result.current.copyToClipboard("test content", "test-tab");
    });

    act(() => {
      result.current.clearState();
    });

    expect(result.current.success).toBeNull();
    expect(result.current.error).toBeNull();
  });
});

describe("useFileDownload", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Mock document methods
    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
      style: {},
      setAttribute: jest.fn(),
    };
    jest.spyOn(document, "createElement").mockReturnValue(mockLink as any);
    jest.spyOn(document.body, "appendChild").mockImplementation();
    jest.spyOn(document.body, "removeChild").mockImplementation();
  });

  test("downloads file successfully", async () => {
    const { result } = renderHook(() => useFileDownload());

    await act(async () => {
      await result.current.downloadFile("test content", "test.txt");
    });

    expect(result.current.success).toBe(true);
    expect(result.current.error).toBeNull();
  });

  test("downloads with extension", async () => {
    const { result } = renderHook(() => useFileDownload());

    await act(async () => {
      await result.current.downloadWithExtension(
        "test content",
        "test",
        ".jsx",
      );
    });

    expect(result.current.success).toBe(true);
  });
});

describe("useTabConfig", () => {
  const mockContent = {
    jsx: "const test = true",
    css: ".test { color: red; }",
    typescript: "interface Test { value: string }",
  };

  test("returns available tabs", () => {
    const { result } = renderHook(() => useTabConfig(mockContent, true));

    expect(result.current.availableTabs).toHaveLength(3);
    expect(result.current.availableTabs.some((tab) => tab.id === "tsx")).toBe(
      true,
    );
    expect(result.current.availableTabs.some((tab) => tab.id === "jsx")).toBe(
      false,
    ); // Hidden when TS available
  });

  test("gets tab content", () => {
    const { result } = renderHook(() => useTabConfig(mockContent, true));

    expect(result.current.getTabContent("tsx")).toBe(mockContent.jsx);
    expect(result.current.getTabContent("css")).toBe(mockContent.css);
  });

  test("gets default tab", () => {
    const { result } = renderHook(() => useTabConfig(mockContent, true));

    expect(result.current.getDefaultTab()).toBe("tsx");
  });

  test("checks if tab is empty", () => {
    const { result } = renderHook(() => useTabConfig({ jsx: "" }, false));

    expect(result.current.isTabEmpty("jsx")).toBe(true);
  });
});

describe("useTheme", () => {
  test("detects system theme", () => {
    const { result } = renderHook(() => useTheme("auto"));

    expect(result.current.theme).toBe("dark"); // Based on our mock
    expect(result.current.systemTheme).toBe("dark");
  });

  test("sets user theme", () => {
    const { result } = renderHook(() => useTheme("auto"));

    act(() => {
      result.current.setUserTheme("light");
    });

    expect(result.current.theme).toBe("light");
    expect(result.current.userPreference).toBe("light");
  });

  test("gets syntax theme", () => {
    const { result } = renderHook(() => useTheme("dark"));

    expect(result.current.getSyntaxTheme()).toBe("dark");
  });
});
