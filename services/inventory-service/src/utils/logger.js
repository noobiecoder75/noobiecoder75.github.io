const winston = require('winston');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp, ...meta }) => {
          let logMessage = `${timestamp} ${level}: ${message}`;
          if (Object.keys(meta).length > 0) {
            logMessage += `\nMetadata: ${JSON.stringify(meta, null, 2)}`;
          }
          return logMessage;
        })
      )
    }),
    new winston.transports.File({ 
      filename: 'logs/error.log', 
      level: 'error',
      maxsize: 10000000, // 10MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: 'logs/combined.log',
      maxsize: 10000000, // 10MB
      maxFiles: 5
    })
  ]
});

// Add a simple request logger middleware
logger.requestLogger = (req, res, next) => {
  logger.info(`Incoming ${req.method} request to ${req.url}`, {
    method: req.method,
    url: req.url,
    query: req.query,
    params: req.params,
    body: req.body
  });
  next();
};

module.exports = logger; 