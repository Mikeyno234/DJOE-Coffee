import { describe, it, expect } from "vitest";
import { AuthService } from "@/lib/services/auth.service";

describe("AuthService Cryptographic Token System", () => {
  const sampleUser = {
    id: "usr-admin-1",
    email: "admin@djoecoffee.id",
    role: "ADMIN" as const,
    name: "Admin DJOE",
    permissions: ["pos", "hpp", "menu"] as any[],
  };

  it("should generate deterministic SHA-256 password hash", () => {
    const hash1 = AuthService.hashPassword("secret123");
    const hash2 = AuthService.hashPassword("secret123");
    const diffHash = AuthService.hashPassword("otherpassword");

    expect(hash1).toBe(hash2);
    expect(hash1).toHaveLength(64);
    expect(hash1).not.toBe(diffHash);
  });

  it("should sign and verify valid HMAC-SHA256 tokens", () => {
    const token = AuthService.signToken(sampleUser);
    expect(typeof token).toBe("string");
    expect(token).toContain(".");

    const verified = AuthService.verifyToken(token);
    expect(verified).not.toBeNull();
    if (verified) {
      expect(verified.id).toBe(sampleUser.id);
      expect(verified.email).toBe(sampleUser.email);
      expect(verified.role).toBe(sampleUser.role);
      expect(verified.name).toBe(sampleUser.name);
      expect(verified.exp).toBeGreaterThan(Date.now());
    }
  });

  it("should reject tampered payload", () => {
    const token = AuthService.signToken(sampleUser);
    const [payload, signature] = token.split(".");

    // Decode and modify payload role to SUPER_ADMIN
    const raw = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    raw.role = "SUPER_ADMIN";
    const forgedPayload = Buffer.from(JSON.stringify(raw)).toString("base64url");

    const tamperedToken = `${forgedPayload}.${signature}`;
    const result = AuthService.verifyToken(tamperedToken);

    expect(result).toBeNull();
  });

  it("should reject tampered signature", () => {
    const token = AuthService.signToken(sampleUser);
    const [payload] = token.split(".");

    const bogusSignature = Buffer.from("invalid_signature_bytes_12345678901234567890123456789012").toString("base64url");
    const tamperedToken = `${payload}.${bogusSignature}`;

    const result = AuthService.verifyToken(tamperedToken);
    expect(result).toBeNull();
  });

  it("should reject expired tokens", () => {
    // Generate token with negative lifespan (already expired)
    const expiredToken = AuthService.signToken(sampleUser, -1000);
    const result = AuthService.verifyToken(expiredToken);

    expect(result).toBeNull();
  });
});
