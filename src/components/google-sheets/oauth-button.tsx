"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface OAuthButtonProps {
  isConnected: boolean;
  email?: string | null;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export function GoogleSheetsOAuthButton({
  isConnected,
  email,
  onConnect,
  onDisconnect,
}: OAuthButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleConnect = () => {
    setLoading(true);
    if (onConnect) {
      onConnect();
    } else {
      window.location.href = "/api/google-sheets/auth";
    }
  };

  const handleDisconnect = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/google-sheets/disconnect", {
        method: "POST",
      });
      if (response.ok) {
        if (onDisconnect) {
          onDisconnect();
        } else {
          window.location.reload();
        }
      }
    } catch (error) {
      console.error("Disconnect error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (isConnected) {
    return (
      <div className="flex items-center gap-3">
        <Badge variant="success">Connected</Badge>
        {email && <span className="text-sm text-muted-foreground">{email}</span>}
        <Button
          variant="outline"
          size="sm"
          onClick={handleDisconnect}
          disabled={loading}
        >
          {loading ? "Disconnecting..." : "Disconnect"}
        </Button>
      </div>
    );
  }

  return (
    <Button onClick={handleConnect} disabled={loading}>
      <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
        <path
          fill="currentColor"
          d="M19.3 8.93l-6.52 4.89L6.26 8.93 6.26 6.61l6.52 4.89 6.52-4.89z"
        />
        <path
          fill="currentColor"
          d="M19.3 8.93v8.14a1.3 1.3 0 0 1-1.3 1.3H6a1.3 1.3 0 0 1-1.3-1.3V8.93l6.52 4.89z"
          opacity="0.5"
        />
        <path
          fill="currentColor"
          d="M6.26 6.61V4.93c0-.72.58-1.3 1.3-1.3h8.88c.72 0 1.3.58 1.3 1.3v1.68l-5.74 4.31z"
        />
      </svg>
      {loading ? "Connecting..." : "Connect Google Sheets"}
    </Button>
  );
}
