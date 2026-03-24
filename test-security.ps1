# Security Testing Script for Campus Navigation App (PowerShell)
# Usage: .\test-security.ps1 [API_URL]

param(
    [string]$ApiUrl = "http://localhost:3000"
)

Write-Host "🔒 Campus Navigation Security Test Suite" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Testing API: $ApiUrl" -ForegroundColor Yellow
Write-Host ""

$ResultsFile = "security-test-results.txt"
$Passed = 0
$Failed = 0
$Warnings = 0

# Initialize results file
"Security Test Results - $(Get-Date)" | Out-File $ResultsFile
"Testing API: $ApiUrl" | Out-File $ResultsFile -Append
"==========================================" | Out-File $ResultsFile -Append

function Print-Result {
    param(
        [string]$TestName,
        [string]$Result,
        [string]$Message
    )
    
    $script:Passed = $Passed
    $script:Failed = $Failed
    $script:Warnings = $Warnings
    
    switch ($Result) {
        "PASS" {
            Write-Host "✓ PASS: $TestName" -ForegroundColor Green
            $script:Passed++
        }
        "FAIL" {
            Write-Host "✗ FAIL: $TestName - $Message" -ForegroundColor Red
            $script:Failed++
        }
        "WARN" {
            Write-Host "⚠ WARN: $TestName - $Message" -ForegroundColor Yellow
            $script:Warnings++
        }
    }
    
    "$Result: $TestName - $Message" | Out-File $ResultsFile -Append
}

# Test 1: Health Check
Write-Host "Test 1: Health Check Endpoint"
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method Get -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Print-Result "Health Check" "PASS" "Server is responding"
    }
} catch {
    Print-Result "Health Check" "FAIL" "Server not responding: $($_.Exception.Message)"
}
Write-Host ""

# Test 2: Security Headers
Write-Host "Test 2: Security Headers"
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method Get -UseBasicParsing
    
    if ($response.Headers["Strict-Transport-Security"]) {
        Print-Result "HSTS Header" "PASS" "HSTS header present"
    } else {
        Print-Result "HSTS Header" "WARN" "HSTS header missing (required for HTTPS)"
    }
    
    if ($response.Headers["X-Frame-Options"]) {
        Print-Result "X-Frame-Options" "PASS" "X-Frame-Options header present"
    } else {
        Print-Result "X-Frame-Options" "FAIL" "X-Frame-Options header missing"
    }
    
    if ($response.Headers["X-Content-Type-Options"]) {
        Print-Result "X-Content-Type-Options" "PASS" "X-Content-Type-Options header present"
    } else {
        Print-Result "X-Content-Type-Options" "FAIL" "X-Content-Type-Options header missing"
    }
} catch {
    Print-Result "Security Headers" "FAIL" "Could not check headers: $($_.Exception.Message)"
}
Write-Host ""

# Test 3: Rate Limiting (sending 110 requests...)
Write-Host "Test 3: Rate Limiting (sending 110 requests...)"
$rateLimited = $false
for ($i = 1; $i -le 110; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "$ApiUrl/health" -Method Get -UseBasicParsing
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 429) {
            $rateLimited = $true
            Print-Result "Rate Limiting" "PASS" "Rate limiting active (blocked at request $i)"
            break
        }
    }
}
if (-not $rateLimited) {
    Print-Result "Rate Limiting" "WARN" "Rate limiting not triggered (may need adjustment)"
}
Write-Host ""

# Test 4: Bot Detection - Missing User Agent
Write-Host "Test 4: Bot Detection - Missing User Agent"
try {
    $headers = @{}
    $body = @{ message = "test" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing
    Print-Result "Bot Detection (No UA)" "WARN" "Bot not detected"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 403) {
        Print-Result "Bot Detection (No UA)" "PASS" "Bot detected and blocked"
    } else {
        Print-Result "Bot Detection (No UA)" "WARN" "Unexpected response: $($_.Exception.Message)"
    }
}
Write-Host ""

# Test 5: Bot Detection - Bot User Agent
Write-Host "Test 5: Bot Detection - Bot User Agent"
try {
    $headers = @{ "User-Agent" = "python-requests/2.28.0" }
    $body = @{ message = "test" } | ConvertTo-Json
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body $body -ContentType "application/json" -Headers $headers -UseBasicParsing
    Print-Result "Bot Detection (Bot UA)" "WARN" "Bot user agent not detected"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 403) {
        Print-Result "Bot Detection (Bot UA)" "PASS" "Bot user agent detected"
    } else {
        Print-Result "Bot Detection (Bot UA)" "WARN" "Unexpected response"
    }
}
Write-Host ""

# Test 6: AI Rate Limiting
Write-Host "Test 6: AI Request Rate Limiting (sending 15 AI requests...)"
$aiRateLimited = $false
for ($i = 1; $i -le 15; $i++) {
    try {
        $body = @{ message = "test" } | ConvertTo-Json
        $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    } catch {
        if ($_.Exception.Response.StatusCode.Value__ -eq 429) {
            $aiRateLimited = $true
            Print-Result "AI Rate Limiting" "PASS" "AI rate limiting active (blocked at request $i)"
            break
        }
    }
}
if (-not $aiRateLimited) {
    Print-Result "AI Rate Limiting" "WARN" "AI rate limiting not triggered"
}
Write-Host ""

# Test 7: Honeypot Field Detection
Write-Host "Test 7: Honeypot Field Detection"
try {
    $body = @{
        email = "test@test.com"
        password = "password123"
        name = "Test"
        website = "http://spam.com"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/auth/register" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Print-Result "Honeypot Detection" "PASS" "Bot caught by honeypot (silent success)"
    }
} catch {
    Print-Result "Honeypot Detection" "WARN" "Honeypot may not be active"
}
Write-Host ""

# Test 8: XSS Prevention
Write-Host "Test 4: XSS Prevention"
try {
    $body = @{
        message = "<script>alert(1)</script>"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    
    if ($response.Content -match "<script>") {
        Print-Result "XSS Prevention" "FAIL" "XSS payload not sanitized"
    } else {
        Print-Result "XSS Prevention" "PASS" "XSS payload sanitized"
    }
} catch {
    Print-Result "XSS Prevention" "PASS" "XSS payload rejected"
}
Write-Host ""

# Test 5: Message Length Validation
Write-Host "Test 5: Message Length Validation"
try {
    $longMessage = "A" * 600
    $body = @{
        message = $longMessage
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    Print-Result "Message Length Limit" "FAIL" "Long messages not rejected"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
        Print-Result "Message Length Limit" "PASS" "Long messages rejected"
    } else {
        Print-Result "Message Length Limit" "FAIL" "Unexpected response: $($_.Exception.Message)"
    }
}
Write-Host ""

# Test 6: Invalid JSON
Write-Host "Test 6: Invalid JSON Handling"
try {
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/chat" -Method Post -Body "invalid json" -ContentType "application/json" -UseBasicParsing
    Print-Result "Invalid JSON" "FAIL" "Invalid JSON not rejected"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
        Print-Result "Invalid JSON" "PASS" "Invalid JSON rejected"
    } else {
        Print-Result "Invalid JSON" "WARN" "Unexpected response: $($_.Exception.Message)"
    }
}
Write-Host ""

# Test 7: Coordinate Validation
Write-Host "Test 7: Coordinate Validation"
try {
    $body = @{
        name = "Test"
        lat = 999
        lng = 999
        description = "Test"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "$ApiUrl/api/locations" -Method Post -Body $body -ContentType "application/json" -UseBasicParsing
    Print-Result "Coordinate Validation" "FAIL" "Invalid coordinates accepted"
} catch {
    if ($_.Exception.Response.StatusCode.Value__ -eq 400) {
        Print-Result "Coordinate Validation" "PASS" "Invalid coordinates rejected"
    } else {
        Print-Result "Coordinate Validation" "WARN" "Unexpected response: $($_.Exception.Message)"
    }
}
Write-Host ""

# Summary
Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Test Summary" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Passed: $Passed" -ForegroundColor Green
Write-Host "Failed: $Failed" -ForegroundColor Red
Write-Host "Warnings: $Warnings" -ForegroundColor Yellow
Write-Host ""

if ($Failed -eq 0) {
    Write-Host "✓ All critical tests passed!" -ForegroundColor Green
    $exitCode = 0
} else {
    Write-Host "✗ Some tests failed. Review the results above." -ForegroundColor Red
    $exitCode = 1
}

Write-Host ""
Write-Host "Detailed results saved to: $ResultsFile" -ForegroundColor Cyan
Write-Host ""

# Recommendations
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "Security Recommendations" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "1. Ensure HTTPS is enabled in production"
Write-Host "2. Configure CORS whitelist with production domains"
Write-Host "3. Monitor logs regularly for suspicious activity"
Write-Host "4. Keep dependencies updated (npm audit, pip check)"
Write-Host "5. Rotate secrets every 90 days"
Write-Host "6. Set up automated security scanning"
Write-Host "7. Implement authentication before public deployment"
Write-Host "8. Use a real database with proper access controls"
Write-Host "9. Enable SSL/TLS for all external connections"
Write-Host "10. Set up monitoring and alerting"
Write-Host ""

exit $exitCode
