interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

export const request = async <T>(
  url: string,
  method = "GET",
  body?: unknown,
): Promise<T> => {
  const response = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = (await response.json()) as ApiResponse<T>;
  if (!data.success || !response.ok) {
    throw new Error(
      data.error || `Request failed with status ${response.status}`,
    );
  }
  return data.data;
};
