export interface Alert {
  id: string;
  transactionId: string;
  amount: number;
  location: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  timestamp: string; // e.g., '2 mins ago'
  status: 'Pending Review' | 'Investigating' | 'Resolved Today';
}

export interface Stats {
  backlogItems: number;
  backlogGrowth: number; // e.g. +12%
  resolvedCases: number;
  avgResolutionTime: string; // e.g. '8.4m'
}
