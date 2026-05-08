# Cafe Ordering System

This is a full-stack web application for a Cafe Ordering System, built with React.js for the frontend, Node.js/Express.js for the backend, and Supabase for the database and authentication.

## Features

### Admin Module
- Manages staff accounts
- Manages products/menu
- Views sales/orders
- Monitors system activity

### Staff Module
- Login required
- Manages incoming customer orders
- Updates order status
- Handles cashier/order processing

### Customer Module
- No login required
- Browse menu
- Add products to cart
- Place orders

## Technology Stack

- **Frontend**: React.js, HTML5, CSS3, JavaScript, React Router, Axios, Vite
- **Backend**: Node.js, Express.js
- **Database & Authentication**: Supabase (PostgreSQL Database, Email + Password Authentication)

## Setup Guide

Follow these steps to set up and run the Cafe Ordering System on your local machine.

### 1. Supabase Setup

1.  **Create a New Supabase Project**:
    *   Go to [Supabase](https://supabase.com/) and sign in or create an account.
    *   Click on 

    `New project` to create a new project.
    *   Choose an organization, enter a project name (e.g., `cafe-ordering-system`), set a strong database password, and select a region.
    *   Wait for your project to be provisioned.

2.  **Run SQL Schema**:
    *   Once your project is ready, navigate to the `SQL Editor` in the Supabase dashboard.
    *   Click on `New query`.
    *   Copy the content of the `database.sql` file from the root of this project.
    *   Paste the SQL into the query editor and click `Run`.
    *   This will create all necessary tables (`users`, `categories`, `products`, `orders`, `order_items`) and seed initial data.

3.  **Configure Row Level Security (RLS)**:
    *   Go to `Authentication` -> `Policies` in the Supabase dashboard.
    *   For each table (`users`, `categories`, `products`, `orders`, `order_items`), you will need to set up RLS policies based on your application logic. For a quick start, you can disable RLS for development, but it is highly recommended to enable and configure it for production.
    *   **Example for `products` table (read-only for public, full access for admin/staff):**
        *   Create a new policy for `SELECT` operations.
        *   Enable for `anon` and `authenticated` roles.
        *   Using expression: `true` (allows all reads)
        *   Create a new policy for `INSERT`, `UPDATE`, `DELETE` operations.
        *   Enable for `authenticated` role.
        *   Using expression: `auth.jwt() ->> 'role' = 'admin' OR auth.jwt() ->> 'role' = 'staff'`

4.  **Get Supabase API Keys**:
    *   Go to `Project Settings` -> `API`.
    *   Note down your `Project URL` (SUPABASE_URL) and `anon public` key (SUPABASE_ANON_KEY).

### 2. Backend Setup (Node.js/Express)

1.  **Navigate to the backend directory**:
    ```bash
    cd cafe-ordering-system/backend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Create `.env` file**:
    *   Create a file named `.env` in the `backend` directory.
    *   Copy the content from `.env.example` into your new `.env` file.
    *   Replace the placeholder values with your actual Supabase URL and Anon Key, and generate a strong JWT secret.
    ```
    PORT=5000
    SUPABASE_URL=YOUR_SUPABASE_URL
    SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
    JWT_SECRET=YOUR_VERY_STRONG_SECRET_KEY
    ```

4.  **Run the backend server**:
    ```bash
    npm start
    # Or for development with nodemon:
    npm run dev
    ```
    *   The server will run on `http://localhost:5000`.

### 3. Frontend Setup (React)

1.  **Navigate to the frontend directory**:
    ```bash
    cd cafe-ordering-system/frontend
    ```

2.  **Install dependencies**:
    ```bash
    npm install
    ```

3.  **Run the frontend application**:
    ```bash
    npm run dev
    ```
    *   The application will typically open in your browser at `http://localhost:3000`.

### 4. VS Code Setup

1.  **Open Project in VS Code**:
    *   Open VS Code.
    *   Go to `File` > `Open Folder...` and select the `cafe-ordering-system` directory.

2.  **Recommended Extensions**:
    *   **ESLint**: For linting JavaScript/TypeScript code.
    *   **Prettier - Code formatter**: For consistent code formatting.
    *   **DotEnv**: For syntax highlighting of `.env` files.
    *   **PostgreSQL**: For interacting with your Supabase database directly from VS Code (optional).

3.  **Terminal Usage**:
    *   You can open two integrated terminals in VS Code (`Terminal` > `New Terminal`).
    *   In one terminal, navigate to `backend` and run `npm run dev`.
    *   In the other terminal, navigate to `frontend` and run `npm run dev`.

## Initial Admin User

After running the `database.sql` script, an initial admin user is created with the following credentials:

*   **Email**: `admin@cafe.com`
*   **Password**: `admin123` (You should change this immediately after your first login and generate a new hash for the database).

**Note**: The password `admin123` is stored as a bcrypt hash in the `database.sql` file. When creating new users or changing passwords, ensure you hash them using `bcryptjs` in your backend before storing them in Supabase.

## Project Structure

```
cafe-ordering-system/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── supabase.js
│   │   ├── controllers/
│   │   │   ├── authController.js
│   │   │   ├── productController.js
│   │   │   ├── orderController.js
│   │   │   ├── staffController.js
│   │   │   └── reportController.js
│   │   ├── middleware/
│   │   │   ├── authMiddleware.js
│   │   │   ├── roleMiddleware.js
│   │   │   └── errorMiddleware.js
│   │   ├── routes/
│   │   │   ├── authRoutes.js
│   │   │   ├── productRoutes.js
│   │   │   ├── orderRoutes.js
│   │   │   ├── staffRoutes.js
│   │   │   └── reportRoutes.js
│   │   ├── services/ (Not implemented in this basic version, but good for separation of concerns)
│   │   ├── utils/ (Not implemented in this basic version, but good for helper functions)
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   ├── package.json
│   └── nodemon.json (for development)
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── assets/
│   │   │   ├── images/
│   │   │   ├── icons/
│   │   │   └── styles/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Navbar.jsx
│   │   │   │   └── ... (other common components)
│   │   │   ├── admin/
│   │   │   ├── staff/
│   │   │   └── customer/
│   │   ├── context/
│   │   │   ├── AuthContext.jsx
│   │   │   └── CartContext.jsx
│   │   ├── hooks/ (Not implemented in this basic version)
│   │   ├── pages/
│   │   │   ├── admin/
│   │   │   │   └── Dashboard.jsx
│   │   │   ├── staff/
│   │   │   │   └── StaffDashboard.jsx
│   │   │   ├── customer/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Menu.jsx
│   │   │   │   ├── Cart.jsx
│   │   │   │   └── Checkout.jsx
│   │   │   └── auth/
│   │   │       └── Login.jsx
│   │   ├── routes/ (Not explicitly used as separate files, but logic is in App.jsx)
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── utils/ (Not implemented in this basic version)
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   └── vite.config.js
└── database.sql
```
