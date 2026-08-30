
const dns = require('dns');
if (dns.setDefaultResultOrder) {
  dns.setDefaultResultOrder('ipv4first');
}
require('dotenv').config();
const http = require('http');
const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const { initDb } = require('./config/db');
const { initSocketServer } = require('./realtime/socketServer');
const { initPgListener } = require('./realtime/pgListener');
const openapiSpec = require('./docs/openapi.json');

const app = express();
const server = http.createServer(app);
const port = process.env.PORT || 5000;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());

// Security Response Headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
});

// API Rate Limiting & DoS Protection
const { generalLimiter } = require('./middleware/rateLimiter');
app.use('/api', generalLimiter);


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));


const authRoutes = require('./routes/auth');
const opportunityRoutes = require('./routes/opportunities');
const scholarshipRoutes = require('./routes/scholarships');
const bursaryRoutes = require('./routes/bursaries');
const applicationRoutes = require('./routes/applications');
const documentRoutes = require('./routes/documents');
const notificationRoutes = require('./routes/notifications');
const partnerRoutes = require('./routes/partners');
const reportRoutes = require('./routes/reports');
const distributionRoutes = require('./routes/distributions');
const registryRoutes = require('./routes/registry');
const adminRoutes = require('./routes/admin');
const qcidRoutes = require('./routes/qcid');
const schoolSyncRoutes = require('./routes/schoolSync');
const fundRoutes = require('./routes/funds');
const communicationRoutes = require('./routes/communication');
const calendarRoutes = require('./routes/calendar');
const ticketRoutes = require('./routes/tickets');
const portalSettingsRoutes = require('./routes/portalSettings');

app.use('/api/auth', authRoutes);
app.use('/api/opportunities', opportunityRoutes);
app.use('/api/scholarships', scholarshipRoutes);
app.use('/api/bursaries', bursaryRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/partners', partnerRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/distributions', distributionRoutes);
app.use('/api/registry', registryRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/qcid', qcidRoutes);
app.use('/api/schools-sync', schoolSyncRoutes);
app.use('/api/funds', fundRoutes);
app.use('/api/communication', communicationRoutes);
app.use('/api/calendar', calendarRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/portal-settings', portalSettingsRoutes);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    system: 'EduScholar Quezon City Scholarship Management System',
    version: '2.0.0',
    database: 'PostgreSQL Connected',
    timestamp: new Date().toISOString(),
  });
});

const path = require('path');
const fs = require('fs');
const frontendDist = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDist)) {
  console.log('[EduScholar Server] Serving frontend production bundle from frontend/dist');
  app.use(express.static(frontendDist));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api') && !req.path.startsWith('/api-docs') && !req.path.startsWith('/ws')) {
      return res.sendFile(path.join(frontendDist, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({
      status: 'online',
      system: 'EduScholar Quezon City Scholarship Management System API',
      version: '2.0.0',
      database: 'PostgreSQL Connected',
      endpoints: {
        docs: '/api-docs',
        auth: '/api/auth',
        scholarships: '/api/scholarships',
        applications: '/api/applications',
        partners: '/api/partners',
        reports: '/api/reports/monitoring',
        distributions: '/api/distributions',
        registry: '/api/registry',
        admin: '/api/admin/stats',
      },
    });
  });
}

initSocketServer(server);

server.listen(port, host, () => {
  3
  console.log(`[EduScholar Server] HTTP listening on port ${port} (0.0.0.0:${port})`);
  console.log(`[EduScholar Realtime] WebSocket listening on ws://0.0.0.0:${port}/ws`);
  console.log(`[EduScholar Docs] Swagger OpenAPI available at http://0.0.0.0:${port}/api-docs`);
});

// Initialize Database & PostgreSQL listener in background
(async function initBackgroundServices() {
  try {
    await initDb();
    await initPgListener();
    console.log('[EduScholar Server] Database and realtime listener ready.');
  } catch (error) {
    console.warn('[EduScholar Server] Background services warning:', error.message);
  }
})();
