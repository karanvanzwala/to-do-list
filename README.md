# Car On Phone - Task Management System

A full-stack Next.js application with MySQL database, JWT authentication, and comprehensive task management features.

## 🚀 Features

- **User Authentication**: Secure registration and login with JWT tokens
- **Task Management**: Create, read, update, and delete tasks
- **Database**: MySQL with connection pooling and automatic table creation
- **Validation**: Comprehensive input validation using Joi schemas
- **Security**: Password hashing with bcrypt, JWT token authentication
- **Testing**: Jest and Supertest for comprehensive testing
- **API**: RESTful API endpoints with proper error handling

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL 8.0+
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Validation**: Joi
- **Testing**: Jest, Supertest, React Testing Library
- **Version Control**: Git & GitHub

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd car-on-phone
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Setup

Create a `.env.local` file in the root directory:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=car_on_phone_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
```

### 4. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE car_on_phone_db;
```

2. Initialize the database tables and demo user:
```bash
node src/lib/init-db.js
```

This will:
- Create the necessary tables (users, tasks)
- Create a demo user: `admin@example.com` / `Admin123!`

### 5. Run the Application

```bash
# Development mode
npm run dev

# Production build
npm run build
npm start
```

The application will be available at `http://localhost:3000`

## 📚 API Endpoints

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | User registration |
| POST | `/api/auth/login` | User login |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List all tasks (with pagination & filters) |
| POST | `/api/tasks` | Create new task |
| GET | `/api/tasks/[id]` | Get specific task |
| PUT | `/api/tasks/[id]` | Update task |
| DELETE | `/api/tasks/[id]` | Delete task |

### Query Parameters for Task Listing

- `status`: Filter by status (`pending`, `in_progress`, `completed`)
- `priority`: Filter by priority (`low`, `medium`, `high`)
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 10)

## 🔐 Authentication

All task endpoints require authentication. Include the JWT token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### Tasks Table
```sql
CREATE TABLE tasks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status ENUM('pending', 'in_progress', 'completed') DEFAULT 'pending',
  priority ENUM('low', 'medium', 'high') DEFAULT 'medium',
  due_date DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Test Structure

- **Unit Tests**: JWT utilities, validation schemas
- **Integration Tests**: API endpoints
- **Component Tests**: React components

## 📁 Project Structure

```
car-on-phone/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   └── tasks/
│   │   │       ├── [id]/
│   │   │       └── route.js
│   │   ├── login/
│   │   │   └── page.js
│   │   ├── globals.css
│   │   ├── layout.js
│   │   └── page.js
│   ├── lib/
│   │   ├── __tests__/
│   │   ├── auth.js
│   │   ├── db.js
│   │   ├── init-db.js
│   │   ├── jwt.js
│   │   └── validation.js
│   └── components/
├── jest.config.js
├── jest.setup.js
├── package.json
└── README.md
```

## 🔒 Security Features

- **Password Hashing**: bcrypt with 12 salt rounds
- **JWT Tokens**: Secure token-based authentication
- **Input Validation**: Comprehensive validation using Joi
- **SQL Injection Protection**: Parameterized queries
- **CORS Protection**: Built-in CORS handling
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Production Build

```bash
npm run build
npm start
```

### Environment Variables for Production

Ensure all environment variables are properly set in your production environment:
- Database credentials
- JWT secret (use a strong, unique secret)
- Server configuration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues
2. Create a new issue with detailed information
3. Include error logs and steps to reproduce

## 🔄 Version History

- **v1.0.0**: Initial release with authentication and task management
- Basic CRUD operations for tasks
- JWT authentication system
- MySQL database integration
- Comprehensive testing suite

---

**Happy Coding! 🎉**
