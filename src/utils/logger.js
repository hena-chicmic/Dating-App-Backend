const winston = require('winston');

const customFormat = winston.format.printf(({ level, message, timestamp, stack, service, ...meta }) => {
    // Ensure objects passed as messages don't evaluate to [object Object]
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    
    // Top-Level Log Line
    let log = `\n[${timestamp}] [${level.toUpperCase()}] : ${formattedMessage}`;
    
    // Attach structured metadata on new alignments 
    if (service) {
        log += `\n   ↳ Service: ${service}`;
    }
    
    // Pretty-print any extra meta objects cleanly instead of cramming them into one line
    if (Object.keys(meta).length > 0) {
        log += `\n   ↳ Details: ${JSON.stringify(meta, null, 2).replace(/\n/g, '\n      ')}`;
    }
    
    // Keep stack traces fully readable
    if (stack) {
        log += `\n   ↳ StackTrace:\n${stack}`;
    }
    
    return log;
});

const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    format: winston.format.combine(
        winston.format.timestamp({
            format: 'YYYY-MM-DD HH:mm:ss'
        }),
        winston.format.errors({ stack: true }),
        winston.format.splat(),
        customFormat
    ),
    defaultMeta: { service: 'dating-app-backend' },
    transports: [
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/combined.log' })
    ]
});

// For local terminals, automatically colorize the text headers
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
        format: winston.format.combine(
            winston.format.colorize({ all: true })
        )
    }));
}

logger.stream = {
    write: (message) => {
        try {
            logger.info(JSON.parse(message));
        } catch {
            logger.info(message.trim());
        }
    }
};

module.exports = logger;
