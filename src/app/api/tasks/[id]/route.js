import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { taskSchemas } from "@/lib/validation";
import { authenticateToken } from "@/lib/auth";

// Get a specific task
async function getTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const connection = await pool.getConnection();
    try {
      const [tasks] = await connection.execute(
        "SELECT * FROM tasks WHERE id = ? AND user_id = ?",
        [taskId, userId]
      );

      if (tasks.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Task not found",
          },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: tasks[0],
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get task error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Update a specific task
async function updateTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;
    const body = await req.json();

    // Validate request body
    const { error, value } = taskSchemas.update.validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.details[0].message,
        },
        { status: 400 }
      );
    }

    const connection = await pool.getConnection();
    try {
      // Check if task exists and belongs to user
      const [existingTasks] = await connection.execute(
        "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
        [taskId, userId]
      );

      if (existingTasks.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Task not found",
          },
          { status: 404 }
        );
      }

      // Build update query dynamically
      const updateFields = [];
      const updateValues = [];

      Object.keys(value).forEach((key) => {
        if (value[key] !== undefined && value[key] !== null) {
          updateFields.push(`${key} = ?`);
          updateValues.push(value[key]);
        }
      });

      if (updateFields.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "No fields to update",
          },
          { status: 400 }
        );
      }

      // Add task ID to update values
      updateValues.push(taskId);

      const updateQuery = `UPDATE tasks SET ${updateFields.join(
        ", "
      )} WHERE id = ? AND user_id = ?`;
      updateValues.push(userId);

      await connection.execute(updateQuery, updateValues);

      // Fetch updated task
      const [updatedTasks] = await connection.execute(
        "SELECT * FROM tasks WHERE id = ?",
        [taskId]
      );

      return NextResponse.json({
        success: true,
        message: "Task updated successfully",
        data: updatedTasks[0],
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Update task error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Delete a specific task
async function deleteTask(req, res) {
  try {
    const taskId = req.params.id;
    const userId = req.user.userId;

    const connection = await pool.getConnection();
    try {
      // Check if task exists and belongs to user
      const [existingTasks] = await connection.execute(
        "SELECT id FROM tasks WHERE id = ? AND user_id = ?",
        [taskId, userId]
      );

      if (existingTasks.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Task not found",
          },
          { status: 404 }
        );
      }

      // Delete the task
      await connection.execute(
        "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        [taskId, userId]
      );

      return NextResponse.json({
        success: true,
        message: "Task deleted successfully",
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Delete task error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Export authenticated handlers
export const GET = authenticateToken(getTask);
export const PUT = authenticateToken(updateTask);
export const DELETE = authenticateToken(deleteTask);
