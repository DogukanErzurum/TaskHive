# TaskHive Backend

TaskHive backend is a **RESTful API server** built with Node.js, Express, and MongoDB.  
It handles authentication, workspace management, project management, task operations, and analytics.

---

# Tech Stack

Node.js  
Express.js  
MongoDB  
Mongoose  
JWT Authentication  
Zod Validation  
SendGrid (Email Service)  
Arcjet (Security & Rate Limiting)  

---

# Features

• JWT-based authentication  
• Email verification and password reset  
• Workspace and member management  
• Project management  
• Task management (status, priority, assignees, subtasks)  
• Comments and activity timeline  
• Protected routes and request validation  

---

# API Base URL

```
http://localhost:5000/api-v1
```

---

# Installation

```bash
npm install
```

---

# Run Development Server

```bash
npm run dev
```

---

# Environment Variables

Create a `.env` file inside the backend folder:

```
PORT=5000

MONGODB_URI=your_mongodb_connection_string

JWT_SECRET=your_secret_key

SEND_GRID_API=your_sendgrid_api_key

FROM_EMAIL=your_verified_email

ARCJET_KEY=your_arcjet_key

FRONTEND_URL=http://localhost:5173
```

---

# Project Structure

```
backend
│
├── controllers
├── models
├── routes
├── middleware
├── libs
├── index.js
```

---

# Authentication

Protected endpoints require:

```
Authorization: Bearer <token>
```

---

# Author

Doğukan Erzurum  
https://github.com/DogukanErzurum
