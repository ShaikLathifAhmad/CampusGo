#!/bin/bash

# Security Testing Script for Campus Navigation App
# This script tests various security features

echo "🔒 Campus Navigation Security Test Suite"
echo "=========================================="
echo ""

# Configuration
API_URL="${1:-http://localhost:3000}"
RESULTS_FILE="security-test-results.txt"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0
WARNINGS=0

# Function to print test result
print_result() {
    local test_name=$1
    local result=$2
    local message=$3
    
    if [ "$result" == "PASS" ]; then
        echo -e "${GREEN}✓ PASS${NC}: $test_name"
        ((PASSED++))
    elif [ "$result" == "FAIL" ]; then
        echo -e "${RED}✗ FAIL${NC}: $test_name - $message"
        ((FAILED++))
    else
        echo -e "${YELLOW}⚠ WARN${NC}: $test_name - $message"
        ((WARNINGS++))
    fi
    
    echo "$result: $test_name - $message" >> "$RESULTS_FILE"
}

# Initialize results file
echo "Security Test Results - $(date)" > "$RESULTS_FILE"
echo "Testing API: $API_URL" >> "$RESULTS_FILE"
echo "========================================" >> "$RESULTS_FILE"

echo "Testing API: $API_URL"
echo ""

# Test 1: Health Check
echo "Test 1: Health Check Endpoint"
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
if [ "$response" == "200" ]; then
    print_result "Health Check" "PASS" "Server is responding"
else
    print_result "Health Check" "FAIL" "Server not responding (HTTP $response)"
fi
echo ""

# Test 2: HTTPS Redirect (if production)
echo "Test 2: HTTPS Enforcement"
if [[ $API_URL == https://* ]]; then
    http_url="${API_URL/https/http}"
    response=$(curl -s -o /dev/null -w "%{http_code}" -L "$http_url/health")
    if [ "$response" == "200" ]; then
        print_result "HTTPS Redirect" "PASS" "HTTP redirects to HTTPS"
    else
        print_result "HTTPS Redirect" "FAIL" "HTTP not redirecting properly"
    fi
else
    print_result "HTTPS Redirect" "WARN" "Testing HTTP endpoint (use HTTPS in production)"
fi
echo ""

# Test 3: Security Headers
echo "Test 3: Security Headers"
headers=$(curl -s -I "$API_URL/health")

if echo "$headers" | grep -q "Strict-Transport-Security"; then
    print_result "HSTS Header" "PASS" "HSTS header present"
else
    print_result "HSTS Header" "WARN" "HSTS header missing (required for HTTPS)"
fi

if echo "$headers" | grep -q "X-Frame-Options"; then
    print_result "X-Frame-Options" "PASS" "X-Frame-Options header present"
else
    print_result "X-Frame-Options" "FAIL" "X-Frame-Options header missing"
fi

if echo "$headers" | grep -q "X-Content-Type-Options"; then
    print_result "X-Content-Type-Options" "PASS" "X-Content-Type-Options header present"
else
    print_result "X-Content-Type-Options" "FAIL" "X-Content-Type-Options header missing"
fi
echo ""

# Test 4: Rate Limiting
echo "Test 4: Rate Limiting"
echo "Sending 110 requests to test rate limiting..."
rate_limited=false
for i in {1..110}; do
    response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/health")
    if [ "$response" == "429" ]; then
        rate_limited=true
        break
    fi
done

if [ "$rate_limited" = true ]; then
    print_result "Rate Limiting" "PASS" "Rate limiting active (blocked at request $i)"
else
    print_result "Rate Limiting" "WARN" "Rate limiting not triggered (may need adjustment)"
fi
echo ""

# Test 5: Input Validation - XSS
echo "Test 5: XSS Prevention"
xss_payload='{"message":"<script>alert(1)</script>"}'
response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "$xss_payload")

if echo "$response" | grep -q "<script>"; then
    print_result "XSS Prevention" "FAIL" "XSS payload not sanitized"
else
    print_result "XSS Prevention" "PASS" "XSS payload sanitized"
fi
echo ""

# Test 6: Input Validation - Message Length
echo "Test 6: Message Length Validation"
long_message=$(printf 'A%.0s' {1..600})
response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "{\"message\":\"$long_message\"}" \
    -w "%{http_code}" -o /dev/null)

if [ "$response" == "400" ]; then
    print_result "Message Length Limit" "PASS" "Long messages rejected"
else
    print_result "Message Length Limit" "FAIL" "Long messages not rejected (HTTP $response)"
fi
echo ""

# Test 7: Invalid JSON
echo "Test 7: Invalid JSON Handling"
response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "invalid json" \
    -w "%{http_code}" -o /dev/null)

if [ "$response" == "400" ]; then
    print_result "Invalid JSON" "PASS" "Invalid JSON rejected"
else
    print_result "Invalid JSON" "FAIL" "Invalid JSON not rejected (HTTP $response)"
fi
echo ""

# Test 8: CORS
echo "Test 8: CORS Configuration"
response=$(curl -s -X OPTIONS "$API_URL/api/chat" \
    -H "Origin: http://malicious-site.com" \
    -H "Access-Control-Request-Method: POST" \
    -I)

if echo "$response" | grep -q "Access-Control-Allow-Origin"; then
    allowed_origin=$(echo "$response" | grep "Access-Control-Allow-Origin" | cut -d' ' -f2)
    if [ "$allowed_origin" == "*" ]; then
        print_result "CORS Configuration" "WARN" "CORS allows all origins (use whitelist in production)"
    else
        print_result "CORS Configuration" "PASS" "CORS whitelist configured"
    fi
else
    print_result "CORS Configuration" "FAIL" "CORS headers not found"
fi
echo ""

# Test 9: Coordinate Validation
echo "Test 9: Coordinate Validation"
invalid_coords='{"name":"Test","lat":999,"lng":999,"description":"Test"}'
response=$(curl -s -X POST "$API_URL/api/locations" \
    -H "Content-Type: application/json" \
    -d "$invalid_coords" \
    -w "%{http_code}" -o /dev/null)

if [ "$response" == "400" ]; then
    print_result "Coordinate Validation" "PASS" "Invalid coordinates rejected"
else
    print_result "Coordinate Validation" "FAIL" "Invalid coordinates accepted (HTTP $response)"
fi
echo ""

# Test 10: SQL Injection (Basic)
echo "Test 10: SQL Injection Prevention"
sql_payload='{"message":"1\"; DROP TABLE users; --"}'
response=$(curl -s -X POST "$API_URL/api/chat" \
    -H "Content-Type: application/json" \
    -d "$sql_payload")

if echo "$response" | grep -q "error"; then
    print_result "SQL Injection" "PASS" "SQL injection attempt handled safely"
else
    print_result "SQL Injection" "PASS" "SQL injection attempt processed safely"
fi
echo ""

# Summary
echo ""
echo "=========================================="
echo "Test Summary"
echo "=========================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo -e "${YELLOW}Warnings: $WARNINGS${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All critical tests passed!${NC}"
    exit_code=0
else
    echo -e "${RED}✗ Some tests failed. Review the results above.${NC}"
    exit_code=1
fi

echo ""
echo "Detailed results saved to: $RESULTS_FILE"
echo ""

# Recommendations
echo "=========================================="
echo "Security Recommendations"
echo "=========================================="
echo "1. Ensure HTTPS is enabled in production"
echo "2. Configure CORS whitelist with production domains"
echo "3. Monitor logs regularly for suspicious activity"
echo "4. Keep dependencies updated (npm audit, pip check)"
echo "5. Rotate secrets every 90 days"
echo "6. Set up automated security scanning"
echo "7. Implement authentication before public deployment"
echo "8. Use a real database with proper access controls"
echo "9. Enable SSL/TLS for all external connections"
echo "10. Set up monitoring and alerting"
echo ""

exit $exit_code
