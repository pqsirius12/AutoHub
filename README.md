# AutoHub - Car Showroom & Rental Management System

AutoHub is a full-stack web application designed to manage a premium car showroom and rental service. It allows users to browse vehicles, make bookings, manage rentals, and track customer history, all within a modern, responsive interface.

## 👥 Authors
*   **Mohamed Qurrain**
*   **Mohammed Faisal**

**University**: Ramaiah Institute Of Technology

---

## 🚀 Features

*   **Showroom**: Browse a curated list of premium vehicles (Sports, SUV, Luxury, Electric) with detailed specs and pricing.
*   **Booking System**: Seamless booking interface for both new and existing customers.
*   **Rental Management**: Track active rentals, calculate durations, and manage cancellations.
*   **Notifications**: Real-time alerts for successful bookings, cancellations, and completed rental durations.
*   **Customer History**: View detailed booking history for specific vehicles and customers.
*   **Dark/Light Mode**: Fully responsive UI with theme support (defaulting to a sleek Dark Mode).
*   **Search**: Filter cars and customers instantly.

## 🛠️ Tech Stack

*   **Frontend**: React (Vite), Vanilla CSS (Custom Design System)
*   **Backend**: Node.js, Express.js
*   **Database**: MongoDB (Mongoose)

## 📦 Installation & Setup

### Prerequisites
*   Node.js installed on your machine.
*   MongoDB installed and running locally on port `27017`.

### 1. Clone the Repository
```bash
git clone https://github.com/pqsirius12/AutoHub.git
cd AutoHub
```

### 2. Backend Setup
Install dependencies and start the server:
```bash
# In the root directory
npm install
node server.js
```
*The server will run on `http://localhost:3000` and automatically seed the database with default cars if empty.*

### 3. Frontend Setup
Open a new terminal, navigate to the client folder, install dependencies, and run the development server:
```bash
cd client
npm install
npm run dev
```
*The application will open at `http://localhost:5173`.*

## 📂 Project Structure

```
AutoHub/
├── Mongo_db/       # Database connection and Schemas
├── client/         # React Frontend
│   ├── src/
│   │   ├── components/  # Sidebar, TopBar
│   │   ├── pages/       # Showroom, Bookings, Rentals, Customers
│   │   └── App.jsx      # Main Logic & Routing
├── server.js       # Express Backend Server
└── seed_data.js    # Data seeding scripts
```

## 📝 License
This project is created for academic purposes at Ramaiah Institute Of Technology.
