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
const client = require('prom-client');

const register = new client.Registry();

client.collectDefaultMetrics({
  register
});

const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register]
});

const httpRequestDuration = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'HTTP request duration in seconds',
  labelNames: ['method', 'route', 'status_code'],
  registers: [register],
  buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5]
});

const app = express();
app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  if (req.path === '/metrics') {
    return next();
  }

  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;

    const route = req.route?.path || req.path;

    httpRequestCounter.inc({
      method: req.method,
      route,
      status_code: res.statusCode
    });

    httpRequestDuration.observe(
      {
        method: req.method,
        route,
        status_code: res.statusCode
      },
      duration
    );
  });

  next();
});

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

app.get('/metrics', async (req, res) => {
  res.set('Content-Type', register.contentType);

  res.end(await register.metrics());
});

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