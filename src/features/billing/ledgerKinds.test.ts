import { describe, expect, it } from "vitest";

import { LEDGER_KIND_LABELS } from "./ledgerKinds";

const BACKEND_KINDS = ["reserve", "commit", "refund", "topup", "grant", "adjust", "usage", "signup_grant", "first_topup_grant"];

describe("LEDGER_KIND_LABELS", () => {
    it("có nhãn tiếng Việt cho mọi kind backend trả về (portalLedgerSchema)", () => {
        for (const kind of BACKEND_KINDS) {
            expect(LEDGER_KIND_LABELS[kind], kind).toBeTruthy();
        }
    });
});
