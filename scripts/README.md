# PowerShell Scripts Quick Reference

This document provides quick reference information for the PowerShell scripts included in this project.

## Available Scripts

### 1. provision-sharepoint-lists.ps1

Automatically creates SharePoint lists and columns required for the survey application.

**Usage:**
```powershell
.\provision-sharepoint-lists.ps1 -SiteUrl "https://yourtenant.sharepoint.com/sites/yoursite" -ClientId "your-client-id" -ClientSecret "your-client-secret" -TenantId "your-tenant-id"
```

**Parameters:**
- `-SiteUrl` (Required): Your SharePoint site URL
- `-ClientId` (Required): Azure AD app client ID
- `-ClientSecret` (Required): Azure AD app client secret
- `-TenantId` (Required): Azure AD tenant ID

**What it creates:**
- Surveys list with columns: Description, Questions, IsActive, Version
- SurveyResponses list with columns: SurveyId, ResponseData, RespondentToken, SubmittedDate, IPAddress, UserAgent, SyncStatus, LastSyncDate, IsAdminResponse
- SyncLog list with columns: EntityType, EntityId, Action, Status, ErrorMessage, Timestamp, DeviceId
- Users list with columns: Username, Email, Role, LastActive

**Example:**
```powershell
cd scripts
.\provision-sharepoint-lists.ps1 `
    -SiteUrl "https://contoso.sharepoint.com/sites/surveys" `
    -ClientId "a1b2c3d4-e5f6-7890-abcd-ef1234567890" `
    -ClientSecret "abc123~DEF456-ghi789" `
    -TenantId "12345678-1234-1234-1234-123456789012"
```

### 2. deploy-netlify.ps1

Automates the deployment process to Netlify.

**Usage:**
```powershell
.\deploy-netlify.ps1 [options]
```

**Parameters:**
- `-SiteName` (Optional): Netlify site name
- `-NetlifyToken` (Optional): Netlify authentication token
- `-SkipBuild` (Optional): Skip the build step
- `-Production` (Optional): Deploy to production environment
- `-Message` (Optional): Deployment message

**Examples:**

Deploy to preview:
```powershell
.\deploy-netlify.ps1 -Message "Test deployment"
```

Deploy to production:
```powershell
.\deploy-netlify.ps1 -Production -Message "Production release v1.0"
```

Deploy with authentication:
```powershell
.\deploy-netlify.ps1 -NetlifyToken "your-netlify-token" -SiteName "my-survey-app" -Production
```

Skip build (use existing dist folder):
```powershell
.\deploy-netlify.ps1 -SkipBuild -Production
```

### 3. test-provisioning.ps1

Tests the provisioning script environment and syntax.

**Usage:**
```powershell
.\test-provisioning.ps1
```

**What it checks:**
- PowerShell version compatibility
- Required assemblies availability
- Provisioning script existence
- Script syntax validity

## Prerequisites

### For PowerShell Scripts

1. **PowerShell 5.0 or higher**
   ```powershell
   $PSVersionTable.PSVersion
   ```

2. **Required Modules** (usually included):
   - System.Web (for URL encoding)
   - Microsoft.PowerShell.Utility

3. **Execution Policy** (may need to be set):
   ```powershell
   Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
   ```

### For Azure AD and SharePoint Access

1. **Global Administrator** or **SharePoint Administrator** permissions
2. **Azure AD app registration** with appropriate permissions
3. **Microsoft Graph API** permissions:
   - `Sites.ReadWrite.All` (recommended)
   - `Sites.FullControl.All` (for full control)

## Common Issues and Solutions

### Issue: "Execution policy restricts running scripts"

**Solution:**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Issue: "Cannot load System.Web assembly"

**Solution:**
Ensure you're using .NET Framework 4.5 or higher. The System.Web assembly should be available by default.

### Issue: "Authentication failed"

**Solution:**
1. Verify your Client ID and Secret are correct
2. Ensure admin consent was granted for API permissions
3. Check that the Tenant ID matches your organization

### Issue: "Site not found"

**Solution:**
1. Verify the Site URL is correct
2. Ensure you have access to the SharePoint site
3. Check that the site exists in your tenant

### Issue: "Permission denied"

**Solution:**
1. Verify API permissions are configured in Azure AD
2. Ensure admin consent was granted
3. Check that your account has the necessary permissions

## Security Best Practices

1. **Never commit credentials to version control**
   - Use `.env` files for local development
   - Use environment variables in production
   - Use Azure Key Vault for production secrets

2. **Use separate credentials for different environments**
   - Development app registration
   - Staging app registration
   - Production app registration

3. **Rotate credentials regularly**
   - Set expiration dates on client secrets
   - Document credential rotation schedule
   - Test with new credentials before deployment

4. **Limit permissions**
   - Use minimum required permissions
   - Avoid granting full control unless necessary
   - Regularly audit permissions

## Troubleshooting

### Enable Detailed Logging

Add `-Verbose` flag to any script to see detailed output:

```powershell
.\provision-sharepoint-lists.ps1 -SiteUrl "..." -ClientId "..." -ClientSecret "..." -TenantId "..." -Verbose
```

### Test Connection First

Before running the full provisioning, test your connection:

```powershell
# Test authentication
$tokenUrl = "https://login.microsoftonline.com/$TenantId/oauth2/v2.0/token"
$body = @{
    client_id = $ClientId
    client_secret = $ClientSecret
    scope = "https://graph.microsoft.com/.default"
    grant_type = "client_credentials"
}
$response = Invoke-RestMethod -Uri $tokenUrl -Method Post -Body $body -ContentType "application/x-www-form-urlencoded"
$response.access_token
```

### Check Graph API Access

Test Graph API access with a simple request:

```powershell
$headers = @{
    "Authorization" = "Bearer $accessToken"
    "Content-Type" = "application/json"
}
Invoke-RestMethod -Uri "https://graph.microsoft.com/v1.0/sites" -Headers $headers
```

## Integration with CI/CD

### GitHub Actions Example

```yaml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build
        run: npm run build
        
      - name: Deploy to Netlify
        run: |
          npm install -g netlify-cli
          netlify deploy --prod --dir=dist
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### Azure DevOps Example

```yaml
trigger:
- main

pool:
  vmImage: 'windows-latest'

steps:
- task: NodeTool@0
  inputs:
    versionSpec: '18.x'
    
- script: |
    npm install
    npm run build
  displayName: 'Build application'
  
- script: |
    npm install -g netlify-cli
    netlify deploy --prod --dir=dist
  displayName: 'Deploy to Netlify'
  env:
    NETLIFY_AUTH_TOKEN: $(NETLIFY_AUTH_TOKEN)
    NETLIFY_SITE_ID: $(NETLIFY_SITE_ID)
```

## Additional Resources

- [Microsoft Graph API Documentation](https://docs.microsoft.com/graph/api/)
- [SharePoint REST API Documentation](https://docs.microsoft.com/sharepoint/dev/sp-add-ins/sharepoint-rest-api)
- [Azure AD App Registration](https://docs.microsoft.com/azure/active-directory/develop/app-objects-and-service-principals)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started)

## Support

For issues or questions:

1. Check this quick reference guide
2. Review the main setup guide: `SHAREPOINT_SETUP_GUIDE.md`
3. Check the script output for error messages
4. Consult Microsoft documentation
5. Contact your SharePoint administrator

---

**Last Updated:** 2026-05-05
**Version:** 1.0