# Admin Interface Setup Instructions

## Overview
This document explains how to set up the admin interface for the Communication Matters Conference App, including database setup and user authentication.

## Prerequisites
- Supabase project created and configured
- Database connection established
- Access to Supabase SQL Editor and Auth dashboard

## Setup Steps

### 1. Create Admin Users Table

1. **Run the SQL Script**
   - Open your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `setup-admin-users.sql`
   - Execute the script

2. **What the Script Creates**
   - `admin_users` table to store admin user information
   - Row Level Security (RLS) policies for secure access
   - Helper function `is_admin(email)` to check admin status
   - Default admin user entry (requires Auth user creation)

### 2. Create Admin User in Supabase Auth

1. **Go to Supabase Auth Dashboard**
   - Navigate to Authentication > Users in your Supabase dashboard
   - Click "Add user" or "Invite user"

2. **Create Admin User**
   - Email: `admin@communicationmatters.org`
   - Password: `AdminPass2025!` (change this after first login)
   - Confirm the user creation

### 3. Admin Login Details

**Default Admin Credentials:**
- **Email:** `admin@communicationmatters.org`
- **Password:** `AdminPass2025!`

⚠️ **Important Security Notes:**
- Change the default password immediately after first login
- Use a strong, unique password
- Consider enabling 2FA in Supabase Auth settings
- The admin interface logs all login attempts

### 4. Access the Admin Interface

1. **Navigate to Admin Page**
   - URL: `http://localhost:3007/admin` (development)
   - Or your production domain + `/admin`

2. **Login Process**
   - Enter the admin email and password
   - The system will verify the user exists in Supabase Auth
   - Then check if the user is in the `admin_users` table
   - If both checks pass, access is granted

## Admin Interface Features

Once logged in, admins have access to:

### 📊 Dashboard
- Overview of system statistics
- Recent activity summary
- Quick access to common tasks

### ❓ Q&A Management
- View all submitted questions
- Answer questions
- Mark questions as answered
- Moderate question content

### 🛡️ Content Moderation
- Review flagged content
- Moderate user submissions
- Manage content policies

### 📈 Analytics
- View usage statistics
- Track user engagement
- Generate reports

## Adding Additional Admin Users

### Method 1: Through Supabase Dashboard

1. **Create Auth User**
   - Go to Authentication > Users
   - Add the new user with their email and password

2. **Add to Admin Users Table**
   - Go to Table Editor > admin_users
   - Insert new row with:
     - `email`: The user's email
     - `name`: The user's display name
     - `role`: 'admin' (or custom role)
     - `is_active`: true

### Method 2: Through SQL

```sql
-- First ensure the user exists in Supabase Auth
-- Then add them to admin_users table
INSERT INTO admin_users (email, name, role, is_active)
VALUES ('newadmin@communicationmatters.org', 'New Admin Name', 'admin', true);
```

## Troubleshooting

### Common Issues

1. **"No routes matched location '/admin'" warning**
   - This is a known React Router v6 development warning
   - The admin interface should still work correctly
   - The warning doesn't affect functionality

2. **Login fails with correct credentials**
   - Verify the user exists in Supabase Auth
   - Check the user is in the `admin_users` table
   - Ensure `is_active` is set to `true`
   - Check browser console for detailed error messages

3. **"Error checking admin profile" message**
   - Verify the `admin_users` table was created successfully
   - Check RLS policies are properly configured
   - Ensure the user's email matches exactly in both Auth and admin_users

4. **Admin interface shows blank page**
   - Check browser console for JavaScript errors
   - Verify all admin components are properly imported
   - Ensure CSS modules are loading correctly

### Debug Steps

1. Check Supabase logs for authentication errors
2. Verify database table structure matches expected schema
3. Test admin functions directly in SQL Editor
4. Check browser console for detailed error messages
5. Verify network requests in browser dev tools

## Security Considerations

- All admin actions are logged and auditable
- RLS policies prevent unauthorized data access
- Admin sessions expire according to Supabase Auth settings
- Consider implementing IP restrictions for production
- Regular security audits recommended

## Database Schema

### admin_users Table Structure

```sql
CREATE TABLE admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'admin',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Helper Functions

- `is_admin(email TEXT)`: Returns boolean indicating if email belongs to active admin

---

For additional support or questions, contact the development team or refer to the main project documentation.