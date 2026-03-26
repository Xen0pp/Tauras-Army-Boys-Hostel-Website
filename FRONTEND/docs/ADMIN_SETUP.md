# Admin System Setup Guide

## Initial Admin Setup

To initialize the first admin in the system, follow these steps:

### Prerequisites
- Firebase service account key file (`serviceAccountKey.json`)
- Node.js installed
- User must be registered in the system first

### Step 1: Ensure Service Account Key Exists

Place your Firebase service account key at:
```
/home/pixelx/Documents/TABH_2/alumi/Alumni-Portal/FRONTEND/serviceAccountKey.json
```

### Step 2: Run Initialization Script

```bash
cd /home/pixelx/Documents/TABH_2/alumi/Alumni-Portal/FRONTEND
node scripts/initializeAdmin.js
```

**Or** specify a different admin email:
```bash
ADMIN_EMAIL="admin@example.com" node scripts/initializeAdmin.js
```

### Step 3: Verify Admin Access

1. Login with the admin account
2. Navigate to `/portal/admin`
3. Confirm you can access the admin panel

## Adding Additional Admins

Once you have admin access, you can add more admins through the admin panel:

1. Login as admin
2. Go to `/portal/admin/users` (when UI is built)
3. Enter the user ID and email of the person you want to make admin
4. Click "Add Admin"

## Removing Admin Access

To remove admin access from a user:

1. Login as admin
2. Go to `/portal/admin/users`
3. Find the admin you want to remove
4. Click "Remove Admin"

**Note**: You cannot remove your own admin access.

## Security Notes

- Admin status is now stored in Firestore `admins` collection
- All admin API endpoints verify admin status against Firestore
- Frontend pages check admin status via `/api/admin/check` endpoint
- No more hardcoded email addresses

## Troubleshooting

### "No user found with email"
- Ensure the user has registered in the system first
- Check the email spelling

### "Module not found: serviceAccountKey.json"
- Place the Firebase service account key in the correct location
- Ensure the file is named exactly `serviceAccountKey.json`

### "Admin check failed"
- Clear browser cache and cookies
- Re-login to the system
- Check browser console for errors
