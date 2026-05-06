# Afriland First Bank - Employee Engagement Survey

A modern, responsive employee engagement survey application built with React, TypeScript, and Vite. Features real-time analytics, anonymous data collection, and comprehensive reporting capabilities.

## 🚀 Features

- **Anonymous Survey System**: Secure, anonymous employee feedback collection
- **Real-time Analytics**: Live dashboard with engagement metrics and trends
- **Multi-format Exports**: CSV, Power BI, and comprehensive markdown reports
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Authentication**: Secure admin access for data management
- **Offline Support**: Graceful degradation when network is unavailable
- **TypeScript**: Full type safety for better development experience

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, Framer Motion
- **Icons**: Lucide React
- **Routing**: React Router DOM
- **Build**: Vite with single-file output plugin

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Git

## 🏗️ Local Development

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd enquete-test

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the application
npm run build

# Preview production build
npm run preview
```

## 🌐 Netlify Deployment

### Automatic Deployment

1. **Push to GitHub**: Push your code to a GitHub repository
2. **Connect to Netlify**: 
   - Go to [Netlify](https://app.netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect your GitHub repository
3. **Configure Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Node version: `18`

### Manual Deployment

```bash
# Build the application
npm run build

# Deploy to Netlify using CLI
npm install -g netlify-cli
netlify deploy --prod --dir=dist
```

### Environment Variables

Configure these in Netlify dashboard under Site Settings → Environment Variables:

```bash
# Application Mode
VITE_APP_MODE=production

# Feature Flags
VITE_ENABLE_OFFLINE_MODE=true
VITE_ENABLE_DIAGNOSTICS=false

# API Configuration
VITE_API_BASE_URL=/api

# Security
VITE_ENABLE_RATE_LIMITING=true
VITE_MAX_REQUESTS_PER_MINUTE=60

# Logging
VITE_LOG_LEVEL=info
VITE_ENABLE_CONSOLE_LOGGING=true
```

### Netlify Configuration

The `netlify.toml` file includes:

- **Build settings**: Automated build configuration
- **SPA routing**: Redirects for client-side routing
- **Security headers**: XSS protection, content type options
- **Caching strategy**: Optimized cache headers for static assets
- **Environment contexts**: Different settings for production/staging

## 📁 Project Structure

```
enquete-test/
├── src/
│   ├── components/      # Reusable UI components
│   ├── pages/          # Page components
│   ├── utils/          # Utility functions
│   ├── hooks/          # Custom React hooks
│   ├── config/         # Configuration files
│   └── assets/         # Static assets
├── public/             # Public static files
├── backend/           # Backend API (if applicable)
├── dist/              # Build output (generated)
├── netlify.toml       # Netlify configuration
├── package.json       # Project dependencies
├── vite.config.ts     # Vite configuration
└── tsconfig.json      # TypeScript configuration
```

## 🔐 Security Features

- **Anonymous Data Collection**: No personal identifiers stored
- **Session-based Authentication**: Secure admin access
- **XSS Protection**: Content Security Policy headers
- **HTTPS Only**: Enforced secure connections
- **Rate Limiting**: Protection against abuse

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

## 🐛 Troubleshooting

### Build Issues

```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

### Deployment Issues

1. **Build fails**: Check Node version matches `netlify.toml`
2. **Blank pages**: Verify SPA redirects in `netlify.toml`
3. **Environment variables**: Ensure all required vars are set in Netlify

### Local Development Issues

```bash
# Reset local storage
localStorage.clear()

# Check console for errors
# Open browser DevTools → Console
```

## 📝 License

Proprietary - Afriland First Bank Internal Use

## 👥 Support

For technical support, contact:
- **IT Department**: Cisco 01411
- **HR Department**: Contact via internal channels

## 🔄 Version History

- **v2.0.0**: Complete rewrite with React + TypeScript
- **v1.0.0**: Initial release

---

**Built with ❤️ for Afriland First Bank Employees**