# Railway Backend-Only Deployment Guide

## 🚀 Deploy Backend Only on Railway

Your current issue: Railway is deploying the entire repository (frontend + backend) instead of just the backend.

## 📋 Solution: Configure Railway for Backend-Only Deployment

### **Step 1: Create Backend-Specific Railway Configuration**

We've already created `backend/railway.json` with proper configuration.

### **Step 2: Update Backend package.json Scripts**

Make sure your backend `package.json` has these scripts:

```json
{
  "scripts": {
    "start": "node dist/server.js",
    "build": "tsc",
    "dev": "ts-node-dev --respawn --transpile-only src/server.ts"
  }
}
```

### **Step 3: Configure Railway Build Settings**

**Option A: Via Railway Dashboard (Recommended)**

1. **Go to Railway Dashboard** → Your backend service
2. **Click "Settings"** tab
3. **Scroll to "Build Config"** section
4. **Set these values:**

   **Root Directory:**
   ```
   backend
   ```

   **Build Command:**
   ```
   npm install && npm run build
   ```

   **Start Command:**
   ```
   npm start
   ```

5. **Save** the configuration

**Option B: Via railway.json**

The `backend/railway.json` file we created should handle this automatically.

### **Step 4: Add PostgreSQL Database**

1. **In Railway Dashboard**, click **"+ New"**
2. **Select "Database"** → **"PostgreSQL"**
3. **Wait for database** to be created (1-2 minutes)

### **Step 5: Link Database to Backend**

1. **Click on your backend service**
2. **Go to "Variables" tab**
3. **Click "Add Variable Reference"**
4. **Select `DATABASE_URL`** from the PostgreSQL service
5. **Save** the changes

### **Step 6: Trigger Redeploy**

Railway will automatically redeploy when you:
- Push changes to GitHub
- Update variables
- Modify build settings

Or manually trigger:
1. Go to **"Deployments"** tab
2. Click **"Redeploy"** button

### **Step 7: Run Database Setup**

Once backend is running successfully:

**Run Migration:**
```bash
curl -X POST https://[YOUR-BACKEND-URL]/api/setup/migrate
```

**Run Seeding:**
```bash
curl -X POST https://[YOUR-BACKEND-URL]/api/setup/seed
```

## 🔧 Alternative: Create Separate Repository

If Railway continues to have issues with the monorepo structure:

### **Option A: Create Backend-Only Repository**

1. **Create new GitHub repository:** `enquete-backend`
2. **Move backend folder contents** to new repository
3. **Update Railway** to use new repository
4. **Deploy** backend-only

**Structure:**
```
enquete-backend/
├── src/
│   ├── server.ts
│   ├── routes/
│   ├── controllers/
│   ├── middleware/
│   └── database/
├── dist/
├── package.json
├── tsconfig.json
└── railway.json
```

### **Option B: Use Git Submodules**

Keep main repository but use submodules for backend:

```bash
# In main repository
git submodule add https://github.com/your-username/enquete-backend.git backend

# Railway will treat backend as separate module
```

## 🎯 Verify Backend-Only Deployment

### **Check What's Being Deployed:**

1. **Go to Railway Dashboard** → Backend service
2. **Click "Deployments"** tab
3. **Click on latest deployment**
4. **Check "Build Log"** - should show:
   ```
   Cloning repository...
   cd backend
   npm install
   npm run build
   npm start
   ```

### **Check Running Service:**

1. **Go to "Logs"** tab
2. **Should see:**
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

Should return:
```json
{
  "status": "healthy",
  "timestamp": "2026-05-08T...",
  "uptime": 123.456
}
```

## 🐛 Troubleshooting

### **Issue: Railway Still Deploys Frontend**

**Solution:**
1. Delete current Railway service
2. Create new service
3. **Explicitly set Root Directory to "backend"**
4. **Set Build Command to "npm install && npm run build"**
5. **Set Start Command to "npm start"**

### **Issue: Build Fails**

**Check:**
1. **Root Directory** is set to `backend`
2. **Build Command** includes `npm run build`
3. **TypeScript compiles** successfully locally
4. **All dependencies** are in package.json

### **Issue: Database Connection Fails**

**Check:**
1. **PostgreSQL service** exists in Railway
2. **DATABASE_URL** is linked to backend
3. **Backend logs** show database connection
4. **Wait 1-2 minutes** after adding PostgreSQL

### **Issue: Can't Find Backend URL**

**Find URL:**
1. Click on backend service
2. Look for **"Networking"** or **"Domains"** section
3. Copy the URL shown there

## 📋 Complete Deployment Checklist

- [ ] Railway service created
- [ ] Root Directory set to `backend`
- [ ] Build Command: `npm install && npm run build`
- [ ] Start Command: `npm start`
- [ ] PostgreSQL service added
- [ ] DATABASE_URL linked to backend
- [ ] Backend deployed successfully
- [ ] Health check returns 200
- [ ] Migration completed
- [ ] Seeding completed
- [ ] Login tested with admin credentials

## 🚀 Quick Commands Reference

**Railway CLI:**
```bash
# Install
npm install -g @railway/cli

# Login
railway login

# Initialize
railway init

# Deploy
railway up

# Open shell
railway shell

# View logs
railway logs
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

## 💡 Pro Tips

1. **Use Railway CLI** for more control
2. **Monitor logs** during deployment
3. **Test health endpoint** first
4. **Run setup endpoints** before testing login
5. **Keep backend and frontend separate** for easier deployment

## 🎯 Next Steps After Deployment

1. **Test all API endpoints**
2. **Update frontend API URL** to point to new backend
3. **Change default admin password**
4. **Monitor Railway logs** for errors
5. **Set up monitoring** and alerts

---

**Your backend should now deploy independently on Railway! 🚀**