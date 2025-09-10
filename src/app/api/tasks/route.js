import { NextResponse } from "next/server";
import pool from "@/lib/db";
import { taskSchemas } from "@/lib/validation";
import { authenticateToken } from "@/lib/auth";

// Create new task
async function createTask(req, res) {
  try {
    const body = await req.json();

    // Validate request body
    const { error, value } = taskSchemas.create.validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.details[0].message,
        },
        { status: 400 }
      );
    }

    const { title, description, status, priority, due_date } = value;
    const userId = req.user.userId;

    const connection = await pool.getConnection();
    try {
      const [result] = await connection.execute(
        `INSERT INTO tasks (user_id, title, description, status, priority, due_date) 
         VALUES (?, ?, ?, ?, ?, ?)`,
        [userId, title, description, status, priority, due_date]
      );

      // Fetch the created task
      const [tasks] = await connection.execute(
        "SELECT * FROM tasks WHERE id = ?",
        [result.insertId]
      );

      return NextResponse.json(
        {
          success: true,
          message: "Task created successfully",
          data: tasks[0],
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Create task error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

// Get all tasks for the authenticated user
async function getTasks(req, res) {
  try {
    const userId = req.user.userId;
    const { searchParams } = new URL(req.url);

    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;
    const offset = (page - 1) * limit;

    let query = "SELECT * FROM tasks WHERE user_id = ?";
    let params = [userId];

    // Add filters
    if (status) {
      query += " AND status = ?";
      params.push(status);
    }
    if (priority) {
      query += " AND priority = ?";
      params.push(priority);
    }

    // Add pagination
    query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const connection = await pool.getConnection();
    try {
      const [tasks] = await connection.execute(query, params);

      // Get total count for pagination
      let countQuery = "SELECT COUNT(*) as total FROM tasks WHERE user_id = ?";
      let countParams = [userId];

      if (status) {
        countQuery += " AND status = ?";
        countParams.push(status);
      }
      if (priority) {
        countQuery += " AND priority = ?";
        countParams.push(priority);
      }

      const [countResult] = await connection.execute(countQuery, countParams);
      const total = countResult[0].total;

      return NextResponse.json({
        success: true,
        data: {
          tasks,
          pagination: {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
          },
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Get tasks error:", error);
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
export const POST = authenticateToken(createTask);
export const GET = authenticateToken(getTasks);
