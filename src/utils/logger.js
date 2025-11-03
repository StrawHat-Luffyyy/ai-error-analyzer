import * as Sentry from "@sentry/node";

export const initSentry = () => {
  if (!process.env.SENTRY_DSN) {
    console.warn("Sentry DSN not provided. Skipping initialization.");
    return;
  }
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    tracesSampleRate: 1.0,
    integrations: [Sentry.expressIntegration()],
  });
  console.log("Sentry initialized successfully");
};

export const logInfo = (message) => {
  console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
};

export const logError = (error, context = "General") => {
  console.error(`[ERROR] [${context}] ${error.message}`);
  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, { tags: { context } });
  }
};
