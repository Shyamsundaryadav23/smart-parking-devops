require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const slotRoutes = require('./routes/slotRoutes');
const paymentRoutes = require('./routes/paymentRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// mount routes under /api namespace
app.use('/api/auth', authRoutes);
app.use('/api', parkingRoutes);
app.use('/api', reservationRoutes);
app.use('/api', paymentRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);

// health check
app.get('/health', (req, res) => res.send('OK'));
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

const http = require('http');
const { startWatcher } = require('./services/expiryService');
const { init } = require('./socket');

const PORT = process.env.PORT || 5000;

// create http server so we can attach socket.io
const server = http.createServer(app);
const io = init(server);

server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. The backend may already be running.`);
    process.exit(1);
  }

  throw error;
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  // start periodic expiration checks once server is running
  startWatcher();
});