// Cost Report Types for Foop B2B Automation SaaS

export interface CostBreakdownItem {
  name: string;
  cost: number;
  sessions?: number;
}

export interface DailyCostReport {
  date: string;
  totalCost: number;
  totalSessions: number;
  byRole: CostBreakdownItem[];
  byRig: CostBreakdownItem[];
}
