# TaskFlow API

A production-grade RESTful API for team task management built with **Node.js**, **Express**, and **MongoDB (Mongoose)**.

## Features

- **JWT Authentication**: User registration and login with bcrypt password hashing.
- **Task Management**: Full CRUD operations for team tasks with priority levels, statuses, and due dates.
- **Centralized Error Handling**: Unified operational error responses with automatic Mongoose validation and CastError formatting.
- **Scalable Architecture**: Strict separation of concerns across routes, controllers, services, models, and middleware.
- **Automated Testing**: Integration test suite powered by Jest, Supertest, and in-memory MongoDB.

---

## Tech Stack

- **Runtime**: Node.js (v18+)
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Testing**: Jest, Supertest, `mongodb-memory-server`
- **Linting**: ESLint

---

## Project Structure

```text
taskflow-api/
├── src/
│   ├── app.js               # Express application initialization & middleware
│   ├── server.js            # Server entrypoint and MongoDB connection
│   ├── config/
│   │   └── db.js            # Mongoose connection
│   ├── controllers/         # Request handling & HTTP status mappings
│   │   ├── auth.controller.js
│   │   └── task.controller.js
│   ├── middleware/          # Custom Express middlewares
│   │   ├── auth.middleware.js
│   │   └── error.middleware.js
│   ├── models/              # Mongoose data schemas
│   │   ├── user.model.js
│   │   └── task.model.js
│   ├── routes/              # API route definitions
│   │   ├── index.js
│   │   ├── auth.routes.js
│   │   └── task.routes.js
│   ├── services/            # Core business logic layer
│   │   ├── auth.service.js
│   │   └── task.service.js
│   └── utils/               # Error classes & token utilities
│       ├── errors.js
│       └── jwt.js
├── tests/
│   ├── setup.js             # MongoMemoryServer lifecycle hooks
│   ├── auth.test.js         # Auth integration tests
│   └── task.test.js         # Task CRUD integration tests
├── .env.example
├── .eslintrc.json
├── package.json
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18.x or later)
- MongoDB instance (or local MongoDB server on port 27017)

### Installation

1. Clone the repository:
   ```bash
   git clone <repo-url>
   cd taskflow-api
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```

4. Start the application:
   ```bash
   # Development mode with watch
   npm run dev

   # Production mode
   npm start
   ```

---

## API Endpoints

### Health Check
- `GET /api/health` - Service health status

### Authentication
- `POST /api/auth/register` - Register a new user (`name`, `email`, `password`)
- `POST /api/auth/login` - Authenticate user & receive JWT token (`email`, `password`)
- `GET /api/auth/me` - Retrieve current authenticated profile *(Requires Bearer token)*

### Tasks *(All require Bearer token)*
- `POST /api/tasks` - Create a new task (`title`, `description`, `priority`, `dueDate`, `status`)
- `GET /api/tasks` - List all tasks
- `GET /api/tasks/:id` - Get task details by ID
- `PUT /api/tasks/:id` - Update task by ID
- `DELETE /api/tasks/:id` - Remove task by ID

---

## Available Scripts

- `npm start`: Starts the API server.
- `npm run dev`: Runs the server with Node file watcher.
- `npm test`: Executes the Jest test suite using an in-memory database.
- `npm run lint`: Analyzes codebase with ESLint.

---

## License

ISC
