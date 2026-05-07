# Afriland First Bank - Employee Engagement Survey

A modern, responsive employee engagement survey application built with React, TypeScript, and Node.js. Features real-time analytics, anonymous data collection, and comprehensive reporting capabilities.

## 🚀 Features

- **Anonymous Survey System**: Secure, anonymous employee feedback collection
- **Real-time Analytics**: Live dashboard with engagement metrics and trends
- **Multi-format Exports**: CSV, Power BI, and comprehensive markdown reports
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Authentication**: Secure admin access for data management
- **Offline Support**: Graceful degradation when network is unavailable
- **TypeScript**: Full type safety for better development experience
- **RESTful API**: Complete backend with PostgreSQL database

## 🛠️ Tech Stack

### Frontend
- **React 18**: Modern UI framework
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **Tailwind CSS**: Utility-first styling
- **Framer Motion**: Smooth animations
- **Lucide React**: Beautiful icons
- **React Router DOM**: Client-side routing

### Backend
- **Node.js**: Runtime environment
- **Express**: Web framework
- **TypeScript**: Type-safe API development
- **PostgreSQL**: Relational database
- **JWT**: Authentication
- **Bcrypt**: Password hashing

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 12+
- npm or yarn
- Git (optional)

## 🏗️ Local Development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd "enquete test"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ..
npm install
```

### Database Setup

1. **Install PostgreSQL** if not already installed
2. **Start PostgreSQL service**
3. **Create the database**:
   ```bash
   # Using psql command line
   psql -U postgres
   CREATE DATABASE enquete_db;
   \q
   ```

### Backend Configuration

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Configure environment variables**:
   ```bash
   # Create .env file
   copy .env.example .env
   ```

   Update `.env` with your database credentials:
   ```env
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=enquete_db
   DB_USER=postgres
   DB_PASSWORD=your_actual_password
   PORT=3001
   JWT_SECRET=change_this_to_a_secure_random_string
   ```

3. **Run database migrations**:
   ```bash
   npm run migrate
   ```

4. **Seed the database** (creates default admin account):
   ```bash
   npm run seed
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

   The backend will run at `http://localhost:3001`

### Frontend Configuration

1. **Navigate to project root**:
   ```bash
   cd ..
   ```

2. **Configure environment variables**:
   Create `.env` file with:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

3. **Start the frontend development server**:
   ```bash
   npm run dev
   ```

   The frontend will run at `http://localhost:5173`

## 🔐 Default Credentials

After completing the setup, you can log in with the default admin account:

- **Username**: `admin`
- **Password**: `afriland2026`

⚠️ **IMPORTANT**: Change this password immediately after first login!

## 📁 Project Structure

```
enquete test/
├── backend/                 # Node.js backend API
│   ├── src/
│   │   ├── controllers/    # API route handlers
│   │   ├── database/       # Database configuration & migrations
│   │   ├── middleware/     # Authentication & error handling
│   │   ├── routes/         # API route definitions
│   │   ├── types/          # TypeScript type definitions
│   │   └── server.ts       # Express server setup
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
├── src/                    # React frontend
│   ├── components/         # Reusable UI components
│   ├── pages/             # Page components
│   ├── utils/             # Utility functions & API client
│   ├── hooks/             # Custom React hooks
│   └── main.tsx           # App entry point
├── public/                # Static assets
├── package.json           # Frontend dependencies
├── vite.config.ts        # Vite configuration
├── netlify.toml          # Netlify deployment config
└── README.md             # This file
```

## 🔌 API Endpoints

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

### Health Check
- `GET /health` - Server health check

## 🌐 Deployment

### Build for Production

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

### Netlify Deployment

The application includes Netlify configuration for easy deployment:

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Build the application
npm run build

# Deploy to Netlify
netlify deploy --prod
```

Configure these environment variables in Netlify:
- `VITE_API_URL` - Your backend API URL
- `VITE_APP_MODE` - Set to `production`

## 📊 Analytics & Reporting

### Available Reports

1. **CSV Export**: Raw data for spreadsheet analysis
2. **Power BI Export**: Structured JSON for Power BI integration
3. **Comprehensive Report**: Full markdown report with:
   - Executive summary
   - Methodology
   - Global results
   - Category analysis
   - Verbatim analysis
   - Predictive trends
   - Strategic recommendations
   - Action plans

### Key Metrics

- **Engagement Index**: Overall employee engagement score
- **Participation Rate**: Response completion percentage
- **Category Scores**: Performance by survey category
- **Trend Analysis**: Temporal data patterns

## 🎨 Design System

- **Colors**: 
  - Primary: `#E2001A` (Afriland Red)
  - Secondary: `#FFD700` (Gold)
  - Accent: `#0055A4` (Blue)
- **Typography**: Modern, clean sans-serif fonts
- **Components**: Consistent, reusable UI elements
- **Animations**: Smooth transitions with Framer Motion

## 🔒 Security Features

- **Anonymous Data Collection**: No personal identifiers stored
- **Session-based Authentication**: Secure admin access
- **Password Hashing**: Bcrypt for secure password storage
- **JWT Authentication**: Token-based API authentication
- **SQL Injection Prevention**: Parameterized queries
- **CORS Protection**: Configured for trusted domains
- **Input Validation**: Type-safe with TypeScript

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules dist backend/node_modules backend/dist
npm install
cd backend && npm install && cd ..
npm run build
```

### Database Connection Issues

- Verify PostgreSQL is running
- Check credentials in `backend/.env` file
- Ensure database `enquete_db` exists
- Check PostgreSQL logs for connection errors

### Port Already in Use

```bash
# Find process using port 3001
netstat -ano | findstr :3001

# Kill the process (replace PID with actual process ID)
taskkill /PID <PID> /F
```

### API Connection Issues

- Verify backend is running on port 3001
- Check `VITE_API_URL` in frontend `.env` file
- Check browser console for CORS errors
- Test backend health: `http://localhost:3001/health`

## 📝 Development Workflow

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

## 🧪 Testing

### Manual Testing Checklist

- [ ] Admin login functionality
- [ ] Survey creation and management
- [ ] Response submission
- [ ] Duplicate response prevention
- [ ] Analytics dashboard
- [ ] Export functionality
- [ ] Responsive design on mobile
- [ ] Offline mode behavior

## 📈 Performance Optimization

- **Response Caching**: API response caching for improved performance
- **Code Splitting**: Optimized bundle sizes with Vite
- **Lazy Loading**: Components loaded on demand
- **Database Indexing**: Optimized query performance
- **Asset Optimization**: Minified and compressed static assets

## 🔄 Version History

- **v2.0.0**: Complete rewrite with React + TypeScript + Node.js backend
- **v1.0.0**: Initial release

## 👥 Support

For technical support, contact:
- **IT Department**: Cisco 01411
- **HR Department**: Contact via internal channels

## 📝 License

Proprietary - Afriland First Bank Internal Use

---

**Built with ❤️ for Afriland First Bank Employees**