# Railway CLI Setup Guide

## 🚀 Alternative Method: Railway CLI

If you can't find the Shell in the Railway web interface, use the Railway CLI instead.

### Step 1: Install Railway CLI

```bash
# Using npm
npm install -g @railway/cli

# Or using yarn
yarn global add @railway/cli

# Or using Homebrew (Mac)
brew install railwaycli
```

### Step 2: Login to Railway

```bash
railway login
```

This will open your browser for authentication.

### Step 3: Select Your Project

```bash
# List your projects
railway projects

# Select your project
railway select
```

Choose `enquete-afb-production` from the list.

### Step 4: Open Shell for Backend Service

```bash
# Open shell for your backend service
railway shell
```

This will open a terminal connected to your running backend service.

### Step 5: Run Your Commands

```bash
# Run database migration
npm run migrate

# Seed the database
npm run seed

# Test the server
npm run dev
```

## 🎯 Quick Commands Reference

```bash
# Login
railway login

# List projects
railway projects

# Select project
railway select

# Open shell
railway shell

# View logs
railway logs

# View environment variables
railway variables

# Trigger redeploy
railway up
```

## 🐛 Troubleshooting

### CLI Not Found:
```bash
# Check if railway is installed
railway --version

# If not found, reinstall
npm install -g @railway/cli
```

### Authentication Issues:
```bash
# Logout and login again
railway logout
railway login
```

### Service Not Found:
```bash
# Make sure you selected the right project
railway select

# List services in current project
railway services
```

## 💡 Benefits of Using CLI

- ✅ More reliable than web shell
- ✅ Can be automated in scripts
- ✅ Better for debugging
- ✅ Works even if web interface has issues
- ✅ Can be used in CI/CD pipelines

## 📝 Example Workflow

```bash
# Complete workflow to set up database
railway login
railway select
railway shell

# Inside the shell:
npm run migrate
npm run seed
exit

# Check logs to verify
railway logs
```