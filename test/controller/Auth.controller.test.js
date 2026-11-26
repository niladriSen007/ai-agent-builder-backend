import assert from "node:assert/strict";
import test from "node:test";
import { AuthController } from "../../src/controller/Auth.controller.ts";

test("refreshToken waits for the service before sending its access token", async () => {
  let responseBody;
  const res = {
    status() {
      return this;
    },
    json(body) {
      responseBody = body;
      return this;
    },
  };
  const controller = new AuthController({
    refreshToken: async () => "fresh-access-token",
  });

  await controller.refreshToken({}, res, (error) => {
    throw error;
  });

  assert.equal(responseBody.data.accessToken, "fresh-access-token");
});

test("refreshToken forwards service errors instead of sending a success response", async () => {
  const serviceError = new Error("Token not found");
  let forwardedError;
  let responseSent = false;
  const res = {
    status() {
      responseSent = true;
      return this;
    },
    json() {
      responseSent = true;
      return this;
    },
  };
  const controller = new AuthController({
    refreshToken: async () => {
      throw serviceError;
    },
  });

  await controller.refreshToken({}, res, (error) => {
    forwardedError = error;
  });

  assert.equal(forwardedError, serviceError);
  assert.equal(responseSent, false);
});
