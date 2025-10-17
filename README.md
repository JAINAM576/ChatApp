Next.js Full-Stack Authentication App

This is a complete full-stack web application built with Next.js that provides robust user authentication functionality. It includes user signup with email verification, login/logout, a user profile page, and a secure password reset flow.

✨ Features

User Signup & Email Verification: New users can create an account and must verify their email address via a unique token sent to their inbox.

Secure User Login/Logout: Existing users can log in with their credentials. Sessions are managed securely.

Password Hashing: Passwords are securely hashed using bcryptjs before being stored in the database.

Password Reset Flow: Users who have forgotten their password can request a reset link to be sent to their email.

User Profile Page: Authenticated users can view their unique user ID and other details on a protected profile page.

API Routes: The entire backend is built using Next.js API routes, providing a seamless full-stack experience.

Toast Notifications: Provides user-friendly feedback for actions like successful login or errors using react-hot-toast.

🛠️ Tech Stack

Framework: Next.js (React framework for production)

Database: MongoDB (with Mongoose as the ODM)

Authentication: JWT (JSON Web Tokens) for secure session management.

Styling: Tailwind CSS for utility-first styling.

Emailing: Nodemailer for sending verification and password reset emails (configured for Mailtrap).

Notifications: React Hot Toast for user notifications.

Password Security: bcryptjs for hashing.

🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine.

Prerequisites

Node.js (v16 or later recommended)

npm (Node Package Manager)

MongoDB (a local instance or a cloud-based Atlas account)

A Mailtrap account for testing email sending.

Installation & Setup

Clone the repository:

git clone [https://github.com/Pritam-nitj/Auth.git](https://github.com/Pritam-nitj/Auth.git)
cd Auth


Install dependencies:

npm install


Set up Environment Variables:
Create a .env.local file in the root of the project.

touch .env.local


Add the following variables to your .env.local file. Replace the placeholder values with your actual credentials.

MONGO_URI=YOUR_MONGODB_CONNECTION_STRING
TOKEN_SECRET=YOUR_SUPER_SECRET_JWT_KEY
DOMAIN=http://localhost:3000

# Mailtrap Credentials for email testing
MAILTRAP_USER=YOUR_MAILTRAP_USERNAME
MAILTRAP_PASS=YOUR_MAILTRAP_PASSWORD


Running the Application

Start the development server:

npm run dev


Open your browser and navigate to http://localhost:3000 to see the application in action.

📁 Project Structure

This is a Next.js app using the App Router. The structure is organized as follows:

/Auth
├── /app
│   ├── /api/users        # Backend API route logic
│   │   ├── /login
│   │   ├── /logout
│   │   ├── /me
│   │   ├── /signup
│   │   └── /verifyemail
│   ├── /profile          # Protected user profile page
│   ├── /verifyemail      # Page for handling email verification
│   ├── layout.js
│   └── page.js           # Homepage (Login/Signup)
│
├── /helpers
│   └── mailer.js         # Nodemailer configuration and email sending logic
│
├── /models
│   └── userModel.js      # Mongoose schema for the User
│
├── .env.local            # Environment variables (untracked)
├── next.config.js
└── package.json


📝 API Endpoints

All API routes are located under /api/users.

POST /api/users/signup: Register a new user and send a verification email.

POST /api/users/login: Log in an existing user.

GET /api/users/logout: Log out the current user.

GET /api/users/me: Get the profile information of the currently logged-in user.

POST /api/users/verifyemail: Verify a user's email using a token.