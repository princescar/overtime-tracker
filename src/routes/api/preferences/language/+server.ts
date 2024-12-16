import { z } from "zod";
import { isLanguageSupported } from "#/utils/i18n";
import { createErrorResponse, createSuccessResponse } from "#/utils/responseFormatter";
import type { RequestHandler } from "./$types";

// Set preferred language
export const PUT: RequestHandler = async ({ request, cookies }) => {
  const body = (await request.json()) as unknown;

  try {
    const { language } = z.object({ language: z.string() }).parse(body);

    if (!isLanguageSupported(language)) {
      throw new Error("Language not supported");
    }

    cookies.set("language", language, {
      path: "/",
      maxAge: 2147483647, // The max value for max-age
      httpOnly: true,
      secure: true,
    });

    return createSuccessResponse({ language });
  } catch (error) {
    return createErrorResponse(error);
  }
};
