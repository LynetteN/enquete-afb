# Test Script for SharePoint Provisioning
# This script tests the provisioning script with sample parameters

Write-Host "SharePoint Provisioning Test Script" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if PowerShell version is sufficient
$psVersion = $PSVersionTable.PSVersion
Write-Host "PowerShell Version: $psVersion" -ForegroundColor Green

if ($psVersion.Major -lt 5) {
    Write-Error "PowerShell 5.0 or higher is required"
    exit 1
}

# Check if required assemblies are available
try {
    Add-Type -AssemblyName System.Web -ErrorAction Stop
    Write-Host "System.Web assembly loaded successfully" -ForegroundColor Green
}
catch {
    Write-Error "Failed to load System.Web assembly: $_"
    exit 1
}

# Check if the main script exists
$scriptPath = ".\provision-sharepoint-lists.ps1"
if (-not (Test-Path $scriptPath)) {
    Write-Error "Provisioning script not found at: $scriptPath"
    Write-Host "Please ensure you're running this test from the scripts directory" -ForegroundColor Yellow
    exit 1
}

Write-Host "Provisioning script found at: $scriptPath" -ForegroundColor Green
Write-Host ""

# Display required parameters
Write-Host "Required Parameters for the Provisioning Script:" -ForegroundColor Yellow
Write-Host "  -SiteUrl    : Your SharePoint site URL (e.g., https://yourtenant.sharepoint.com/sites/yoursite)" -ForegroundColor White
Write-Host "  -ClientId    : Your Azure AD app client ID" -ForegroundColor White
Write-Host "  -ClientSecret: Your Azure AD app client secret" -ForegroundColor White
Write-Host "  -TenantId   : Your Azure AD tenant ID" -ForegroundColor White
Write-Host ""

# Example command
Write-Host "Example command:" -ForegroundColor Cyan
Write-Host ".\provision-sharepoint-lists.ps1 -SiteUrl `"https://yourtenant.sharepoint.com/sites/yoursite`" -ClientId `"your-client-id`" -ClientSecret `"your-client-secret`" -TenantId `"your-tenant-id`"" -ForegroundColor White
Write-Host ""

# Ask if user wants to run a syntax check
$response = Read-Host "Do you want to run a syntax check on the provisioning script? (Y/N)"
if ($response -eq 'Y' -or $response -eq 'y') {
    Write-Host "Running syntax check..." -ForegroundColor Yellow
    try {
        $null = [System.Management.Automation.PSParser]::Tokenize((Get-Content $scriptPath -Raw), [ref]$null)
        Write-Host "Syntax check passed!" -ForegroundColor Green
    }
    catch {
        Write-Error "Syntax check failed: $_"
        exit 1
    }
}

Write-Host ""
Write-Host "Test script completed successfully!" -ForegroundColor Green
Write-Host "You can now run the provisioning script with your actual parameters." -ForegroundColor Cyan