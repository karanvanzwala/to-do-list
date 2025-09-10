"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import taskService from "@/services/taskService";

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filters, setFilters] = useState({ status: "all", priority: "all" });
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    status: "pending",
    priority: "medium",
    due_date: "",
  });

  // Helper function to check if we're in browser environment
  const isBrowser = typeof window !== "undefined";

  const loadTasks = useCallback(async () => {
    // Only load tasks in browser environment and when user is available
    if (!isBrowser || !user) return;

    // Prevent running during SSR
    if (typeof window === "undefined") return;

    try {
      const userTasks = taskService.getTasks(user.id, filters);
      setTasks(userTasks);
    } catch (error) {
      console.error("Error loading tasks:", error);
    } finally {
      setLoading(false);
    }
  }, [isBrowser, user, filters]);

  useEffect(() => {
    // Only load tasks when user is available and we're in browser
    if (user && isBrowser && typeof window !== "undefined") {
      loadTasks();
    }
  }, [filters, user, isBrowser, loadTasks]);

  const handleInputChange = (e) => {
    if (!isBrowser) return;

    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    // Prevent form submission during SSR
    if (!isBrowser) return;

    e.preventDefault();

    // Ensure user is available and we're in browser
    if (!user || !isBrowser) return;

    try {
      if (editingTask) {
        await taskService.updateTask(editingTask.id, formData, user.id);
        setEditingTask(null);
      } else {
        await taskService.createTask(formData, user.id);
        setShowCreateForm(false);
      }

      setFormData({
        title: "",
        description: "",
        status: "pending",
        priority: "medium",
        due_date: "",
      });

      loadTasks();
    } catch (error) {
      console.error("Error saving task:", error);
      if (isBrowser) {
        alert("Error saving task. Please try again.");
      }
    }
  };

  const handleEdit = (task) => {
    if (!user || !isBrowser) return;

    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      due_date: task.due_date,
    });
    setShowCreateForm(false);
  };

  const handleDelete = async (taskId) => {
    if (!user || !isBrowser) return;

    if (isBrowser && confirm("Are you sure you want to delete this task?")) {
      try {
        await taskService.deleteTask(taskId, user.id);
        loadTasks();
      } catch (error) {
        console.error("Error deleting task:", error);
        if (isBrowser) {
          alert("Error deleting task. Please try again.");
        }
      }
    }
  };

  const handleCancel = () => {
    if (!isBrowser) return;

    setShowCreateForm(false);
    setEditingTask(null);
    setFormData({
      title: "",
      description: "",
      status: "pending",
      priority: "medium",
      due_date: "",
    });
  };

  const getPriorityColor = (priority) => {
    // Don't process during SSR
    if (typeof window === "undefined") {
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }

    switch (priority) {
      case "high":
        return "bg-gradient-to-r from-red-500 to-red-600 text-white shadow-lg";
      case "medium":
        return "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white shadow-lg";
      case "low":
        return "bg-gradient-to-r from-green-500 to-green-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }
  };

  const getStatusColor = (status) => {
    // Don't process during SSR
    if (typeof window === "undefined") {
      return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }

    switch (status) {
      case "completed":
        return "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg";
      case "in-progress":
        return "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg";
      case "pending":
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
      default:
        return "bg-gradient-to-r from-gray-500 to-gray-600 text-white shadow-lg";
    }
  };

  const formatDate = (dateString) => {
    // Don't format dates during SSR
    if (typeof window === "undefined") return "No due date";

    if (!dateString) return "No due date";
    return new Date(dateString).toLocaleDateString();
  };

  const getTaskStats = () => {
    // Don't calculate stats during SSR
    if (typeof window === "undefined") {
      return { total: 0, completed: 0, pending: 0, inProgress: 0 };
    }

    const total = tasks.length;
    const completed = tasks.filter((t) => t.status === "completed").length;
    const pending = tasks.filter((t) => t.status === "pending").length;
    const inProgress = tasks.filter((t) => t.status === "in-progress").length;

    return { total, completed, pending, inProgress };
  };

  const stats = getTaskStats();

  // Don't render dashboard content during SSR or when user is not loaded
  if (!isBrowser || !user || typeof window === "undefined") {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50">
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600"></div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        {/* Modern Header */}
        <header
          className={`bg-white/80 ${
            typeof window !== "undefined" ? "backdrop-blur-md" : ""
          } shadow-lg border-b border-white/20 sticky top-0 z-50`}
        >
          <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
            <div className="flex justify-between items-center py-3 sm:py-4 lg:py-6">
              {/* Logo and Title Section */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 min-w-0 flex-1">
                <div
                  className={`w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 ${
                    typeof window !== "undefined"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-700"
                      : "bg-blue-600"
                  } rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg flex-shrink-0`}
                >
                  <svg
                    className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl lg:text-2xl xl:text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                    Task Dashboard
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium truncate hidden sm:block">
                    Welcome back,{" "}
                    {isBrowser && typeof window !== "undefined" && user?.name
                      ? user.name
                      : "User"}
                    ! 👋
                  </p>
                </div>
              </div>

              {/* Action Buttons Section */}
              <div className="flex items-center space-x-2 sm:space-x-3 lg:space-x-4 flex-shrink-0">
                <button
                  onClick={() => isBrowser && setShowCreateForm(true)}
                  disabled={!isBrowser}
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg sm:rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 ${
                    typeof window !== "undefined"
                      ? "transform hover:scale-105"
                      : ""
                  } shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm lg:text-base flex items-center`}
                >
                  <svg
                    className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 inline mr-1 sm:mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                    />
                  </svg>
                  <span className="hidden sm:inline">Add Task</span>
                  <span className="sm:hidden">Add</span>
                </button>
                <button
                  onClick={() => isBrowser && logout()}
                  disabled={!isBrowser}
                  className="text-gray-600 hover:text-gray-900 px-2 sm:px-3 lg:px-4 py-1.5 sm:py-2 lg:py-3 rounded-lg text-xs sm:text-sm lg:text-base font-medium hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="hidden sm:inline">Logout</span>
                  <span className="sm:hidden">Out</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
          {/* Statistics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 ${
                typeof window !== "undefined" ? "hover:shadow-xl" : ""
              } transition-all duration-300`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Total Tasks
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {typeof window !== "undefined" ? stats.total : 0}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 ${
                typeof window !== "undefined" ? "hover:shadow-xl" : ""
              } transition-all duration-300`}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Completed
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {typeof window !== "undefined" ? stats.completed : 0}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 ${
                typeof window !== "undefined" ? "hover:shadow-xl" : ""
              } transition-all duration-300`}
            >
              <div className="flex items-center">
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg sm:rounded-xl">
                  <svg
                    className="w-5 h-5 sm:w-6 sm:h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 10V3L4 14h7v7l9-11h-7z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    In Progress
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {typeof window !== "undefined" ? stats.inProgress : 0}
                  </p>
                </div>
              </div>
            </div>

            <div
              className={`bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 ${
                typeof window !== "undefined" ? "hover:shadow-xl" : ""
              } transition-all duration-300`}
            >
              <div className="flex items-center">
                <div className="p-3 bg-gradient-to-br from-slate-500 to-slate-600 rounded-xl">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-xs sm:text-sm font-medium text-gray-600">
                    Pending
                  </p>
                  <p className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">
                    {typeof window !== "undefined" ? stats.pending : 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Filters */}
          <div
            className={`mb-6 sm:mb-8 bg-white/70 backdrop-blur-sm rounded-xl sm:rounded-2xl shadow-lg p-4 sm:p-6 border border-white/20 ${
              typeof window !== "undefined" ? "hover:shadow-xl" : ""
            } transition-all duration-300`}
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg
                className="w-5 h-5 mr-2 text-gray-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z"
                />
              </svg>
              Filter Tasks
            </h3>
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  value={filters.status}
                  onChange={(e) => {
                    if (isBrowser) {
                      setFilters((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }));
                    }
                  }}
                  disabled={!isBrowser}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority
                </label>
                <select
                  value={filters.priority}
                  onChange={(e) =>
                    isBrowser &&
                    setFilters((prev) => ({
                      ...prev,
                      priority: e.target.value,
                    }))
                  }
                  disabled={!isBrowser}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <option value="all">All Priorities</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
          </div>

          {/* Enhanced Create/Edit Task Form */}
          {(showCreateForm || editingTask) && (
            <div
              className={`mb-8 bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-white/20 ${
                typeof window !== "undefined" ? "hover:shadow-2xl" : ""
              } transition-all duration-300`}
            >
              <div className="flex items-center mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mr-4">
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {editingTask ? "Edit Task" : "Create New Task"}
                </h3>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={(e) => {
                        if (isBrowser) {
                          handleInputChange(e);
                        }
                      }}
                      required
                      disabled={!isBrowser}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      placeholder="Enter task title"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date
                    </label>
                    <input
                      type="date"
                      name="due_date"
                      value={formData.due_date}
                      onChange={(e) => {
                        if (isBrowser) {
                          handleInputChange(e);
                        }
                      }}
                      disabled={!isBrowser}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={(e) => {
                      if (isBrowser) {
                        handleInputChange(e);
                      }
                    }}
                    rows={4}
                    disabled={!isBrowser}
                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 placeholder-gray-500 transition-all duration-200 shadow-sm resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                    placeholder="Enter task description"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={(e) => {
                        if (isBrowser) {
                          handleInputChange(e);
                        }
                      }}
                      disabled={!isBrowser}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      name="priority"
                      value={formData.priority}
                      onChange={(e) => {
                        if (isBrowser) {
                          handleInputChange(e);
                        }
                      }}
                      disabled={!isBrowser}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 bg-white/80 backdrop-blur-sm text-gray-900 transition-all duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => isBrowser && handleCancel()}
                    disabled={!isBrowser}
                    className="px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-500/20 focus:border-gray-500 transition-all duration-200 shadow-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!isBrowser}
                    className={`px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 ${
                      typeof window !== "undefined"
                        ? "transform hover:scale-105"
                        : ""
                    } shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {editingTask ? "Update Task" : "Create Task"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Enhanced Tasks List */}
          <div
            className={`bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden ${
              typeof window !== "undefined" ? "hover:shadow-xl" : ""
            } transition-all duration-300`}
          >
            <div className="px-8 py-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-gray-900 flex items-center">
                  <svg
                    className="w-6 h-6 mr-3 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Tasks ({typeof window !== "undefined" ? tasks.length : 0})
                </h3>
                <div className="text-sm text-gray-600 font-medium">
                  {typeof window !== "undefined"
                    ? `${stats.completed} of ${stats.total} completed`
                    : "0 of 0 completed"}
                </div>
              </div>
            </div>

            {loading || typeof window === "undefined" ? (
              <div className="p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
                <p className="mt-4 text-gray-600 font-medium">
                  {typeof window === "undefined"
                    ? "Initializing..."
                    : "Loading your tasks..."}
                </p>
              </div>
            ) : typeof window === "undefined" || tasks.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-12 h-12 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {typeof window === "undefined"
                    ? "Initializing..."
                    : "No tasks yet"}
                </h3>
                <p className="text-gray-500 mb-4">
                  {typeof window !== "undefined"
                    ? "Get started by creating your first task!"
                    : "Loading..."}
                </p>
                <button
                  onClick={() => isBrowser && setShowCreateForm(true)}
                  disabled={!isBrowser}
                  className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-4 focus:ring-blue-500/30 transition-all duration-300 ${
                    typeof window !== "undefined"
                      ? "transform hover:scale-105"
                      : ""
                  } shadow-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  Create Your First Task
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {typeof window !== "undefined" &&
                  tasks.map((task) => (
                    <div
                      key={task.id}
                      className={`p-8 ${
                        typeof window !== "undefined"
                          ? "hover:bg-gray-50/50"
                          : ""
                      } transition-all duration-200 group`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4 mb-3">
                            <h4
                              className={`text-xl font-semibold text-gray-900 ${
                                typeof window !== "undefined"
                                  ? "group-hover:text-blue-600"
                                  : ""
                              } transition-colors duration-200`}
                            >
                              {typeof window !== "undefined"
                                ? task.title
                                : "Loading..."}
                            </h4>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getPriorityColor(
                                task.priority
                              )}`}
                            >
                              {typeof window !== "undefined"
                                ? task.priority.charAt(0).toUpperCase() +
                                  task.priority.slice(1)
                                : "Loading..."}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                                task.status
                              )}`}
                            >
                              {typeof window !== "undefined"
                                ? task.status
                                    .replace("-", " ")
                                    .split(" ")
                                    .map(
                                      (word) =>
                                        word.charAt(0).toUpperCase() +
                                        word.slice(1)
                                    )
                                    .join(" ")
                                : "Loading..."}
                            </span>
                          </div>

                          {typeof window !== "undefined" &&
                            task.description && (
                              <p className="text-gray-600 mb-4 text-base leading-relaxed">
                                {task.description}
                              </p>
                            )}

                          <div className="flex items-center space-x-6 text-sm text-gray-500">
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              Due:{" "}
                              {typeof window !== "undefined"
                                ? formatDate(task.due_date)
                                : "Loading..."}
                            </span>
                            <span className="flex items-center">
                              <svg
                                className="w-4 h-4 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Created:{" "}
                              {typeof window !== "undefined"
                                ? formatDate(task.created_at)
                                : "Loading..."}
                            </span>
                            {typeof window !== "undefined" &&
                              task.updated_at !== task.created_at && (
                                <span className="flex items-center">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                                    />
                                  </svg>
                                  Updated:{" "}
                                  {typeof window !== "undefined"
                                    ? formatDate(task.updated_at)
                                    : "Loading..."}
                                </span>
                              )}
                          </div>
                        </div>

                        <div
                          className={`flex items-center space-x-2 ml-6 ${
                            typeof window !== "undefined"
                              ? "opacity-0 group-hover:opacity-100"
                              : "opacity-100"
                          } transition-opacity duration-200`}
                        >
                          <button
                            onClick={() => isBrowser && handleEdit(task)}
                            disabled={!isBrowser}
                            className="p-3 text-blue-600 hover:text-blue-800 rounded-xl hover:bg-blue-50 focus:outline-none focus:ring-4 focus:ring-blue-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Edit task"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => isBrowser && handleDelete(task.id)}
                            disabled={!isBrowser}
                            className="p-3 text-red-600 hover:text-red-800 rounded-xl hover:bg-red-50 focus:outline-none focus:ring-4 focus:ring-red-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Delete task"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
