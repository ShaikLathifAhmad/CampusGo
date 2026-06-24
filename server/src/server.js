const https = require('https');
const fs = require('fs');
require('dotenv').config();

const app = require('./app');
const connectDB = require('./db/db');
const logger = require('./utils/logger');

const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';

const startHttp = () => {
    app.listen(PORT, '0.0.0.0', () => {
        logger.info('HTTP Server started', { port: PORT, environment: NODE_ENV });
        console.log(`Server running on http://localhost:${PORT}`);
        console.log('Features: MongoDB, JWT Auth, Helmet, Rate Limiting, Input Validation, CORS');

        if (NODE_ENV === 'production') {
            logger.warn('Running in production without HTTPS — configure SSL_CERT_PATH and SSL_KEY_PATH');
        }
    });
};

const startServer = async () => {
    try {
        await connectDB();

        if (NODE_ENV === 'production' && process.env.SSL_CERT_PATH && process.env.SSL_KEY_PATH) {
            try {
                const httpsOptions = {
                    cert: fs.readFileSync(process.env.SSL_CERT_PATH),
                    key: fs.readFileSync(process.env.SSL_KEY_PATH)
                };
                https.createServer(httpsOptions, app).listen(PORT, '0.0.0.0', () => {
                    logger.info('HTTPS Server started', { port: PORT, environment: NODE_ENV });
                    console.log(`HTTPS Server running on https://localhost:${PORT}`);
                });
            } catch (err) {
                logger.error('SSL setup failed, falling back to HTTP', { error: err.message });
                startHttp();
            }
        } else {
            startHttp();
        }
    } catch (err) {
        logger.error('Server startup failed', { error: err.message });
        process.exit(1);
    }
};

startServer();
