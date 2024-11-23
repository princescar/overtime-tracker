export enum WorkLocation {
  HOME = "HOME",
  OFFICE = "OFFICE",
  BUSINESS_TRIP = "BUSINESS_TRIP",
}

export enum WorklogStatus {
  IN_PROGRESS = "IN_PROGRESS",
  COMPLETED = "COMPLETED",
}

export interface IWorklog {
  id: string;
  userId: string;
  startTime: Date;
  endTime?: Date;
  description?: string;
  location: WorkLocation;
  cost?: number;
}
