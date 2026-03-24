import logging
import json
import os
from datetime import datetime
from logging.handlers import RotatingFileHandler

class SecurityLogger:
    def __init__(self):
        self.log_dir = os.path.join(os.path.dirname(__file__), 'logs')
        os.makedirs(self.log_dir, exist_ok=True)
        
        # Main application logger
        self.app_logger = self._setup_logger('app', 'app.log')
        
        # Security events logger
        self.security_logger = self._setup_logger('security', 'security.log')
        
        # Error logger
        self.error_logger = self._setup_logger('error', 'error.log', logging.ERROR)
    
    def _setup_logger(self, name, filename, level=logging.INFO):
        logger = logging.getLogger(name)
        logger.setLevel(level)
        
        # File handler with rotation
        file_handler = RotatingFileHandler(
            os.path.join(self.log_dir, filename),
            maxBytes=10*1024*1024,  # 10MB
            backupCount=5
        )
        
        # JSON formatter
        formatter = logging.Formatter(
            '{"timestamp": "%(asctime)s", "level": "%(levelname)s", "message": "%(message)s"}'
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
        
        # Console handler for development
        if os.getenv('FLASK_ENV') != 'production':
            console_handler = logging.StreamHandler()
            console_handler.setFormatter(logging.Formatter(
                '%(asctime)s - %(levelname)s - %(message)s'
            ))
            logger.addHandler(console_handler)
        
        return logger
    
    def log_request(self, endpoint, method, ip, status_code, duration_ms=None):
        """Log API request"""
        log_data = {
            'endpoint': endpoint,
            'method': method,
            'ip': ip,
            'status': status_code,
            'duration_ms': duration_ms
        }
        self.app_logger.info(json.dumps(log_data))
    
    def log_error(self, endpoint, error, ip=None):
        """Log API error"""
        log_data = {
            'endpoint': endpoint,
            'error': str(error),
            'ip': ip
        }
        self.error_logger.error(json.dumps(log_data))
    
    def log_security_event(self, event_type, details):
        """Log security-related events"""
        log_data = {
            'event_type': event_type,
            'timestamp': datetime.utcnow().isoformat(),
            **details
        }
        self.security_logger.warning(json.dumps(log_data))
    
    def log_suspicious_activity(self, activity, ip, details=None):
        """Log suspicious activity"""
        log_data = {
            'activity': activity,
            'ip': ip,
            'severity': 'HIGH',
            'details': details or {}
        }
        self.security_logger.warning(json.dumps(log_data))
    
    def log_rate_limit(self, ip, endpoint):
        """Log rate limit violations"""
        log_data = {
            'event': 'rate_limit_exceeded',
            'ip': ip,
            'endpoint': endpoint,
            'severity': 'MEDIUM'
        }
        self.security_logger.warning(json.dumps(log_data))

# Global logger instance
security_logger = SecurityLogger()
