declare global {
  enum WorkLocation {
    HOME = "HOME",
    OFFICE = "OFFICE",
    BUSINESS_TRIP = "BUSINESS_TRIP",
  }

  enum WorklogStatus {
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
  }

  interface IWorklog {
    id: string;
    userId: string;
    startTime: Date;
    endTime?: Date;
    description?: string;
    location: WorkLocation;
    cost?: number; // in minutes, set when completed
  }
}

export {};
