import { WorkLocation } from "#/types/worklog";

/**
 * Validate work location
 */
export function validateWorkLocation(location: unknown): void {
  if (
    !location ||
    typeof location !== "string" ||
    !Object.values(WorkLocation).includes(location as WorkLocation)
  ) {
    throw new Error(`Invalid location: ${String(location)}`);
  }
}

/**
 * Validate date string or Date object
 */
export function validateDate(date: unknown, fieldName: string): void {
  if (
    !date ||
    (typeof date !== "string" && !(date instanceof Date)) ||
    isNaN(new Date(date).getTime())
  ) {
    throw new Error(`Invalid ${fieldName} format`);
  }
}
