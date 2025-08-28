// backend/server.js
require('dotenv').config({ path: '../.env' }); // Load .env file from the root
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { Pool } = require('pg'); // PostgreSQL client

// === Basic Setup ===
const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// === CORS Configuration ===
// This is CRUCIAL. Your React app (running on localhost:3000) is a different
// "origin" from your backend (running on localhost:5000). The browser's security
// policy will block requests unless the server explicitly allows it.
const corsOptions = {
  origin: 'http://localhost:3000', // Allow requests from your React app
  methods: ['GET', 'POST'],
};
app.use(cors(corsOptions));

// === Initialize Socket.IO with CORS ===
const io = new Server(server, {
  cors: corsOptions,
});

// === PostgreSQL Connection ===
// The Pool will manage connections to the database.
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST, // This is 'postgres', the service name in docker-compose
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});
console.log("DB Connection Details:", {
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
});


// === API Routes ===
app.get('/api/users', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW() as now'); // A simple test query
    res.json({ message: 'Successfully connected to DB!', time: result.rows[0].now });
  } catch (err) {
    console.error('Database query error', err.stack);
    res.status(500).json({ error: 'Database error' });
  }
});

// === WebSocket Logic ===
io.on('connection', (socket) => {
  console.log('✅ A user connected:', socket.id);

  // Listen for a custom event from the client, e.g., 'send_message'
  socket.on('send_message', (data) => {
    console.log(`Received message from ${socket.id}:`, data.message);

    // Broadcast the message to ALL connected clients, including the sender
    io.emit('receive_message', {
      message: data.message,
      senderId: socket.id
    });

  });
socket.on('add_user', (data)=>{
  console.log(data.user);
  // const result = data.json();
  // console.log(result)
  // console.log(data.name,data.age)
  // async (res,req)=>{
  //   try{
  //     const result = await pool.query(`INSERT INTO People (Name, Age) VALUES (${data.name},${data.age})`);
  //     // res.json({})
  //     console.log("send the message succesfully")
  //   }catch{
  //     console.error("database query error")
  //   }
  // }
})
  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
  });
});

// === Start Server ===
server.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
});