# Simple Authentication Test
# This script tests your Azure AD credentials before running the full provisioning

param(
    [Parameter(Mandatory=$true)]
    [string]$ClientId,

    [Parameter(Mandatory=$true)]
    [string]$ClientSecret,

    [Parameter(Mandatory=$true)]
    [string]$TenantId
)

Write-Host "Azure AD Authentication Test" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Testing credentials..." -ForegroundColor Yellow
Write-Host "  Tenant ID: $TenantId" -ForegroundColor White
Write-Host "  Client ID: $ClientId" -ForegroundColor White
Write-Host "  Client Secret: ****" -ForegroundColor White
Write-Host ""

# Test authentication
try {
    $tokenUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"

    Write-Host "Requesting access token..." -ForegroundColor Yellow
    Write-Host "  URL: $tokenUrl" -ForegroundColor DarkGray

    $body = @{
        client_id = $ClientId
        client_secret = $ClientSecret
        scope = "https://graph.microsoft.com/.default"
        grant_type = "client_credentials"
    }

    $response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded" -ErrorAction Stop

    Write-Host "✓ Authentication successful!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Token Details:" -ForegroundColor Cyan
    Write-Host "  Token Type: $($response.token_type)" -ForegroundColor White
    Write-Host "  Expires In: $($response.expires_in) seconds" -ForegroundColor White
    Write-Host "  Scope: $($response.scope)" -ForegroundColor White
    Write-Host ""

    # Test Graph API access
    Write-Host "Testing Graph API access..." -ForegroundColor Yellow

    $headers = @{
        "Authorization" = "Bearer $($response.access_token)"
        "Content-Type" = "application/json"
    }

    $graphTestUrl = "https://graph.microsoft.com/v1.0/sites"
    Write-Host "  Testing: $graphTestUrl" -ForegroundColor DarkGray

    $graphResponse = Invoke-RestMethod -Uri $graphTestUrl -Method Get -Headers $headers -ErrorAction Stop

    Write-Host "✓ Graph API access successful!" -ForegroundColor Green
    Write-Host "  Found $($graphResponse.value.Count) sites" -ForegroundColor White
    Write-Host ""

    Write-Host "================================" -ForegroundColor Cyan
    Write-Host "All tests passed! ✓" -ForegroundColor Green
    Write-Host "You can now run the provisioning script." -ForegroundColor Cyan
    Write-Host ""

}
catch {
    Write-Host "✗ Authentication failed!" -ForegroundColor Red
    Write-Host ""
    Write-Host "Error Details:" -ForegroundColor Yellow
    Write-Host "  $($_.Exception.Message)" -ForegroundColor Red

    if ($_.ErrorDetails) {
        Write-Host "  Details: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }

    Write-Host ""
    Write-Host "Troubleshooting:" -ForegroundColor Yellow
    Write-Host "  1. Verify the Tenant ID is correct" -ForegroundColor White
    Write-Host "  2. Check that the Client ID matches your app registration" -ForegroundColor White
    Write-Host "  3. Ensure the Client Secret is valid and not expired" -ForegroundColor White
    Write-Host "  4. Verify admin consent was granted for API permissions" -ForegroundColor White
    Write-Host "  5. Check that 'Sites.ReadWrite.All' permission is configured" -ForegroundColor White
    Write-Host ""

    Write-Host "To check your app registration:" -ForegroundColor Cyan
    Write-Host "  1. Go to https://portal.azure.com" -ForegroundColor White
    Write-Host "  2. Navigate to Microsoft Entra ID > App registrations" -ForegroundColor White
    Write-Host "  3. Find your app and verify the credentials" -ForegroundColor White
    Write-Host "  4. Check API permissions and grant admin consent" -ForegroundColor White
    Write-Host ""

    exit 1
}