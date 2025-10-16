# 💬 Real-Time Chat Application

A **real-time chat app** built with the **MERN Stack**, **Socket.io**, **TailwindCSS**, **DaisyUI**, and **Zustand**, featuring **JWT authentication**, **online presence indicators**, and a sleek, responsive UI.

---

## 🚀 Features

- ⚡ **Instant Messaging:** Real-time two-way communication using **Socket.io**.
- 🔐 **Authentication:** Secure login & signup with **JWT tokens**.
- 🟢 **Online Status:** Track and display online/offline users dynamically.
- 🌐 **Cloud Storage:** Store and manage user images with **Cloudinary**.
- 🧠 **Global State Management:** Smooth UI updates with **Zustand**.
- 🎨 **Modern UI:** Responsive design using **TailwindCSS** & **DaisyUI**.
- 🧩 **Error Handling:** Robust client and server-side error management.

---

## 🧰 Tech Stack

| Category | Technologies |
|-----------|--------------|
| **Frontend** | React, Zustand, TailwindCSS, DaisyUI, Socket.io-client |
| **Backend** | Node.js, Express.js, MongoDB, Socket.io |
| **Authentication** | JWT (JSON Web Token) |
| **Media Storage** | Cloudinary |
| **State Management** | Zustand |
| **Environment** | .env configuration |

---

---

## ⚙️ Environment Variables

Create a `.env` file in your `server/` directory with the following keys:

```env
MONGODB_URI=

PORT=5001

JWT_SECRET=mysecretkey

NODE_ENV=development

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

NETWORK_URL=http://192.168.1.25:5173

git clone <your-github-repo-link>
cd chat-app

cd server
npm install

cd ../client
npm install

cd server
npm run dev

cd ../client
npm run dev
