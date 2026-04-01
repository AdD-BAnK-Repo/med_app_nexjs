#!/bin/bash
#===============================================================================
# Deploy Script for Med Expiry Checker
# This script builds and deploys the Next.js app with proper error handling
#===============================================================================

set -e  # Exit on error

# Configuration
APP_NAME="med-expiry-checker"
APP_DIR="/workspace/med_application"
LOG_DIR="$APP_DIR/logs"
PORT=3000
NODE_VERSION="20"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Create log directory
mkdir -p "$LOG_DIR"

log_info "Starting deployment for $APP_NAME..."
log_info "Working directory: $APP_DIR"
log_info "Target port: $PORT"

# Check if port is in use
check_port() {
    if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Port $PORT is already in use. Stopping existing process..."
        # Try to stop gracefully first
        if command -v pm2 &> /dev/null; then
            pm2 stop $APP_NAME 2>/dev/null || true
            pm2 delete $APP_NAME 2>/dev/null || true
        fi
        # Force kill if still running
        PID=$(lsof -Pi :$PORT -sTCP:LISTEN -t 2>/dev/null)
        if [ ! -z "$PID" ]; then
            kill -9 $PID 2>/dev/null || true
            sleep 2
        fi
    fi
}

# Navigate to app directory
cd "$APP_DIR"

# Check Node.js version
log_info "Checking Node.js version..."
CURRENT_NODE=$(node -v 2>/dev/null || echo "none")
log_info "Current Node.js version: $CURRENT_NODE"

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    log_warn "node_modules not found. Running npm install..."
    npm install
fi

# Check if Prisma client is generated
if [ ! -d "node_modules/.prisma/client" ]; then
    log_warn "Prisma client not found. Generating..."
    npx prisma generate
fi

# Check port availability
check_port

# Build the application
log_info "Building Next.js application..."
npm run build 2>&1 | tee "$LOG_DIR/build.log"

if [ $? -ne 0 ]; then
    log_error "Build failed! Check $LOG_DIR/build.log for details."
    exit 1
fi

log_success "Build completed successfully!"

# Start/Restart the application with PM2
if command -v pm2 &> /dev/null; then
    log_info "Starting application with PM2..."
    
    # Check if app already exists in PM2
    if pm2 list | grep -q "$APP_NAME"; then
        log_info "Restarting existing PM2 process..."
        pm2 restart $APP_NAME --update-env
    else
        log_info "Starting new PM2 process..."
        pm2 start npm --name "$APP_NAME" -- start
    fi
    
    # Save PM2 config
    pm2 save
    
    log_success "Application started with PM2 on port $PORT"
    log_info "Use 'pm2 logs $APP_NAME' to view logs"
    log_info "Use 'pm2 status' to check status"
else
    log_warn "PM2 not found. Starting without process manager..."
    log_info "To install PM2: npm install -g pm2"
    nohup npm start > "$LOG_DIR/app.log" 2>&1 &
    log_success "Application started in background on port $PORT"
fi

# Verify the application is running
sleep 3
if curl -s http://localhost:$PORT > /dev/null 2>&1; then
    log_success "Application is responding on port $PORT!"
else
    log_warn "Application may not be ready yet. Checking again in 5 seconds..."
    sleep 5
    if curl -s http://localhost:$PORT > /dev/null 2>&1; then
        log_success "Application is now responding on port $PORT!"
    else
        log_error "Application is not responding. Check logs for errors."
        exit 1
    fi
fi

# Update deploy log
echo "$(date '+%a %d %b %Y %H:%M:%S %Z') - Deployment completed successfully" >> "$APP_DIR/deploy.log"

log_success "=========================================="
log_success "Deployment completed successfully!"
log_success "=========================================="
log_info "Application URL: http://localhost:$PORT"
log_info "Timestamp: $(date)"
