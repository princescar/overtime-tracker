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
      body: requestBody ? JSON.stringify(requestBody) : undefined,
    });

    responseBody = (await response.json()) as ApiResponse<T>;
  } catch (error) {
    console.log(error);
    throw new RequestError("Request failed");
  }

  if (!responseBody.success) {
    throw new ServerError(responseBody.error.code ?? "UNKNOWN", responseBody.error.message);
  }

  return responseBody.data;
};

class RequestError extends Error {
  code = "REQUEST_ERROR";
  constructor(message: string) {
    super(message);
    this.name = "RequestError";
  }
}

class ServerError extends Error {
  code: string;
  constructor(code: string, message: string) {
    super(message);
    this.name = "ServerError";
    this.code = code;
  }
}
