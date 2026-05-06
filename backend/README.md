# Enquete Backend API

Backend API for the Enquete Satisfaction Survey application built with Express, TypeScript, and PostgreSQL.

## Features

- RESTful API for survey management
- User authentication with JWT
- Admin management with role-based access
- Response tracking with duplicate prevention
- PostgreSQL database with proper indexing
- Comprehensive error handling

## Prerequisites

- Node.js (v18 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

## Installation

1. Clone the repository and navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enquete_db
DB_USER=postgres
DB_PASSWORD=your_password
PORT=3001
JWT_SECRET=your_secret_key
```

4. Create the PostgreSQL database:
```bash
createdb enquete_db
```

5. Run database migrations:
```bash
npm run migrate
```

6. Seed the database with default data:
```bash
npm run seed
```

## Running the Server

### Development Mode
```bash
npm run dev
```

The server will start on `http://localhost:3001` with hot-reload enabled.

### Production Mode
```bash
npm run build
npm start
```

## API Endpoints

### Authentication
- `POST /api/admin/login` - Admin login
- `GET /api/admin` - Get all admins (authenticated)
- `POST /api/admin` - Create new admin (authenticated)
- `DELETE /api/admin/:id` - Delete admin (authenticated)
- `PUT /api/admin/:id/password` - Update admin password (authenticated)
- `GET /api/admin/stats/overview` - Get system statistics (authenticated)

### Surveys
- `GET /api/surveys` - Get all surveys (authenticated)
- `GET /api/surveys/latest` - Get latest survey (authenticated)
- `GET /api/surveys/:id` - Get survey by ID (authenticated)
- `POST /api/surveys` - Create new survey (authenticated)
- `PUT /api/surveys/:id` - Update survey (authenticated)
- `DELETE /api/surveys/:id` - Delete survey (authenticated)

### Responses
- `POST /api/responses` - Submit survey response (public)
- `GET /api/responses/check/:surveyId?session_token=xxx` - Check if user has responded (public)
- `GET /api/responses` - Get all responses (authenticated)
- `GET /api/responses/survey/:surveyId` - Get responses for a survey (authenticated)
- `GET /api/responses/:id` - Get response by ID (authenticated)
- `DELETE /api/responses/:id` - Delete response (authenticated)

### Health Check
- `GET /health` - Server health check

## Default Admin Account

After running the seed script, a default admin account is created:
- Username: `admin`
- Password: `afriland2026`

**Important:** Change this password in production!

## Database Schema

### Admins Table
- `id` (string, primary key)
- `username` (string, unique)
- `password` (string, hashed)
- `name` (string)
- `created_at` (timestamp)
- `updated_at` (timestamp)

### Surveys Table
- `id` (integer, primary key, auto-increment)
- `title` (string)
- `description` (string)
- `questions` (JSON)
- `categories` (JSON)
- `version` (string)
- `last_updated` (timestamp)
- `updated_by` (string, foreign key to admins)
- `created_at` (timestamp)
- `published_at` (timestamp, nullable)

### Responses Table
- `id` (integer, primary key, auto-increment)
- `survey_id` (string)
- `session_token` (string)
- `answers` (JSON)
- `timestamp` (timestamp)
- `is_admin` (boolean)
- `synced_at` (timestamp)
- `created_at` (timestamp)

## Security Features

- Password hashing with bcrypt
- JWT authentication
- CORS enabled
- Input validation
- SQL injection prevention with parameterized queries
- Rate limiting (recommended for production)

## Error Handling

All API responses follow this format:

```json
{
  "success": true|false,
  "data": {},
  "error": "error message",
  "message": "success message"
}
```

## Development Tips

1. Use `npm run dev` for development with hot-reload
2. Check logs for database connection issues
3. Use PostgreSQL tools like pgAdmin or DBeaver for database management
4. Test API endpoints with tools like Postman or curl

## Troubleshooting

### Database Connection Issues
- Verify PostgreSQL is running
- Check credentials in `.env` file
- Ensure database exists: `createdb enquete_db`

### Port Already in Use
- Change PORT in `.env` file
- Kill process using port 3001: `npx kill-port 3001`

### Migration Errors
- Drop and recreate database: `dropdb enquete_db && createdb enquete_db`
- Run migrations again: `npm run migrate`

## License

ISC
