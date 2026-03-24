const fs = require('fs');
const path = require('path');

class Logger {
    constructor() {
        this.logDir = path.join(__dirname, 'logs');
        this.logFile = path.join(this.logDir, 'app.log');
        this.securityLogFile = path.join(this.logDir, 'security.log');
        this.errorLogFile = path.join(this.logDir, 'error.log');
        
        // Create logs directory if it doesn't exist
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }
    }

    formatLog(level, message, metadata = {}) {
        return JSON.stringify({
            timestamp: new Date().toISOString(),
            level,
            message,
            ...metadata
        }) + '\n';
    }

    writeLog(file, level, message, metadata) {
        const logEntry = this.formatLog(level, message, metadata);
        
        // Write to file
        fs.appendFile(file, logEntry, (err) => {
            if (err) console.error('Failed to write log:', err);
        });
        
        // Also log to console in development
        if (process.env.NODE_ENV !== 'production') {
            console.log(`[${level}] ${message}`, metadata);
        }
    }

    info(message, metadata = {}) {
        this.writeLog(this.logFile, 'INFO', message, metadata);
    }

    warn(message, metadata = {}) {
        this.writeLog(this.logFile, 'WARN', message, metadata);
    }

    error(message, metadata = {}) {
        this.writeLog(this.errorLogFile, 'ERROR', message, metadata);
        this.writeLog(this.logFile, 'ERROR', message, metadata);
    }

    security(message, metadata = {}) {
        this.writeLog(this.securityLogFile, 'SECURITY', message, metadata);
        this.writeLog(this.logFile, 'SECURITY', message, metadata);
    }

    // Log authentication attempts
    logAuth(success, metadata = {}) {
        const message = success ? 'Authentication successful' : 'Authentication failed';
        this.security(message, {
            success,
            ...metadata
        });
    }

    // Log API errors
    logApiError(endpoint, error, metadata = {}) {
        this.error(`API Error: ${endpoint}`, {
            error: error.message,
            stack: error.stack,
            ...metadata
        });
    }

    // Log suspicious activity
    logSuspicious(activity, metadata = {}) {
        this.security(`Suspicious activity detected: ${activity}`, {
            severity: 'HIGH',
            ...metadata
        });
    }

    // Log rate limit violations
    logRateLimit(ip, metadata = {}) {
        this.security('Rate limit exceeded', {
            ip,
            severity: 'MEDIUM',
            ...metadata
        });
    }
}

module.exports = new Logger();
