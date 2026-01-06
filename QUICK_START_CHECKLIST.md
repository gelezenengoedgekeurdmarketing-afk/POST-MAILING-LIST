# POST MAILINGLIST MAKER - Quick Deployment Checklist

## Pre-Deployment Checklist

- [ ] **Node.js 20.x** installed (`node --version`)
- [ ] **PostgreSQL** installed and running (`sudo systemctl status postgresql`)
- [ ] Server has at least **2GB RAM** and **500MB disk space**
- [ ] SSH access to server (if remote deployment)

---

## Step-by-Step Checklist

### Database Setup
- [ ] Create PostgreSQL database: `postmailinglist`
- [ ] Create PostgreSQL user: `postuser` with password
- [ ] Grant all privileges to user
- [ ] Note connection string: `postgresql://postuser:password@localhost:5432/postmailinglist`

### Application Setup
- [ ] Create directory: `/var/www/postmailinglist`
- [ ] Copy all application files to directory
- [ ] **IMPORTANT**: Modify `vite.config.ts` to remove Replit-specific plugins (see DEPLOYMENT.md section 3a)
- [ ] Create `.env` file with:
  - [ ] `DATABASE_URL=postgresql://...`
  - [ ] `SESSION_SECRET=` (generate 64-char random string)
  - [ ] `LOCAL_ADMIN_USERNAME=emmekegg`
  - [ ] `LOCAL_ADMIN_PASSWORD=Akker002025`
  - [ ] `PORT=5000`
  - [ ] `NODE_ENV=production`

### Build & Deploy
- [ ] Run `npm install` (installs all dependencies)
- [ ] Run `npm run db:push` (creates database tables)
- [ ] Run `npm run build` (builds production assets)
- [ ] Run `npm start` (test if app starts)
- [ ] Visit `http://localhost:5000` and login

### Production Setup (Optional)
- [ ] Create systemd service file: `/etc/systemd/system/postmailinglist.service`
- [ ] Enable service: `sudo systemctl enable postmailinglist`
- [ ] Start service: `sudo systemctl start postmailinglist`
- [ ] Install Nginx (reverse proxy)
- [ ] Configure Nginx site
- [ ] Install SSL certificate (Let's Encrypt)
- [ ] Configure firewall (UFW)

---

## Essential Files to Copy

```
/var/www/postmailinglist/
├── client/                 # Frontend React code
├── server/                 # Backend Express code
├── shared/                 # Shared TypeScript schemas
├── package.json           # Dependencies
├── package-lock.json      # Dependency lock file
├── tsconfig.json          # TypeScript config
├── vite.config.ts         # Vite build config
├── tailwind.config.ts     # Tailwind CSS config
├── drizzle.config.ts      # Database migration config
├── .env                   # Environment variables (CREATE THIS)
└── All other config files
```

---

## Required Environment Variables

```env
DATABASE_URL=postgresql://postuser:password@localhost:5432/postmailinglist
SESSION_SECRET=<64-character-random-string>
LOCAL_ADMIN_USERNAME=emmekegg
LOCAL_ADMIN_PASSWORD=Akker002025
PORT=5000
NODE_ENV=production
```

Generate session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Testing Checklist

After deployment, verify:
- [ ] App starts without errors
- [ ] Can login with emmekegg / Akker002025
- [ ] Dashboard loads and shows empty table
- [ ] Can create a business manually
- [ ] Can import Excel/CSV file
- [ ] Can export to Excel
- [ ] Can export to Word (.docx)
- [ ] Can search and filter businesses
- [ ] Inline comment editing works
- [ ] Table sorting works

---

## Quick Commands Reference

```bash
# Start application
npm start

# View logs (if using systemd)
sudo journalctl -u postmailinglist -f

# Restart application
sudo systemctl restart postmailinglist

# Check status
sudo systemctl status postmailinglist

# Backup database
pg_dump -U postuser postmailinglist > backup_$(date +%Y%m%d).sql

# Restore database
psql -U postuser postmailinglist < backup_20250114.sql

# Update application
cd /var/www/postmailinglist
git pull
npm install
npm run build
npm run db:push
sudo systemctl restart postmailinglist
```

---

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| "Port 5000 already in use" | Kill process: `sudo lsof -i :5000` or change PORT in .env |
| "Database connection failed" | Check PostgreSQL running: `sudo systemctl status postgresql` |
| "Permission denied" | Fix ownership: `sudo chown -R www-data:www-data /var/www/postmailinglist` |
| "Module not found" | Reinstall: `npm install` |
| "Build failed" | Check Node.js version: `node --version` (need 18+) |
| Can't login | Verify admin user created, check logs for errors |

---

## Security Checklist

- [ ] Change `LOCAL_ADMIN_PASSWORD` from default
- [ ] Use strong `SESSION_SECRET` (64+ characters)
- [ ] Use strong PostgreSQL password
- [ ] Enable firewall (only ports 22, 80, 443)
- [ ] Set up HTTPS with SSL certificate
- [ ] Regular backups configured
- [ ] PostgreSQL only accepts local connections
- [ ] Keep system updated: `sudo apt-get update && sudo apt-get upgrade`

---

## Default Access

- **URL**: http://localhost:5000 (or your domain)
- **Username**: emmekegg
- **Password**: Akker002025

**⚠️ Change password immediately after first login!**

---

## Need More Details?

See `DEPLOYMENT.md` for comprehensive step-by-step instructions.
