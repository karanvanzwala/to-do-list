"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Helper function to check if we're in browser environment
  const isBrowser = () => typeof window !== "undefined";

  // During SSR, show loading state
  if (!isBrowser()) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  useEffect(() => {
    // Only redirect in browser environment
    if (isBrowser() && !loading && !isAuthenticated()) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div
          className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"
          role="status"
          aria-label="Loading"
        ></div>
      </div>
    );
  }

  if (!isAuthenticated()) {
    return null;
  }

  return children;
};

export default ProtectedRoute;
