import { isAlphaNum } from "../utils/validation.js";

describe("isAlphaNum", () => {
  it("returns true for alphanumeric strings", () => {
    expect(isAlphaNum("abc123")).toBe(true);
    expect(isAlphaNum("ABCdef456")).toBe(true);
  });

  it("returns false for strings with special characters", () => {
    expect(isAlphaNum("abc123!")).toBe(false);
    expect(isAlphaNum("hello@world")).toBe(false);
  });

  it("returns false for strings with spaces", () => {
    expect(isAlphaNum("hello world")).toBe(false);
    expect(isAlphaNum("123 456")).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(isAlphaNum("")).toBe(false);
  });

    it("returns false for strings with only special characters", () => {
    expect(isAlphaNum("!@#$%^&*()")).toBe(false);
  });
});