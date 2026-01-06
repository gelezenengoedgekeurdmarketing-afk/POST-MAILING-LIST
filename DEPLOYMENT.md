# POST MAILINGLIST MAKER - Local Server Deployment Guide

## System Requirements

- **Node.js**: Version 18.x or higher (recommended: 20.x)
- **PostgreSQL**: Version 12 or higher
- **Operating System**: Linux, macOS, or Windows with WSL2
- **Memory**: Minimum 2GB RAM
- **Disk Space**: Minimum 500MB

---

## Step-by-Step Deployment Instructions

### 1. Install Prerequisites

#### Install Node.js (if not already installed)
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# macOS (using Homebrew)
brew install node@20

# Verify installation
node --version  # Should show v20.x.x
npm --version   # Should show 10.x.x
```

#### Install PostgreSQL (if not already installed)
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql@15
brew services start postgresql@15

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

---

### 2. Set Up PostgreSQL Database

#### Create Database and User
```bash
# Switch to postgres user
sudo -u postgres psql

# Inside PostgreSQL prompt:
CREATE DATABASE postmailinglist;
CREATE USER postuser WITH ENCRYPTED PASSWORD 'your_secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE postmailinglist TO postuser;

# Grant schema permissions (PostgreSQL 15+)
\c postmailinglist
GRANT ALL ON SCHEMA public TO postuser;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO postuser;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO postuser;

# Exit PostgreSQL
\q
```

#### Note Your Database Connection String
```
postgresql://postuser:your_secure_password_here@localhost:5432/postmailinglist
```

---

### 3. Download and Extract the Application

```bash
# Create application directory
mkdir -p /var/www/postmailinglist
cd /var/www/postmailinglist

# If you have the code in a Git repository:
git clone <your-repo-url> .
```

---

### 3a. Required Code Modifications for Self-Hosting

**IMPORTANT**: Before building, you must remove Replit-specific plugins from `vite.config.ts`:

```bash
nano vite.config.ts
```

Replace the file contents with this self-hosting compatible version:

```typescript
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});
```

**Why this is needed**: The original config includes Replit-specific Vite plugins that don't work outside Replit:
- `@replit/vite-plugin-runtime-error-modal`
- `@replit/vite-plugin-cartographer`
- `@replit/vite-plugin-dev-banner`

**Also remove these from package.json devDependencies** (optional but cleaner):
```bash
npm uninstall @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer @replit/vite-plugin-dev-banner
```

---

### 4. Configure Environment Variables

Create a `.env` file in the application root:

```bash
nano .env
```

Add the following content (replace values with your actual configuration):

```env
# Database Configuration
DATABASE_URL=postgresql://postuser:your_secure_password_here@localhost:5432/postmailinglist

# Session Secret (generate a random string)
SESSION_SECRET=your_random_secret_key_min_32_characters_long

# Admin Credentials for Username/Password Login
LOCAL_ADMIN_USERNAME=emmekegg
LOCAL_ADMIN_PASSWORD=Akker002025

# Server Port (default: 5000)
PORT=5000

# Node Environment
NODE_ENV=production

# Optional: Disable secure cookies for HTTP-only deployments (not recommended)
# Only use this if you can't set up HTTPS and understand the security implications
# DISABLE_SECURE_COOKIE=true
```

#### Generate a Secure Session Secret
```bash
# Generate random 64-character secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

### 5. Install Dependencies

```bash
# Install all Node.js packages
npm install

# This will install all dependencies from package.json
# Takes 2-5 minutes depending on your internet connection
```

---

### 6. Initialize Database Schema

```bash
# Push database schema to PostgreSQL
npm run db:push

# This creates all necessary tables:
# - businesses (your main data)
# - users (authentication)
# - sessions (login sessions)
```

---

### 7. Build the Application

```bash
# Build frontend and backend for production
npm run build

# This creates:
# - dist/ folder with compiled backend code
# - dist/public/ folder with optimized frontend assets
```

---

### 8. Test the Application

```bash
# Start the application in production mode
npm start

# You should see:
# ✅ Database available - using DatabaseStorage
# ✅ Admin user 'emmekegg' initialized
# ✅ Database tables initialized successfully
# 🔐 Authentication enabled - database storage active
# serving on port 5000
```

Open your browser and test:
- **URL**: http://localhost:5000
- **Login**: emmekegg / Akker002025

---

### 9. Set Up as a System Service (Linux)

Create a systemd service file for automatic startup:

```bash
sudo nano /etc/systemd/system/postmailinglist.service
```

Add this content:

```ini
[Unit]
Description=POST Mailinglist Maker
After=network.target postgresql.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/postmailinglist
Environment="NODE_ENV=production"
EnvironmentFile=/var/www/postmailinglist/.env
ExecStart=/usr/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

Enable and start the service:

```bash
# Set correct permissions
sudo chown -R www-data:www-data /var/www/postmailinglist

# Reload systemd
sudo systemctl daemon-reload

# Enable service to start on boot
sudo systemctl enable postmailinglist

# Start the service
sudo systemctl start postmailinglist

# Check status
sudo systemctl status postmailinglist

# View logs
sudo journalctl -u postmailinglist -f
```

---

### 10. Set Up Reverse Proxy with Nginx (Optional but Recommended)

#### Install Nginx
```bash
sudo apt-get install -y nginx
```

#### Create Nginx Configuration
```bash
sudo nano /etc/nginx/sites-available/postmailinglist
```

Add this content:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # Replace with your domain or IP

    client_max_body_size 50M;  # Allow large Excel file uploads

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/postmailinglist /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

---

### 11. Set Up SSL/HTTPS with Let's Encrypt (Optional)

```bash
# Install Certbot
sudo apt-get install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal is set up automatically
# Test renewal:
sudo certbot renew --dry-run
```

---

### 12. Configure Firewall

```bash
# Allow SSH (if remote server)
sudo ufw allow 22/tcp

# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

---

## Maintenance Commands

### View Application Logs
```bash
# Service logs
sudo journalctl -u postmailinglist -f

# Last 100 lines
sudo journalctl -u postmailinglist -n 100
```

### Restart Application
```bash
sudo systemctl restart postmailinglist
```

### Update Application
```bash
cd /var/www/postmailinglist

# Pull latest changes (if using Git)
git pull

# Install new dependencies
npm install

# Rebuild
npm run build

# Update database schema if needed
npm run db:push

# Restart service
sudo systemctl restart postmailinglist
```

### Backup Database
```bash
# Create backup
pg_dump -U postuser -h localhost postmailinglist > backup_$(date +%Y%m%d).sql

# Restore backup
psql -U postuser -h localhost postmailinglist < backup_20250114.sql
```

---

## Troubleshooting

### Application Won't Start
```bash
# Check logs
sudo journalctl -u postmailinglist -n 50

# Common issues:
# 1. Database connection - verify DATABASE_URL in .env
# 2. Port already in use - check if port 5000 is free: sudo lsof -i :5000
# 3. Permissions - ensure www-data owns the files
```

### Database Connection Issues
```bash
# Test PostgreSQL connection
psql -U postuser -h localhost postmailinglist

# If connection refused, check PostgreSQL is running:
sudo systemctl status postgresql

# Check PostgreSQL logs:
sudo tail -f /var/log/postgresql/postgresql-*.log
```

### Port Already in Use
```bash
# Find what's using port 5000
sudo lsof -i :5000

# Kill the process or change PORT in .env
```

---

## Security Recommendations

1. **Change Default Credentials**: Update LOCAL_ADMIN_PASSWORD in .env
2. **Use Strong Session Secret**: Generate with `crypto.randomBytes(32).toString('hex')`
3. **Enable HTTPS**: Use Let's Encrypt (free SSL certificates)
4. **Firewall**: Only allow necessary ports (22, 80, 443)
5. **Regular Backups**: Automate daily database backups
6. **Keep Updated**: Regularly update Node.js packages with `npm update`
7. **PostgreSQL Security**: 
   - Use strong database password
   - Configure `pg_hba.conf` to only allow local connections
   - Regular security updates: `sudo apt-get update && sudo apt-get upgrade`

---

## Application Access

Once deployed, access your application at:

- **Without Nginx**: http://your-server-ip:5000
- **With Nginx (HTTP)**: http://your-domain.com
- **With Nginx + SSL (HTTPS)**: https://your-domain.com

**Default Login Credentials**:
- Username: `emmekegg`
- Password: `Akker002025`

**Change these immediately after first login!**

---

## Quick Start Summary

```bash
# 1. Install prerequisites
sudo apt-get install nodejs postgresql

# 2. Create database
sudo -u postgres psql -c "CREATE DATABASE postmailinglist;"

# 3. Navigate to app directory
cd /var/www/postmailinglist

# 4. Create .env file with DATABASE_URL and secrets

# 5. Install and build
npm install
npm run db:push
npm run build

# 6. Start application
npm start

# Visit http://localhost:5000
```

---

## Support

For issues or questions:
1. Check application logs: `sudo journalctl -u postmailinglist -f`
2. Check PostgreSQL logs: `sudo tail -f /var/log/postgresql/*.log`
3. Verify .env configuration
4. Ensure all dependencies are installed: `npm install`
