# PatrollingAppBackend

## Overview

PatrollingAppBackend is the backend service for a patrol management application designed primarily for law enforcement agencies. This backend enables real-time tracking, assignment, reporting, and authentication for police officers on patrol. It features robust APIs for user management, live GPS updates, assignment scheduling, incident reporting, and secure authentication using OTPs and JWTs.

## Features

- **User Authentication & Authorization:**  
  - Register, login, and manage users (officers/admins).
  - JWT-based authentication and OTP verification via Twilio.
  - Role-based access control.

- **Assignment Management:**  
  - Create and assign patrol tasks to one or more officers.
  - Schedule assignments with specific start/end times and checkpoints.

- **Real-time Location Tracking:**  
  - Officers update their GPS location periodically.
  - Location logs are stored and can be queried for patrol history.

- **Incident Reporting:**  
  - Officers can submit reports and upload images/selfies as proof of presence or incident response.
  - Image uploads managed via Cloudinary.

- **WebSocket (Socket.IO) Integration:**  
  - Real-time event handling for location updates, admin monitoring, and chat events.
  - Secure socket connections require user authentication.

- **Health Check and Rate Limiting:**  
  - `/health` endpoint for system health checks.
  - Rate limiting on API requests to prevent abuse.

- **File Upload Support:**  
  - Secure image/file uploads via multipart/form-data.

## Tech Stack

- **Node.js** with **Fastify** (web server)
- **MongoDB** (via Mongoose ODM)
- **Socket.IO** (real-time communication)
- **Twilio** (SMS/OTP verification)
- **Cloudinary** (image storage)
- **Multer** (file upload middleware)

## Key API Endpoints

| Endpoint                        | Description                               |
|----------------------------------|-------------------------------------------|
| `POST /api/v1/auth/register`     | Register a new user                       |
| `POST /api/v1/auth/login`        | Login and receive JWT token               |
| `POST /api/v1/auth/send-otp`     | Send OTP to user via SMS                  |
| `POST /api/v1/auth/verify-otp`   | Verify received OTP                       |
| `GET  /api/v1/auth/me`           | Get current authenticated user profile    |
| `POST /api/v1/assignments`       | Create a new patrol assignment            |
| `GET  /api/v1/assignments`       | List current assignments                  |
| `POST /api/v1/gps`               | Update current GPS location               |
| `GET  /api/v1/gps/logs`          | Get location logs for an officer          |
| `POST /api/v1/selfie/:assignmentId` | Upload a selfie for assignment         |
| `GET  /health`                   | Health check endpoint                     |

*(See source code for all available endpoints and parameters.)*

## Socket.IO Events

- `connected`: Successful socket connection established.
- `locationUpdate`: Officer sends updated GPS coordinates.
- `locationLogged`: Confirmation of location log.
- `registerAdmin`: Admin joins admin monitoring room.

## Project Structure

```
src/
│
├── app.js                  # Fastify app setup and plugin registration
├── db/                     # Database connection
├── routes/                 # Route definitions
├── controllers/            # Request handlers and business logic
├── models/                 # Mongoose schemas/models
├── middlewares/            # Multer and other middleware
├── socket/                 # Socket.IO integration
├── Twilio/                 # OTP verification logic
├── utils/                  # Helper utilities
└── constants.js            # Constants and enums
```

## Getting Started

1. **Install dependencies:**  
   ```bash
   npm install
   ```

2. **Configure environment:**  
   Create a `.env` file based on the provided variables above.

3. **Run MongoDB:**  
   Ensure a local or remote MongoDB instance is running.

4. **Start the server:**  
   ```bash
   npm start
   ```
   The backend will run on the configured port (default: 8080).


---

**PatrollingAppBackend — Aaditya0112**
