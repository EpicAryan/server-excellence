# Excellence — Backend API for Academic Management

**Excellence** is the backend system powering a streamlined academic management platform for educators. Built using **Node.js**, **Express**, **PostgreSQL**, and **Drizzle ORM**, it enables secure handling of student records, batch data, and subject-specific marks with clean, modular architecture.

---

## Features

- Teacher account management and authentication
- Add, view, and manage students
- Batch-wise student grouping
- Record subject-wise marks by semester
- Secure login using JWT
- Structured API endpoints for scalable expansion
- API tested and modularized for clarity

---

## Tech Stack

| Tech           | Purpose                                  |
|----------------|-------------------------------------------|
| Node.js        | JavaScript runtime                       |
| Express.js     | Web framework                            |
| PostgreSQL     | Relational database                      |
| Drizzle ORM    | Type-safe SQL schema and queries         |
| TypeScript     | Static type checking                     |
| Zod            | Data validation                          |
| bcrypt         | Password hashing                         |
| JWT            | Authentication tokens                    |
| dotenv         | Environment variable management          |

---

## Project Structure

```txt
server-excellence/
├── controllers/ # Business logic
│ ├── auth.controller.ts
│ ├── user.controller.ts
│ └── student.controller.ts
├── db/
│ ├── schema/ # Drizzle ORM table definitions
│ ├── drizzle.config.ts
│ └── db_connect.ts
├── middleware/ # Auth and route protection
│ └── authMiddleware.ts
├── routes/ # API route definitions
│ └── auth.routes.ts
│ └── user.routes.ts
│ └── student.routes.ts
├── utils/ # Helpers and utilities
│ └── hashPassword.ts
│ └── jwt.ts
├── validations/ # Zod schemas
│ └── authSchema.ts
├── index.ts # App entry point
├── .env # Environment variables
└── package.json
```

## Setup & Installation

### 1. Clone the Repository

```bash
git clone https://github.com/EpicAryan/server-excellence.git
cd server-excellence
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a .env file in the root directory:
```bash
PORT=3001
DATABASE_URL=your_postgres_db_url
JWT_SECRET=your_jwt_secret
```
Replace the values with your actual credentials.

### 4. Set Up Database
Push schema using Drizzle ORM:

```bash
npx drizzle-kit push
```
## Running the Server

Development

```bash
npm run dev
# or
yarn dev
```
Runs on: http://localhost:3001

## Authentication Flow

- Secure registration & login with hashed passwords
- Token-based access with JWT
- Protected routes for managing student and batch data

## Core API Endpoints
| Route                | Method | Description            |
| -------------------- | ------ | ---------------------- |
| `/api/auth/register` | POST   | Register teacher       |
| `/api/auth/login`    | POST   | Login teacher          |
| `/api/user/profile`  | GET    | Fetch teacher info     |
| `/api/student`       | POST   | Add a new student      |
| `/api/student/:id`   | GET    | Get student by ID      |
| `/api/student/batch` | GET    | List students by batch |


## Future Enhancements
- Admin roles and permissions
- Email verification and password reset
- Advanced analytics and export reports

## License
This project is licensed under the MIT License.


Built with ❤️ by Aryan Kumar

