# Authentication Troubleshooting Guide

## Quick Fix for Common Issues

### Issue: "param is not recognized" ✅ FIXED
**Problem**: PowerShell param block was not at the beginning of the script
**Solution**: Moved `Add-Type` line after the `param` block
**Status**: Fixed in the updated script

### Issue: "404 Not Found" on authentication
**Problem**: Authentication URL format or credentials issue

## Step-by-Step Troubleshooting

### Step 1: Test Your Credentials First

Before running the full provisioning script, test your credentials:

```powershell
cd scripts
.\test-auth.ps1 `
    -ClientId "089c486f-7589-43ad-866c-8a01f01aec78" `
    -ClientSecret "hrO8Q~yzInwd3H5P6GTMNSuBJ~jiwLFTXvfD5aKx" `
    -TenantId "2bd82a68-2c7d-4c43-b080-9b064410f6cf"
```

### Step 2: Verify Your Azure AD App Registration

1. Go to [Azure Portal](https://portal.azure.com)
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Select **App registrations**
4. Find your app with Client ID: `089c486f-7589-43ad-866c-8a01f01aec78`

### Step 3: Check API Permissions

1. In your app, go to **API permissions**
2. Verify you have the following permissions:
   - `Sites.ReadWrite.All` (Application permissions)
   - OR `Sites.FullControl.All` (for full control)

3. Click **Grant admin consent** if not already granted

### Step 4: Verify Client Secret

1. Go to **Certificates & secrets**
2. Check that your client secret is:
   - Not expired
   - Correctly copied (no extra spaces)
   - Still valid

### Step 5: Verify Tenant ID

1. In your app, go to **Overview**
2. Copy the **Directory (tenant) ID**
3. Verify it matches: `2bd82a68-2c7d-4c43-b080-9b064410f6cf`

### Step 6: Try the Corrected Script

The script has been fixed to handle:
- ✅ Param block positioning
- ✅ SharePoint sharing URL format (`/:u:/r/`)
- ✅ Multiple Graph API URL formats
- ✅ Better error messages
- ✅ Detailed logging

Run the provisioning script again:

```powershell
cd scripts
.\provision-sharepoint-lists.ps1 `
    -SiteUrl "https://afrilandfirstbankcmr.sharepoint.com/:u:/r/sites/SURVEYDRH/" `
    -ClientId "089c486f-7589-43ad-866c-8a01f01aec78" `
    -ClientSecret "hrO8Q~yzInwd3H5P6GTMNSuBJ~jiwLFTXvfD5aKx" `
    -TenantId "2bd82a68-2c7d-4c43-b080-9b064410f6cf"
```

## Alternative: Use Direct Site URL

If the sharing URL format doesn't work, try the direct site URL:

```powershell
.\provision-sharepoint-lists.ps1 `
    -SiteUrl "https://afrilandfirstbankcmr.sharepoint.com/sites/SURVEYDRH" `
    -ClientId "089c486f-7589-43ad-866c-8a01f01aec78" `
    -ClientSecret "hrO8Q~yzInwd3H5P6GTMNSuBJ~jiwLFTXvfD5aKx" `
    -TenantId "2bd82a68-2c7d-4c43-b080-9b064410f6cf"
```

## Common Error Messages and Solutions

### "Failed to get access token: (404) Not Found"
**Cause**: Invalid tenant ID or token URL format
**Solution**:
1. Verify tenant ID is correct
2. Check tenant is active
3. Try the test-auth.ps1 script first

### "Authentication failed"
**Cause**: Invalid client ID or secret
**Solution**:
1. Verify client ID matches app registration
2. Check client secret is not expired
3. Regenerate client secret if needed

### "Access denied" or "403 Forbidden"
**Cause**: Missing API permissions or admin consent
**Solution**:
1. Add `Sites.ReadWrite.All` permission
2. Grant admin consent
3. Verify your account has SharePoint access

### "Site not found"
**Cause**: Invalid site URL or no access to site
**Solution**:
1. Verify site URL is correct
2. Check you have access to the SharePoint site
3. Try the direct site URL format

## Quick Verification Checklist

- [ ] Ran test-auth.ps1 successfully
- [ ] Verified Client ID in Azure Portal
- [ ] Verified Client Secret is valid and not expired
- [ ] Verified Tenant ID matches your organization
- [ ] Granted admin consent for API permissions
- [ ] Confirmed `Sites.ReadWrite.All` permission is added
- [ ] Verified you have access to the SharePoint site
- [ ] Tried both sharing URL and direct site URL formats

## Getting Help

If you're still having issues:

1. **Check the detailed error output** - The script now provides more detailed error messages
2. **Review Azure AD logs** - Check sign-in logs in Azure Portal
3. **Verify SharePoint access** - Ensure you can access the site in browser
4. **Contact IT administrator** - You may need additional permissions

## Next Steps After Success

Once authentication works:

1. **Run the provisioning script** - It will create the required lists
2. **Verify lists in SharePoint** - Check that all lists were created
3. **Configure your application** - Set up environment variables
4. **Test the integration** - Use the diagnostics page in your app

---

**Updated**: 2026-05-05
**Status**: Script fixes applied, ready for testing