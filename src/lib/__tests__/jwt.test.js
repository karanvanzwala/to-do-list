import jwt from "jsonwebtoken";
import { generateToken, verifyToken, decodeToken } from "../jwt";

describe("JWT Utilities", () => {
  const mockPayload = {
    userId: 1,
    email: "test@example.com",
    name: "Test User",
  };

  describe("generateToken", () => {
    it("should generate a valid JWT token", () => {
      const token = generateToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");
      expect(token.split(".")).toHaveLength(3); // JWT has 3 parts
    });

    it("should generate different tokens for different payloads", () => {
      const token1 = generateToken(mockPayload);
      const token2 = generateToken({ ...mockPayload, userId: 2 });

      expect(token1).not.toBe(token2);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token", () => {
      const token = generateToken(mockPayload);
      const decoded = verifyToken(token);

      expect(decoded).toMatchObject(mockPayload);
      expect(decoded.iat).toBeDefined();
      expect(decoded.exp).toBeDefined();
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        verifyToken("invalid.token.here");
      }).toThrow("Invalid token");
    });

    it("should throw error for expired token", () => {
      // Create a token that expires immediately
      const expiredToken = jwt.sign(mockPayload, process.env.JWT_SECRET, {
        expiresIn: "0s",
      });

      // Wait a bit for token to expire
      setTimeout(() => {
        expect(() => {
          verifyToken(expiredToken);
        }).toThrow("Token expired");
      }, 100);
    });
  });

  describe("decodeToken", () => {
    it("should decode token without verification", () => {
      const token = generateToken(mockPayload);
      const decoded = decodeToken(token);

      expect(decoded).toMatchObject(mockPayload);
    });

    it("should decode invalid token", () => {
      const decoded = decodeToken("invalid.token.here");
      expect(decoded).toBeNull();
    });
  });
});
