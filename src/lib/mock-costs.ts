import type { DailyCostReport, CostSummary } from '@/types/costs';

const dailyReports: DailyCostReport[] = [
  {
    id: 'cr-20260427',
    date: '2026-04-27',
    totalAmount: 301.73,
    totalSessions: 265,
    entries: [
      { role: 'boot', amount: 38.47, sessions: 42 },
      { role: 'mayor', amount: 263.26, sessions: 223 },
    ],
  },
  {
    id: 'cr-20260426',
    date: '2026-04-26',
    totalAmount: 278.91,
    totalSessions: 241,
    entries: [
      { role: 'boot', amount: 35.12, sessions: 38 },
      { role: 'mayor', amount: 243.79, sessions: 203 },
    ],
  },
  {
    id: 'cr-20260425',
    date: '2026-04-25',
    totalAmount: 312.45,
    totalSessions: 279,
    entries: [
      { role: 'boot', amount: 41.23, sessions: 45 },
      { role: 'mayor', amount: 271.22, sessions: 234 },
    ],
  },
  {
    id: 'cr-20260424',
    date: '2026-04-24',
    totalAmount: 289.67,
    totalSessions: 252,
    entries: [
      { role: 'boot', amount: 36.89, sessions: 40 },
      { role: 'mayor', amount: 252.78, sessions: 212 },
    ],
  },
  {
    id: 'cr-20260423',
    date: '2026-04-23',
    totalAmount: 295.14,
    totalSessions: 258,
    entries: [
      { role: 'boot', amount: 37.56, sessions: 41 },
      { role: 'mayor', amount: 257.58, sessions: 217 },
    ],
  },
  {
    id: 'cr-20260422',
    date: '2026-04-22',
    totalAmount: 267.33,
    totalSessions: 231,
    entries: [
      { role: 'boot', amount: 33.91, sessions: 36 },
      { role: 'mayor', amount: 233.42, sessions: 195 },
    ],
  },
  {
    id: 'cr-20260421',
    date: '2026-04-21',
    totalAmount: 284.52,
    totalSessions: 248,
    entries: [
      { role: 'boot', amount: 36.21, sessions: 39 },
      { role: 'mayor', amount: 248.31, sessions: 209 },
    ],
  },
];

export const mockCostSummary: CostSummary = {
  periodStart: '2026-04-21',
  periodEnd: '2026-04-27',
  totalAmount: dailyReports.reduce((sum, r) => sum + r.totalAmount, 0),
  totalSessions: dailyReports.reduce((sum, r) => sum + r.totalSessions, 0),
  dailyReports,
};
