const { createLogger, format, transports } = require('winston');
const DailyRotateFile = require('winston-daily-rotate-file');
const path = require('path');

const logDir = path.join(__dirname, '../../logs');

const { combine, timestamp, printf, colorize, errors } = format;

// Format for log files — JSON lines
const fileFormat = combine(
    timestamp(),
    errors({ stack: true }),
    format.json()
);

// Format for console — colored, readable
const consoleFormat = combine(
    colorize(),
    timestamp({ format: 'HH:mm:ss' }),
    printf(({ level, message, timestamp, ...meta }) => {
        const metaStr = Object.keys(meta).length ? ' ' + JSON.stringify(meta) : '';
        return `${timestamp} [${level}] ${message}${metaStr}`;
    })
);

const rotateOptions = (filename) => ({
    dirname: logDir,
    filename: `${filename}-%DATE%.log`,
    datePattern: 'YYYY-MM-DD',
    maxFiles: '14d',    // keep 14 days of logs
    maxSize: '20m',     // rotate at 20MB
    zippedArchive: true
});

// app.log — info + warn + error
const appLogger = createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new DailyRotateFile(rotateOptions('app')),
        ...(process.env.NODE_ENV !== 'production'
            ? [new transports.Console({ format: consoleFormat })]
            : [])
    ]
});

// security.log — security events only
const securityLogger = createLogger({
    level: 'info',
    format: fileFormat,
    transports: [
        new DailyRotateFile(rotateOptions('security'))
    ]
});

// error.log — errors only
const errorLogger = createLogger({
    level: 'error',
    format: fileFormat,
    transports: [
        new DailyRotateFile(rotateOptions('error'))
    ]
});

// ── Public API — same method names as before ───────────────────────────────

const logger = {
    info(message, metadata = {}) {
        appLogger.info(message, metadata);
    },

    warn(message, metadata = {}) {
        appLogger.warn(message, metadata);
    },

    error(message, metadata = {}) {
        appLogger.error(message, metadata);
        errorLogger.error(message, metadata);
    },

    security(message, metadata = {}) {
        appLogger.warn(message, metadata);
        securityLogger.warn(message, metadata);
    },

    logAuth(success, metadata = {}) {
        const message = success ? 'Authentication successful' : 'Authentication failed';
        this.security(message, { success, ...metadata });
    },

    logApiError(endpoint, error, metadata = {}) {
        this.error(`API Error: ${endpoint}`, {
            error: error.message,
            stack: error.stack,
            ...metadata
        });
    },

    logSuspicious(activity, metadata = {}) {
        this.security(`Suspicious activity detected: ${activity}`, {
            severity: 'HIGH',
            ...metadata
        });
    },

    logRateLimit(ip, metadata = {}) {
        this.security('Rate limit exceeded', { ip, severity: 'MEDIUM', ...metadata });
    }
};

module.exports = logger;
