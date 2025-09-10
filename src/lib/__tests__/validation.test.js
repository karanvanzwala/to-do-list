import { userSchemas, taskSchemas } from "../validation";

describe("Validation Schemas", () => {
  describe("User Schemas", () => {
    describe("Register Schema", () => {
      it("should validate valid registration data", () => {
        const validData = {
          email: "test@example.com",
          password: "ValidPass123!",
          name: "Test User",
        };

        const { error } = userSchemas.register.validate(validData);
        expect(error).toBeUndefined();
      });

      it("should require email", () => {
        const invalidData = {
          password: "ValidPass123!",
          name: "Test User",
        };

        const { error } = userSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("Email is required");
      });

      it("should validate email format", () => {
        const invalidData = {
          email: "invalid-email",
          password: "ValidPass123!",
        };

        const { error } = userSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          "Please enter a valid email address"
        );
      });

      it("should validate password complexity", () => {
        const invalidData = {
          email: "test@example.com",
          password: "weakpassword", // 12 chars but no complexity
        };

        const { error } = userSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          "Password must contain uppercase, lowercase, number, and special character"
        );
      });

      it("should validate password length", () => {
        const invalidData = {
          email: "test@example.com",
          password: "Weak1!",
        };

        const { error } = userSchemas.register.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          "Password must be at least 8 characters long"
        );
      });
    });

    describe("Login Schema", () => {
      it("should validate valid login data", () => {
        const validData = {
          email: "test@example.com",
          password: "ValidPass123!",
        };

        const { error } = userSchemas.login.validate(validData);
        expect(error).toBeUndefined();
      });

      it("should require both email and password", () => {
        const invalidData = {
          email: "test@example.com",
        };

        const { error } = userSchemas.login.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("Password is required");
      });
    });
  });

  describe("Task Schemas", () => {
    describe("Create Task Schema", () => {
      it("should validate valid task data", () => {
        const validData = {
          title: "Test Task",
          description: "Test Description",
          status: "pending",
          priority: "medium",
          due_date: "2025-12-31",
        };

        const { error } = taskSchemas.create.validate(validData);
        expect(error).toBeUndefined();
      });

      it("should require title", () => {
        const invalidData = {
          description: "Test Description",
        };

        const { error } = taskSchemas.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe("Title is required");
      });

      it("should validate status enum", () => {
        const invalidData = {
          title: "Test Task",
          status: "invalid_status",
        };

        const { error } = taskSchemas.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          "Status must be pending, in_progress, or completed"
        );
      });

      it("should validate priority enum", () => {
        const invalidData = {
          title: "Test Task",
          priority: "invalid_priority",
        };

        const { error } = taskSchemas.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          "Priority must be low, medium, or high"
        );
      });

      it("should validate due date format", () => {
        const invalidData = {
          title: "Test Task",
          due_date: "invalid-date",
        };

        const { error } = taskSchemas.create.validate(invalidData);
        expect(error).toBeDefined();
        expect(error.details[0].message).toBe(
          '"due_date" must be in ISO 8601 date format'
        );
      });
    });

    describe("Update Task Schema", () => {
      it("should validate valid update data", () => {
        const validData = {
          title: "Updated Task",
          status: "completed",
        };

        const { error } = taskSchemas.update.validate(validData);
        expect(error).toBeUndefined();
      });

      it("should allow partial updates", () => {
        const validData = {
          status: "in_progress",
        };

        const { error } = taskSchemas.update.validate(validData);
        expect(error).toBeUndefined();
      });
    });
  });
});
