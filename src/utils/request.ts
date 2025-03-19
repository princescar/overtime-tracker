import type { ApiResponse } from "./responseFormatter";

export const request = async <T>(
  url: string,
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" = "GET",
  requestBody?: unknown,
): Promise<T> => {
  let responseBody: ApiResponse<T>;
  try {
    const response = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      // oxlint-disable-next-line no-invalid-fetch-options
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    responseBody = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.log(error);
    throw new RequestError("Request failed", { cause: error });
  }

  if (!responseBody.success) {
    throw new ServerError(responseBody.error.code ?? "UNKNOWN", responseBody.error.message, {
      cause: responseBody,
    });
  }

  return responseBody.data;
};

class RequestError extends Error {
  code = "NETWORK";
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "RequestError";
  }
}

class ServerError extends Error {
  code: string;
  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "ServerError";
    this.code = code;
  }
}
