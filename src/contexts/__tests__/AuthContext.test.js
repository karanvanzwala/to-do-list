import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Mock next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

// Mock safeStorage
const safeStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

jest.mock("../../lib/storage", () => ({
  __esModule: true,
  default: safeStorageMock,
}));

// Test component to access context
const TestComponent = () => {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">
        {auth.user ? JSON.stringify(auth.user) : "no-user"}
      </div>
      <div data-testid="token">{auth.token || "no-token"}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <div data-testid="authenticated">{auth.isAuthenticated().toString()}</div>
      <button onClick={() => auth.login("test@example.com", "password")}>
        Login
      </button>
      <button
        onClick={() =>
          auth.register("Test User", "test@example.com", "password")
        }
      >
        Register
      </button>
      <button onClick={auth.logout}>Logout</button>
    </div>
  );
};

describe("AuthContext", () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    useRouter.mockReturnValue(mockRouter);
    safeStorageMock.getItem.mockReturnValue(null);
    safeStorageMock.setItem.mockClear();
    safeStorageMock.removeItem.mockClear();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const renderWithAuth = (component) => {
    return render(<AuthProvider>{component}</AuthProvider>);
  };

  describe("Initial State", () => {
    it("should start with loading state", async () => {
      renderWithAuth(<TestComponent />);
      expect(screen.getByTestId("loading")).toHaveTextContent("true");

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });
    });

    it("should initialize with no user and no token", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user")).toHaveTextContent("no-user");
      expect(screen.getByTestId("token")).toHaveTextContent("no-token");
    });

    it("should load existing user from localStorage", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      const mockToken = "mock_token";

      safeStorageMock.getItem
        .mockReturnValueOnce(mockToken) // token
        .mockReturnValueOnce(JSON.stringify(mockUser)); // user

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      expect(screen.getByTestId("user")).toHaveTextContent(
        JSON.stringify(mockUser)
      );
      expect(screen.getByTestId("token")).toHaveTextContent(mockToken);
      expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
    });
  });

  describe("Login Functionality", () => {
    it("should successfully login with valid admin credentials", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Create a test component that uses the correct admin credentials
      const AdminLoginComponent = () => {
        const auth = useAuth();
        const handleLogin = async () => {
          try {
            await auth.login("admin@example.com", "Admin123!");
          } catch (error) {
            // Handle error
          }
        };
        return <button onClick={handleLogin}>Admin Login</button>;
      };

      renderWithAuth(<AdminLoginComponent />);
      const adminLoginButton = screen.getByText("Admin Login");
      fireEvent.click(adminLoginButton);

      await waitFor(() => {
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          expect.stringContaining("mock_jwt_token_1_")
        );
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "user",
          expect.stringContaining('"id":1')
        );
      });
    });

    it("should successfully login with valid user credentials", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Create a test component that uses the correct user credentials
      const UserLoginComponent = () => {
        const auth = useAuth();
        const handleUserLogin = async () => {
          try {
            await auth.login("user@example.com", "User123!");
          } catch (error) {
            // Handle error
          }
        };
        return <button onClick={handleUserLogin}>User Login</button>;
      };

      renderWithAuth(<UserLoginComponent />);
      const userLoginButton = screen.getByText("User Login");
      fireEvent.click(userLoginButton);

      await waitFor(() => {
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          expect.stringContaining("mock_jwt_token_2_")
        );
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "user",
          expect.stringContaining('"id":2')
        );
      });
    });

    it("should throw error with invalid credentials", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      const { useAuth: useAuthHook } = require("../AuthContext");
      const TestErrorComponent = () => {
        const auth = useAuthHook();
        const [error, setError] = useState(null);

        const handleInvalidLogin = async () => {
          try {
            await auth.login("invalid@example.com", "wrongpassword");
          } catch (err) {
            setError(err.message);
          }
        };

        return (
          <div>
            <button onClick={handleInvalidLogin}>Invalid Login</button>
            {error && <div data-testid="error">{error}</div>}
          </div>
        );
      };

      renderWithAuth(<TestErrorComponent />);
      const invalidLoginButton = screen.getByText("Invalid Login");
      fireEvent.click(invalidLoginButton);

      await waitFor(() => {
        expect(screen.getByTestId("error")).toHaveTextContent(
          "Invalid credentials"
        );
      });
    });
  });

  describe("Register Functionality", () => {
    it("should successfully register a new user", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("loading")).toHaveTextContent("false");
      });

      // Create a test component that uses the correct register parameters
      const RegisterComponent = () => {
        const auth = useAuth();
        const handleRegister = async () => {
          try {
            await auth.register("Test User", "test@example.com", "password");
          } catch (error) {
            // Handle error
          }
        };
        return <button onClick={handleRegister}>Register</button>;
      };

      renderWithAuth(<RegisterComponent />);
      const registerButton = screen.getByText("Register");
      fireEvent.click(registerButton);

      await waitFor(() => {
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "token",
          expect.stringContaining("mock_jwt_token_")
        );
        expect(safeStorageMock.setItem).toHaveBeenCalledWith(
          "user",
          expect.stringContaining('"email":"test@example.com"')
        );
      });
    });
  });

  describe("Logout Functionality", () => {
    it("should clear user data and redirect on logout", async () => {
      // First login
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      const mockToken = "mock_token";

      safeStorageMock.getItem
        .mockReturnValueOnce(mockToken)
        .mockReturnValueOnce(JSON.stringify(mockUser));

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      });

      // Then logout
      const logoutButton = screen.getByText("Logout");
      fireEvent.click(logoutButton);

      expect(safeStorageMock.removeItem).toHaveBeenCalledWith("token");
      expect(safeStorageMock.removeItem).toHaveBeenCalledWith("user");
      expect(mockRouter.push).toHaveBeenCalledWith("/login");
      expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
    });
  });

  describe("Authentication State", () => {
    it("should return true when user is authenticated", async () => {
      const mockUser = { id: 1, email: "test@example.com", name: "Test User" };
      const mockToken = "mock_token";

      safeStorageMock.getItem
        .mockReturnValueOnce(mockToken)
        .mockReturnValueOnce(JSON.stringify(mockUser));

      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("true");
      });
    });

    it("should return false when user is not authenticated", async () => {
      renderWithAuth(<TestComponent />);

      await waitFor(() => {
        expect(screen.getByTestId("authenticated")).toHaveTextContent("false");
      });
    });
  });

  describe("Context Hook Usage", () => {
    it("should throw error when used outside provider", () => {
      // Suppress console.error for this test
      const consoleSpy = jest
        .spyOn(console, "error")
        .mockImplementation(() => {});

      // Mock window to simulate browser environment
      Object.defineProperty(window, "window", {
        value: {},
        writable: true,
      });

      expect(() => {
        render(<TestComponent />);
      }).toThrow("useAuth must be used within an AuthProvider");

      consoleSpy.mockRestore();
    });
  });
});
