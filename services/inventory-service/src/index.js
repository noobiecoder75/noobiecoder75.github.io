require('dotenv').config();
const app = require('./app');
const logger = require('./utils/logger');

const port = process.env.PORT || 3001;

// Add some startup checks
logger.info('Starting inventory service with config:', {
  port,
  amadeusConfigured: !!process.env.AMADEUS_CLIENT_ID && !!process.env.AMADEUS_CLIENT_SECRET,
  nodeEnv: process.env.NODE_ENV
});

app.listen(port, () => {
  logger.info(`Inventory service listening at http://localhost:${port}`);
}); 