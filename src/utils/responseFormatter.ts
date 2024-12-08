interface ErrorResponse {
  success: boolean;
  error: string;
}

interface SuccessResponse<T> {
  success: boolean;
  data: T;
}

export function createErrorResponse(error: unknown): Response {
  console.error(error);

  const response: ErrorResponse = {
    success: false,
    error: error instanceof Error ? error.message : String(error),
  };

  return Response.json(response, {
    status: 400,
  });
}

export function createSuccessResponse<T>(data: T): Response {
  const response: SuccessResponse<T> = { success: true, data };
  return Response.json(response);
}
