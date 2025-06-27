"use client";

/**
 * Tab action buttons component (copy/download)
 */

import type React from "react";
import { memo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Download, Check, Loader2 } from "lucide-react";
import { ARIA_LABELS } from "@/constants/code-preview";

interface TabActionsProps {
  /** Current tab ID */
  tabId: string;
  /** Tab content */
  content: string;
  /** Filename for download */
  filename: string;
  /** Whether copy is in progress */
  isCopying?: boolean;
  /** Whether download is in progress */
  isDownloading?: boolean;
  /** Whether copy was successful for this tab */
  copySuccess?: boolean;
  /** Whether download was successful */
  downloadSuccess?: boolean;
  /** Copy handler */
  onCopy: (content: string, tabId: string) => void;
  /** Download handler */
  onDownload: (content: string, filename: string) => void;
  /** Whether actions are disabled */
  disabled?: boolean;
  /** Custom CSS classes */
  className?: string;
}

const TabActionsComponent = memo<TabActionsProps>(
  ({
    tabId,
    content,
    filename,
    isCopying = false,
    isDownloading = false,
    copySuccess = false,
    downloadSuccess = false,
    onCopy,
    onDownload,
    disabled = false,
    className = "",
  }) => {
    const handleCopy = useCallback(() => {
      if (!disabled && content.trim()) {
        onCopy(content, tabId);
      }
    }, [disabled, content, onCopy, tabId]);

    const handleDownload = useCallback(() => {
      if (!disabled && content.trim()) {
        onDownload(content, filename);
      }
    }, [disabled, content, onDownload, filename]);

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent, action: () => void) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          action();
        }
      },
      [],
    );

    const isEmpty = !content.trim();
    const isDisabled = disabled || isEmpty;

    return (
      <div className={`flex items-center space-x-2 ${className}`}>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          onKeyDown={(e) => handleKeyDown(e, handleCopy)}
          disabled={isDisabled || isCopying}
          aria-label={`${ARIA_LABELS.COPY_BUTTON} for ${tabId}`}
          aria-describedby={copySuccess ? `copy-success-${tabId}` : undefined}
          className="min-w-[80px]"
        >
          {isCopying ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Copying...
            </>
          ) : copySuccess ? (
            <>
              <Check className="w-3 h-3 mr-1 text-green-600" />
              Copied!
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 mr-1" />
              Copy
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleDownload}
          onKeyDown={(e) => handleKeyDown(e, handleDownload)}
          disabled={isDisabled || isDownloading}
          aria-label={`${ARIA_LABELS.DOWNLOAD_BUTTON} ${filename}`}
          aria-describedby={
            downloadSuccess ? `download-success-${tabId}` : undefined
          }
          className="min-w-[90px]"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
              Downloading...
            </>
          ) : downloadSuccess ? (
            <>
              <Check className="w-3 h-3 mr-1 text-green-600" />
              Downloaded!
            </>
          ) : (
            <>
              <Download className="w-3 h-3 mr-1" />
              Download
            </>
          )}
        </Button>

        {/* Screen reader announcements */}
        {copySuccess && (
          <div
            id={`copy-success-${tabId}`}
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            Code copied to clipboard
          </div>
        )}

        {downloadSuccess && (
          <div
            id={`download-success-${tabId}`}
            role="status"
            aria-live="polite"
            className="sr-only"
          >
            File downloaded successfully
          </div>
        )}
      </div>
    );
  },
);

TabActionsComponent.displayName = "TabActions";

export { TabActionsComponent as TabActions };
