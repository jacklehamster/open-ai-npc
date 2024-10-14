import * as Sentry from "@sentry/node";
import { Express, Request } from "express";

export function initSentry(app: Express) {
  Sentry.setupExpressErrorHandler(app)

  app.get("/debug-sentry", function mainHandler(_req, _res) {
    throw new Error("My first Sentry error!");
  });

  app.use(function onError(_err: any, _req: Request, res: any) {
    // The error id is attached to `res.sentry` to be returned
    // and optionally displayed to the user for support.
    res.statusCode = 500;
    res.end(res.sentry + "\n");
  });
}
