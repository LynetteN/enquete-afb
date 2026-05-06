# Deployment Guide - Afriland Employee Engagement Survey

This guide provides step-by-step instructions for deploying the Employee Engagement Survey application to Netlify.

## 📋 Pre-Deployment Checklist

- [ ] All code changes committed to Git
- [ ] Environment variables configured
- [ ] Build tested locally (`npm run build`)
- [ ] All TypeScript errors resolved
- [ ] Responsive design tested on multiple devices
- [ ] Authentication flow verified
- [ ] Data export functionality tested

## 🚀 Quick Start Deployment

### Option 1: GitHub Integration (Recommended)

1. **Prepare Your Repository**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [app.netlify.com](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Select "GitHub" and authorize Netlify
   - Choose your repository

3. **Configure Build Settings**
   ```
   Build command: npm run build
   Publish directory: dist
   Node version: 18
   ```

4. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete (~2-3 minutes)

### Option 2: Manual CLI Deployment

1. **Install Netlify CLI**
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**
   ```bash
   netlify login
   ```

3. **Build the Application**
   ```bash
   npm run build
   ```

4. **Deploy**
   ```bash
   netlify deploy --prod --dir=dist
   ```

## 🔧 Environment Configuration

### Production Environment Variables

Set these in Netlify Dashboard → Site Settings → Environment Variables:

```bash
# Application Configuration
VITE_APP_MODE=production
VITE_API_BASE_URL=/api

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_DIAGNOSTICS=false

# Security
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=60

# Logging
VITE_LOG_LEVEL=info
VITE_ENABLE_CONSOLE_LOGGING=false
```

### Staging Environment Variables

For deploy previews and branch deploys:

```bash
VITE_APP_MODE=staging
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_DIAGNOSTICS=true
VITE_LOG_LEVEL=debug
VITE_ENABLE_CONSOLE_LOGGING=true
```

## 🌐 Domain Configuration

### Custom Domain Setup

1. **Add Custom Domain**
   - Go to Site Settings → Domain management
   - Click "Add custom domain"
   - Enter your domain (e.g., `survey.afrilandfirstbank.com`)

2. **Configure DNS**
   ```
   Type: CNAME
   Name: survey
   Value: your-site-name.netlify.app
   ```

3. **SSL Certificate**
   - Netlify automatically provisions SSL
   - Wait for certificate to be issued (~5-10 minutes)

### Subdomain Options

- **Production**: `survey.afrilandfirstbank.com`
- **Staging**: `staging-survey.afrilandfirstbank.com`
- **Testing**: `test-survey.afrilandfirstbank.com`

## 🔒 Security Configuration

### HTTPS Only

Ensure HTTPS is enforced:
- Site Settings → Domain management → HTTPS
- Enable "HTTPS only" mode

### Security Headers

The `netlify.toml` file includes these security headers:

```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
```

### Access Control

For internal company access, consider:
- IP whitelisting (Netlify Enterprise)
- Password protection (Site Settings → Site protection)
- SSO integration (Netlify Enterprise)

## 📊 Performance Optimization

### Build Optimization

The `vite.config.ts` is already optimized:

```typescript
build: {
  outDir: 'dist',
  emptyOutDir: true,
  sourcemap: false,
  minify: 'esbuild',
  rollupOptions: {
    output: {
      manualChunks: undefined, // Single file output
    },
  },
  chunkSizeWarningLimit: 1000,
}
```

### Caching Strategy

Static assets are cached for 1 year:

```toml
[[headers]]
  for = "*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### CDN Configuration

Netlify automatically uses:
- Global CDN network
- Edge caching
- Automatic compression (gzip, brotli)

## 🧪 Testing Before Deployment

### Local Testing

```bash
# Build and test locally
npm run build
npm run preview

# Test on different devices
# - Desktop (Chrome, Firefox, Safari)
# - Mobile (iOS Safari, Chrome Mobile)
# - Tablet (iPad, Android tablets)
```

### Staging Deployment

```bash
# Deploy to staging branch
git checkout -b staging
git push origin staging

# Netlify will create a deploy preview
# Test the preview URL before merging to main
```

### Production Testing Checklist

- [ ] Home page loads correctly
- [ ] Survey form submits successfully
- [ ] Admin login works
- [ ] Dashboard displays data
- [ ] Export functions work (CSV, Power BI, Report)
- [ ] Responsive design on mobile
- [ ] No console errors
- [ ] All links work correctly

## 🔄 Continuous Deployment

### Automatic Deployments

Configure in Netlify:

1. **Branch Settings**
   - Main branch: Auto-deploy on push
   - Staging branch: Deploy previews enabled
   - Feature branches: Deploy previews enabled

2. **Build Notifications**
   - Slack integration for build status
   - Email notifications for failed builds
   - Webhook notifications for custom integrations

### Deployment Workflow

```bash
# Feature development
git checkout -b feature/new-feature
git push origin feature/new-feature
# Netlify creates deploy preview

# Testing and review
# Test deploy preview URL
# Get approval from team

# Merge to staging
git checkout staging
git merge feature/new-feature
git push origin staging
# Staging deployment

# Final approval and production
git checkout main
git merge staging
git push origin main
# Production deployment
```

## 🐛 Troubleshooting Deployment Issues

### Build Failures

**Issue**: Build fails with TypeScript errors
```bash
# Solution: Check TypeScript locally
npm run build

# Check specific errors
npx tsc --noEmit
```

**Issue**: Dependencies not installing
```bash
# Solution: Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Runtime Issues

**Issue**: Blank pages on deployment
```bash
# Solution: Check SPA redirects in netlify.toml
# Ensure redirects are configured correctly
```

**Issue**: Environment variables not working
```bash
# Solution: Verify variables in Netlify dashboard
# Variables must start with VITE_ prefix
# Re-deploy after adding variables
```

### Performance Issues

**Issue**: Slow load times
```bash
# Solution: Check bundle size
npm run build
# Check dist folder size

# Enable compression in netlify.toml
[build.processing]
  skip_processing = false
```

## 📈 Monitoring and Analytics

### Netlify Analytics

Enable in Site Settings → Analytics:
- Page views
- Visitor demographics
- Traffic sources
- Performance metrics

### Custom Analytics

Integrate with:
- Google Analytics
- Microsoft Clarity
- Custom tracking solutions

### Error Tracking

Consider integrating:
- Sentry for error tracking
- LogRocket for session replay
- Custom error logging

## 🔄 Rollback Procedures

### Quick Rollback

```bash
# Via Netlify CLI
netlify deploy --prod --dir=dist --previous

# Or via Netlify Dashboard
# Deploys → Choose previous deploy → Publish rollback
```

### Database Rollback

If using database:
```bash
# Restore from backup
# Contact database administrator
# Use backup from before deployment
```

## 📞 Support and Maintenance

### Deployment Support

For deployment issues:
- **Netlify Support**: [support.netlify.com](https://support.netlify.com)
- **Documentation**: [docs.netlify.com](https://docs.netlify.com)
- **Community**: [community.netlify.com](https://community.netlify.com)

### Application Support

For application issues:
- **IT Department**: Cisco 01411
- **Development Team**: Contact via internal channels

### Maintenance Schedule

- **Weekly**: Check build logs and performance
- **Monthly**: Review analytics and user feedback
- **Quarterly**: Update dependencies and security patches
- **Annually**: Major version updates and feature planning

## 📝 Post-Deployment Checklist

- [ ] Verify site is accessible
- [ ] Test all user flows
- [ ] Check analytics integration
- [ ] Monitor error logs
- [ ] Test on mobile devices
- [ ] Verify SSL certificate
- [ ] Check performance scores
- [ ] Document any issues
- [ ] Notify stakeholders of successful deployment

---

**Last Updated**: 2026-05-06
**Version**: 1.0.0