import { setupWorker } from "msw/browser";
import { handlers } from "./handlers";
import { webhookSecretHandlers } from "./webhookSecret.mock";

export const worker = setupWorker(...handlers, ...webhookSecretHandlers);
