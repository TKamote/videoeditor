# Add Service Usage Consumer Role

This role allows the service account to use enabled APIs in your project.

## Steps:

1. **Go to IAM:**
   - https://console.cloud.google.com/iam-admin/iam?project=videoeditor-2508b

2. **Find your service account** (the email from your Vercel env vars)

3. **Click Edit (pencil icon)**

4. **Click "ADD ANOTHER ROLE"**

5. **Search for:** `Service Usage Consumer`
   - Full name: **Service Usage Consumer**
   - Role ID: `roles/serviceusage.serviceUsageConsumer`

6. **Select it and click SAVE**

This role allows the service account to consume/use any enabled APIs in your project, including Video Intelligence API.

## Also Verify:

- Make sure the service account email in Vercel matches the one in Google Cloud IAM
- Make sure Video Intelligence API is enabled (check API Library)
- Wait 1-2 minutes after adding the role for permissions to propagate

