# QueueIt - Virtual Queue Management System

QueueIt is a virtual queue management system built using the MERN stack. It allows customers to join virtual lines via their mobile device or web browser and monitor their queue position, people in front, and estimated service times in real-time, removing the need to stand in physical lines. It also provides an admin panel for operators to advance the queue and manage open lines.

---

## Tech Stack

- **Frontend**: React (Vite, React Router v7, Axios, Lucide React)
- **Backend**: Node.js & Express.js
- **Database**: MongoDB (via Mongoose)
- **Styling**: Vanilla CSS (Custom dark theme layout with Glassmorphism styles)

---

## Project Structure

```text
/
├── backend/
│   ├── models/           # Mongoose Database Schemas (User, Venue, Queue)
│   ├── routes/           # REST API routes (/api/queues, /api/admin)
│   ├── index.js          # Express Server configuration & entry
│   └── .env              # Backend configuration (Port, Database URI)
│
└── frontend/
    ├── src/
    │   ├── components/   # React Page Components (Home, Join, Status, Admin)
    │   ├── App.jsx       # App layout & React Router config
    │   └── index.css     # Global stylesheets (typography, dark mode, themes)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) installed on your machine.
- Optional: Local [MongoDB](https://www.mongodb.com/) running on port `27017` (or access to an online MongoDB Atlas URI).

---

## How to Run

### 1. Run the Backend Server

1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already done):
   ```bash
   npm install
   ```
3. Configure the environment variables in the `.env` file:
   - `PORT=5000`
   - `MONGO_URI=mongodb://localhost:27017/queueit` (or your MongoDB Atlas connection string)
4. Start the server:
   ```bash
   npm start
   ```

*Note: If MongoDB is not running locally, the server will log a connection error but remain running in "offline mode" so you can still access the endpoints.*

### 2. Run the Frontend Dev Server

1. Open another terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
4. Open your browser and navigate to the address shown in the terminal (usually `http://localhost:5173`).

---

## Features & Verification Flows

1. **Browse Venues**: The home page lists active queues for Central Bank, Metro Medical, and City Council.
2. **Join Queue**: Customers enter their name and email to join the line. The backend automatically registers them as a Customer.
3. **Live Status**: Displays ticket ID, real-time wait times, position in line, and currently serving notifications. If the MongoDB service is offline, the app switches to a **Demo Simulation Mode** where position progression is simulated directly.
4. **Admin Dashboard**: Operator view at `/admin/queues/:queueId` to call and serve the next user in line (`PATCH /api/admin/queues/:id/serve`).
