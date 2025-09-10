import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { userSchemas } from "@/lib/validation";
import { generateToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const { error, value } = userSchemas.register.validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.details[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password, name } = value;

    // Check if user already exists
    const connection = await pool.getConnection();
    try {
      const [existingUsers] = await connection.execute(
        "SELECT id FROM users WHERE email = ?",
        [email]
      );

      if (existingUsers.length > 0) {
        return NextResponse.json(
          {
            success: false,
            message: "User with this email already exists",
          },
          { status: 409 }
        );
      }

      // Hash password
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Insert new user
      const [result] = await connection.execute(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        [email, hashedPassword, name || null]
      );

      // Generate JWT token
      const token = generateToken({
        userId: result.insertId,
        email,
        name,
      });

      // Return success response
      return NextResponse.json(
        {
          success: true,
          message: "User registered successfully",
          data: {
            user: {
              id: result.insertId,
              email,
              name,
            },
            token,
          },
        },
        { status: 201 }
      );
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
