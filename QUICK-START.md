# Quick Start Guide - Energy Mobile Dashboard

## 🚀 Ready to Go with Azure PostgreSQL!

Your Energy Mobile Dashboard is pre-configured to work with your **Azure PostgreSQL database**. Follow these simple steps to get started:

### Option 1: Automated Setup (Recommended)

**For Windows Command Prompt:**
```bash
quick-start.bat
```

**For PowerShell:**
```powershell
.\quick-start.ps1
```

### Option 2: Manual Setup

1. **Copy environment file:**
   ```bash
   copy .env.example .env
   ```

2. **Setup database schema:**
   - Open your preferred PostgreSQL client (pgAdmin, DBeaver, Azure Data Studio)
   - Connect to your Azure PostgreSQL database:
     - **Host:** `nbsenergydevdb.postgres.database.azure.com`
     - **Port:** `5432`
     - **Database:** `nbsenergydev_db`
     - **Username:** `nbsadmin`
     - **Password:** `Nb$ad2567!`
     - **SSL:** Required
   - Run the SQL script: `database\energy_mobile_dashboard.sql`

3. **Install app dependencies:**
   ```bash
   npm install
   ```

4. **Start the app:**
   ```bash
   npm start
   ```

### 📱 Running the App

Once the app starts:
- **Mobile:** Scan the QR code with Expo Go app
- **Web:** Press `w` to open in browser
- **Android Emulator:** Press `a`
- **iOS Simulator:** Press `i`

### 🔐 Test Accounts

Use these accounts to test different user roles:

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@nbs.com | admin123 |
| Driver | driver@nbs.com | driver123 |
| Customer | customer@nbs.com | customer123 |
| Dispatcher | dispatcher@nbs.com | dispatcher123 |

### 🔧 Troubleshooting

**Database Connection Issues:**
- Ensure your IP is whitelisted in Azure PostgreSQL firewall rules
- Check if SSL connection is enabled
- Verify credentials in `.env` file

**App Not Starting:**
- Make sure Node.js and npm are installed
- Try deleting `node_modules` and running `npm install` again
- Check if port 19000/19001 are available

**Need Help?**
- Check `TESTING-GUIDE.md` for detailed testing instructions
- See `APP-DEMO-GUIDE.md` for app demonstration
- Review `database\SETUP-HELP.md` for database setup help

### 🎯 What You'll See

**Admin Dashboard:**
- User management
- System analytics
- Order monitoring
- Driver tracking

**Driver App:**
- Route optimization
- Delivery tracking
- Order management
- Real-time updates

**Customer App:**
- Order placement
- Delivery tracking
- Account management
- Order history

**Dispatcher Console:**
- Route planning
- Driver assignment
- Real-time monitoring
- Emergency handling

---

**Ready to start?** Run `quick-start.bat` or `quick-start.ps1` now! 🚀
