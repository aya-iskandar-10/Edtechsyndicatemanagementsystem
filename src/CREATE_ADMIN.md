# 👨‍💼 Create Admin User Guide

## Quick Method: Supabase Dashboard

### Step 1: Create User
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click **Authentication** in sidebar
4. Click **Users** tab
5. Click **Add User** button
6. Enter:
   - **Email**: `admin@edtech.com` (or your choice)
   - **Password**: `admin123456` (or your choice)
   - Check "Auto Confirm User" ✅
7. Click **Create User**

### Step 2: Add Admin Role
1. Find the user you just created
2. Click on the user to open details
3. Scroll to **User Metadata** section
4. Click **Edit** 
5. Replace the content with:
   ```json
   {
     "name": "Admin",
     "role": "admin"
   }
   ```
6. Click **Save**

### Step 3: Test Login
1. Open Flutter app
2. Click **Sign In**
3. Enter the email and password
4. You should see the **Admin Dashboard** 🎉

---

## SQL Method (Faster)

### Option 1: Create New Admin User
```sql
-- Run this in SQL Editor (Supabase Dashboard → SQL Editor)

-- Insert admin user
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'authenticated',
  'authenticated',
  'admin@edtech.com',
  crypt('admin123456', gen_salt('bf')),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"name":"Admin","role":"admin"}',
  NOW(),
  NOW(),
  '',
  '',
  '',
  ''
);
```

### Option 2: Convert Existing User to Admin
```sql
-- Run this in SQL Editor
-- Replace 'existing@email.com' with the user's email

UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'existing@email.com';
```

---

## API Method (Using curl)

### Step 1: Create User via Backend
```bash
# Replace YOUR_PROJECT and YOUR_ANON_KEY with actual values

curl -X POST \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "admin@edtech.com",
    "password": "admin123456",
    "name": "Admin"
  }'
```

### Step 2: Add Admin Role via SQL
Then run the SQL from Option 2 above to add the admin role.

---

## Verification

### Method 1: Check in Dashboard
1. Go to Authentication → Users
2. Click on your admin user
3. Check User Metadata shows:
   ```json
   {
     "name": "Admin",
     "role": "admin"
   }
   ```

### Method 2: Check in SQL
```sql
SELECT 
  email,
  raw_user_meta_data->>'role' as role,
  raw_user_meta_data->>'name' as name
FROM auth.users
WHERE email = 'admin@edtech.com';
```

Should return:
```
email              | role  | name
admin@edtech.com  | admin | Admin
```

### Method 3: Test in App
1. Sign in with admin credentials
2. You should see:
   - **Admin Dashboard** (not Member Dashboard)
   - Statistics cards (Total, Pending, Approved, Rejected)
   - Search bar and filter
   - List of applications

**Debug logs should show:**
```
Sign in successful - User: Admin, Admin: true
```

If you see `Admin: false`, the role is not set correctly!

---

## Multiple Admins

You can create multiple admin users by repeating the process with different emails:

```sql
-- Admin 1
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin1@edtech.com';

-- Admin 2
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin2@edtech.com';

-- Admin 3
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin3@edtech.com';
```

---

## Remove Admin Role

To convert admin back to regular user:

```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data - 'role'
WHERE email = 'admin@edtech.com';
```

Or set to specific value:
```sql
UPDATE auth.users
SET raw_user_meta_data = jsonb_set(
  raw_user_meta_data,
  '{role}',
  '"member"'
)
WHERE email = 'admin@edtech.com';
```

---

## Troubleshooting

### Problem: Admin shows as regular member

**Check 1: Verify role is set**
```sql
SELECT email, raw_user_meta_data 
FROM auth.users 
WHERE email = 'admin@edtech.com';
```

**Check 2: Sign out and sign in again**
- The role is loaded during authentication
- Must sign out and back in after changing role

**Check 3: Check debug logs**
Run app with `flutter run -v` and look for:
```
User metadata: {name: Admin, role: admin}
Sign in successful - User: Admin, Admin: true
```

### Problem: SQL query fails

- Make sure you're in **SQL Editor** (not Table Editor)
- Check email is correct in WHERE clause
- Ensure user exists first

### Problem: Can't create user via SQL

Use Supabase Dashboard method instead:
1. Authentication → Users → Add User
2. Then add role via SQL update

---

## Recommended Admin Credentials

For development:
- **Email**: `admin@edtech.com`
- **Password**: `admin123456`
- **Name**: `Admin`
- **Role**: `admin`

For production:
- Use strong password
- Use real email
- Enable MFA if available
- Use proper role-based access control

---

## Summary

**Easiest Method:**
1. Dashboard → Authentication → Users → Add User
2. Enter email/password
3. Edit user metadata → Add `"role": "admin"`
4. Sign in to app ✅

**Fastest Method:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'YOUR_EMAIL@example.com';
```

Then sign out and sign in again in the app!

---

Last updated: December 2025
