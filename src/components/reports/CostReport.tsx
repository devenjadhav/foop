'use client';

import React, { useState } from 'react';
import { Card, CardHeader, CardContent } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { DailyCostReport } from '../../types/cost-report';

const mockReports: DailyCostReport[] = [
  {
    date: '2026-04-28',
    totalCost: 296.29,
    totalSessions: 84,
    byRole: [
      { name: 'deacon', cost: 247.86 },
      { name: 'mayor', cost: 34.73 },
      { name: 'boot', cost: 7.17 },
      { name: 'witness', cost: 6.53 },
    ],
    byRig: [
      { name: 'hearth', cost: 4.87 },
      { name: 'cockpit', cost: 0.99 },
      { name: 'foop', cost: 0.67 },
    ],
  },
  {
    date: '2026-04-27',
    totalCost: 301.73,
    totalSessions: 265,
    byRole: [
      { name: 'mayor', cost: 263.26 },
      { name: 'boot', cost: 38.47 },
    ],
    byRig: [],
  },
];

const roleIcons: Record<string, string> = {
  boot: '\uD83D\uDC3E',
  deacon: '\uD83D\uDC3A',
  mayor: '\uD83C\uDFA9',
  witness: '\uD83E\uDD89',
};

function formatCurrency(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

function CostBreakdownTable({
  items,
  total,
  showIcons,
}: {
  items: { name: string; cost: number }[];
  total: number;
  showIcons?: boolean;
}) {
  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
            Name
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Cost
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
            Share
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {items.map((item) => {
          const share = total > 0 ? ((item.cost / total) * 100).toFixed(1) : '0.0';
          return (
            <tr key={item.name}>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {showIcons && roleIcons[item.name] ? `${roleIcons[item.name]} ` : ''}
                {item.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                {formatCurrency(item.cost)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right">
                {share}%
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function DailyReportSection({ report }: { report: DailyCostReport }) {
  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Total Cost</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">
              {formatCurrency(report.totalCost)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <p className="text-sm font-medium text-gray-500">Total Sessions</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{report.totalSessions}</p>
            <p className="mt-1 text-sm text-gray-500">
              Avg {formatCurrency(report.totalCost / report.totalSessions)} / session
            </p>
          </CardContent>
        </Card>
      </div>

      {/* By Role */}
      {report.byRole.length > 0 && (
        <Card>
          <CardHeader
            title="Cost by Role"
            description="Breakdown of costs by agent role"
            action={
              <Badge variant="info">{report.byRole.length} roles</Badge>
            }
          />
          <CardContent className="p-0">
            <CostBreakdownTable items={report.byRole} total={report.totalCost} showIcons />
          </CardContent>
        </Card>
      )}

      {/* By Rig */}
      {report.byRig.length > 0 && (
        <Card>
          <CardHeader
            title="Cost by Rig"
            description="Breakdown of costs by infrastructure rig"
            action={
              <Badge variant="info">{report.byRig.length} rigs</Badge>
            }
          />
          <CardContent className="p-0">
            <CostBreakdownTable items={report.byRig} total={report.totalCost} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function CostReport() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const report = mockReports[selectedIndex];

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Cost Report</h1>
          <p className="mt-1 text-sm text-gray-500">
            Daily cost aggregate for {new Date(report.date + 'T00:00:00').toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
        </div>
        {mockReports.length > 1 && (
          <div className="flex gap-1">
            {mockReports.map((r, i) => (
              <button
                key={r.date}
                onClick={() => setSelectedIndex(i)}
                className={`px-3 py-1.5 text-sm rounded-md transition-colors ${
                  i === selectedIndex
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </button>
            ))}
          </div>
        )}
      </div>

      <DailyReportSection report={report} />
    </div>
  );
}
