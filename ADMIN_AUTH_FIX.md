# Admin Authentication Fix Guide

## Issue Description

You're experiencing a "permission denied for table users" error when trying to create announcements in the admin panel. This error occurs because:

1. The application is trying to access the `auth.users` table directly via `supabase.auth.getUser()`
2. Row Level Security (RLS) policies are blocking this access
3. The admin authentication check fails, preventing announcement creation

## Error Details

```
Failed to create announcement: permission denied for table users
Failed to load resource: the server responded with a status of 403 () (user_actions, line 0)
Failed to load resource: the server responded with a status of 403 () (announcements, line 0)
```

## Root Cause

The issue is in the `isCurrentUserAdmin()` function in `src/lib/supabase.js` which was trying to:
1. Call `supabase.auth.getUser()` to get the current user
2. Query the `admin_users` table to check admin status

However, the RLS policies were blocking access to the `auth.users` table, causing the entire operation to fail.

## Solution

I've created a comprehensive fix that:

1. **Creates secure database functions** that bypass RLS restrictions
2. **Updates the client code** to use these secure functions instead of direct table access
3. **Fixes RLS policies** to use the new secure functions

## Files Modified

### 1. Created: `fix-admin-auth-access.sql`
A comprehensive SQL script that:
- Creates secure functions: `is_current_user_admin()` and `get_current_admin_user()`
- Updates RLS policies to use these functions
- Ensures proper permissions are granted

### 2. Updated: `src/lib/supabase.js`
Modified the `isCurrentUserAdmin()` function to:
- Use `supabase.rpc('is_current_user_admin')` instead of `auth.getUser()`
- Use `auth.getSession()` instead of `auth.getUser()` for other functions
- Avoid direct access to the `auth.users` table

## Steps to Fix

### Step 1: Run the SQL Script

1. Go to your Supabase dashboard: https://supabase.com/dashboard/project/corcfxmrkhugmyqmbqkh/sql
2. Copy the entire contents of `fix-admin-auth-access.sql`
3. Paste it into the SQL Editor
4. Click "Run" to execute the script

### Step 2: Verify the Fix

1. The SQL script will output success messages
2. Check that the functions were created successfully
3. Verify that the RLS policies were updated

### Step 3: Test the Application

1. Go to your deployed application
2. Log in as admin (`admin@communicationmatters.org`)
3. Navigate to the Content Moderation tab
4. Try creating a new announcement
5. The "permission denied" error should be resolved

## What the Fix Does

### Secure Functions Created

1. **`is_current_user_admin()`**
   - Returns `BOOLEAN`
   - Uses `SECURITY DEFINER` to bypass RLS
   - Checks if current user is an active admin

2. **`get_current_admin_user()`**
   - Returns admin user details
   - Uses `SECURITY DEFINER` to bypass RLS
   - Provides safe access to admin information

### RLS Policies Updated

- **Announcements table**: Now uses `is_current_user_admin()` function
- **User actions table**: Updated to use secure function (if exists)
- **Admin users table**: Maintains existing secure policies

### Code Changes

- **`isCurrentUserAdmin()`**: Now uses `supabase.rpc('is_current_user_admin')`
- **Authentication checks**: Use `auth.getSession()` instead of `auth.getUser()`
- **Error handling**: Improved to handle RLS restrictions gracefully

## Expected Results

After applying this fix:

✅ Admin users can create announcements without permission errors
✅ Analytics data loads properly (403 errors resolved)
✅ User actions tracking works correctly
✅ All admin functionality restored
✅ Security maintained through proper RLS policies

## Verification Commands

After running the SQL script, you can verify the fix with these queries:

```sql
-- Check if functions exist
SELECT routine_name, routine_type 
FROM information_schema.routines 
WHERE routine_name IN ('is_current_user_admin', 'get_current_admin_user');

-- Check RLS policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename = 'announcements';

-- Test admin function (when logged in as admin)
SELECT is_current_user_admin();
```

## Troubleshooting

If you still experience issues:

1. **Ensure admin user exists**: The script creates `admin@communicationmatters.org`
2. **Check Supabase Auth**: Make sure the admin user exists in Supabase Auth
3. **Verify environment variables**: Ensure `REACT_APP_SUPABASE_URL` and `REACT_APP_SUPABASE_ANON_KEY` are set in Vercel
4. **Clear browser cache**: Hard refresh the application
5. **Check console logs**: Look for "User is admin: true" messages

## Security Notes

- The `SECURITY DEFINER` functions are safe because they only check admin status
- RLS policies are still enforced for all other operations
- No sensitive data is exposed through these functions
- Admin access is still properly controlled through the `admin_users` table

This fix resolves the authentication issues while maintaining security best practices.