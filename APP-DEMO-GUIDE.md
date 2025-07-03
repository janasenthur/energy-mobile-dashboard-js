# 🎯 **HOW TO RUN & TEST THE ENERGY MOBILE DASHBOARD**

## 🚀 **QUICK START (3 Commands):**

```bash
# 1. Run complete setup (this installs everything)
database\complete-setup.bat

# 2. Close command prompt, open new one, then run:
demo.bat

# 3. When Expo starts, press 'w' for web or scan QR for mobile
```

---

## 📱 **WHAT THE APP LOOKS LIKE:**

### 🔐 **1. Role Selection Screen**
When you first open the app, you'll see:

```
┌─────────────────────────────────────┐
│     ENERGY MOBILE DASHBOARD        │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │👤 CUSTOMER │  │🚛 DRIVER │          │
│  │Book Services│  │Drive & Deliver│     │
│  └─────────┘  └─────────┘          │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │📋DISPATCHER│  │⚙️ ADMIN │          │
│  │Manage Ops │  │System Mgmt│       │
│  └─────────┘  └─────────┘          │
└─────────────────────────────────────┘
```

### 🔑 **2. Login Screen** 
After selecting a role:

```
┌─────────────────────────────────────┐
│              LOGIN                  │
│                                     │
│  📧 Email: customer@example.com     │
│  🔒 Password: ●●●●●●●●               │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │           LOGIN                 │ │
│  └─────────────────────────────────┘ │
│                                     │
│  Forgot Password? | Register        │
└─────────────────────────────────────┘
```

---

## 🏠 **APP SCREENS BY ROLE:**

### 👤 **CUSTOMER APP:**

#### **Home Dashboard:**
```
┌─────────────────────────────────────┐
│  Welcome, Customer! 👋              │
│                                     │
│  🚛 QUICK BOOKING                   │
│  ┌─────────────────────────────────┐ │
│  │        BOOK TRUCK NOW           │ │
│  └─────────────────────────────────┘ │
│                                     │
│  📊 RECENT BOOKINGS                 │
│  • Delivery to Houston - Completed │
│  • Pickup from Dallas - In Transit │
│                                     │
│  🔥 POPULAR TRUCKS                  │
│  Freightliner | Western Star | Peterbilt
└─────────────────────────────────────┘
```

#### **Booking Screen:**
```
┌─────────────────────────────────────┐
│         CREATE BOOKING              │
│                                     │
│  📍 PICKUP LOCATION                 │
│  [123 Main St, Dallas, TX_______]   │
│                                     │
│  🎯 DELIVERY LOCATION               │
│  [456 Oak Ave, Houston, TX______]   │
│                                     │
│  📦 CARGO DETAILS                   │
│  Type: [Electronics_____________]   │
│  Weight: [500 lbs_______________]   │
│                                     │
│  📅 SCHEDULE                        │
│  Pickup: [Today 2:00 PM________]    │
│  Delivery: [Tomorrow 10:00 AM__]    │
│                                     │
│  ┌─────────────────────────────────┐ │
│  │         CREATE BOOKING          │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 🚛 **DRIVER APP:**

#### **Driver Dashboard:**
```
┌─────────────────────────────────────┐
│  Driver: John Smith 🚛              │
│  Status: Available ✅               │
│                                     │
│  📋 ASSIGNED JOBS (2)               │
│  ┌─────────────────────────────────┐ │
│  │ JOB #001 - Electronics          │ │
│  │ Dallas → Houston                │ │
│  │ Status: En Route                │ │
│  │ [UPDATE STATUS] [VIEW DETAILS]  │ │
│  └─────────────────────────────────┘ │
│                                     │
│  🕐 WORK SESSION                    │
│  Started: 8:00 AM                   │
│  Duration: 4h 30m                   │
│  ┌─────────────────────────────────┐ │
│  │         PUNCH OUT               │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### 📋 **DISPATCHER APP:**

#### **Operations Dashboard:**
```
┌─────────────────────────────────────┐
│      DISPATCH CONTROL CENTER       │
│                                     │
│  📊 TODAY'S METRICS                 │
│  Active Jobs: 15 | Available Drivers: 8
│  Completed: 23 | Pending: 12        │
│                                     │
│  🚛 DRIVER STATUS                   │
│  • John Smith - En Route (JOB001)  │
│  • Jane Doe - Available            │
│  • Mike Wilson - On Break          │
│                                     │
│  📋 JOB QUEUE                       │
│  ┌─────────────────────────────────┐ │
│  │ URGENT - Dallas → Houston       │ │
│  │ Electronics - Customer: ABC Co  │ │
│  │ [ASSIGN DRIVER] [VIEW DETAILS]  │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

### ⚙️ **ADMIN APP:**

#### **System Dashboard:**
```
┌─────────────────────────────────────┐
│       ADMIN CONTROL PANEL          │
│                                     │
│  📈 BUSINESS METRICS                │
│  Revenue: $45,230 | Jobs: 156       │
│  Drivers: 25 | Customers: 89        │
│                                     │
│  👥 USER MANAGEMENT                 │
│  • Pending Approvals: 3            │
│  • Active Users: 114               │
│  • Suspended: 2                    │
│                                     │
│  🚛 FLEET STATUS                    │
│  • Total Vehicles: 18              │
│  • Active: 12 | Maintenance: 3     │
│  • Available: 3                    │
│                                     │
│  ⚙️ QUICK ACTIONS                   │
│  [USER MGMT] [REPORTS] [SETTINGS]   │
└─────────────────────────────────────┘
```

---

## 🧪 **TESTING CHECKLIST:**

### ✅ **Test Authentication:**
- [ ] Role selection works
- [ ] Login with all 4 test accounts
- [ ] Logout functionality
- [ ] Password validation

### ✅ **Test Customer Features:**
- [ ] Create new booking
- [ ] View booking history
- [ ] Track active deliveries
- [ ] Chat assistant responds

### ✅ **Test Driver Features:**
- [ ] View assigned jobs
- [ ] Update job status
- [ ] Start/stop work session
- [ ] View job details

### ✅ **Test Dispatcher Features:**
- [ ] View job queue
- [ ] Assign jobs to drivers
- [ ] Monitor driver status
- [ ] Real-time dashboard updates

### ✅ **Test Admin Features:**
- [ ] System overview
- [ ] User management
- [ ] Reports generation
- [ ] Settings configuration

### ✅ **Test Shared Features:**
- [ ] Notifications system
- [ ] Profile management
- [ ] Help & support
- [ ] Settings screen

---

## 🎯 **HOW TO RUN TESTS:**

### **Step 1: Setup & Start**
```bash
# Run in Command Prompt (as Administrator)
cd "d:\Source\AI Coding\New folder\energy-mobile-dashboard-js"
database\complete-setup.bat
```

### **Step 2: Start Demo**
```bash
# After setup completes, run:
demo.bat
```

### **Step 3: Test on Device**
```bash
# When Expo starts, choose:
# - Press 'w' for web browser
# - Install Expo Go app and scan QR code
# - Press 'a' for Android emulator
```

### **Step 4: Test Features**
Use these login credentials:

| Role | Email | Password |
|------|-------|----------|
| **Customer** | customer@example.com | customer123 |
| **Driver** | driver1@energymobile.com | driver123 |
| **Dispatcher** | dispatcher@energymobile.com | dispatcher123 |
| **Admin** | admin@energymobile.com | admin123 |

---

## 📱 **EXPECTED BEHAVIOR:**

### **✅ When Working Correctly:**
- App loads without errors
- All screens render properly
- Navigation works smoothly
- Login authentication succeeds
- Database queries return data
- Sample jobs and users appear

### **❌ Common Issues:**
- **Blank screen:** Dependencies not installed
- **Login fails:** Database not set up
- **Expo won't start:** Node.js not in PATH
- **QR code won't scan:** Firewall blocking connection

---

## 🚀 **READY TO TEST!**

Your Energy Mobile Dashboard includes:
- ✅ **4 Complete User Interfaces** (Customer, Driver, Dispatcher, Admin)
- ✅ **Full Authentication System** with role-based access
- ✅ **Working Database** with sample data
- ✅ **Real-time Features** like job tracking and notifications
- ✅ **Professional UI** with modern design
- ✅ **Cross-platform** support (iOS, Android, Web)

**Run `demo.bat` to start testing now!** 🎉
