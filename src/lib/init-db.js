import { initDatabase, testConnection } from "./db.js";
import bcrypt from "bcryptjs";
import pool from "./db.js";

async function createDemoUser() {
  try {
    const connection = await pool.getConnection();

    // Check if demo user already exists
    const [existingUsers] = await connection.execute(
      "SELECT id FROM users WHERE email = ?",
      ["admin@example.com"]
    );

    if (existingUsers.length === 0) {
      // Create demo user
      const hashedPassword = await bcrypt.hash("Admin123!", 12);

      await connection.execute(
        "INSERT INTO users (email, password, name) VALUES (?, ?, ?)",
        ["admin@example.com", hashedPassword, "Demo Admin"]
      );

      console.log("✅ Demo user created: admin@example.com / Admin123!");
    } else {
      console.log("ℹ️ Demo user already exists");
    }

    connection.release();
  } catch (error) {
    console.error("❌ Error creating demo user:", error.message);
  }
}

async function main() {
  console.log("🚀 Initializing database...");

  // Test connection
  const isConnected = await testConnection();
  if (!isConnected) {
    console.error("❌ Cannot proceed without database connection");
    process.exit(1);
  }

  // Initialize tables
  const tablesCreated = await initDatabase();
  if (!tablesCreated) {
    console.error("❌ Cannot proceed without database tables");
    process.exit(1);
  }

  // Create demo user
  await createDemoUser();

  console.log("✅ Database initialization completed successfully!");
  console.log("\n📋 Available endpoints:");
  console.log("POST /api/auth/register - User registration");
  console.log("POST /api/auth/login - User login");
  console.log("GET  /api/tasks - List tasks");
  console.log("POST /api/tasks - Create task");
  console.log("GET  /api/tasks/[id] - Get task");
  console.log("PUT  /api/tasks/[id] - Update task");
  console.log("DELETE /api/tasks/[id] - Delete task");

  process.exit(0);
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch(console.error);
}
