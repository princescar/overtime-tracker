import { Router } from "@hattip/router";
import { z } from "zod";
import {
  createErrorResponse,
  createSuccessResponse,
} from "#/utils/responseFormatter";
import { isLanguageSupported } from "#/utils/i18n";

export default (app: Router) => {
  // Set user preferred language
  app.put("/api/preferences/language", async (context) => {
    const body = (await context.request.json()) as unknown;

    try {
      const { language } = z.object({ language: z.string() }).parse(body);

      if (!isLanguageSupported(language)) {
        throw new Error("Language not supported");
      }

      context.setCookie("language", language, {
        path: "/",
        maxAge: 2147483647, // The max value for max-age
        httpOnly: true,
        secure: true,
      });

      return createSuccessResponse({ language });
    } catch (error) {
      return createErrorResponse(error);
    }
  });
};
