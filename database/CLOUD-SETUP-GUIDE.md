# 🌥️ Cloud PostgreSQL Setup Guide
## Energy Mobile Dashboard

## 📋 **What Changed:**
Instead of installing PostgreSQL locally, your app now connects to a **cloud PostgreSQL database**. This is better for:
- ✅ **No local installation** - saves space and setup time
- ✅ **Production-ready** - same database for development and production
- ✅ **Always accessible** - from any device/location
- ✅ **Automatic backups** - most providers include this
- ✅ **Better performance** - optimized cloud infrastructure

---

## 🎯 **Quick Setup (3 Steps):**

### **Step 1: Get a Cloud Database**
Choose a **free cloud PostgreSQL provider**:

#### 🔥 **Recommended: Supabase (Best for beginners)**
1. Go to [supabase.com](https://supabase.com/)
2. Sign up and create a new project
3. Go to Settings → Database
4. Copy the connection string

#### 🚀 **Alternative: Neon (Fast & simple)**
1. Go to [neon.tech](https://neon.tech/)
2. Sign up and create a database
3. Copy the connection string

#### 🐘 **Alternative: ElephantSQL (Reliable)**
1. Go to [elephantsql.com](https://www.elephantsql.com/)
2. Create a free "Tiny Turtle" plan
3. Copy the connection URL

### **Step 2: Configure Connection**
```bash
# Copy the example file
copy .env.example .env

# Edit .env file and add your database URL:
DATABASE_URL=postgresql://username:password@hostname:port/database_name
```

### **Step 3: Run Cloud Setup**
```bash
# Run the cloud setup script
database\setup-cloud.bat
```

---

## 🔧 **Detailed Setup Instructions:**

### **🌟 Option 1: Supabase (Recommended)**

1. **Create Account:** Go to [supabase.com](https://supabase.com/) and sign up
2. **Create Project:** Click "New Project"
   - Name: `energy-mobile-dashboard`
   - Password: Choose a strong password
   - Region: Select closest to you
3. **Get Connection String:**
   - Go to Settings → Database
   - Find "Connection string" section
   - Copy the URI format string
   - Replace `[YOUR-PASSWORD]` with your actual password

**Example Supabase connection:**
```
DATABASE_URL=postgresql://postgres:your_password@db.abcdefghijk.supabase.co:5432/postgres
```

### **🚀 Option 2: Neon**

1. **Create Account:** Go to [neon.tech](https://neon.tech/) and sign up
2. **Create Database:** Click "Create Database"
   - Name: `energy-mobile-dashboard`
   - Region: Select closest to you
3. **Get Connection String:**
   - Copy the connection string from the dashboard
   - It includes SSL by default

**Example Neon connection:**
```
DATABASE_URL=postgresql://username:password@ep-cool-darkness-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
```

### **🐘 Option 3: ElephantSQL**

1. **Create Account:** Go to [elephantsql.com](https://www.elephantsql.com/) and sign up
2. **Create Instance:** Click "Create New Instance"
   - Name: `energy-mobile-dashboard`
   - Plan: "Tiny Turtle" (Free)
   - Region: Select closest to you
3. **Get Connection URL:**
   - Click on your instance
   - Copy the URL from the details page

**Example ElephantSQL connection:**
```
DATABASE_URL=postgresql://username:password@mouse.db.elephantsql.com:5432/database_name
```

---

## 📝 **Setup File Configuration:**

### **Edit .env file:**
```env
# =====================================================
# CLOUD POSTGRESQL CONNECTION
# =====================================================
DATABASE_URL=postgresql://your_username:your_password@your_host:5432/your_database

# =====================================================
# APP CONFIGURATION (Optional)
# =====================================================
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

---

## 🚀 **Run the Setup:**

### **Option 1: Batch Script**
```bash
database\setup-cloud.bat
```

### **Option 2: PowerShell Script**
```powershell
.\database\setup-cloud.ps1
```

### **What the script does:**
1. ✅ Installs Node.js (if missing)
2. ✅ Installs PostgreSQL client tools (psql)
3. ✅ Tests connection to your cloud database
4. ✅ Creates all tables and sample data
5. ✅ Installs app dependencies
6. ✅ Validates everything works

---

## 🔍 **Verification:**

After setup completes, test your connection:

```bash
# Test database connection
psql "your_database_url_here" -c "SELECT count(*) FROM users;"
# Should return: 5

# Start the app
expo start
```

---

## 🆓 **Free Tier Limits:**

| Provider | Storage | Connections | Backup |
|----------|---------|-------------|---------|
| **Supabase** | 500MB | 60 concurrent | 7 days |
| **Neon** | 512MB | 100 concurrent | Point-in-time |
| **ElephantSQL** | 20MB | 5 concurrent | None |
| **Aiven** | 1 month free | 50 concurrent | 2 days |

---

## 🔧 **Troubleshooting:**

### **❌ "Cannot connect to database"**
- Check if DATABASE_URL is correct in .env
- Verify username/password
- Make sure database allows connections from your IP
- Add `?sslmode=require` if using SSL

### **❌ "Database not found"**
- Make sure the database name in URL is correct
- Some providers use different default database names

### **❌ "SSL connection required"**
- Add `?sslmode=require` to your connection string
- Example: `postgresql://user:pass@host:5432/db?sslmode=require`

### **❌ "Permission denied"**
- Check username and password are correct
- Make sure user has create table permissions

---

## 🎉 **Benefits of Cloud Setup:**

- ✅ **Faster setup** - no local PostgreSQL installation
- ✅ **Production ready** - same database for dev and prod
- ✅ **Always accessible** - works from anywhere
- ✅ **Automatic backups** - data is safe
- ✅ **Better performance** - optimized infrastructure
- ✅ **Easy scaling** - upgrade when needed

---

## 📱 **Ready to Test!**

Once setup is complete:
1. Run `expo start`
2. Test login with provided credentials
3. Your app now uses cloud database! 🌥️

**Your Energy Mobile Dashboard is now cloud-powered!** 🚀
