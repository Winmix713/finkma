export interface FigmaUrlValidation {
  isValid: boolean;
  fileId?: string;
  error?: string;
  urlType?: "file" | "proto" | "design";
}

export function validateFigmaUrl(url: string): FigmaUrlValidation {
  if (!url || typeof url !== "string") {
    return {
      isValid: false,
      error: "URL is required",
    };
  }

  // Remove whitespace and normalize URL
  const cleanUrl = url.trim();

  // Check if it's a valid URL
  try {
    new URL(cleanUrl);
  } catch {
    return {
      isValid: false,
      error: "Invalid URL format",
    };
  }

  // Check if it's a Figma URL
  if (!cleanUrl.includes("figma.com")) {
    return {
      isValid: false,
      error: "URL must be from figma.com",
    };
  }

  // Regex patterns for different Figma URL types
  const patterns = {
    file: /^https:\/\/(www\.)?figma\.com\/file\/([a-zA-Z0-9]+)(\/[^?]*)?(\?.*)?$/,
    proto:
      /^https:\/\/(www\.)?figma\.com\/proto\/([a-zA-Z0-9]+)(\/[^?]*)?(\?.*)?$/,
    design:
      /^https:\/\/(www\.)?figma\.com\/design\/([a-zA-Z0-9]+)(\/[^?]*)?(\?.*)?$/,
  };

  // Try each pattern
  for (const [type, pattern] of Object.entries(patterns)) {
    const match = cleanUrl.match(pattern);
    if (match && match[2]) {
      return {
        isValid: true,
        fileId: match[2],
        urlType: type as "file" | "proto" | "design",
      };
    }
  }

  return {
    isValid: false,
    error:
      "Invalid Figma URL format. Please use a valid Figma file, prototype, or design URL.",
  };
}
