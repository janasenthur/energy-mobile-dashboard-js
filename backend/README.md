# Energy Mobile Dashboard - Backend API Setup

## Quick Start

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Setup Database**
   - Install PostgreSQL
   - Create database: `energy_mobile_dashboard`
   - Run database setup scripts from `/database` folder
   - Update `.env` file with your database credentials

3. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual configuration values
   ```

4. **Start Server**
   ```bash
   npm run dev       # Development mode with auto-reload
   npm start         # Production mode
   ```

## API Endpoints

### Base URL: `http://localhost:3000/api`

### Authentication
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh JWT token
- `POST /auth/forgot-password` - Password reset request
- `POST /auth/reset-password` - Reset password with token
- `POST /auth/change-password` - Change password (authenticated)
- `GET /auth/me` - Get current user profile

### Users
- `GET /user/profile` - Get user profile
- `PUT /user/update-profile` - Update user profile
- `GET /user/notification-settings` - Get notification settings
- `PUT /user/notification-settings` - Update notification settings
- `POST /user/push-token` - Update push notification token
- `GET /user/statistics` - Get user statistics
- `DELETE /user/account` - Delete user account
- `GET /user/all` - Get all users (admin only)

### Jobs
- `GET /jobs` - Get jobs (filtered by user role)
- `GET /jobs/:id` - Get single job details
- `POST /jobs/create` - Create new job
- `PUT /jobs/:id` - Update job
- `POST /jobs/:id/assign` - Assign job to driver
- `PUT /jobs/:id/status` - Update job status
- `DELETE /jobs/:id` - Delete job

### Drivers
- `GET /drivers` - Get all drivers (dispatcher/admin)
- `GET /drivers/available` - Get available drivers
- `GET /drivers/:id` - Get driver details
- `POST /drivers/register` - Register driver profile
- `PUT /drivers/:id` - Update driver
- `POST /drivers/location` - Update driver location
- `PUT /drivers/availability` - Update driver availability
- `GET /drivers/:id/reports` - Get driver reports
- `POST /drivers/punch` - Punch in/out for work sessions

### Tracking
- `POST /tracking/location` - Update location (drivers)
- `GET /tracking/route/:jobId` - Get route for job
- `GET /tracking/track/:trackingCode` - Public tracking
- `POST /tracking/optimize-route` - Optimize route
- `GET /tracking/driver/:driverId/history` - Driver location history
- `GET /tracking/drivers/active` - Active drivers locations

### Notifications
- `GET /notifications` - Get user notifications
- `GET /notifications/unread-count` - Get unread count
- `POST /notifications/read` - Mark notification as read
- `POST /notifications/read-all` - Mark all as read
- `POST /notifications/clicked` - Mark notification as clicked
- `DELETE /notifications/:id` - Delete notification
- `GET /notifications/settings` - Get notification settings
- `PUT /notifications/settings` - Update notification settings
- `POST /notifications/create` - Create notification (admin)
- `POST /notifications/broadcast` - Broadcast to roles (admin)
- `GET /notifications/analytics` - Notification analytics (admin)

### Reports
- `POST /reports/generate` - Generate business reports
- `GET /reports/dashboard` - Get dashboard metrics
- `GET /reports/download/:reportId` - Download report

### Health Check
- `GET /health` - Server health status

## Environment Variables

Required environment variables (copy from `.env.example`):

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=energy_mobile_dashboard
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your_secret_key
JWT_EXPIRE=7d

# Optional Services
GOOGLE_MAPS_API_KEY=your_api_key
FCM_SERVER_KEY=your_firebase_key
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=your_email
EMAIL_PASS=your_password
```

## Database Schema

The API uses PostgreSQL with the following main tables:
- `users` - User authentication and profiles
- `customers` - Customer-specific data
- `drivers` - Driver profiles and information
- `vehicles` - Vehicle information
- `jobs` - Job/booking records
- `driver_locations` - Real-time driver location tracking
- `notifications` - Push notifications and messaging
- `job_status_history` - Job status audit trail

## Development

### Running in Development Mode
```bash
npm run dev
```
Uses nodemon for automatic restart on file changes.

### Testing
```bash
npm test
```

### Database Migrations
```bash
npm run migrate
```

### Seeding Sample Data
```bash
npm run seed
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Configure production database
3. Set secure JWT secret
4. Configure external services (Firebase, Google Maps, etc.)
5. Set up reverse proxy (nginx)
6. Configure SSL certificates
7. Set up monitoring and logging

## API Response Format

All API responses follow this format:

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "details": [...] // validation errors
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_records": 100,
    "total_pages": 10,
    "has_next": true,
    "has_prev": false
  }
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication.

### Login Flow
1. POST credentials to `/auth/login`
2. Receive JWT token and refresh token
3. Include token in Authorization header: `Bearer <token>`
4. Use refresh token to get new access token when expired

### Role-Based Access Control
- `customer` - Can create jobs, view own bookings
- `driver` - Can view assigned jobs, update location/status
- `dispatcher` - Can manage jobs and drivers
- `admin` - Full system access

## Rate Limiting

API requests are rate limited:
- 100 requests per 15 minutes per IP address
- Authenticated endpoints have higher limits

## Error Codes

- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/expired token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Support

For API support or questions, contact the development team or check the main project README.
