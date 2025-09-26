# 📘 Chorely API

A simple RESTful Task Management API built with **Node.js**, **Express**, **TypeScript**, and **MongoDB**. It includes features like user registration, login, token-based authentication (JWT + refresh tokens), and task CRUD operations.

---

## 📂 Features

- 🔐 **Authentication**
  - Register & login with hashed passwords (using `argon2`)
  - JWT access tokens with refresh token support
  - Logout by invalidating refresh tokens

- ✅ **Task Management**
  - Create, read, update, and delete tasks
  - Tasks belong to the authenticated user
  - Partial updates (PATCH)

- ⚙️ **Technology Stack**
  - Node.js, Express.js
  - MongoDB with Mongoose
  - TypeScript
  - JWT + Argon2 for auth
  - RESTful API design

- 🧪 **Testing**
  - Jest & Supertest for API testing
  - In-memory MongoDB for isolated test environment
  - Tests cover auth and task routes (CRUD operations)

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git https://github.com/obbylee/chorely.git
cd chorely
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Create .env File

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/task-api
JWT_SECRET=your_jwt_secret
```

Make sure MongoDB is running locally or use a MongoDB Atlas URI.

## 🛠️ API Endpoints

### 🔐 Auth Endpoints

| Method | Endpoint              | Description                |
| ------ | --------------------- | -------------------------- |
| POST   | `/auth/register`      | Register a new user        |
| POST   | `/auth/login`         | Login and receive tokens   |
| POST   | `/auth/logout`        | Invalidate a refresh token |
| POST   | `/auth/refresh-token` | Refresh the access token   |

---

### ✅ Task Endpoints (Protected)

> Requires header: `Authorization: Bearer <access_token>`

| Method | Endpoint     | Description          |
| ------ | ------------ | -------------------- |
| GET    | `/tasks`     | Get all user's tasks |
| GET    | `/tasks/:id` | Get a task by ID     |
| POST   | `/tasks`     | Create a new task    |
| PATCH  | `/tasks/:id` | Update a task        |
| DELETE | `/tasks/:id` | Delete a task        |

### 🧱 Project Structure

```bash

src/
│
├── controllers/       # Request handlers (req/res)
├── services/          # Business logic
├── models/            # Mongoose models
├── routes/            # API routes
├── middlewares/       # Custom middlewares (auth, rate-limiter)
├── utils/             # JWT, hash, etc.
├── types/             # Custom TypeScript types/interfaces
└── index.ts             # Main app entry
```

### 🧪 Testing

This project uses Jest and Supertest for automated testing of API endpoints, including authentication and task operations.

Run the full test suite with:

```bash
npm test
#or
npx jest
```

### Test Environment

- Tests run using an in-memory MongoDB server (mongodb-memory-server) for fast, isolated database testing.

- Authentication tests include JWT token creation.

- Task tests cover all CRUD operations.

### Adding Tests

- Tests are placed in the `/src/__tests__/` folder.

- Use Supertest to simulate HTTP requests.

- Use Jest's `describe` and `it` blocks for organizing tests and `expect` for assertions.
