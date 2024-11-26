# Backend API Documentation
This backend is built using Node.js and Express.js with TypeScript. It provides robust authentication mechanisms using Passport JWT and Google OAuth 2.0, as well as Role-Based Access Control (RBAC) for managing user permissions. Below is the detailed documentation and setup instructions.


## Features

* JWT Authentication: Secure authentication using JSON Web Tokens.
* Google Sign-In: OAuth 2.0 integration for Google Sign-In via Passport.
* Role-Based Access Control: Manage user roles and access levels (e.g., user, admin, super-admin).
* TypeScript Support: Ensures type safety and better development experience.
* Scalable Architecture: Modular and structured codebase for scalability and maintainability.


## Prerequisites
Before running the project, make sure you have the following installed:
* Node.js (version 16.x or later)
* npm or yarn
* PostgreSQL (or your chosen database)

## Getting Started
1. Clone the Repository
```bash
git clone <repository_url>
cd <repository_name>
```
2. Install Dependencies
 ```bash
npm install
```
3. Setup Environmental Variables
```bash
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@<host>:<port>/<database>
JWT_SECRET=<your_jwt_secret>
GOOGLE_CLIENT_ID=<your_google_client_id>
GOOGLE_CLIENT_SECRET=<your_google_client_secret>
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
```
4. Database Setup
   ```bash
   npx prisma migrate dev --name init
   ```
5. Start the Server
   ```bash
   npx nodemon
   ```
   

