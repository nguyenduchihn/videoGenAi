import { setupServer } from "msw/node";
import { handlers } from "./handlers";
import { webhookSecretHandlers } from "./webhookSecret.mock";

export const server = setupServer(...handlers, ...webhookSecretHandlers);
