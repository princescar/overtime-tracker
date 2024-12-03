import { createMiddleware } from "@hattip/adapter-node";
import handler from "./index";

export default createMiddleware(handler, { trustProxy: true });
