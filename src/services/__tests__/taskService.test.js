import taskService from "../taskService";

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

describe("TaskService", () => {
  beforeEach(() => {
    safeStorageMock.getItem.mockReturnValue(null);
    safeStorageMock.setItem.mockClear();
    safeStorageMock.removeItem.mockClear();
    jest.clearAllMocks();
  });

  describe("Initialization", () => {
    it("should initialize with sample tasks when no tasks exist", () => {
      safeStorageMock.getItem.mockReturnValue(null);

      // Create new instance to trigger initialization
      const newTaskService = require("../taskService").default;

      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("Complete project documentation")
      );
      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("Setup testing environment")
      );
      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("Review code quality")
      );
    });

    it("should not reinitialize if tasks already exist", () => {
      const existingTasks = JSON.stringify([
        { id: 1, title: "Existing Task", user_id: 1 },
      ]);
      safeStorageMock.getItem.mockReturnValue(existingTasks);

      // Create new instance
      const newTaskService = require("../taskService").default;

      expect(safeStorageMock.setItem).not.toHaveBeenCalled();
    });
  });

  describe("getTasks", () => {
    beforeEach(() => {
      const sampleTasks = [
        {
          id: 1,
          title: "Task 1",
          status: "pending",
          priority: "high",
          user_id: 1,
          due_date: "2024-01-15",
        },
        {
          id: 2,
          title: "Task 2",
          status: "completed",
          priority: "medium",
          user_id: 1,
          due_date: "2024-01-10",
        },
        {
          id: 3,
          title: "Task 3",
          status: "in-progress",
          priority: "low",
          user_id: 2,
          due_date: "2024-01-20",
        },
      ];
      safeStorageMock.getItem.mockReturnValue(JSON.stringify(sampleTasks));
    });

    it("should return all tasks for a user when no filters applied", () => {
      const tasks = taskService.getTasks(1);

      expect(tasks).toHaveLength(2);
      expect(tasks[0].title).toBe("Task 1");
      expect(tasks[1].title).toBe("Task 2");
    });

    it("should filter tasks by status", () => {
      const tasks = taskService.getTasks(1, { status: "pending" });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe("pending");
    });

    it("should filter tasks by priority", () => {
      const tasks = taskService.getTasks(1, { priority: "high" });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].priority).toBe("high");
    });

    it("should filter tasks by both status and priority", () => {
      const tasks = taskService.getTasks(1, {
        status: "completed",
        priority: "medium",
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0].status).toBe("completed");
      expect(tasks[0].priority).toBe("medium");
    });

    it("should return empty array for non-existent user", () => {
      const tasks = taskService.getTasks(999);

      expect(tasks).toHaveLength(0);
    });

    it("should sort tasks by due date and priority", () => {
      const tasks = taskService.getTasks(1);

      // Should be sorted by due date first (earliest first), then by priority
      expect(tasks[0].due_date).toBe("2024-01-10"); // Task 2 (earlier date)
      expect(tasks[1].due_date).toBe("2024-01-15"); // Task 1 (later date)
    });

    it("should handle malformed localStorage data gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      const tasks = taskService.getTasks(1);

      expect(tasks).toEqual([]);
    });
  });

  describe("getTaskById", () => {
    beforeEach(() => {
      const sampleTasks = [
        {
          id: 1,
          title: "Task 1",
          user_id: 1,
        },
        {
          id: 2,
          title: "Task 2",
          user_id: 2,
        },
      ];
      safeStorageMock.getItem.mockReturnValue(JSON.stringify(sampleTasks));
    });

    it("should return task by ID for correct user", () => {
      const task = taskService.getTaskById(1, 1);

      expect(task).toBeDefined();
      expect(task.title).toBe("Task 1");
    });

    it("should return null for non-existent task ID", () => {
      const task = taskService.getTaskById(999, 1);

      expect(task).toBeNull();
    });

    it("should return null for task owned by different user", () => {
      const task = taskService.getTaskById(2, 1);

      expect(task).toBeNull();
    });

    it("should handle malformed localStorage data gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      const task = taskService.getTaskById(1, 1);

      expect(task).toBeNull();
    });
  });

  describe("createTask", () => {
    beforeEach(() => {
      safeStorageMock.getItem.mockReturnValue(JSON.stringify([]));
    });

    it("should create a new task with all required fields", () => {
      const taskData = {
        title: "New Task",
        description: "Task description",
        status: "pending",
        priority: "medium",
        due_date: "2024-01-25",
      };

      const newTask = taskService.createTask(taskData, 1);

      expect(newTask.id).toBeDefined();
      expect(newTask.title).toBe("New Task");
      expect(newTask.description).toBe("Task description");
      expect(newTask.status).toBe("pending");
      expect(newTask.priority).toBe("medium");
      expect(newTask.due_date).toBe("2024-01-25");
      expect(newTask.user_id).toBe(1);
      expect(newTask.created_at).toBeDefined();
      expect(newTask.updated_at).toBeDefined();

      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("New Task")
      );
    });

    it("should generate unique ID for new task", () => {
      const taskData = { title: "Task 1" };
      const task1 = taskService.createTask(taskData, 1);

      const taskData2 = { title: "Task 2" };
      const task2 = taskService.createTask(taskData2, 1);

      expect(task1.id).not.toBe(task2.id);
    });

    it("should handle malformed localStorage data gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      const taskData = { title: "New Task" };

      expect(() => {
        taskService.createTask(taskData, 1);
      }).toThrow();
    });
  });

  describe("updateTask", () => {
    beforeEach(() => {
      const sampleTasks = [
        {
          id: 1,
          title: "Original Title",
          description: "Original description",
          status: "pending",
          priority: "low",
          user_id: 1,
          created_at: "2024-01-01T00:00:00Z",
          updated_at: "2024-01-01T00:00:00Z",
        },
      ];
      safeStorageMock.getItem.mockReturnValue(JSON.stringify(sampleTasks));
    });

    it("should update existing task with new data", () => {
      const updateData = {
        title: "Updated Title",
        status: "completed",
      };

      const updatedTask = taskService.updateTask(1, updateData, 1);

      expect(updatedTask.title).toBe("Updated Title");
      expect(updatedTask.status).toBe("completed");
      expect(updatedTask.description).toBe("Original description"); // Should remain unchanged
      expect(updatedTask.updated_at).not.toBe("2024-01-01T00:00:00Z"); // Should be updated

      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("Updated Title")
      );
    });

    it("should throw error for non-existent task", () => {
      const updateData = { title: "Updated Title" };

      expect(() => {
        taskService.updateTask(999, updateData, 1);
      }).toThrow("Task not found");
    });

    it("should throw error for task owned by different user", () => {
      const updateData = { title: "Updated Title" };

      expect(() => {
        taskService.updateTask(1, updateData, 2);
      }).toThrow("Task not found");
    });

    it("should handle malformed localStorage data gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      const updateData = { title: "Updated Title" };

      expect(() => {
        taskService.updateTask(1, updateData, 1);
      }).toThrow();
    });
  });

  describe("deleteTask", () => {
    beforeEach(() => {
      const sampleTasks = [
        {
          id: 1,
          title: "Task 1",
          user_id: 1,
        },
        {
          id: 2,
          title: "Task 2",
          user_id: 1,
        },
      ];
      safeStorageMock.getItem.mockReturnValue(JSON.stringify(sampleTasks));
    });

    it("should delete existing task for correct user", () => {
      const result = taskService.deleteTask(1, 1);

      expect(result).toBe(true);
      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.not.stringContaining("Task 1")
      );
      expect(safeStorageMock.setItem).toHaveBeenCalledWith(
        "tasks",
        expect.stringContaining("Task 2")
      );
    });

    it("should throw error for non-existent task", () => {
      expect(() => {
        taskService.deleteTask(999, 1);
      }).toThrow("Task not found");
    });

    it("should throw error for task owned by different user", () => {
      expect(() => {
        taskService.deleteTask(1, 2);
      }).toThrow("Task not found");
    });

    it("should handle malformed localStorage data gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      expect(() => {
        taskService.deleteTask(1, 1);
      }).toThrow();
    });
  });

  describe("Error Handling", () => {
    it("should handle JSON parsing errors gracefully", () => {
      safeStorageMock.getItem.mockReturnValue("invalid json");

      const tasks = taskService.getTasks(1);
      expect(tasks).toEqual([]);
    });

    it("should handle localStorage errors gracefully", () => {
      safeStorageMock.setItem.mockImplementation(() => {
        throw new Error("Storage error");
      });

      const taskData = { title: "New Task" };

      expect(() => {
        taskService.createTask(taskData, 1);
      }).toThrow("Storage error");
    });
  });
});
