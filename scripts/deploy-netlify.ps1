# Netlify Deployment Script
# This script automates the deployment process to Netlify

param(
    [Parameter(Mandatory=$false)]
    [string]$SiteName,

    [Parameter(Mandatory=$false)]
    [string]$NetlifyToken,

    [Parameter(Mandatory=$false)]
    [switch]$SkipBuild = $false,

    [Parameter(Mandatory=$false)]
    [switch]$Production = $false,

    [Parameter(Mandatory=$false)]
    [string]$Message = "Automated deployment"
)

# Error handling
$ErrorActionPreference = "Stop"

# Colors for output
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = "White"
    )
    Write-Host $Message -ForegroundColor $Color
}

Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "Netlify Deployment Script" "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-Host ""

# Check if Netlify CLI is installed
Write-ColorOutput "Checking Netlify CLI installation..." "Yellow"
try {
    $netlifyVersion = netlify --version
    Write-ColorOutput "Netlify CLI found: $netlifyVersion" "Green"
}
catch {
    Write-ColorOutput "Netlify CLI not found. Installing..." "Yellow"
    npm install -g netlify-cli
    Write-ColorOutput "Netlify CLI installed successfully" "Green"
}

# Check if .env file exists
Write-ColorOutput "Checking environment configuration..." "Yellow"
if (-not (Test-Path ".env")) {
    Write-ColorOutput ".env file not found. Creating from .env.example..." "Yellow"
    if (Test-Path ".env.example") {
        Copy-Item ".env.example" ".env"
        Write-ColorOutput ".env file created. Please update it with your configuration." "Green"
        Write-ColorOutput "Press Enter to continue after updating .env file..." "Yellow"
        Read-Host
    }
    else {
        Write-ColorOutput ".env.example not found. Please create .env file manually." "Red"
        exit 1
    }
}

# Install dependencies
Write-ColorOutput "Installing dependencies..." "Yellow"
npm install
Write-ColorOutput "Dependencies installed successfully" "Green"

# Build the project
if (-not $SkipBuild) {
    Write-ColorOutput "Building project..." "Yellow"
    npm run build

    if ($LASTEXITCODE -ne 0) {
        Write-ColorOutput "Build failed!" "Red"
        exit 1
    }
    Write-ColorOutput "Build completed successfully" "Green"
}
else {
    Write-ColorOutput "Skipping build (SkipBuild flag set)" "Yellow"
}

# Check if dist folder exists
if (-not (Test-Path "dist")) {
    Write-ColorOutput "dist folder not found. Build may have failed." "Red"
    exit 1
}

Write-ColorOutput "Build output size:" "Yellow"
$distSize = (Get-ChildItem -Path "dist" -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-ColorOutput "Total size: $([math]::Round($distSize, 2)) MB" "White"

# Deploy to Netlify
Write-ColorOutput "Deploying to Netlify..." "Yellow"

$deployCommand = "netlify deploy --dir=dist --message=$Message"

if ($Production) {
    $deployCommand += " --prod"
    Write-ColorOutput "Deploying to PRODUCTION environment" "Red"
}
else {
    Write-ColorOutput "Deploying to PREVIEW environment" "Yellow"
}

if ($SiteName) {
    $deployCommand += " --site=$SiteName"
}

if ($NetlifyToken) {
    $deployCommand += " --token=$NetlifyToken"
}

try {
    Invoke-Expression $deployCommand
    Write-ColorOutput "Deployment completed successfully!" "Green"
}
catch {
    Write-ColorOutput "Deployment failed!" "Red"
    Write-ColorOutput "Error: $_" "Red"
    exit 1
}

# Display deployment information
Write-Host ""
Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "Deployment Summary" "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "Environment: $(if ($Production) { 'Production' } else { 'Preview' })" "White"
Write-ColorOutput "Build Size: $([math]::Round($distSize, 2)) MB" "White"
Write-ColorOutput "Message: $Message" "White"
Write-Host ""

# Post-deployment checks
Write-ColorOutput "Running post-deployment checks..." "Yellow"

# Check if index.html exists
if (Test-Path "dist/index.html") {
    Write-ColorOutput "✓ index.html found" "Green"
}
else {
    Write-ColorOutput "✗ index.html not found" "Red"
}

# Check if main JavaScript file exists
$jsFiles = Get-ChildItem -Path "dist" -Filter "*.js"
if ($jsFiles.Count -gt 0) {
    Write-ColorOutput "✓ JavaScript files found ($($jsFiles.Count) files)" "Green"
}
else {
    Write-ColorOutput "✗ No JavaScript files found" "Red"
}

# Check if CSS file exists
$cssFiles = Get-ChildItem -Path "dist" -Filter "*.css"
if ($cssFiles.Count -gt 0) {
    Write-ColorOutput "✓ CSS files found ($($cssFiles.Count) files)" "Green"
}
else {
    Write-ColorOutput "✗ No CSS files found" "Red"
}

Write-Host ""
Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "Next Steps" "Cyan"
Write-ColorOutput "========================================" "Cyan"
Write-ColorOutput "1. Visit your Netlify dashboard to verify deployment" "White"
Write-ColorOutput "2. Test the application functionality" "White"
Write-ColorOutput "3. Configure environment variables in Netlify dashboard:" "White"
Write-ColorOutput "   - VITE_SHAREPOINT_SITE_URL" "White"
Write-ColorOutput "   - VITE_SHAREPOINT_CLIENT_ID" "White"
Write-ColorOutput "   - VITE_SHAREPOINT_CLIENT_SECRET" "White"
Write-ColorOutput "   - VITE_SHAREPOINT_TENANT_ID" "White"
Write-ColorOutput "4. Set up custom domain (optional)" "White"
Write-ColorOutput "5. Configure analytics and monitoring (optional)" "White"
Write-Host ""

Write-ColorOutput "Deployment script completed successfully!" "Green"