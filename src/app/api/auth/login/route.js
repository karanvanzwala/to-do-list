import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import pool from "@/lib/db";
import { userSchemas } from "@/lib/validation";
import { generateToken } from "@/lib/jwt";

export async function POST(request) {
  try {
    const body = await request.json();

    // Validate request body
    const { error, value } = userSchemas.login.validate(body);
    if (error) {
      return NextResponse.json(
        {
          success: false,
          message: error.details[0].message,
        },
        { status: 400 }
      );
    }

    const { email, password } = value;

    // Find user by email
    const connection = await pool.getConnection();
    try {
      const [users] = await connection.execute(
        "SELECT id, email, password, name FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email or password",
          },
          { status: 401 }
        );
      }

      const user = users[0];

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          {
            success: false,
            message: "Invalid email or password",
          },
          { status: 401 }
        );
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        name: user.name,
      });

      // Return success response
      return NextResponse.json({
        success: true,
        message: "Login successful",
        data: {
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
          },
          token,
        },
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
