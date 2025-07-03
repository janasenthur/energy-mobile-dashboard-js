# 🛠️ Database Setup Scripts

## 🚀 Automatic Installation Options (NEW!)

### Option 1: Complete Auto Setup (Everything in one go!)
```bash
database\complete-setup.bat
```
**Features:**
- ✅ **Automatically installs Node.js, PostgreSQL, Git**
- ✅ **Sets up the database**
- ✅ **Installs app dependencies (npm install)**
- ✅ **One-click complete setup**
- ✅ **Progress indicators and validation**

### Option 2: Auto Install Prerequisites Only
```bash
database\auto-install.bat
```
**Features:**
- ✅ **Automatically downloads and installs:**
  - Node.js (latest LTS)
  - PostgreSQL (with default settings)
  - Git (for development)
- ✅ **No manual downloads required**
- ✅ **Uses Windows Package Manager (winget)**

### Option 3: PowerShell Auto Install (Advanced)
```powershell
.\database\auto-install.ps1
```
**Features:**
- ✅ **Enhanced PowerShell version**
- ✅ **Colored output and progress indicators**
- ✅ **Automatic PATH management**
- ✅ **Installs Expo CLI automatically**

## Manual Setup Options

### Option 4: Simple Setup (Recommended for beginners)
```bash
database\setup-simple.bat
```

### Option 5: Advanced Setup (For experienced users)
```bash
database\setup-windows.bat
```

### Option 6: PowerShell Setup (Modern Windows)
```powershell
.\database\setup-powershell.ps1
```

### Option 7: Troubleshooting
```bash
database\troubleshoot-windows.bat
```

## Requirements for Auto-Install

**Windows Package Manager (winget) Required:**
- ✅ Windows 10 (version 1809 or later)
- ✅ Windows 11 (all versions)
- ✅ Administrator privileges (for some installations)

**If winget is not available:**
- Update Windows to the latest version
- Or use manual setup options below

## Common Issues & Solutions

### ❌ "Node.js not found"
**Solution:**
1. Download Node.js from https://nodejs.org/
2. Install LTS version (18.x or higher)
3. Restart command prompt
4. Run: `node --version`

### ❌ "PostgreSQL not found" 
**Solution:**
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. During installation, remember the password for 'postgres' user
3. Add PostgreSQL bin directory to PATH:
   - Default location: `C:\Program Files\PostgreSQL\15\bin`
   - Add to System PATH in Environment Variables
4. Restart command prompt
5. Run: `psql --version`

### ❌ "Cannot connect to PostgreSQL"
**Solutions:**
1. **Start PostgreSQL service:**
   ```bash
   net start postgresql-x64-15
   ```

2. **Check if service exists:**
   - Open Windows Services
   - Look for "postgresql-x64-15" (or similar)
   - Start the service

3. **Test connection manually:**
   ```bash
   psql -U postgres -d postgres
   ```

4. **Reset postgres password:**
   ```bash
   psql -U postgres
   ALTER USER postgres PASSWORD 'newpassword';
   ```

### ❌ "Database creation failed"
**Solutions:**
1. **Check permissions:**
   ```bash
   psql -U postgres -c "CREATE DATABASE test_db;"
   ```

2. **Connect as postgres user:**
   ```bash
   psql -U postgres -d postgres
   ```

3. **Check pg_hba.conf configuration**

### ❌ "Package.json not found"
**Solution:**
- Make sure you're in the project root directory
- Look for the folder containing `package.json` and `database` folder
- Use `cd` command to navigate to correct directory

### ❌ "PATH issues"
**Solution:**
1. Open System Properties → Advanced → Environment Variables
2. Edit PATH variable (System variables)
3. Add PostgreSQL bin directory
4. Restart command prompt
5. Test with: `psql --version`

## Manual Setup (If scripts fail)

### 1. Create Database
```sql
CREATE DATABASE energy_mobile_dashboard;
```

### 2. Connect to Database  
```bash
psql -d energy_mobile_dashboard
```

### 3. Run Schema Script
```sql
\i database/energy_mobile_dashboard.sql
```

### 4. Verify Setup
```sql
SELECT count(*) FROM users;  -- Should return 5
\dt  -- List all tables
```

## Verification Commands

```bash
# Check Node.js
node --version

# Check PostgreSQL
psql --version

# Test database connection
psql -d energy_mobile_dashboard -c "SELECT count(*) FROM users;"

# List databases
psql -U postgres -l
```

## Next Steps After Successful Setup

1. **Install app dependencies:**
   ```bash
   npm install
   ```

2. **Create environment file:**
   ```env
   DATABASE_URL=postgresql://app_user:password@localhost:5432/energy_mobile_dashboard
   ```

3. **Start the app:**
   ```bash
   expo start
   ```

## Support

If you continue to have issues:
1. Run `database\troubleshoot-windows.bat` for detailed diagnostics
2. Check the logs in the database folder
3. Review `database\DEPLOYMENT.md` for detailed setup instructions
4. Check `database\README.md` for complete documentation

## Default Login Credentials

⚠️ **Change these for production!**

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@energymobile.com | admin123 |
| Dispatcher | dispatcher@energymobile.com | dispatcher123 |
| Customer | customer@example.com | customer123 |
| Driver | driver1@energymobile.com | driver123 |
