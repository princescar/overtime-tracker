declare global {
  enum BalanceChangeType {
    WORKLOG = "WORKLOG",
    MANUAL = "MANUAL",
  }

  interface IBalanceHistory {
    id: string;
    userId: string;
    amount: number;
    timestamp: Date;
    worklogId: string;
    type: BalanceChangeType;
    description: string;
  }
}

export {};
