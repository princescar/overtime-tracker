interface ErrorResponse {
  success: false;
  error: {
    message: string;
    code?: string;
  };
}

interface SuccessResponse<T> {
  success: true;
  data: T;
}

export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

export function createErrorResponse(error: unknown): Response {
  console.error(error);

  const errorMessage = error instanceof Error ? error.message : String(error);
  const errorCode =
    typeof (error as { code: string }).code === "string"
      ? (error as { code: string }).code
      : undefined;
  const response: ErrorResponse = {
    success: false,
    error: {
      message: errorMessage,
      code: errorCode,
    },
  };

  return Response.json(response, {
    status: 400,
  });
}

export function createSuccessResponse<T>(data: T): Response {
  const response: SuccessResponse<T> = { success: true, data };
  return Response.json(response);
}
