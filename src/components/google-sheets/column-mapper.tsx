"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SheetColumn, ColumnMapping } from "@/types/google-sheets";

interface ColumnMapperProps {
  spreadsheetId: string;
  sheetTitle: string;
  targetFields: { name: string; label: string; required?: boolean }[];
  initialMappings?: ColumnMapping[];
  onMappingChange: (mappings: ColumnMapping[]) => void;
}

const TRANSFORM_OPTIONS = [
  { value: "none", label: "No Transform" },
  { value: "uppercase", label: "Uppercase" },
  { value: "lowercase", label: "Lowercase" },
  { value: "trim", label: "Trim Whitespace" },
  { value: "number", label: "Parse as Number" },
  { value: "date", label: "Parse as Date" },
];

export function ColumnMapper({
  spreadsheetId,
  sheetTitle,
  targetFields,
  initialMappings = [],
  onMappingChange,
}: ColumnMapperProps) {
  const [columns, setColumns] = useState<SheetColumn[]>([]);
  const [mappings, setMappings] = useState<ColumnMapping[]>(initialMappings);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchColumns = async () => {
      try {
        setLoading(true);
        const encodedTitle = encodeURIComponent(sheetTitle);
        const response = await fetch(
          `/api/google-sheets/spreadsheets/${spreadsheetId}/sheets/${encodedTitle}/columns`
        );
        if (!response.ok) throw new Error("Failed to fetch columns");

        const data = await response.json();
        setColumns(data.columns);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchColumns();
  }, [spreadsheetId, sheetTitle]);

  const updateMapping = (
    targetField: string,
    sourceColumn: string,
    transform?: ColumnMapping["transform"]
  ) => {
    const newMappings = mappings.filter((m) => m.targetField !== targetField);
    if (sourceColumn) {
      newMappings.push({
        sourceColumn,
        targetField,
        transform: transform || "none",
      });
    }
    setMappings(newMappings);
    onMappingChange(newMappings);
  };

  const getMappingForField = (fieldName: string) => {
    return mappings.find((m) => m.targetField === fieldName);
  };

  const autoMapColumns = () => {
    const newMappings: ColumnMapping[] = [];

    targetFields.forEach((field) => {
      const matchingColumn = columns.find(
        (col) =>
          col.header.toLowerCase() === field.name.toLowerCase() ||
          col.header.toLowerCase() === field.label.toLowerCase()
      );

      if (matchingColumn) {
        newMappings.push({
          sourceColumn: matchingColumn.header,
          targetField: field.name,
          transform: "none",
        });
      }
    });

    setMappings(newMappings);
    onMappingChange(newMappings);
  };

  if (loading) {
    return <div className="text-sm text-muted-foreground">Loading columns...</div>;
  }

  if (error) {
    return (
      <div className="p-4 text-sm text-destructive bg-destructive/10 rounded-md">
        {error}
      </div>
    );
  }

  const columnOptions = [
    { value: "", label: "-- Select Column --" },
    ...columns.map((col) => ({
      value: col.header,
      label: `${col.letter}: ${col.header}`,
    })),
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Column Mapping</CardTitle>
          <Button variant="outline" size="sm" onClick={autoMapColumns}>
            Auto-Map
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {targetFields.map((field) => {
          const mapping = getMappingForField(field.name);

          return (
            <div key={field.name} className="grid grid-cols-3 gap-3 items-center">
              <div className="text-sm">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </div>

              <Select
                value={mapping?.sourceColumn || ""}
                onChange={(e) =>
                  updateMapping(field.name, e.target.value, mapping?.transform)
                }
                options={columnOptions}
              />

              <Select
                value={mapping?.transform || "none"}
                onChange={(e) =>
                  updateMapping(
                    field.name,
                    mapping?.sourceColumn || "",
                    e.target.value as ColumnMapping["transform"]
                  )
                }
                options={TRANSFORM_OPTIONS}
                disabled={!mapping?.sourceColumn}
              />
            </div>
          );
        })}

        <div className="text-xs text-muted-foreground mt-4">
          {mappings.length} of {targetFields.length} fields mapped
        </div>
      </CardContent>
    </Card>
  );
}
