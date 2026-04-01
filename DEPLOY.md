# Deployment Guide

This document explains how to deploy and maintain the Med Expiry Checker application with Cloudflare Tunnel.

## Overview

The application runs on:
- **Port**: 3000
- **Process Manager**: PM2 (recommended)
- **Reverse Proxy**: Cloudflare Tunnel (cloudflared)
- **Public URL**: https://med.netfree.in.th

## Prerequisites

1. Node.js 18+ installed
2. PM2 installed globally: `npm install -g pm2`
3. Cloudflared installed and configured

## Quick Start

### 1. First Time Setup

```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Run database migrations (if needed)
npx prisma migrate deploy
```

### 2. Deploy the Application

```bash
# Using the deploy script
./scripts/deploy.sh
```

This will:
- Check and free port 3000 if needed
- Build the Next.js application
- Start/restart with PM2
- Verify the application is running

### 3. Verify Deployment

```bash
# Check application status
curl http://localhost:3000

# Check PM2 status
pm2 status

# View logs
pm2 logs med-expiry-checker
```

## Cloudflare Tunnel Setup

### Installation

```bash
# Download and install cloudflared
# See: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/

# Login to Cloudflare
cloudflared tunnel login
```

### Create and Configure Tunnel

```bash
# Create a new tunnel
cloudflared tunnel create med-app

# Configure the tunnel
cat > ~/.cloudflared/config.yml << 'EOF'
tunnel: <TUNNEL_ID>
credentials-file: /home/nn/.cloudflared/<TUNNEL_ID>.json

ingress:
  - hostname: med.netfree.in.th
    service: http://localhost:3000
  - service: http_status:404
EOF

# Route DNS to tunnel
cloudflared tunnel route dns med-app med.netfree.in.th

# Start the tunnel
cloudflared tunnel run med-app
```

### Run as System Service

```bash
# Install as systemd service
sudo cloudflared service install

# Or manually create service file
sudo tee /etc/systemd/system/cloudflared.service > /dev/null << 'EOF'
[Unit]
Description=Cloudflare Tunnel
After=network.target

[Service]
Type=simple
User=nn
WorkingDirectory=/home/nn
ExecStart=/usr/local/bin/cloudflared tunnel run med-app
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# Enable and start
sudo systemctl daemon-reload
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

## Monitoring & Health Checks

### Manual Health Check

```bash
./scripts/health-check.sh
```

### Automated Health Checks (Cron)

Add to crontab to run every 5 minutes:

```bash
# Edit crontab
crontab -e

# Add line:
*/5 * * * * /workspace/med_application/scripts/health-check.sh > /dev/null 2>&1
```

### Cloudflare Diagnostic

If you see Error 1033:

```bash
./scripts/cloudflare-diagnostic.sh
```

## Troubleshooting

### Error 1033 - Cloudflare Tunnel Error

**Symptoms**: Browser shows "Cloudflare Tunnel error" with Error 1033

**Causes & Fixes**:

1. **cloudflared not running**
   ```bash
   sudo systemctl status cloudflared
   sudo systemctl restart cloudflared
   ```

2. **Application not running**
   ```bash
   ./scripts/deploy.sh
   ```

3. **Tunnel credentials expired**
   ```bash
   cloudflared tunnel list
   cloudflared tunnel login
   ```

### Port Already in Use

If port 3000 is taken:

```bash
# Find what's using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or use deploy script (handles this automatically)
./scripts/deploy.sh
```

### Application Won't Start

```bash
# Check logs
pm2 logs med-expiry-checker

# Check Node.js version
node -v  # Should be 18+

# Rebuild
rm -rf .next
npm run build
pm2 restart med-expiry-checker
```

### PM2 Commands

```bash
# List processes
pm2 list

# View logs
pm2 logs med-expiry-checker

# Restart
pm2 restart med-expiry-checker

# Stop
pm2 stop med-expiry-checker

# Delete
pm2 delete med-expiry-checker

# Save configuration
pm2 save

# Startup script
pm2 startup
```

## File Structure

```
/workspace/med_application/
├── scripts/
│   ├── deploy.sh              # Main deployment script
│   ├── health-check.sh        # Health monitoring
│   └── cloudflare-diagnostic.sh # Troubleshooting
├── ecosystem.config.js        # PM2 configuration
├── logs/                      # Log files
│   ├── combined.log
│   ├── out.log
│   └── error.log
└── DEPLOY.md                  # This file
```

## Maintenance Checklist

- [ ] Run health check daily
- [ ] Review PM2 logs weekly
- [ ] Check disk space monthly
- [ ] Update dependencies quarterly
- [ ] Backup database regularly

## Emergency Contacts

- Cloudflare Status: https://www.cloudflarestatus.com/
- Documentation: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/
