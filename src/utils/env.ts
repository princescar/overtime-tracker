// String environment variables
export const getRequiredEnvVar = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  return value;
};

export const getEnvVar = (key: string, defaultValue: string): string => {
  const value = process.env[key];
  return value ?? defaultValue;
};

// Numeric environment variables
export const getRequiredNumericEnvVar = (key: string): number => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  const numValue = Number(value);
  if (isNaN(numValue)) {
    throw new Error(`${key} environment variable must be a number`);
  }
  return numValue;
};

export const getNumericEnvVar = (key: string, defaultValue: number): number => {
  const value = process.env[key];
  if (!value) return defaultValue;

  const numValue = Number(value);
  return isNaN(numValue) ? defaultValue : numValue;
};

// Boolean environment variables
export const getRequiredBooleanEnvVar = (key: string): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (!value) {
    throw new Error(`${key} is not defined in environment variables`);
  }
  return ["true", "1", "yes"].includes(value);
};

export const getBooleanEnvVar = (key: string, defaultValue: boolean): boolean => {
  const value = process.env[key]?.toLowerCase();
  if (!value) return defaultValue;

  return ["true", "1", "yes"].includes(value);
};
