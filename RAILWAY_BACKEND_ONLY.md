# 🚀 Railway Backend-Only Deployment - Complete Guide

## 📋 Problem Solved
Railway was deploying your entire repository (frontend + backend) instead of just the backend folder.

## 🎯 Solution: Configure Railway for Backend-Only Deployment

### **Step 1: Configure Railway Build Settings**

**Go to Railway Dashboard → Your Backend Service → Settings → Build Config**

Set these exact values:

```
Root Directory: backend
Build Command: npm install && npm run build
Start Command: npm start
```

### **Step 2: Add PostgreSQL Database**

1. In Railway Dashboard, click **"+ New"**
2. Select **"Database"** → **"PostgreSQL"**
3. Wait for database creation (1-2 minutes)

### **Step 3: Link Database to Backend**

1. Click on your backend service
2. Go to **"Variables"** tab
3. Click **"Add Variable Reference"**
4. Select **`DATABASE_URL`** from PostgreSQL service
5. Save changes

### **Step 4: Trigger Redeploy**

Railway will automatically redeploy, or you can:
- Go to **"Deployments"** tab
- Click **"Redeploy"** button

### **Step 5: Run Database Setup**

Once backend is running (check logs for "✅ Database connected successfully"):

**Run Migration:**
```bash
curl -X POST https://[YOUR-BACKEND-URL]/api/setup/migrate
```

**Run Seeding:**
```bash
curl -X POST https://[YOUR-BACKEND-URL]/api/setup/seed
```

## 🔍 Verify Backend-Only Deployment

### **Check Build Log:**
Go to Railway → Backend Service → Deployments → Latest Deployment

**Should see:**
```
Cloning repository...
cd backend
npm install
npm run build
npm start
```

### **Check Running Service:**
Go to Railway → Backend Service → Logs

**Should see:**
```
🚀 Server running on port 3001
📊 API available at http://localhost:3001/api
❤️  Health check at http://localhost:3001/health
✅ Database connected successfully
```

### **Test Health Endpoint:**
```bash
curl https://[YOUR-BACKEND-URL]/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2026-05-08T...",
  "uptime": 123.456
}
```

## 🐛 Troubleshooting

### **Issue: Still Deploying Frontend**

**Solution:**
1. Delete current Railway service
2. Create new service from GitHub
3. **Explicitly set Root Directory to "backend"**
4. Set Build Command: `npm install && npm run build`
5. Set Start Command: `npm start`

### **Issue: Build Fails**

**Check:**
- Root Directory is exactly `backend` (not `./backend` or `/backend`)
- Build Command includes `npm run build`
- TypeScript compiles successfully locally
- All dependencies are in package.json

### **Issue: Database Connection Fails**

**Check:**
- PostgreSQL service exists in Railway project
- DATABASE_URL is linked to backend variables
- Wait 1-2 minutes after adding PostgreSQL
- Check backend logs for connection errors

### **Issue: Can't Find Backend URL**

**Find URL:**
1. Click on backend service in Railway
2. Look for **"Networking"** or **"Domains"** section
3. Copy the URL shown there

## 📋 Complete Deployment Checklist

- [ ] Railway backend service created
- [ ] Root Directory set to `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] PostgreSQL service added to project
- [ ] DATABASE_URL linked to backend variables
- [ ] Backend deployed successfully
- [ ] Health check returns 200 OK
- [ ] Database connection successful in logs
- [ ] Migration completed via API
- [ ] Seeding completed via API
- [ ] Login tested with admin/afriland2026

## 🚀 Quick Reference Commands

**Railway CLI:**
```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Select project
railway select

# Deploy
railway up

# View logs
railway logs

# Open shell
railway shell
```

**Testing Backend:**
```bash
# Health check
curl https://[BACKEND-URL]/health

# Migration
curl -X POST https://[BACKEND-URL]/api/setup/migrate

# Seeding
curl -X POST https://[BACKEND-URL]/api/setup/seed

# Login test
curl -X POST https://[BACKEND-URL]/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"afriland2026"}'
```

## 💡 Important Notes

1. **Root Directory must be exactly "backend"** - no leading slashes or dots
2. **Build Command must include "npm run build"** - TypeScript compilation
3. **Start Command must be "npm start"** - runs the compiled server
4. **DATABASE_URL must be linked** - not manually set
5. **Wait for PostgreSQL** - database takes 1-2 minutes to initialize

## 🎯 Next Steps After Successful Deployment

1. **Test all API endpoints** work correctly
2. **Update frontend .env** with correct backend URL
3. **Change default admin password** immediately
4. **Monitor Railway logs** for any errors
5. **Consider removing setup endpoints** for security

## 🔒 Security Post-Deployment

**Remove Setup Endpoints:**
```bash
# Delete these lines from backend/src/server.ts:
import setupRoutes from './routes/setupRoutes';
app.use('/api/setup', setupRoutes);
```

**Or Add Environment Check:**
```typescript
// In setupController.ts
if (process.env.NODE_ENV === 'production' && process.env.ALLOW_SETUP !== 'true') {
  return res.status(403).json({ error: 'Setup disabled in production' });
}
```

---

**Your backend will now deploy independently on Railway! 🚀**