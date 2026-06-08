# Ecommerce Platform

A full-stack ecommerce web application built with React, Vite, Node.js, Express, PostgreSQL, and JWT authentication.

## Features

- User registration and login
- JWT-based authentication
- Buyer, seller, and admin roles
- Product listing and filtering
- Product details page
- Shopping cart
- Order placement and order history
- Admin category management
- Admin order status management
- Seller product management

## Tech Stack

### Frontend
- React
- Vite
- React Router
- Tailwind CSS

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT
- bcrypt

## Project Structure

```text
MusaProject/
├── client/          # Frontend React application
├── server/          # Backend Express API
├── musa sql.sql     # PostgreSQL database schema
├── .gitignore
└── README.md
```

## Setup Instructions

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPO_URL
cd MusaProject
```

### 2. Setup the database

Create a PostgreSQL database and run the SQL file:

```bash
psql -U YOUR_POSTGRES_USER -d YOUR_DATABASE_NAME -f "musa sql.sql"
```

### 3. Setup the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
PORT=5000
DB_USER=your_postgres_user
DB_HOST=localhost
DB_DATABASE=your_database_name
DB_PASSWORD=your_database_password
DB_PORT=5432
JWT_SECRET=your_secure_jwt_secret
```

Run the backend:

```bash
npm run dev
```

### 4. Setup the frontend

Open a new terminal:

```bash
cd client
npm install
npm run dev
```

The frontend will usually run on:

```text
http://localhost:5173
```

The backend will run on:

```text
http://localhost:5000
```

## Important Notes Before Deployment

- Do not upload `.env` files to GitHub.
- Do not upload `node_modules` folders.
- Update frontend API URLs before deploying.
- Use a strong JWT secret in production.
- Restrict CORS to trusted frontend domains in production.

## Author

Zainab Shakeel
