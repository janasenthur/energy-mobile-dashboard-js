# 🚀 Complete Setup & Testing Guide
## Energy Mobile Dashboard - Step by Step

## 📋 Pre-Setup Checklist

Before we start, make sure you have:
- ✅ Windows 10 (1809+) or Windows 11
- ✅ Internet connection
- ✅ Administrator privileges (for installations)

## 🎯 **STEP 1: Run Complete Setup**

### Open Command Prompt as Administrator:
1. Press `Windows + R`
2. Type `cmd`
3. Press `Ctrl + Shift + Enter` (to run as admin)
4. Navigate to your project folder:
```bash
cd "d:\Source\AI Coding\New folder\energy-mobile-dashboard-js"
```

### Run the Complete Setup:
```bash
database\complete-setup.bat
```

**What you'll see:**
```
============================================
Energy Mobile Dashboard - Complete Setup
============================================

This script will:
  1. Install Node.js (if missing)
  2. Install PostgreSQL (if missing)
  3. Install Git (if missing)
  4. Set up the database
  5. Install app dependencies

Continue with automatic setup? (Y/N): Y

✓ Windows Package Manager found

==== PHASE 1: Installing Prerequisites ====

Checking Node.js...
Installing Node.js...
✓ Node.js installation completed

Checking PostgreSQL...
Installing PostgreSQL (this may take 5-10 minutes)...
✓ PostgreSQL installation completed

==== PHASE 2: Refreshing Environment ====
...

🎉 COMPLETE SETUP FINISHED SUCCESSFULLY!
```

## 🔍 **STEP 2: Verify Installation**

After setup completes, **close and reopen Command Prompt**, then check:

```bash
# Check Node.js
node --version
# Should show: v18.x.x or higher

# Check npm
npm --version
# Should show: 9.x.x or higher

# Check PostgreSQL
psql --version
# Should show: psql (PostgreSQL) 15.x

# Check database
psql -d energy_mobile_dashboard -c "SELECT count(*) FROM users;"
# Should show: 5
```

## 🎯 **STEP 3: Install Expo CLI & Start the App**

```bash
# Install Expo CLI globally
npm install -g @expo/cli

# Navigate to project directory (if not already there)
cd "d:\Source\AI Coding\New folder\energy-mobile-dashboard-js"

# Start the development server
expo start
```

**What you'll see:**
```
Starting Metro Bundler
─────────────────────────────────────────────────────

› Metro waiting on exp://192.168.1.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web

› Press r │ reload app
› Press m │ toggle menu
› Press o │ open project code in your editor

› Press ? │ show all commands
```

## 📱 **STEP 4: Test the App**

### Option A: Test in Web Browser
```bash
# When expo start is running, press 'w'
# Or visit: http://localhost:19006
```

### Option B: Test on Phone (Recommended)
1. **Install Expo Go app** on your phone:
   - Android: Google Play Store
   - iOS: App Store

2. **Scan QR code** from the terminal with Expo Go app

3. **App will load** on your phone

### Option C: Test in Android Emulator
```bash
# When expo start is running, press 'a'
# (Requires Android Studio and emulator setup)
```

## 🔑 **STEP 5: Test Login & Features**

When the app loads, you'll see a **Role Selection Screen**:

### Test Each Role:

#### 1. **Admin Login:**
```
Email: admin@energymobile.com
Password: admin123
```
**Features to test:**
- Dashboard with system overview
- Manage drivers, vehicles, jobs
- View reports and analytics
- System settings

#### 2. **Dispatcher Login:**
```
Email: dispatcher@energymobile.com  
Password: dispatcher123
```
**Features to test:**
- Job queue management
- Assign drivers to jobs
- Real-time tracking
- Driver availability

#### 3. **Customer Login:**
```
Email: customer@example.com
Password: customer123
```
**Features to test:**
- Create new bookings
- Track deliveries
- View job history
- AI chat assistant

#### 4. **Driver Login:**
```
Email: driver1@energymobile.com
Password: driver123
```
**Features to test:**
- View assigned jobs
- Update job status
- GPS tracking simulation
- Work hours tracking

## 🧪 **STEP 6: Test Database Features**

Open another command prompt and test database:

```bash
# Connect to database
psql -d energy_mobile_dashboard

# Test queries
SELECT role, count(*) FROM users GROUP BY role;
SELECT * FROM jobs;
SELECT * FROM vehicles;

# Exit database
\q
```

## 📊 **What You Should See:**

### App Screens:
1. **Role Selection** → Choose user type
2. **Login Screen** → Enter credentials
3. **Dashboard** → Role-specific interface
4. **Navigation** → Bottom tabs or drawer
5. **Functional Screens** → Based on user role

### Database Data:
- ✅ **5 Users** (1 admin, 1 dispatcher, 1 customer, 2 drivers)
- ✅ **3 Vehicles** (truck, van, heavy truck)  
- ✅ **1 Sample Job** with complete workflow
- ✅ **All Tables** properly created and populated

## 🛠️ **Troubleshooting Commands**

If something goes wrong:

```bash
# Restart Expo
expo start --clear

# Reinstall dependencies
npm install

# Check database connection
psql -d energy_mobile_dashboard -c "SELECT 'Database OK';"

# Run troubleshooting
database\troubleshoot-windows.bat

# Check logs
expo start --verbose
```

## 🎯 **Expected App Structure:**

```
📱 Energy Mobile Dashboard App
├── 🔐 Authentication
│   ├── Role Selection (Customer/Driver/Dispatcher/Admin)
│   ├── Login/Register
│   └── Forgot Password
├── 👤 Customer App
│   ├── Dashboard & Quick Actions
│   ├── Create Booking
│   ├── Track Jobs
│   └── AI Chat Assistant
├── 🚛 Driver App  
│   ├── Job Queue
│   ├── Active Jobs
│   ├── GPS Tracking
│   └── Work Hours
├── 📋 Dispatcher App
│   ├── Operations Dashboard
│   ├── Assign Jobs
│   ├── Driver Management
│   └── Real-time Tracking
└── ⚙️ Admin App
    ├── System Dashboard
    ├── User Management
    ├── Reports & Analytics
    └── Settings
```

## 🎉 **Success Indicators:**

✅ **Setup Complete** when you see:
- Node.js, PostgreSQL, Git installed
- Database created with sample data
- App dependencies installed
- Expo server starts successfully

✅ **App Working** when you can:
- Select different user roles
- Login with provided credentials
- Navigate between screens
- See role-specific dashboards
- Access all main features

✅ **Database Working** when:
- Login authentication works
- User data loads correctly
- Sample jobs and vehicles appear
- Database queries return expected results

---

## 🚀 **Ready to Test!**

Run this command to start:
```bash
database\complete-setup.bat
```

The script will handle everything automatically. When it's done, run `expo start` and test the app on your phone or browser!

**Your Energy Mobile Dashboard will be ready for testing in about 10-15 minutes!** 🎯
