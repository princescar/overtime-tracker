export enum BalanceChangeType {
  WORKLOG = "WORKLOG",
  MANUAL = "MANUAL",
}

export interface IBalanceHistory {
  id: string;
  userId: string;
  amount: number;
  timestamp: Date;
  worklogId?: string;
  type: BalanceChangeType;
  description: string;
}
