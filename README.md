# 💖 Dating App Backend

An advanced, scalable, and highly performant backend microservice architecture for a modern Dating Application. Built to support real-time interactions, background job processing, and secure authentication.

## 🚀 Tech Stack
- **Core Framework:** Node.js, Express.js
- **Database:** PostgreSQL (with raw `pg` pool queries for maximum performance via Layered Architecture)
- **In-Memory Store / Caching:** Redis
- **Real-time Engine:** Socket.io (Chat, WebRTC Calls, Online Presence)
- **Message Broker / Background Jobs:** BullMQ (Email dispatches, Heavy Matching algorithms, Notifications)
- **Authentication:** JWT (Access + Refresh Tokens) with secure cookie storage, Google OAuth2
- **Storage:** Cloudinary via Multer
- **API Documentation:** Swagger UI
- **Security:** bcrypt, rate-limit-redis, Joi Validation

---

## 🔥 Key Features

### 1. Robust Authentication & Session Management
- **Token-based Security:** Utilizes simultaneous robust JWT issuing (short-lived access tokens via Bearer headers, long-lived refresh tokens stored in HTTP-only cookies).
- **Infinite Multi-Device Sessions:** Safely logged-in across mobile and desktop. Logging out of an iPad won't destroy the iPhone's session.
- **Social Login:** Out-of-the-box Google Auth configuration.

### 2. High-Performance Architectural Pattern
- Features strict Separation of Concerns: **Routes ➜ Controllers ➜ Services ➜ Repositories**.
- **Controllers** map REST API inputs and schemas.
- **Services** encapsulate intricate app logic.
- **Repositories** hold explicitly localized raw SQL statements ensuring 0 database connection leaks.

### 3. Worker Engine (Microservices via BullMQ)
A completely separate Node.js process manages heavy background tasks so the Express.js Event Loop is never blocked:
- **Email Worker:** Asynchronously transmits password resets and verification OTBs.
- **Match Worker:** Conducts heavy mutual-like intersection logic silently.
- **Discovery Worker:** Pre-calculates swiping queues when a user modifies their profile matrix.
- **Notification Worker:** Coordinates push-alerts cross-platform.

### 4. Real-time WebSocket Protocol
- **Presence Handlers:** Instantly detects when matches come online or go offline.
- **Chat Handlers:** Emits messaging, typing indicators (`Match is typing...`), and read receipts.
- **Call Handlers:** Built-in WebRTC signaling ready for Audio/Video dates.

### 5. Media Support
Native Cloudinary integration with `multer` supporting optimized profile photos and attached chat media logic natively supported over WebSockets.

---

## 🛠 Installation & Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)
- Redis Server (Running locally or in Docker)

### 1. Clone and Install
```bash
git clone https://github.com/hena-chicmic/Dating-App-Backend.git
cd Dating-App-Backend
npm install
```

### 2. Environment Variables (`.env`)
Create a `.env` in the root directory mirroring the necessary configuration constraints:
```env
PORT=3000
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=yourpassword
DB_NAME=datingapp
DB_PORT=5432

REDIS_URL=redis://localhost:6379

ACCESS_SECRET=your_super_secret_access_key
REFRESH_SECRET=your_super_secret_refresh_key

SMTP_HOST=smtp.ethereal.email
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
SMTP_FROM="Dating App" <noreply@example.com>

CLOUD_NAME=your_cloudinary_name
CLOUD_API_KEY=your_cloudinary_key
CLOUD_API_SECRET=your_cloudinary_secret

GOOGLE_CLIENT_ID=your_google_id
```

### 3. Database Initialization
```bash
# Execute structural migrations to build the tables
npm run migrate

# (Optional) Seed the database with fake testing profiles
npm run seed
```

---

## 💻 Running the Application

Because of the background job processing architecture, you will need to run **two** separate processes simultaneously to power the entire system.

### Terminal 1: The Main API & Socket Server
Serves all HTTP incoming requests and Socket.io endpoints.
```bash
# Development (Nodemon)
npm run dev

# Production
npm start
```

### Terminal 2: The Worker Engine Microservice
Listens to Redis queues and asynchronously processes background processes like matching, emails, and notifications.
```bash
node src/workers/index.js
```

---

## 📚 API Documentation
Once the server boots up, complete Interactive Documentation is available at:
👉 **[http://localhost:3000/api-docs](http://localhost:3000/api-docs)**

This features dynamically rendered Swagger schemas where you can natively authenticate your Bearer tokens and simulate REST requests point-blank against the app.

---

## 🧪 Local Testing UI
For testing the Socket.io WebSocket architecture effortlessly, simply open `test.html` strictly in your browser (Double click from your file manager).
* `test.html` supports injecting your generated JWT token to instantly connect and mock real-time events like typing, downloading historical chat payloads, matching, and sending native Cloudinary images!
