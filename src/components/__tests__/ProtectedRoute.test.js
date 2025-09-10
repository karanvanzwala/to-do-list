import { render, screen, waitFor } from "@testing-library/react";
import ProtectedRoute from "../ProtectedRoute";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";

// Mock the hooks
jest.mock("@/contexts/AuthContext", () => ({
  useAuth: jest.fn(),
}));
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
}));

const mockUseAuth = useAuth;
const mockUseRouter = useRouter;

describe("ProtectedRoute", () => {
  let mockRouter;

  beforeEach(() => {
    mockRouter = {
      push: jest.fn(),
    };
    mockUseRouter.mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  const renderProtectedRoute = (authState = {}) => {
    const mockIsAuthenticated = jest
      .fn()
      .mockReturnValue(authState.isAuthenticated || false);

    mockUseAuth.mockReturnValue({
      isAuthenticated: mockIsAuthenticated,
      loading: authState.loading || false,
      ...authState,
    });

    return render(
      <ProtectedRoute>
        <div data-testid="protected-content">Protected Content</div>
      </ProtectedRoute>
    );
  };

  describe("Loading State", () => {
    it("should show loading spinner when authentication is loading", () => {
      renderProtectedRoute({ loading: true });

      expect(screen.getByTestId("protected-content")).not.toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument(); // Loading spinner
    });

    it("should not show protected content while loading", () => {
      renderProtectedRoute({ loading: true });

      expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
    });
  });

  describe("Unauthenticated State", () => {
    it("should redirect to login when user is not authenticated", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: false });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
      });
    });

    it("should not render protected content when unauthenticated", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: false });

      await waitFor(() => {
        expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
      });
    });

    it("should redirect immediately after loading completes", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: false });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Authenticated State", () => {
    it("should render protected content when user is authenticated", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });

    it("should not redirect when user is authenticated", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: true });

      await waitFor(() => {
        expect(mockRouter.push).not.toHaveBeenCalled();
      });
    });

    it("should show content after loading completes for authenticated user", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByText("Protected Content")).toBeInTheDocument();
      });
    });
  });

  describe("State Transitions", () => {
    it("should handle transition from loading to authenticated", async () => {
      const { rerender } = renderProtectedRoute({
        loading: true,
        isAuthenticated: false,
      });

      // Initially loading
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Transition to authenticated
      rerender(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      mockUseAuth.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(true),
        loading: false,
      });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
    });

    it("should handle transition from loading to unauthenticated", async () => {
      const { rerender } = renderProtectedRoute({
        loading: true,
        isAuthenticated: false,
      });

      // Initially loading
      expect(screen.getByRole("status")).toBeInTheDocument();

      // Transition to unauthenticated
      rerender(
        <ProtectedRoute>
          <div data-testid="protected-content">Protected Content</div>
        </ProtectedRoute>
      );

      mockUseAuth.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(false),
        loading: false,
      });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
      });
    });
  });

  describe("Edge Cases", () => {
    it("should handle undefined authentication state gracefully", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(undefined),
        loading: false,
      });

      renderProtectedRoute();

      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("should handle null authentication state gracefully", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(null),
        loading: false,
      });

      renderProtectedRoute();

      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });

    it("should handle function returning undefined gracefully", () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: jest.fn().mockReturnValue(undefined),
        loading: false,
      });

      renderProtectedRoute();

      expect(mockRouter.push).toHaveBeenCalledWith("/login");
    });
  });

  describe("Component Structure", () => {
    it("should render children when authenticated", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: true });

      await waitFor(() => {
        expect(screen.getByTestId("protected-content")).toBeInTheDocument();
      });
    });

    it("should render loading spinner with proper styling", () => {
      renderProtectedRoute({ loading: true });

      const spinner = screen.getByRole("status");
      expect(spinner).toHaveClass("animate-spin");
      expect(spinner).toHaveClass("rounded-full");
      expect(spinner).toHaveClass("h-32");
      expect(spinner).toHaveClass("w-32");
      expect(spinner).toHaveClass("border-b-2");
      expect(spinner).toHaveClass("border-blue-600");
    });

    it("should have proper container styling for loading state", () => {
      renderProtectedRoute({ loading: true });

      const container = screen.getByRole("status").parentElement;
      expect(container).toHaveClass("min-h-screen");
      expect(container).toHaveClass("flex");
      expect(container).toHaveClass("items-center");
      expect(container).toHaveClass("justify-center");
    });
  });

  describe("Router Integration", () => {
    it("should use the router from next/navigation", () => {
      renderProtectedRoute({ loading: false, isAuthenticated: false });

      expect(mockUseRouter).toHaveBeenCalled();
    });

    it("should call router.push with correct path", async () => {
      renderProtectedRoute({ loading: false, isAuthenticated: false });

      await waitFor(() => {
        expect(mockRouter.push).toHaveBeenCalledWith("/login");
      });
    });
  });
});
