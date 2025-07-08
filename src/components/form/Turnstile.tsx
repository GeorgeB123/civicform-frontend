"use client";

import { useEffect, useRef, useState } from "react";

interface TurnstileProps {
  siteKey: string;
  onVerifyAction: (token: string) => void;
  onErrorAction?: () => void;
  onExpireAction?: () => void;
  theme?: "light" | "dark" | "auto";
  size?: "normal" | "compact";
  className?: string;
}

declare global {
  interface Window {
    turnstile?: {
      render: (
        element: HTMLElement | string,
        options: {
          sitekey: string;
          callback?: (token: string) => void;
          "error-callback"?: () => void;
          "expired-callback"?: () => void;
          theme?: "light" | "dark" | "auto";
          size?: "normal" | "compact";
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export default function Turnstile({
  siteKey,
  onVerifyAction,
  onErrorAction,
  onExpireAction,
  theme = "auto",
  size = "normal",
  className = "",
}: TurnstileProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isScriptLoaded, setIsScriptLoaded] = useState(false);

  // Load Turnstile script
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Check if script is already loaded
    if (window.turnstile) {
      setIsScriptLoaded(true);
      return;
    }

    // Check if script tag already exists
    if (document.querySelector('script[src*="challenges.cloudflare.com"]')) {
      // Script is loading, wait for it
      const checkTurnstile = () => {
        if (window.turnstile) {
          setIsScriptLoaded(true);
        } else {
          setTimeout(checkTurnstile, 100);
        }
      };
      checkTurnstile();
      return;
    }

    // Load the script
    const script = document.createElement("script");
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js";
    script.async = true;
    script.defer = true;
    script.onload = () => setIsScriptLoaded(true);
    script.onerror = () => {
      console.error("Failed to load Turnstile script");
      onErrorAction?.();
    };

    document.head.appendChild(script);

    return () => {
      // Don't remove the script on unmount as it might be used by other components
    };
  }, [onErrorAction]);

  // Render Turnstile widget
  useEffect(() => {
    if (!isScriptLoaded || !window.turnstile || !containerRef.current || isLoaded) {
      return;
    }

    try {
      const widgetId = window.turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onVerifyAction,
        "error-callback": onErrorAction,
        "expired-callback": onExpireAction,
        theme,
        size,
      });

      widgetIdRef.current = widgetId;
      setIsLoaded(true);
    } catch (error) {
      console.error("Failed to render Turnstile widget:", error);
      onErrorAction?.();
    }
  }, [isScriptLoaded, siteKey, onVerifyAction, onErrorAction, onExpireAction, theme, size, isLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (widgetIdRef.current && window.turnstile) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error("Failed to remove Turnstile widget:", error);
        }
      }
    };
  }, []);

  // Reset method
  const reset = () => {
    if (widgetIdRef.current && window.turnstile) {
      try {
        window.turnstile.reset(widgetIdRef.current);
      } catch (error) {
        console.error("Failed to reset Turnstile widget:", error);
      }
    }
  };

  // Expose reset method to parent
  useEffect(() => {
    if (containerRef.current) {
      (containerRef.current as HTMLDivElement & { reset?: () => void }).reset = reset;
    }
  }, []);

  return (
    <div className={`turnstile-container ${className}`}>
      <div ref={containerRef} />
      {!isScriptLoaded && (
        <div className="flex items-center space-x-2 p-4 bg-gray-50 rounded">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
          <span className="text-sm text-gray-600">Loading security check...</span>
        </div>
      )}
    </div>
  );
}