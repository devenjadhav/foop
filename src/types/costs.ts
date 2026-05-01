export interface CostEntry {
  role: string;
  amount: number;
  sessions: number;
}

export interface DailyCostReport {
  id: string;
  date: string;
  totalAmount: number;
  totalSessions: number;
  entries: CostEntry[];
}

export interface CostSummary {
  periodStart: string;
  periodEnd: string;
  totalAmount: number;
  totalSessions: number;
  dailyReports: DailyCostReport[];
}
