# Alternative Setup Methods (If Railway Shell Not Available)

## 🚀 Method 1: Railway CLI (Recommended)

If you can't find the Shell in Railway web interface, use the CLI:

### Install CLI:
```bash
npm install -g @railway/cli
```

### Login and Setup:
```bash
railway login
railway select
railway shell

# Inside shell:
npm run migrate
npm run seed
```

See [RAILWAY_CLI_GUIDE.md](RAILWAY_CLI_GUIDE.md) for detailed instructions.

## 🌐 Method 2: API Endpoints (No Shell Required)

We've added setup endpoints that you can call via HTTP requests!

### Run Migration via API:

```bash
curl -X POST https://enquete-afb-production.up.railway.app/api/setup/migrate
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database migration completed successfully",
  "tables": ["admins", "surveys", "responses"],
  "indexes": ["idx_responses_survey_id", "idx_responses_session_token", "idx_responses_timestamp"],
  "triggers": ["update_admins_updated_at"]
}
```

### Seed Database via API:

```bash
curl -X POST https://enquete-afb-production.up.railway.app/api/setup/seed
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Database seeding completed successfully",
  "admin": {
    "username": "admin",
    "password": "afriland2026",
    "note": "Please change this password immediately after first login"
  },
  "survey": {
    "title": "Baromètre Engagement Collaborateur",
    "questions_count": 3
  }
}
```

## 🧪 Method 3: Test in Browser

You can also call these endpoints directly in your browser:

1. **Migration:** Open `https://enquete-afb-production.up.railway.app/api/setup/migrate`
2. **Seeding:** Open `https://enquete-afb-production.up.railway.app/api/setup/seed`

## 📋 Complete Setup Workflow

### Step 1: Add Railway PostgreSQL Plugin
1. Go to Railway Dashboard
2. Click "+ New" → Database → PostgreSQL
3. Wait for database to be created

### Step 2: Link DATABASE_URL
1. Click on your backend service
2. Go to Variables tab
3. Click "Add Variable Reference"
4. Select `DATABASE_URL` from PostgreSQL service

### Step 3: Run Migration (Choose One Method)

**Option A: Railway CLI**
```bash
railway shell
npm run migrate
```

**Option B: API Endpoint**
```bash
curl -X POST https://enquete-afb-production.up.railway.app/api/setup/migrate
```

**Option C: Browser**
- Visit: `https://enquete-afb-production.up.railway.app/api/setup/migrate`

### Step 4: Seed Database (Choose One Method)

**Option A: Railway CLI**
```bash
railway shell
npm run seed
```

**Option B: API Endpoint**
```bash
curl -X POST https://enquete-afb-production.up.railway.app/api/setup/seed
```

**Option C: Browser**
- Visit: `https://enquete-afb-production.up.railway.app/api/setup/seed`

### Step 5: Test Login

1. Go to your frontend: `https://enquete-afb.netlify.app`
2. Login with:
   - **Username:** `admin`
   - **Password:** `afriland2026`
3. **Important:** Change password immediately after first login!

## 🔒 Security Note

⚠️ **Important:** After setup, you should remove or secure the setup endpoints:

### Option 1: Remove Setup Routes (Recommended for Production)
Delete these lines from `backend/src/server.ts`:
```typescript
import setupRoutes from './routes/setupRoutes';
app.use('/api/setup', setupRoutes);
```

### Option 2: Add Authentication
Modify `backend/src/routes/setupRoutes.ts` to require authentication.

### Option 3: Use Environment Variable
Add a check in the setup controller:
```typescript
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SETUP !== 'true') {
  return res.status(403).json({ error: 'Setup endpoints disabled in production' });
}
```

## 🐛 Troubleshooting

### Migration Fails:
1. Check Railway logs for database connection errors
2. Verify DATABASE_URL is linked correctly
3. Ensure PostgreSQL service is running

### Seeding Fails:
1. Make sure migration ran successfully first
2. Check if admin already exists (run migration again to reset)
3. Verify database permissions

### API Endpoints Return 404:
1. Make sure backend is deployed and running
2. Check Railway logs for deployment errors
3. Verify the URL is correct

## 🎯 Quick Reference

**Setup Endpoints:**
- Migration: `POST /api/setup/migrate`
- Seeding: `POST /api/setup/seed`

**Default Credentials:**
- Username: `admin`
- Password: `afriland2026`

**Next Steps:**
1. Run migration
2. Run seeding
3. Test login
4. Change default password
5. Remove/setup secure setup endpoints

---

**You now have multiple ways to set up your database! 🚀**