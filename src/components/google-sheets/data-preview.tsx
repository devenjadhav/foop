"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DataPreviewProps {
  spreadsheetId: string;
  sheetTitle: string;
  maxRows?: number;
}

export function DataPreview({ spreadsheetId, sheetTitle, maxRows = 10 }: DataPreviewProps) {
  const [data, setData] = useState<{ headers: string[]; rows: Record<string, unknown>[] } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const encodedTitle = encodeURIComponent(sheetTitle);
      const response = await fetch(
        `/api/google-sheets/spreadsheets/${spreadsheetId}/sheets/${encodedTitle}/data?endRow=${maxRows + 1}`
      );
      if (!response.ok) throw new Error("Failed to fetch data");

      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [spreadsheetId, sheetTitle]);

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading preview...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
        <Button variant="link" size="sm" onClick={fetchData} className="ml-2">
          Retry
        </Button>
      </div>
    );
  }

  if (!data || data.rows.length === 0) {
    return (
      <div className="text-sm text-muted-foreground p-4 border rounded-md">
        No data found in this sheet.
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Data Preview</CardTitle>
          <Button variant="ghost" size="sm" onClick={fetchData}>
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {data.headers.map((header, i) => (
                  <th key={i} className="text-left p-2 font-medium text-muted-foreground">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.rows.slice(0, maxRows).map((row, rowIndex) => (
                <tr key={rowIndex} className="border-b last:border-0">
                  {data.headers.map((header, colIndex) => (
                    <td key={colIndex} className="p-2 truncate max-w-[200px]">
                      {row[header] !== null && row[header] !== undefined
                        ? String(row[header])
                        : "-"}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.rows.length > maxRows && (
          <div className="text-xs text-muted-foreground mt-2">
            Showing {maxRows} of {data.rows.length}+ rows
          </div>
        )}
      </CardContent>
    </Card>
  );
}
