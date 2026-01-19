"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  GoogleSheetsOAuthButton,
  SpreadsheetSelector,
  SheetSelector,
  ColumnMapper,
  DataPreview,
} from "@/components/google-sheets";
import type { SpreadsheetListItem, GoogleSheetTab, ColumnMapping } from "@/types/google-sheets";

type Step = "connect" | "select-spreadsheet" | "select-sheet" | "map-columns" | "preview";

const SAMPLE_TARGET_FIELDS = [
  { name: "name", label: "Name", required: true },
  { name: "email", label: "Email", required: true },
  { name: "phone", label: "Phone" },
  { name: "company", label: "Company" },
  { name: "notes", label: "Notes" },
];

export default function GoogleSheetsIntegrationPage() {
  const [connectionStatus, setConnectionStatus] = useState<{
    connected: boolean;
    email: string | null;
  }>({ connected: false, email: null });
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState<Step>("connect");

  const [selectedSpreadsheet, setSelectedSpreadsheet] = useState<SpreadsheetListItem | null>(null);
  const [selectedSheet, setSelectedSheet] = useState<GoogleSheetTab | null>(null);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);

  useEffect(() => {
    const checkConnection = async () => {
      try {
        const response = await fetch("/api/google-sheets/status");
        const data = await response.json();
        setConnectionStatus(data);
        if (data.connected) {
          setStep("select-spreadsheet");
        }
      } catch (error) {
        console.error("Failed to check connection:", error);
      } finally {
        setLoading(false);
      }
    };

    checkConnection();
  }, []);

  const handleSpreadsheetSelect = (spreadsheet: SpreadsheetListItem) => {
    setSelectedSpreadsheet(spreadsheet);
    setSelectedSheet(null);
    setColumnMappings([]);
    setStep("select-sheet");
  };

  const handleSheetSelect = (sheet: GoogleSheetTab) => {
    setSelectedSheet(sheet);
    setColumnMappings([]);
    setStep("map-columns");
  };

  const handleMappingChange = (mappings: ColumnMapping[]) => {
    setColumnMappings(mappings);
  };

  const handleDisconnect = () => {
    setConnectionStatus({ connected: false, email: null });
    setSelectedSpreadsheet(null);
    setSelectedSheet(null);
    setColumnMappings([]);
    setStep("connect");
  };

  const handleBack = () => {
    switch (step) {
      case "select-sheet":
        setStep("select-spreadsheet");
        break;
      case "map-columns":
        setStep("select-sheet");
        break;
      case "preview":
        setStep("map-columns");
        break;
    }
  };

  if (loading) {
    return (
      <div className="container max-w-4xl py-8">
        <div className="text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Google Sheets Integration</h1>
        <p className="text-muted-foreground">
          Connect your Google Sheets to import and export data.
        </p>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Connection Status</CardTitle>
          <CardDescription>
            {connectionStatus.connected
              ? "Your Google account is connected."
              : "Connect your Google account to get started."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <GoogleSheetsOAuthButton
            isConnected={connectionStatus.connected}
            email={connectionStatus.email}
            onDisconnect={handleDisconnect}
          />
        </CardContent>
      </Card>

      {connectionStatus.connected && (
        <>
          <div className="flex items-center gap-2 mb-6 text-sm text-muted-foreground">
            <span
              className={`cursor-pointer ${step === "select-spreadsheet" ? "text-foreground font-medium" : ""}`}
              onClick={() => setStep("select-spreadsheet")}
            >
              1. Select Spreadsheet
            </span>
            <span>/</span>
            <span
              className={`${!selectedSpreadsheet ? "opacity-50" : "cursor-pointer"} ${step === "select-sheet" ? "text-foreground font-medium" : ""}`}
              onClick={() => selectedSpreadsheet && setStep("select-sheet")}
            >
              2. Select Sheet
            </span>
            <span>/</span>
            <span
              className={`${!selectedSheet ? "opacity-50" : "cursor-pointer"} ${step === "map-columns" ? "text-foreground font-medium" : ""}`}
              onClick={() => selectedSheet && setStep("map-columns")}
            >
              3. Map Columns
            </span>
            <span>/</span>
            <span
              className={`${!selectedSheet ? "opacity-50" : "cursor-pointer"} ${step === "preview" ? "text-foreground font-medium" : ""}`}
              onClick={() => selectedSheet && setStep("preview")}
            >
              4. Preview
            </span>
          </div>

          <Card>
            <CardContent className="pt-6">
              {step === "select-spreadsheet" && (
                <SpreadsheetSelector
                  onSelect={handleSpreadsheetSelect}
                  selectedId={selectedSpreadsheet?.id}
                />
              )}

              {step === "select-sheet" && selectedSpreadsheet && (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                  <SheetSelector
                    spreadsheetId={selectedSpreadsheet.id}
                    onSelect={handleSheetSelect}
                    selectedSheetId={selectedSheet?.sheetId}
                  />
                </div>
              )}

              {step === "map-columns" && selectedSpreadsheet && selectedSheet && (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                  <ColumnMapper
                    spreadsheetId={selectedSpreadsheet.id}
                    sheetTitle={selectedSheet.title}
                    targetFields={SAMPLE_TARGET_FIELDS}
                    initialMappings={columnMappings}
                    onMappingChange={handleMappingChange}
                  />
                  <div className="flex justify-end">
                    <Button onClick={() => setStep("preview")} disabled={columnMappings.length === 0}>
                      Continue to Preview
                    </Button>
                  </div>
                </div>
              )}

              {step === "preview" && selectedSpreadsheet && selectedSheet && (
                <div className="space-y-4">
                  <Button variant="ghost" size="sm" onClick={handleBack}>
                    Back
                  </Button>
                  <DataPreview
                    spreadsheetId={selectedSpreadsheet.id}
                    sheetTitle={selectedSheet.title}
                  />
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4">
                      <h4 className="font-medium mb-2">Current Configuration</h4>
                      <dl className="text-sm space-y-1">
                        <div className="flex">
                          <dt className="w-32 text-muted-foreground">Spreadsheet:</dt>
                          <dd>{selectedSpreadsheet.name}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-32 text-muted-foreground">Sheet:</dt>
                          <dd>{selectedSheet.title}</dd>
                        </div>
                        <div className="flex">
                          <dt className="w-32 text-muted-foreground">Mappings:</dt>
                          <dd>{columnMappings.length} fields configured</dd>
                        </div>
                      </dl>
                    </CardContent>
                  </Card>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline">Save Configuration</Button>
                    <Button>Start Import</Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
