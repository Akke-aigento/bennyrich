import { describe, expect, test } from "bun:test";

import { readShopOpen, resolveShopOpen, shopClosedMessage } from "./shop-status";

describe("shop status (BILLING-LOCK-2)", () => {
  test("closes only on an explicit open === false", async () => {
    expect(await resolveShopOpen(async () => ({ open: false }))).toBe(false);
    expect(await resolveShopOpen(async () => ({ open: true }))).toBe(true);
  });

  test("missing field or unexpected shape means open", () => {
    expect(readShopOpen({})).toBe(true);
    expect(readShopOpen(null)).toBe(true);
    expect(readShopOpen({ success: false, error: "Unknown action" })).toBe(true);
    expect(readShopOpen({ open: "false" })).toBe(true);
  });

  test("an error means open", async () => {
    expect(
      await resolveShopOpen(async () => {
        throw new Error("SellQo 500");
      }),
    ).toBe(true);
  });

  test("no answer within the timeout means open", async () => {
    const never = () => new Promise<unknown>(() => {});
    expect(await resolveShopOpen(never, 20)).toBe(true);
  });

  test("checkout shows the SHOP_CLOSED message from the API", () => {
    const err = new Error(JSON.stringify({ code: "SHOP_CLOSED", message: "We are closed." }));
    expect(shopClosedMessage(err)).toBe("We are closed.");
    expect(shopClosedMessage(new Error("Payment failed"))).toBeNull();
    expect(shopClosedMessage(new Error(JSON.stringify({ code: "OTHER", message: "x" })))).toBeNull();
  });
});
