"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import type { SpreadsheetListItem } from "@/types/google-sheets";

interface SpreadsheetSelectorProps {
  onSelect: (spreadsheet: SpreadsheetListItem) => void;
  selectedId?: string;
}

export function SpreadsheetSelector({ onSelect, selectedId }: SpreadsheetSelectorProps) {
  const [spreadsheets, setSpreadsheets] = useState<SpreadsheetListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const fetchSpreadsheets = async (pageToken?: string) => {
    try {
      setLoading(true);
      const url = pageToken
        ? `/api/google-sheets/spreadsheets?pageToken=${pageToken}`
        : "/api/google-sheets/spreadsheets";

      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch spreadsheets");

      const data = await response.json();

      if (pageToken) {
        setSpreadsheets((prev) => [...prev, ...data.spreadsheets]);
      } else {
        setSpreadsheets(data.spreadsheets);
      }
      setNextPageToken(data.nextPageToken || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSpreadsheets();
  }, []);

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Select a Spreadsheet</h3>

      {loading && spreadsheets.length === 0 ? (
        <div className="text-sm text-muted-foreground">Loading spreadsheets...</div>
      ) : (
        <>
          <div className="grid gap-2 max-h-64 overflow-y-auto">
            {spreadsheets.map((spreadsheet) => (
              <Card
                key={spreadsheet.id}
                className={`cursor-pointer transition-colors hover:bg-accent ${
                  selectedId === spreadsheet.id ? "border-primary bg-accent" : ""
                }`}
                onClick={() => onSelect(spreadsheet)}
              >
                <CardContent className="p-3">
                  <div className="font-medium text-sm">{spreadsheet.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Modified: {new Date(spreadsheet.modifiedTime).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {nextPageToken && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchSpreadsheets(nextPageToken)}
              disabled={loading}
            >
              {loading ? "Loading..." : "Load More"}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
