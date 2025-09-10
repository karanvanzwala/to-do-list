// Static task service using safe storage
import safeStorage from "@/lib/storage";

class TaskService {
  constructor() {
    this.storageKey = "tasks";
    // Only initialize tasks in browser environment
    if (this.isBrowser()) {
      this.initializeTasks();
    }
  }

  // Helper method to check if we're in browser environment
  isBrowser() {
    return typeof window !== "undefined";
  }

  initializeTasks() {
    // Don't initialize during SSR
    if (!this.isBrowser()) return;

    if (!safeStorage.getItem(this.storageKey)) {
      // Initialize with some sample tasks
      const sampleTasks = [
        {
          id: 1,
          title: "Complete project documentation",
          description:
            "Write comprehensive documentation for the car-on-phone project",
          status: "in-progress",
          priority: "high",
          due_date: "2024-01-15",
          user_id: 1,
          created_at: "2024-01-10T10:00:00Z",
          updated_at: "2024-01-10T10:00:00Z",
        },
        {
          id: 2,
          title: "Setup testing environment",
          description:
            "Configure Jest and React Testing Library for unit tests",
          status: "completed",
          priority: "medium",
          due_date: "2024-01-12",
          user_id: 1,
          created_at: "2024-01-08T09:00:00Z",
          updated_at: "2024-01-12T15:00:00Z",
        },
        {
          id: 3,
          title: "Review code quality",
          description: "Perform code review and refactor if necessary",
          status: "pending",
          priority: "low",
          due_date: "2024-01-20",
          user_id: 1,
          created_at: "2024-01-10T14:00:00Z",
          updated_at: "2024-01-10T14:00:00Z",
        },
      ];
      safeStorage.setItem(this.storageKey, JSON.stringify(sampleTasks));
    }
  }

  getTasks(userId, filters = {}) {
    // Return empty array during SSR
    if (!this.isBrowser()) return [];

    try {
      const tasksData = safeStorage.getItem(this.storageKey);
      if (!tasksData) return [];

      const tasks = JSON.parse(tasksData);
      let filteredTasks = tasks.filter((task) => task.user_id === userId);

      // Apply filters
      if (filters.status && filters.status !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.status === filters.status
        );
      }
      if (filters.priority && filters.priority !== "all") {
        filteredTasks = filteredTasks.filter(
          (task) => task.priority === filters.priority
        );
      }

      // Sort by due date and priority
      filteredTasks.sort((a, b) => {
        if (a.due_date !== b.due_date) {
          return new Date(a.due_date) - new Date(b.due_date);
        }
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      return filteredTasks;
    } catch (error) {
      console.error("Error getting tasks:", error);
      return [];
    }
  }

  getTaskById(taskId, userId) {
    // Return null during SSR
    if (!this.isBrowser()) return null;

    try {
      const tasksData = safeStorage.getItem(this.storageKey);
      if (!tasksData) return null;

      const tasks = JSON.parse(tasksData);
      return tasks.find(
        (task) => task.id === taskId && task.user_id === userId
      );
    } catch (error) {
      console.error("Error getting task:", error);
      return null;
    }
  }

  createTask(taskData, userId) {
    // Throw error during SSR
    if (!this.isBrowser()) {
      throw new Error("Cannot create task during server-side rendering");
    }

    try {
      const tasksData = safeStorage.getItem(this.storageKey);
      const tasks = tasksData ? JSON.parse(tasksData) : [];

      const newTask = {
        id: Date.now(),
        ...taskData,
        user_id: userId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      tasks.push(newTask);
      safeStorage.setItem(this.storageKey, JSON.stringify(tasks));

      return newTask;
    } catch (error) {
      console.error("Error creating task:", error);
      throw error;
    }
  }

  updateTask(taskId, taskData, userId) {
    // Throw error during SSR
    if (!this.isBrowser()) {
      throw new Error("Cannot update task during server-side rendering");
    }

    try {
      const tasksData = safeStorage.getItem(this.storageKey);
      if (!tasksData) {
        throw new Error("Task not found");
      }

      const tasks = JSON.parse(tasksData);
      const taskIndex = tasks.findIndex(
        (task) => task.id === taskId && task.user_id === userId
      );

      if (taskIndex === -1) {
        throw new Error("Task not found");
      }

      tasks[taskIndex] = {
        ...tasks[taskIndex],
        ...taskData,
        updated_at: new Date().toISOString(),
      };

      safeStorage.setItem(this.storageKey, JSON.stringify(tasks));
      return tasks[taskIndex];
    } catch (error) {
      console.error("Error updating task:", error);
      throw error;
    }
  }

  deleteTask(taskId, userId) {
    // Throw error during SSR
    if (!this.isBrowser()) {
      throw new Error("Cannot delete task during server-side rendering");
    }

    try {
      const tasksData = safeStorage.getItem(this.storageKey);
      if (!tasksData) {
        throw new Error("Task not found");
      }

      const tasks = JSON.parse(tasksData);
      const filteredTasks = tasks.filter(
        (task) => !(task.id === taskId && task.user_id === userId)
      );

      if (filteredTasks.length === tasks.length) {
        throw new Error("Task not found");
      }

      safeStorage.setItem(this.storageKey, JSON.stringify(filteredTasks));
      return true;
    } catch (error) {
      console.error("Error deleting task:", error);
      throw error;
    }
  }
}

export default new TaskService();
