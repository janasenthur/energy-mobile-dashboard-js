# 🐛 Debugging Guide - Energy Mobile Dashboard

## 🎯 Quick Start Debug Process

### Step 1: Check Your Environment
```bash
# Run this to check what's installed
where node
where npm
where psql
node --version
npm --version
```

### Step 2: Database Connection Test
```bash
# Test Azure PostgreSQL connection
psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -c "\dt"
```
**Expected:** Should list all tables (users, jobs, drivers, etc.)

### Step 3: Run Setup
```bash
# Option 1: Quick automated setup
quick-start.bat

# Option 2: Manual step-by-step
npm install
copy .env.example .env
npm start
```

---

## 🔍 Common Issues & Solutions

### ❌ Issue: "Node.js not found"
**Solution:**
1. Install Node.js from https://nodejs.org/
2. Restart command prompt
3. Run: `node --version`

### ❌ Issue: "psql command not found"
**Solution:**
- **For Azure setup:** This is OK! Use Azure Data Studio instead
- **For local setup:** Install PostgreSQL client tools

### ❌ Issue: "npm install fails"
**Solutions:**
```bash
# Clear npm cache
npm cache clean --force

# Delete and reinstall
rmdir /s node_modules
npm install

# Use different registry
npm install --registry https://registry.npmjs.org/
```

### ❌ Issue: "Database connection failed"
**Solutions:**
1. Check firewall: Add your IP to Azure PostgreSQL firewall
2. Check credentials in `.env` file
3. Verify SSL is enabled
4. Test connection:
   ```bash
   ping nbsenergydevdb.postgres.database.azure.com
   ```

### ❌ Issue: "Could not connect to the server" (Expo Connection Error)
**Error:** `exp://127.0.0.1:8081` - Unknown error: Could not connect to the server

**Solutions:**
```bash
# 1. Clear Expo cache and restart
npx expo start --clear

# 2. Use tunnel mode (bypasses network issues)
npx expo start --tunnel

# 3. Use LAN mode (most reliable for local network)
npx expo start --lan

# 4. Restart with specific host
npx expo start --host localhost

# 5. Nuclear option - clear everything
npm cache clean --force
npx expo install --fix
npx expo start --clear --tunnel
```

**Root Causes:**
- Metro bundler not started properly
- Network configuration issues
- Firewall blocking port 8081
- Expo CLI cache corruption
- Windows network adapter conflicts

**Quick Fix:**
1. Stop any running Metro processes (Ctrl+C in terminal)
2. Run: `npx expo start --tunnel`
3. Scan the new QR code with Expo Go app

### ❌ Issue: "Expo/Metro bundler errors"
**Solutions:**
```bash
# Clear Metro cache
npx expo start --clear

# Reset Expo cache
npx expo install --fix

# Clear all caches
npm start -- --reset-cache
```

---

## 🛠️ Debug Commands

### Check Project Status
```bash
# Check if package.json exists
dir package.json

# Check if .env exists
dir .env

# Check if node_modules exists
dir node_modules

# Check project structure
tree /f /a
```

### Test Database Connection
```bash
# Test with psql (if installed)
set PGPASSWORD=Nb$ad2567!
psql -h nbsenergydevdb.postgres.database.azure.com -p 5432 -U nbsadmin -d nbsenergydev_db -c "SELECT version();"

# Alternative: Use Docker
docker run --rm postgres:15 psql "postgresql://nbsadmin:Nb$ad2567!@nbsenergydevdb.postgres.database.azure.com:5432/nbsenergydev_db" -c "\dt"
```

### Check Network Connectivity
```bash
# Test DNS resolution
nslookup nbsenergydevdb.postgres.database.azure.com

# Test port connectivity
telnet nbsenergydevdb.postgres.database.azure.com 5432

# Alternative test
powershell "Test-NetConnection -ComputerName nbsenergydevdb.postgres.database.azure.com -Port 5432"
```

---

## 📱 App Debugging

### Start App with Debug Info
```bash
# Start with verbose logging
npm start -- --verbose

# Start and open in browser immediately
npm start -- --web

# Start with specific platform
npm start -- --android
npm start -- --ios
```

### Check App Logs
- **Metro Bundler:** Shows in terminal where you ran `npm start`
- **Browser Console:** F12 → Console tab
- **Mobile:** Use Expo Go app → Shake device → View logs

### Test API Connections
```javascript
// Add this to your app for testing
console.log('Environment:', process.env.NODE_ENV);
console.log('Database URL:', process.env.DATABASE_URL ? 'Configured' : 'Missing');
```

---

## 🔧 Troubleshooting Tools

### VS Code Extensions (Recommended)
- **ES7+ React/Redux/React-Native snippets**
- **Prettier - Code formatter**
- **React Native Tools**
- **Expo Tools**

### Browser DevTools
1. **F12** → Console (for errors)
2. **Network** tab (for API calls)
3. **Application** tab (for local storage)

### Database Tools
- **Azure Data Studio** (recommended for Azure)
- **pgAdmin** (universal PostgreSQL client)
- **DBeaver** (free universal database tool)

---

## 🚨 Emergency Reset

If everything breaks, run this:
```bash
# Nuclear option - reset everything
rmdir /s node_modules
del package-lock.json
del .env
copy .env.example .env
npm cache clean --force
npm install
npm start -- --clear
```

---

## 📞 Getting Help

### Check These First:
1. **QUICK-START.md** - Setup instructions
2. **TESTING-GUIDE.md** - Testing procedures  
3. **APP-DEMO-GUIDE.md** - How to use the app

### Log Files to Check:
- Metro Bundler output in terminal
- Browser console (F12)
- Expo Go app logs
- Command prompt error messages

### When Asking for Help, Include:
1. What command you ran
2. Full error message
3. Your OS version
4. Node.js version (`node --version`)
5. What step failed

---

## 🎯 Next Steps After Setup

1. **✅ Database is working** → Test login with: `admin@nbs.com / admin123`
2. **✅ App is running** → Scan QR code with Expo Go app
3. **✅ Mobile app loads** → Test creating a job/booking
4. **✅ Features work** → Read TESTING-GUIDE.md for full testing

**You're ready to develop! 🚀**
