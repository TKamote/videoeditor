# Create Custom Video Intelligence Role

Since the predefined role doesn't appear, we'll create a custom role with the exact permissions needed.

## Steps:

1. **Go to IAM Roles:**
   - Visit: https://console.cloud.google.com/iam-admin/roles?project=videoeditor-2508b
   - Or: Google Cloud Console → IAM & Admin → Roles

2. **Click "CREATE ROLE"** (top of the page)

3. **Fill in the role details:**
   - **Title:** `Video Intelligence API User`
   - **ID:** `video_intelligence_api_user` (auto-generated, you can change it)
   - **Description:** `Allows using Video Intelligence API to analyze videos`

4. **Add Permissions:**
   Click "ADD PERMISSIONS" and search for/add these one by one:
   - `videointelligence.videos.annotate`
   - `videointelligence.operations.get`
   - `videointelligence.operations.list`
   - `videointelligence.operations.cancel` (optional, but helpful)

5. **Click "CREATE"**

6. **Assign to Service Account:**
   - Go to: https://console.cloud.google.com/iam-admin/iam?project=videoeditor-2508b
   - Find your service account
   - Click Edit (pencil icon)
   - Click "ADD ANOTHER ROLE"
   - Search for: `Video Intelligence API User` (your custom role)
   - Select it and click "SAVE"

## Alternative: Use Service Account User + Enable API

If creating a custom role is too complex, you can also try:
- **Service Account User** role (broader permissions)
- Make sure the Video Intelligence API is enabled
- The API might work with just Storage Admin permissions if the service account has proper access

