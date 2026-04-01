#!/bin/bash
#===============================================================================
# Health Check Script for Med Expiry Checker
# This script checks if the application and Cloudflare tunnel are running
#===============================================================================

set -e

# Configuration
APP_NAME="med-expiry-checker"
APP_URL="http://localhost:3000"
CLOUDFLARE_URL="https://med.netfree.in.th"
LOG_FILE="/workspace/med_application/logs/health-check.log"
PID_FILE="/tmp/health-check.pid"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Logging
log_info() {
    echo -e "${BLUE}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_warn() {
    echo -e "${YELLOW}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1" | tee -a "$LOG_FILE"
}

# Prevent multiple simultaneous runs
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE")
    if ps -p "$OLD_PID" > /dev/null 2>&1; then
        log_warn "Health check already running (PID: $OLD_PID)"
        exit 0
    fi
fi
echo $$ > "$PID_FILE"

# Cleanup on exit
trap "rm -f $PID_FILE" EXIT

mkdir -p "$(dirname "$LOG_FILE")"

log_info "=========================================="
log_info "Starting health check..."
log_info "=========================================="

# Check 1: Application is running on localhost
log_info "Checking application on $APP_URL..."
if curl -s --max-time 10 "$APP_URL" > /dev/null 2>&1; then
    APP_STATUS="OK"
    log_success "Application is responding on port 3000"
else
    APP_STATUS="FAIL"
    log_error "Application is NOT responding on port 3000"
fi

# Check 2: PM2 process status
log_info "Checking PM2 process status..."
if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "$APP_NAME"; then
        PM2_STATUS=$(pm2 jlist | grep -o '"status":"[^"]*"' | head -1 | cut -d'"' -f4)
        if [ "$PM2_STATUS" = "online" ]; then
            log_success "PM2 process is online"
            PM2_STATUS="OK"
        else
            log_warn "PM2 process status: $PM2_STATUS"
            PM2_STATUS="WARN"
        fi
    else
        log_error "PM2 process not found"
        PM2_STATUS="FAIL"
    fi
else
    log_warn "PM2 not installed"
    PM2_STATUS="N/A"
fi

# Check 3: Cloudflare Tunnel connectivity
log_info "Checking Cloudflare tunnel ($CLOUDFLARE_URL)..."
# Use a simple HEAD request to check if tunnel is resolving
CF_STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 "$CLOUDFLARE_URL" 2>/dev/null || echo "000")

if [ "$CF_STATUS_CODE" = "200" ] || [ "$CF_STATUS_CODE" = "307" ] || [ "$CF_STATUS_CODE" = "302" ]; then
    CF_STATUS="OK"
    log_success "Cloudflare tunnel is responding (HTTP $CF_STATUS_CODE)"
elif [ "$CF_STATUS_CODE" = "000" ]; then
    CF_STATUS="FAIL"
    log_error "Cloudflare tunnel NOT resolving (Error 1033 likely)"
elif [ "$CF_STATUS_CODE" = "503" ] || [ "$CF_STATUS_CODE" = "502" ] || [ "$CF_STATUS_CODE" = "521" ] || [ "$CF_STATUS_CODE" = "522" ]; then
    CF_STATUS="FAIL"
    log_error "Cloudflare tunnel error (HTTP $CF_STATUS_CODE)"
else
    CF_STATUS="WARN"
    log_warn "Cloudflare tunnel returned HTTP $CF_STATUS_CODE"
fi

# Check 4: Disk space
log_info "Checking disk space..."
DISK_USAGE=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    log_success "Disk usage is ${DISK_USAGE}%"
    DISK_STATUS="OK"
elif [ "$DISK_USAGE" -lt 90 ]; then
    log_warn "Disk usage is ${DISK_USAGE}%"
    DISK_STATUS="WARN"
else
    log_error "Disk usage is critical: ${DISK_USAGE}%"
    DISK_STATUS="FAIL"
fi

# Check 5: Memory usage
log_info "Checking memory usage..."
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.0f", $3/$2 * 100.0}')
if [ "$MEMORY_USAGE" -lt 80 ]; then
    log_success "Memory usage is ${MEMORY_USAGE}%"
    MEM_STATUS="OK"
elif [ "$MEMORY_USAGE" -lt 90 ]; then
    log_warn "Memory usage is ${MEMORY_USAGE}%"
    MEM_STATUS="WARN"
else
    log_error "Memory usage is high: ${MEMORY_USAGE}%"
    MEM_STATUS="WARN"
fi

# Auto-restart if needed
if [ "$APP_STATUS" = "FAIL" ] && command -v pm2 &> /dev/null; then
    log_warn "Attempting to restart application via PM2..."
    pm2 restart "$APP_NAME"
    sleep 3
    if curl -s --max-time 10 "$APP_URL" > /dev/null 2>&1; then
        log_success "Application restarted successfully"
        APP_STATUS="RECOVERED"
    else
        log_error "Failed to restart application"
    fi
fi

# Summary
log_info "=========================================="
log_info "Health Check Summary"
log_info "=========================================="
echo -e "Application: $([ "$APP_STATUS" = "OK" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}$APP_STATUS${NC}")"
echo -e "PM2 Process: $([ "$PM2_STATUS" = "OK" ] && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}$PM2_STATUS${NC}")"
echo -e "Cloudflare:  $([ "$CF_STATUS" = "OK" ] && echo -e "${GREEN}OK${NC}" || echo -e "${RED}$CF_STATUS${NC}")"
echo -e "Disk Space:  $([ "$DISK_STATUS" = "OK" ] && echo -e "${GREEN}OK${NC}" || echo -e "${YELLOW}$DISK_STATUS${NC}") (${DISK_USAGE}%)"

log_info "=========================================="

# Send alert if critical issues found
if [ "$APP_STATUS" = "FAIL" ] || [ "$CF_STATUS" = "FAIL" ]; then
    log_error "CRITICAL ISSUES DETECTED!"
    # Could add notification here (email, webhook, etc.)
    exit 1
fi

exit 0