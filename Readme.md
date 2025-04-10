## Note:

This project is still under development, many more features are going to be included soon. :D

# 🍽️ Waste Food Management System

A full-stack MERN application designed to reduce food wastage by facilitating donations from individuals or organizations to service workers, all coordinated through a centralized management system. Real-time updates, image handling, and multiple user roles ensure smooth and efficient food redistribution.

## 🧱 Project Structure & Tech Stack

This project follows a modular monorepo structure with separate folders for the frontend and backend:

```markdown
/waste-food-management-system
├── /frontend # React + Vite + TypeScript
├── /backend # Node.js + Express + TypeScript
├── /mongo-scripts # MongoDB replica set scripts
```

### 🛠️ Tech Stack

| Layer            | Technology                   |
| ---------------- | ---------------------------- |
| Frontend         | React, Vite, TypeScript      |
| Backend          | Node.js, Express, TypeScript |
| Database         | MongoDB (using Replica Set)  |
| Real-Time        | Socket.io                    |
| Media            | ImageKit (for image uploads) |
| State Management | Redux.js                     |

---

## ✨ Features

#### Dashoard is real time updated based on insret, update and delete in database, with pagination support and Redux caching implemented, to reduce frequent client side api requests.

The Waste Food Management System supports multiple user roles, each with specific capabilities:

- **Donor**

  - Register/login and create food donation listings
  - Upload food images via ImageKit
  - Track status of their donations in real-time

- **Service Worker**

  - View available food donations
  - Accept and collect food items
  - Update donation status (e.g., collected, delivered)

- **Admin**

  - Manage users (Donors, Organizations, Workers)
  - Monitor system activity
  - Moderate reported items or issues

- **Organization**
  - Can act both as Donor and Service Worker
  - Manage multiple team members under one account
  - Access reports and analytics for food distribution

---

## 🧬 Cloning the Repository

```bash
git clone https://github.com/GaneshGorana/waste-food-management-system.git
cd waste-food-management-system
```

---

## 🔐 Environment Setup

### Frontend `.env` (inside `/frontend`)

Create a `.env` file:

```env
VITE_BACKEND_ORIGIN_URL=http://localhost:5000/api
```

### Backend `.env` (inside `/backend`)

Create a `.env` file:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017,wfms-rs1:27018,wfms-rs2:27019/wfms?replicaSet=rs0
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

---

## 🍃 MongoDB Replica Set Setup

To start MongoDB with a replica set, use the following batch files from the `mongo-scripts` folder:

### ▶️ Start Replica Set

Run as **Administrator**:

```bash
start_mongodb_rs.bat
```

### ⏹️ Stop Replica Set

Run as **Administrator**:

```bash
stop_mongodb_rs.bat
```

📖 [Official MongoDB Replica Set Setup Guide](https://www.mongodb.com/docs/manual/tutorial/deploy-replica-set/)

---

## 🚀 Running the Project Locally

### Backend

```bash
cd backend
npm install
npm run dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

---

## 📁 Folder Structure

```
/waste-food-management-system
├── /frontend
│   ├── public
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── services
│   │   └── utils
............ more
├── /backend
│   ├── src
│   │   ├── controllers
│   │   ├── models
│   │   ├── routes
│   │   ├── middlewares
│   │   └── services
............. more

├── start_mongodb_rs.bat
└── stop_mongodb_rs.bat
```

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

- Report bugs and issues
- Submit feature requests
- Fork the repo and submit pull requests
- Improve documentation

### Contact

[Email me 📧](mailto:ganeshgorana01@gmail.com)

---
