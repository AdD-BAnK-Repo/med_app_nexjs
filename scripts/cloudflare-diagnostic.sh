#!/bin/bash
#===============================================================================
# Cloudflare Tunnel Diagnostic Script
# Helps troubleshoot Cloudflare Error 1033 and other tunnel issues
#===============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}"
echo "=========================================="
echo "  Cloudflare Tunnel Diagnostic Tool"
echo "=========================================="
echo -e "${NC}"

# Function to print section headers
print_section() {
    echo ""
    echo -e "${BLUE}>>> $1${NC}"
    echo "------------------------------------------"
}

# Check if running as root (may be needed for some diagnostics)
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some checks may require root privileges${NC}"
fi

print_section "1. Checking Application Status"
echo "Testing http://localhost:3000..."
if curl -s --max-time 5 http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Application is running on port 3000${NC}"
else
    echo -e "${RED}✗ Application is NOT running on port 3000${NC}"
    echo -e "${YELLOW}  Fix: Run ./scripts/deploy.sh to start the application${NC}"
fi

print_section "2. Checking Cloudflared Service"
if command -v cloudflared &> /dev/null; then
    echo -e "${GREEN}✓ cloudflared is installed${NC}"
    cloudflared --version
    
    # Check if running as systemd service
    if systemctl is-active --quiet cloudflared 2>/dev/null; then
        echo -e "${GREEN}✓ cloudflared systemd service is active${NC}"
        systemctl status cloudflared --no-pager -l | head -20
    elif pgrep -x "cloudflared" > /dev/null; then
        echo -e "${GREEN}✓ cloudflared is running (process found)${NC}"
        ps aux | grep cloudflared | grep -v grep
    else
        echo -e "${RED}✗ cloudflared is NOT running${NC}"
        echo -e "${YELLOW}  Fix: Start cloudflared with one of these methods:${NC}"
        echo -e "       1. sudo systemctl start cloudflared"
        echo -e "       2. cloudflared tunnel run <tunnel-name>"
        echo -e "       3. cloudflared tunnel --config ~/.cloudflared/config.yml run"
    fi
else
    echo -e "${RED}✗ cloudflared is NOT installed${NC}"
    echo -e "${YELLOW}  Install: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/${NC}"
fi

print_section "3. Checking Tunnel Configuration"
if [ -d ~/.cloudflared ]; then
    echo -e "${GREEN}✓ Cloudflared config directory exists${NC}"
    ls -la ~/.cloudflared/
    
    if [ -f ~/.cloudflared/config.yml ]; then
        echo ""
        echo "Config file content:"
        cat ~/.cloudflared/config.yml
    fi
    
    # Check for certificate
    if [ -f ~/.cloudflared/cert.pem ]; then
        echo -e "${GREEN}✓ Cloudflare certificate found${NC}"
    else
        echo -e "${YELLOW}⚠ Cloudflare certificate not found (may need to login)${NC}"
        echo -e "    Run: cloudflared tunnel login"
    fi
else
    echo -e "${RED}✗ Cloudflared config directory not found${NC}"
fi

print_section "4. Testing DNS Resolution"
echo "Testing DNS resolution for med.netfree.in.th..."
if nslookup med.netfree.in.th > /dev/null 2>&1; then
    echo -e "${GREEN}✓ DNS resolves:${NC}"
    nslookup med.netfree.in.th | grep -E "Name:|Address:"
else
    echo -e "${RED}✗ DNS resolution failed${NC}"
fi

print_section "5. Testing Cloudflare Edge"
echo "Testing connection to Cloudflare edge..."
if curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://med.netfree.in.th > /dev/null 2>&1; then
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 10 https://med.netfree.in.th)
    if [ "$HTTP_CODE" = "200" ]; then
        echo -e "${GREEN}✓ Cloudflare tunnel is working (HTTP 200)${NC}"
    elif [ "$HTTP_CODE" = "1033" ] || [ "$HTTP_CODE" = "530" ]; then
        echo -e "${RED}✗ Cloudflare Error 1033: Tunnel cannot resolve${NC}"
        echo -e "${YELLOW}  Common causes:${NC}"
        echo -e "    1. cloudflared daemon not running on origin server"
        echo -e "    2. Tunnel credentials expired or invalid"
        echo -e "    3. Origin server is offline"
        echo ""
        echo -e "${YELLOW}  Solutions:${NC}"
        echo -e "    1. Restart cloudflared: sudo systemctl restart cloudflared"
        echo -e "    2. Check tunnel status: cloudflared tunnel list"
        echo -e "    3. Verify tunnel token: cat ~/.cloudflared/*.json"
    else
        echo -e "${YELLOW}⚠ Cloudflare returned HTTP $HTTP_CODE${NC}"
    fi
else
    echo -e "${RED}✗ Cannot connect to Cloudflare${NC}"
    echo -e "${YELLOW}  This could be a network connectivity issue${NC}"
fi

print_section "6. Network Connectivity Tests"
echo "Testing internet connectivity..."
if ping -c 1 1.1.1.1 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Internet connectivity OK${NC}"
else
    echo -e "${RED}✗ No internet connectivity${NC}"
fi

echo ""
echo "Checking firewall status..."
if command -v ufw &> /dev/null; then
    ufw status | head -10
elif command -v firewall-cmd &> /dev/null; then
    firewall-cmd --state 2>/dev/null || echo "Firewall not running"
else
    echo "No standard firewall detected"
fi

print_section "7. Log Analysis"
if command -v cloudflared &> /dev/null; then
    echo "Recent cloudflared logs:"
    if [ -f /var/log/cloudflared.log ]; then
        tail -20 /var/log/cloudflared.log
    elif systemctl is-active --quiet cloudflared 2>/dev/null; then
        journalctl -u cloudflared --no-pager -n 20 2>/dev/null || echo "Cannot access journalctl logs"
    else
        echo "No log file found at standard locations"
    fi
fi

print_section "8. Quick Fixes"
echo -e "${CYAN}Common fix commands:${NC}"
echo ""
echo "1. Restart application:"
echo -e "   ${YELLOW}./scripts/deploy.sh${NC}"
echo ""
echo "2. Restart cloudflared (systemd):"
echo -e "   ${YELLOW}sudo systemctl restart cloudflared${NC}"
echo ""
echo "3. Restart cloudflared (manual):"
echo -e "   ${YELLOW}cloudflared tunnel run <tunnel-name>${NC}"
echo ""
echo "4. Check all tunnels:"
echo -e "   ${YELLOW}cloudflared tunnel list${NC}"
echo ""
echo "5. View real-time logs:"
echo -e "   ${YELLOW}cloudflared tunnel tail <tunnel-name>${NC}"
echo ""

print_section "Summary"
echo "If you're seeing Error 1033, the most likely causes are:"
echo ""
echo -e "1. ${YELLOW}cloudflared is not running${NC} on the origin server"
echo -e "   → Start it with: sudo systemctl start cloudflared"
echo ""
echo -e "2. ${YELLOW}Application is not running${NC} on port 3000"
echo -e "   → Start it with: ./scripts/deploy.sh"
echo ""
echo -e "3. ${YELLOW}Tunnel credentials expired${NC}"
echo -e "   → Check with: cloudflared tunnel list"
echo -e "   → Re-authenticate if needed: cloudflared tunnel login"
echo ""

echo -e "${CYAN}For more help: https://developers.cloudflare.com/cloudflare-one/faq/cloudflare-tunnels-faq/${NC}"
echo ""
echo "=========================================="