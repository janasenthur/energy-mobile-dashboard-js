# Energy Mobile Dashboard

A comprehensive React Native mobile application for energy/trucking management system with roles for Customers, Drivers, Dispatchers, and Admins. **Pre-configured with Azure PostgreSQL cloud database for instant setup!**

## 🚀 Quick Start (Cloud-Ready!)

Your app is **pre-configured** with Azure PostgreSQL database. Get started in minutes:

```bash
# Windows Command Prompt
quick-start.bat

# PowerShell
.\quick-start.ps1

# Manual setup
npm install && npm start
```

**That's it!** Your app connects to a live Azure PostgreSQL database automatically.

### 🎯 Test Accounts (Ready to Use)
- **Admin:** admin@nbs.com / admin123
- **Driver:** driver@nbs.com / driver123  
- **Customer:** customer@nbs.com / customer123
- **Dispatcher:** dispatcher@nbs.com / dispatcher123

---

## 🌟 Features

### Customer Features
- ✅ Create and manage job requests with detailed booking forms
- ✅ Real-time GPS tracking of deliveries with live updates
- ✅ View completion status and generate invoices
- ✅ Track past jobs and related information
- ✅ Push and SMS notifications for job updates
- ✅ AI-powered chat assistant for support
- ✅ Comprehensive booking management and payment tracking

### Driver Features
- ✅ Application form for driver enrollment with document upload
- ✅ Notification alerts for new jobs and assignments
- ✅ Real-time job status updates with location tracking
- ✅ GPS tracking during routes with optimized navigation
- ✅ Punch in/out system for work hours tracking
- ✅ Access to past jobs and comprehensive reports
- ✅ Work hours and attendance tracking
- ✅ Integration with SharePoint and Petro Path (planned)
- ✅ Performance metrics and rating system

### Dispatcher Features
- ✅ Advanced job queue management with filtering and search
- ✅ Assign available drivers to jobs with real-time updates
- ✅ Track job status in real-time with location monitoring
- ✅ Driver management with availability tracking
- ✅ Live operations dashboard with comprehensive analytics
- ✅ Reporting and performance metrics

### Admin Features
- ✅ Full system access and management dashboard
- ✅ Comprehensive driver and vehicle management
- ✅ Advanced job management with full CRUD operations
- ✅ Set up banned routes and operational parameters
- ✅ Job assignment to dispatchers and drivers
- ✅ Comprehensive reporting and analytics
- ✅ System settings and configuration management
- ✅ Integration with Mudflap and Open Invoice (planned)

### Shared Features
- ✅ Advanced notifications system with filtering and management
- ✅ Comprehensive settings and preferences
- ✅ Help and support system with FAQ and contact options
- ✅ Role-based navigation and access control
- ✅ Real-time location services and tracking
- ✅ Professional UI with consistent theming

## 🛠 Tech Stack

- **Framework**: React Native with Expo SDK 50
- **Navigation**: React Navigation v6 (Stack, Tab, Drawer)
- **State Management**: React Context API with Reducers
- **UI Framework**: React Native Paper, Expo Vector Icons
- **Maps & Location**: Expo Location, React Native Maps
- **Notifications**: Expo Notifications with push/local support
- **HTTP Client**: Axios with interceptors and error handling
- **Storage**: AsyncStorage for local data persistence
- **Database**: PostgreSQL (backend integration ready)
- **Real-time**: WebSocket support for live updates
- **Development**: Expo CLI, Metro bundler
- **Authentication**: JWT tokens

## Installation

### Prerequisites
- Node.js 16+ and npm/yarn  
- PostgreSQL 13+ (for database)
- Expo CLI (`npm install -g @expo/cli`)

### 1. Clone and Setup App
```bash
git clone <repository-url>
cd energy-mobile-dashboard-js
npm install
```

### 2. Database Setup
**Windows (Automated):**
```bash
# Run the setup script
database\setup-windows.bat
```

**Linux/Mac (Automated):**
```bash
# Make script executable and run
chmod +x database/setup-unix.sh
./database/setup-unix.sh
```

**Manual Setup:**
```bash
# Create database
createdb energy_mobile_dashboard

# Run setup scripts
psql -d energy_mobile_dashboard -f database/setup-database.sql
psql -d energy_mobile_dashboard -f database/energy_mobile_dashboard.sql
psql -d energy_mobile_dashboard -f database/validate-setup.sql
```

📖 **For detailed database setup instructions, see [database/DEPLOYMENT.md](database/DEPLOYMENT.md)**

### 3. Configure Environment
```bash
cp .env.example .env
# Edit .env with your database connection and API keys
```

Example `.env`:
```env
DATABASE_URL=postgresql://app_user:password@localhost:5432/energy_mobile_dashboard
API_BASE_URL=http://localhost:3000/api
GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 4. Start Development
```bash
# Start the Expo development server
expo start

# For specific platforms
expo start --android
expo start --ios
expo start --web
```

### 5. Production Build
   ```bash
   # Start the development server
   expo start
   
   # For specific platforms
   expo start --android
   expo start --ios
   expo start --web
   ```

5. **Building for Production**
   ```bash
   # Build for Android
   expo build:android
   
   # Build for iOS
   expo build:ios
   ```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Common components (Button, Input, etc.)
│   └── specific/       # Role-specific components
├── screens/            # Screen components
│   ├── auth/          # Authentication screens
│   ├── customer/      # Customer role screens
│   ├── driver/        # Driver role screens
│   ├── dispatcher/    # Dispatcher role screens
│   ├── admin/         # Admin role screens
│   └── shared/        # Shared screens
├── navigation/         # Navigation configuration
├── context/           # React Context providers
├── services/          # API services and utilities
├── theme/            # Theme and styling
├── config/           # App configuration
└── utils/            # Utility functions
```

## 📱 Key Screens

### Authentication
- **Role Selection**: Choose user type (Customer, Driver, Dispatcher, Admin)
- **Login/Register**: Secure authentication with JWT tokens
- **Driver Registration**: Comprehensive driver onboarding with document upload
- **Forgot Password**: Password recovery system

### Customer App
- **Home**: Book truck services, view announcements, quick actions
- **Chat**: AI-powered assistant for support and queries
- **Bookings**: Track active and past bookings with detailed status
- **Booking Form**: Create new bookings with pickup/delivery details
- **Tracking**: Real-time GPS tracking with live driver location
- **Profile**: Manage account settings and payment methods

### Driver App
- **Home**: Daily overview, punch in/out, work details, announcements
- **Jobs**: View and manage assigned jobs with status updates
- **Tracking**: GPS tracking and route optimization
- **Reports**: Job completion, earnings, and performance reports
- **Profile**: Driver information, documents, and vehicle details

### Dispatcher App
- **Dashboard**: Operations overview with job statistics and metrics
- **Job Queue**: Advanced job management with filtering and assignment
- **Driver Management**: Monitor driver availability and performance
- **Reports**: Operational analytics and performance metrics

### Admin App
- **Dashboard**: System overview with business metrics and alerts
- **Jobs**: Comprehensive job management with full CRUD operations
- **Drivers**: Driver management with performance tracking
- **Reports**: Business analytics, workforce, and operational reports
- **Settings**: System configuration and management tools

### Shared Screens
- **Notifications**: Advanced notification management with filtering
- **Settings**: User preferences, privacy, and app configuration
- **Help**: FAQ, contact support, and user guides

## 🏗 Architecture

### Context Providers
- **AuthContext**: User authentication and role management
- **LocationContext**: GPS tracking and location services
- **NotificationContext**: Push and local notification management

### Services
- **API Service**: Centralized HTTP client with interceptors
- **Location Service**: GPS tracking, routing, and geocoding  
- **Notification Service**: Push notification management
- **Job Service**: Job lifecycle and status management
- **Driver Service**: Driver operations and performance tracking

### Database Architecture
- **PostgreSQL Database**: Comprehensive schema with all business entities
- **Real-time Tracking**: Driver locations and job status updates
- **User Management**: Multi-role authentication and authorization
- **Job Management**: Complete booking and delivery workflow
- **Performance Metrics**: Driver and operational analytics

**Database Features:**
- ✅ Complete schema with 12+ core tables
- ✅ Real-time GPS tracking and location history
- ✅ Job status workflow and audit trails
- ✅ User roles and permissions system
- ✅ Notification management system
- ✅ Performance metrics and reporting views
- ✅ Sample data for testing and development
- ✅ Migration scripts for future updates

📖 **Database Documentation:** [database/README.md](database/README.md)  
🚀 **Quick Setup Guide:** [database/DEPLOYMENT.md](database/DEPLOYMENT.md)

### Components
- **Common Components**: Button, Input, Card, LoadingSpinner, EmptyState
- **Confirmation Modal**: Reusable confirmation dialogs
- **Role-specific Components**: Specialized UI for different user roles

## ⚙️ Configuration

### Environment Setup
Update `src/config/config.js` with your backend configuration:

```javascript
export const API_CONFIG = {
  BASE_URL: 'https://your-backend-api.com/api',
  TIMEOUT: 30000,
  // ... other API endpoints
};

export const MAP_CONFIG = {
  GOOGLE_MAPS_API_KEY: 'your-google-maps-key',
  DEFAULT_REGION: {
    latitude: 32.7767,
    longitude: -96.7970,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  },
};
```

### Backend Integration
The app is designed to work with a PostgreSQL backend. Key API endpoints include:
- Authentication: `/auth/login`, `/auth/register`
- Jobs: `/jobs`, `/jobs/create`, `/jobs/assign`
- Drivers: `/drivers`, `/drivers/location`
- Notifications: `/notifications`
- Tracking: `/tracking/location`, `/tracking/route`

## 🔔 Push Notifications

The app supports comprehensive push notification system:
- Job assignments and status updates
- Location-based notifications
- Emergency alerts
- Payment confirmations
- System announcements

### Notification Types
- **Job Notifications**: New assignments, status changes
- **Payment Notifications**: Payment confirmations and invoices
- **Emergency Notifications**: Urgent alerts and safety notifications
- **System Notifications**: Maintenance, updates, and announcements
- **Dashboard**: Overview of operations
- **Job Queue**: Manage incoming job requests
- **Driver Management**: Assign and monitor drivers
- **Reports**: Operational analytics

### Admin App
- **Dashboard**: System overview and metrics
- **Job Management**: Full job lifecycle management
- **Driver Management**: Driver onboarding and monitoring
- **Reports**: Comprehensive business intelligence
- **Settings**: System configuration

## Database Schema

The app connects to a PostgreSQL database with the following main tables:
- `users` - User accounts for all roles
- `jobs` - Job/booking information
- `vehicles` - Truck and vehicle data
- `drivers` - Driver-specific information
- `tracking` - GPS location data
- `notifications` - Push notification logs
- `reports` - Generated reports

## API Integration

### Third-party Integrations
- **Google Maps**: Route optimization and tracking
- **SharePoint**: Customer information management
- **Petro Path**: Reward points tracking
- **Mudflap**: Fuel expense tracking
- **Open Invoice**: Invoice generation

### Backend Endpoints
- Authentication: `/api/auth/*`
- User management: `/api/users/*`
- Job management: `/api/jobs/*`
- Tracking: `/api/tracking/*`
- Reports: `/api/reports/*`
- Notifications: `/api/notifications/*`

## Development

### Prerequisites for Development
- React Native development environment
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- PostgreSQL database
- Backend API server

### Environment Variables
Create a `.env` file:
```
API_BASE_URL=https://your-api-server.com
GOOGLE_MAPS_API_KEY=your-google-maps-key
FIREBASE_SERVER_KEY=your-firebase-key
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Mobile App Stores
1. **Android (Google Play Store)**
   - Build APK/AAB with `expo build:android`
   - Upload to Google Play Console
   - Follow Play Store guidelines

2. **iOS (Apple App Store)**
   - Build IPA with `expo build:ios`
   - Upload to App Store Connect
   - Follow App Store review guidelines

### Backend Deployment
- Deploy backend API to cloud platforms (AWS, Azure, GCP)
- Set up PostgreSQL database
- Configure environment variables
- Set up CI/CD pipelines

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions:
- Email: support@energydashboard.com
- Documentation: [Link to docs]
- GitHub Issues: [Link to issues]