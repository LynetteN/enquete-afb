# Railway PostgreSQL Setup Guide

## 🚀 Quick Setup (5 minutes)

### 1. Add Railway PostgreSQL Plugin

1. Go to your [Railway Dashboard](https://railway.app/)
2. Select your project: `enquete-afb-production`
3. Click **"+ New"** → **Database** → **PostgreSQL**
4. Railway will create a cloud PostgreSQL instance automatically

### 2. Link Database to Backend Service

1. In your Railway project, click on your backend service
2. Go to **Variables** tab
3. Click **"Add Variable Reference"**
4. Select `DATABASE_URL` from the PostgreSQL service
5. This automatically links the database to your backend

### 3. Run Database Migration

Open Railway Shell on your backend service:

```bash
# In Railway dashboard → your backend service → "Shell" tab
npm run migrate
```

This will create all required tables:
- ✅ `admins` - Admin user accounts
- ✅ `surveys` - Survey definitions
- ✅ `responses` - Survey responses
- ✅ Indexes for performance
- ✅ Triggers for timestamps

### 4. Seed Initial Admin User

```bash
# In Railway Shell
npm run seed
```

This creates a default admin account:
- **Username:** `admin`
- **Password:** `admin123`
- **⚠️ Change this password immediately after first login!**

## 🔧 Configuration Details

### Database Config (Already Set Up)

Your `backend/src/database/config.ts` is already configured:

```typescript
const poolConfig: PoolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }, // Required for Railway
    }
  : {
      // Local development fallback
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      database: process.env.DB_NAME || 'enquete_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'password',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
```

### Environment Variables

**Railway (Automatic):**
- `DATABASE_URL` - Provided by Railway PostgreSQL plugin

**Local Development (.env):**
```bash
DB_HOST=localhost
DB_PORT=5432
DB_NAME=enquete_db
DB_USER=postgres
DB_PASSWORD=your_password
```

## 🧪 Testing the Setup

### 1. Test Database Connection

```bash
# In Railway Shell
npm run dev
```

Check logs for: `✅ Database connected successfully`

### 2. Test API Endpoints

```bash
# Health check
curl https://enquete-afb-production.up.railway.app/health

# Should return:
{
  "status": "healthy",
  "timestamp": "2026-05-08T...",
  "uptime": 123.456
}
```

### 3. Test Admin Login

Use your frontend or test with curl:

```bash
curl -X POST https://enquete-afb-production.up.railway.app/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'
```

## 🔐 Security Notes

### ⚠️ Important Security Steps:

1. **Change Default Password:**
   - Login with `admin` / `admin123`
   - Go to Admin Management
   - Change password immediately

2. **Update JWT Secret:**
   - In Railway Variables, set `JWT_SECRET` to a strong random string
   - Example: `openssl rand -base64 32`

3. **Enable SSL (Already Configured):**
   - Railway PostgreSQL uses SSL automatically
   - Your config has `ssl: { rejectUnauthorized: false }`

## 🐛 Troubleshooting

### Connection Issues

**Error:** "Database connection failed"

**Solutions:**
1. Check Railway logs for database connection errors
2. Verify `DATABASE_URL` is linked correctly
3. Ensure PostgreSQL service is running in Railway

### Migration Issues

**Error:** "Relation already exists"

**Solution:**
```bash
# Drop existing tables (WARNING: Deletes all data!)
npm run migrate  # Re-run migration
```

### Seed Issues

**Error:** "Username already exists"

**Solution:**
```bash
# Connect to Railway database directly and clear admins table
# Or use the admin interface to manage users
```

## 📊 Monitoring

### Railway Dashboard

1. **PostgreSQL Service:**
   - Monitor database connections
   - Check storage usage
   - View query performance

2. **Backend Service:**
   - Monitor API response times
   - Check error rates
   - View deployment logs

### Database Queries

```bash
# In Railway Shell with psql
psql $DATABASE_URL

# Check tables
\dt

# Check admins
SELECT * FROM admins;

# Check surveys
SELECT * FROM surveys;

# Check responses
SELECT * FROM responses;
```

## 🎯 Next Steps

1. ✅ Add Railway PostgreSQL plugin
2. ✅ Link DATABASE_URL to backend
3. ✅ Run `npm run migrate`
4. ✅ Run `npm run seed`
5. ✅ Test login with admin credentials
6. ✅ Change default password
7. ✅ Update JWT_SECRET
8. ✅ Deploy frontend changes

## 📞 Support

If you encounter issues:

1. Check Railway logs: Dashboard → Service → Logs
2. Verify environment variables: Dashboard → Service → Variables
3. Test database connection: Railway Shell → `npm run dev`
4. Check this guide's troubleshooting section

---

**Your database is now ready for production! 🚀**