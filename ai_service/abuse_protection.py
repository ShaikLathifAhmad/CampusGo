import time
from datetime import datetime, timedelta
from collections import defaultdict
from logger import security_logger

class AbuseProtection:
    def __init__(self):
        # Rate limit storage
        self.request_counts = defaultdict(dict)
        self.ai_requests = defaultdict(dict)
        self.suspicious_ips = set()
        self.blocked_ips = set()
        
        # Configuration
        self.config = {
            'api': {
                'window': 60,  # seconds
                'max_requests': 50
            },
            'ai_generation': {
                'window': 60,  # seconds
                'max_requests': 10,
                'hourly_limit': 100
            },
            'bot_detection': {
                'requests_per_second': 10,
                'auto_block_threshold': 3
            }
        }
        
        # Last cleanup time
        self.last_cleanup = time.time()
    
    def check_api_rate_limit(self, ip, path):
        """Check general API rate limit"""
        now = time.time()
        key = f"{ip}:{path}"
        
        # Check if IP is blocked
        if ip in self.blocked_ips:
            security_logger.log_suspicious_activity(
                'Blocked IP attempted access',
                ip,
                {'path': path, 'severity': 'HIGH'}
            )
            return {
                'allowed': False,
                'reason': 'IP blocked due to abuse',
                'retry_after': 3600
            }
        
        # Initialize if not exists
        if key not in self.request_counts:
            self.request_counts[key] = {
                'count': 1,
                'reset_time': now + self.config['api']['window'],
                'first_request': now
            }
            return {'allowed': True}
        
        record = self.request_counts[key]
        
        # Reset if window expired
        if now > record['reset_time']:
            record['count'] = 1
            record['reset_time'] = now + self.config['api']['window']
            record['first_request'] = now
            return {'allowed': True}
        
        # Check for bot-like behavior
        requests_per_second = record['count'] / (now - record['first_request'])
        if requests_per_second > self.config['bot_detection']['requests_per_second']:
            self.mark_suspicious(ip, 'High request rate')
            security_logger.log_suspicious_activity(
                'Potential bot detected - high request rate',
                ip,
                {
                    'path': path,
                    'requests_per_second': round(requests_per_second, 2)
                }
            )
        
        # Check if limit exceeded
        if record['count'] >= self.config['api']['max_requests']:
            security_logger.log_rate_limit(ip, path)
            return {
                'allowed': False,
                'reason': 'Rate limit exceeded',
                'retry_after': int(record['reset_time'] - now)
            }
        
        record['count'] += 1
        return {'allowed': True}
    
    def check_ai_request(self, ip):
        """Check AI-specific rate limit"""
        now = time.time()
        
        # Check if IP is blocked
        if ip in self.blocked_ips:
            return {
                'allowed': False,
                'reason': 'IP blocked due to abuse'
            }
        
        # Initialize if not exists
        if ip not in self.ai_requests:
            self.ai_requests[ip] = {
                'count': 1,
                'reset_time': now + self.config['ai_generation']['window'],
                'hourly_count': 1,
                'hourly_reset_time': now + 3600
            }
            return {'allowed': True}
        
        record = self.ai_requests[ip]
        
        # Reset minute counter
        if now > record['reset_time']:
            record['count'] = 1
            record['reset_time'] = now + self.config['ai_generation']['window']
        elif record['count'] >= self.config['ai_generation']['max_requests']:
            security_logger.log_rate_limit(ip, 'AI generation')
            return {
                'allowed': False,
                'reason': 'AI request rate limit exceeded',
                'retry_after': int(record['reset_time'] - now)
            }
        else:
            record['count'] += 1
        
        # Reset hourly counter
        if now > record['hourly_reset_time']:
            record['hourly_count'] = 1
            record['hourly_reset_time'] = now + 3600
        elif record['hourly_count'] >= self.config['ai_generation']['hourly_limit']:
            security_logger.log_suspicious_activity(
                'Hourly AI request limit exceeded',
                ip,
                {'hourly_count': record['hourly_count']}
            )
            return {
                'allowed': False,
                'reason': 'Hourly AI request limit reached',
                'retry_after': int(record['hourly_reset_time'] - now)
            }
        else:
            record['hourly_count'] += 1
        
        return {'allowed': True}
    
    def detect_bot(self, request):
        """Detect bot-like behavior"""
        user_agent = request.headers.get('User-Agent', '')
        ip = request.remote_addr
        
        # Check for missing or suspicious user agents
        if not user_agent or len(user_agent) < 10:
            self.mark_suspicious(ip, 'Missing or suspicious user agent')
            return {
                'is_bot': True,
                'reason': 'Missing or invalid user agent',
                'confidence': 'high'
            }
        
        # Check for common bot patterns
        bot_patterns = [
            'bot', 'crawler', 'spider', 'scraper',
            'curl', 'wget', 'python-requests', 'java',
            'headless', 'phantom', 'selenium'
        ]
        
        user_agent_lower = user_agent.lower()
        for pattern in bot_patterns:
            if pattern in user_agent_lower:
                security_logger.app_logger.info(
                    f"Bot detected via user agent: {ip} - {user_agent}"
                )
                return {
                    'is_bot': True,
                    'reason': 'Bot user agent detected',
                    'confidence': 'medium'
                }
        
        # Check for missing common headers
        has_accept_language = request.headers.get('Accept-Language')
        has_accept = request.headers.get('Accept')
        has_referer = request.headers.get('Referer')
        
        suspicion_score = 0
        if not has_accept_language:
            suspicion_score += 1
        if not has_accept:
            suspicion_score += 1
        if not has_referer and request.method == 'POST':
            suspicion_score += 1
        
        if suspicion_score >= 2:
            self.mark_suspicious(ip, 'Missing common headers')
            return {
                'is_bot': True,
                'reason': 'Missing common browser headers',
                'confidence': 'medium'
            }
        
        return {'is_bot': False}
    
    def mark_suspicious(self, ip, reason):
        """Mark IP as suspicious"""
        if ip not in self.suspicious_ips:
            self.suspicious_ips.add(ip)
            security_logger.log_suspicious_activity(
                'IP marked as suspicious',
                ip,
                {'reason': reason}
            )
            
            # Auto-block after multiple suspicious activities
            suspicious_count = self.get_suspicious_count(ip)
            if suspicious_count >= self.config['bot_detection']['auto_block_threshold']:
                self.block_ip(ip, 'Multiple suspicious activities')
    
    def get_suspicious_count(self, ip):
        """Get suspicious activity count for IP"""
        count = 0
        for key, record in self.request_counts.items():
            if key.startswith(ip) and record['count'] > self.config['api']['max_requests'] * 0.8:
                count += 1
        return count
    
    def block_ip(self, ip, reason):
        """Block IP address"""
        self.blocked_ips.add(ip)
        security_logger.security_logger.warning(
            f"IP blocked: {ip} - Reason: {reason}"
        )
    
    def unblock_ip(self, ip):
        """Unblock IP address"""
        self.blocked_ips.discard(ip)
        self.suspicious_ips.discard(ip)
        security_logger.app_logger.info(f"IP unblocked: {ip}")
    
    def is_blocked(self, ip):
        """Check if IP is blocked"""
        return ip in self.blocked_ips
    
    def cleanup(self):
        """Cleanup old entries"""
        now = time.time()
        
        # Only cleanup every 5 minutes
        if now - self.last_cleanup < 300:
            return
        
        # Cleanup request counts
        keys_to_delete = []
        for key, record in self.request_counts.items():
            if now > record['reset_time'] + 300:  # 5 minutes after reset
                keys_to_delete.append(key)
        
        for key in keys_to_delete:
            del self.request_counts[key]
        
        # Cleanup AI requests
        ips_to_delete = []
        for ip, record in self.ai_requests.items():
            if now > record['hourly_reset_time'] + 300:
                ips_to_delete.append(ip)
        
        for ip in ips_to_delete:
            del self.ai_requests[ip]
        
        self.last_cleanup = now
        
        security_logger.app_logger.info(
            f"Abuse protection cleanup completed - "
            f"Request counts: {len(self.request_counts)}, "
            f"AI requests: {len(self.ai_requests)}, "
            f"Suspicious IPs: {len(self.suspicious_ips)}, "
            f"Blocked IPs: {len(self.blocked_ips)}"
        )
    
    def get_stats(self):
        """Get statistics"""
        return {
            'request_counts': len(self.request_counts),
            'ai_requests': len(self.ai_requests),
            'suspicious_ips': len(self.suspicious_ips),
            'blocked_ips': len(self.blocked_ips)
        }

# Global instance
abuse_protection = AbuseProtection()
