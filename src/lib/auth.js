import { verifyToken } from "./jwt";

// Authentication middleware
export function authenticateToken(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Access token required",
        });
      }

      try {
        const decoded = verifyToken(token);
        req.user = decoded;
        return handler(req, res);
      } catch (error) {
        return res.status(403).json({
          success: false,
          message: error.message,
        });
      }
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  };
}

// Optional authentication middleware (for routes that can work with or without auth)
export function optionalAuth(handler) {
  return async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const token = authHeader && authHeader.split(" ")[1];

      if (token) {
        try {
          const decoded = verifyToken(token);
          req.user = decoded;
        } catch (error) {
          // Token is invalid, but we continue without user
          req.user = null;
        }
      } else {
        req.user = null;
      }

      return handler(req, res);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Authentication error",
      });
    }
  };
}
