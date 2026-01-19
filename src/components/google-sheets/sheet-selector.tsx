"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import type { GoogleSheet, GoogleSheetTab } from "@/types/google-sheets";

interface SheetSelectorProps {
  spreadsheetId: string;
  onSelect: (sheet: GoogleSheetTab) => void;
  selectedSheetId?: number;
}

export function SheetSelector({ spreadsheetId, onSelect, selectedSheetId }: SheetSelectorProps) {
  const [spreadsheet, setSpreadsheet] = useState<GoogleSheet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSpreadsheet = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/google-sheets/spreadsheets/${spreadsheetId}`);
        if (!response.ok) throw new Error("Failed to fetch spreadsheet");

        const data = await response.json();
        setSpreadsheet(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchSpreadsheet();
  }, [spreadsheetId]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading sheets...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  if (!spreadsheet) return null;

  return (
    <div className="space-y-3">
      <h3 className="font-medium">Select a Sheet/Tab</h3>
      <div className="text-sm text-muted-foreground mb-2">
        Spreadsheet: {spreadsheet.title}
      </div>

      <div className="grid gap-2">
        {spreadsheet.sheets.map((sheet) => (
          <Card
            key={sheet.sheetId}
            className={`cursor-pointer transition-colors hover:bg-accent ${
              selectedSheetId === sheet.sheetId ? "border-primary bg-accent" : ""
            }`}
            onClick={() => onSelect(sheet)}
          >
            <CardContent className="p-3">
              <div className="font-medium text-sm">{sheet.title}</div>
              <div className="text-xs text-muted-foreground">
                {sheet.rowCount} rows x {sheet.columnCount} columns
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
