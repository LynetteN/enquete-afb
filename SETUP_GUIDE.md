# Enquete Satisfaction Survey - Complete Setup Guide

This guide will help you set up the complete Enquete Satisfaction Survey application with a Node.js backend and PostgreSQL database.

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **PostgreSQL** (v12 or higher) - [Download here](https://www.postgresql.org/download/)
- **npm** (comes with Node.js) or **yarn**
- **Git** (optional, for cloning)

## Architecture Overview

The application consists of two main parts:

1. **Frontend** (React + TypeScript + Vite)
   - User interface for surveys and responses
   - Admin dashboard for survey management
   - Runs on port 5173 (default)

2. **Backend** (Node.js + Express + PostgreSQL)
   - REST API for data management
   - JWT authentication
   - PostgreSQL database
   - Runs on port 3001 (default)

## Installation Steps

### Step 1: Clone or Navigate to Project Directory

If you have the project files, navigate to the project root:
```bash
cd "c:\Projects\enquete test"
```

### Step 2: Set Up PostgreSQL Database

1. **Install PostgreSQL** if not already installed
2. **Start PostgreSQL service**:
   - Windows: Start PostgreSQL from Services or use pgAdmin
   - Mac/Linux: Use `brew services start postgresql` or `systemctl start postgresql`

3. **Create the database**:
   ```bash
   # Using psql command line
   psql -U postgres
   CREATE DATABASE enquete_db;
   \q
   ```

   Or use pgAdmin/DBeaver to create a database named `enquete_db`

### Step 3: Set Up Backend

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Copy the example file
   copy .env.example .env

   # Edit .env file with your database credentials
   notepad .env
   ```

   Update the following values in `.env`:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=enquete_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   PORT=3001
   JWT_SECRET=change_this_to_a_secure_random_string
   ```

4. **Run database migrations**:
   ```bash
   npm run migrate
   ```

5. **Seed the database** (creates default admin account):
   ```bash
   npm run seed
   ```

6. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The backend should now be running at `http://localhost:3001`

### Step 4: Set Up Frontend

1. **Navigate to frontend directory** (from project root):
   ```bash
   cd ..
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment variables**:
   ```bash
   # Create .env file if it doesn't exist
   notepad .env
   ```

   Add the following content:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

   The frontend should now be running at `http://localhost:5173`

## Default Credentials

After completing the setup, you can log in with the default admin account:

- **Username**: `admin`
- **Password**: `afriland2026`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## Testing the Setup

### 1. Test Backend Health

Open your browser and navigate to:
```
http://localhost:3001/health
```

You should see a JSON response like:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

### 2. Test Frontend

Open your browser and navigate to:
```
http://localhost:5173
```

You should see the survey application home page.

### 3. Test Admin Login

1. Navigate to the admin section
2. Login with default credentials
3. Verify you can access the admin dashboard

## Project Structure

```
enquete test/
├── backend/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/    # API route handlers
│   │   ├── database/       # Database configuration
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── routes/         # API route definitions
│   │   ├── types/          # TypeScript types
│   │   └── server.ts       # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
│
├── src/                    # React frontend
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── services/          # Frontend services
│   ├── utils/             # Utility functions
│   └── main.tsx           # App entry point
│
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── vite.config.ts        # Vite configuration
└── .env                   # Frontend environment variables
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin` - Get all admins (authenticated)
- `POST /api/admin` - Create admin (authenticated)
- `DELETE /api/admin/:id` - Delete admin (authenticated)
- `PUT /api/admin/:id/password` - Update password (authenticated)

### Surveys
- `GET /api/surveys` - Get all surveys (authenticated)
- `GET /api/surveys/latest` - Get latest survey (authenticated)
- `GET /api/surveys/:id` - Get survey by ID (authenticated)
- `POST /api/surveys` - Create survey (authenticated)
- `PUT /api/surveys/:id` - Update survey (authenticated)
- `DELETE /api/surveys/:id` - Delete survey (authenticated)

### Responses
- `POST /api/responses` - Submit response (public)
- `GET /api/responses/check/:surveyId` - Check if user responded (public)
- `GET /api/responses` - Get all responses (authenticated)
- `GET /api/responses/survey/:surveyId` - Get survey responses (authenticated)
- `DELETE /api/responses/:id` - Delete response (authenticated)

## Development Workflow

### Running Both Servers

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd "c:\Projects\enquete test"
npm run dev
```

### Making Changes

- **Backend changes**: The server will automatically restart with `ts-node-dev`
- **Frontend changes**: Vite provides hot module replacement

### Building for Production

**Backend:**
```bash
cd backend
npm run build
npm start
```

**Frontend:**
```bash
npm run build
# The built files will be in the dist/ directory
```

## Troubleshooting

### Backend Issues

**Database Connection Failed**
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database `enquete_db` exists
- Check PostgreSQL logs for connection errors

**Port Already in Use**
```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

**Migration Errors**
```bash
# Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS enquete_db;"
psql -U postgres -c "CREATE DATABASE enquete_db;"

# Run migrations again
cd backend
npm run migrate
npm run seed
```

### Frontend Issues

**API Connection Failed**
- Verify backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env` file
- Check browser console for CORS errors

**Build Errors**
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Security Considerations

### Production Deployment

1. **Change default credentials** immediately
2. **Use strong JWT secret** in production
3. **Enable HTTPS** for production
4. **Use environment variables** for sensitive data
5. **Implement rate limiting** on API endpoints
6. **Enable CORS** only for trusted domains
7. **Regular database backups**
8. **Monitor logs** for suspicious activity

### Database Security

- Use strong database passwords
- Limit database user permissions
- Enable SSL for database connections
- Regular security updates for PostgreSQL

## Additional Resources

- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Express.js Documentation](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Vite Documentation](https://vitejs.dev/)

## Support

For issues or questions:
1. Check the troubleshooting section
2. Review server logs for error messages
3. Verify all prerequisites are installed
4. Ensure both frontend and backend are running

## License

ISC License - See LICENSE file for details