import {pinoHttp} from "pino-http";
import { randomUUID } from "node:crypto";

import { logger } from "../config/logger.js";

export const requestLogger = pinoHttp({
  logger,

  genReqId: (req, res) => {
    const existingId = req.headers["x-request-id"];

    if (typeof existingId === "string") {
      return existingId;
    }

    const requestId = randomUUID();

    res.setHeader("X-Request-Id", requestId);

    return requestId;
  },
});