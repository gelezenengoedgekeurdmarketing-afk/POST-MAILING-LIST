# Self-Hosting Kit for POST MAILINGLIST MAKER

This folder contains modified files needed for running the application on your own server.

## Quick Setup Instructions

### Step 1: Copy the Application
Copy the **entire project** to your server, then:

```bash
# Navigate to your project directory
cd /path/to/postmailinglist

# Replace vite.config.ts with the self-hosting version
cp self-hosting/vite.config.ts ./vite.config.ts
```

### Step 2: Remove Replit-Specific Dependencies
```bash
npm uninstall @replit/vite-plugin-runtime-error-modal @replit/vite-plugin-cartographer @replit/vite-plugin-dev-banner
```

### Step 3: Create Environment File
Create a `.env` file in the project root:

```env
DATABASE_URL=postgresql://username:password@localhost:5432/postmailinglist
SESSION_SECRET=your-64-character-random-secret-here
LOCAL_ADMIN_USERNAME=emmekegg
LOCAL_ADMIN_PASSWORD=Akker002025
PORT=5000
NODE_ENV=production
```

Generate a secure session secret:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 4: Set Up PostgreSQL Database
```sql
CREATE DATABASE postmailinglist;
CREATE USER postuser WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE postmailinglist TO postuser;
\c postmailinglist
GRANT ALL ON SCHEMA public TO postuser;
```

### Step 5: Install, Build, and Run
```bash
# Install dependencies
npm install

# Push database schema
npm run db:push

# Build for production
npm run build

# Start the application
npm start
```

### Step 6: Access Your Application
Open http://localhost:5000 in your browser.

**Default login**: emmekegg / Akker002025

---

## Files in This Folder

| File | Purpose |
|------|---------|
| `vite.config.ts` | Clean Vite config without Replit-specific plugins |
| `README.md` | This file |

## For Full Instructions
See `DEPLOYMENT.md` in the project root for detailed server setup including:
- Nginx reverse proxy configuration
- SSL/HTTPS with Let's Encrypt  
- Systemd service for auto-start
- Firewall configuration
- Backup procedures
