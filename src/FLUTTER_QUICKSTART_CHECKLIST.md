# ✅ Flutter App Quick Start Checklist

Use this checklist to get your EdTech Syndicate Flutter app running in minutes!

## Prerequisites Setup

- [ ] **Flutter SDK installed** 
  - Run: `flutter doctor`
  - All checks should pass ✓

- [ ] **Emulator/Device ready**
  - Run: `flutter devices`
  - Should see at least one device

- [ ] **Supabase Project created**
  - Go to https://supabase.com/dashboard
  - Create new project or use existing

---

## Step 1: Install Dependencies ⏱️ 1 min

```bash
cd your_project_folder
flutter pub get
```

- [ ] No errors shown
- [ ] All packages downloaded

---

## Step 2: Configure Supabase ⏱️ 2 min

### Get Credentials
1. [ ] Open Supabase Dashboard
2. [ ] Go to Settings → API
3. [ ] Copy **Project URL**
4. [ ] Copy **Anon/Public Key** (NOT service role key!)

### Update Code
1. [ ] Open `lib/main.dart`
2. [ ] Find line ~12-15
3. [ ] Replace:
   ```dart
   url: 'YOUR_SUPABASE_URL',
   anonKey: 'YOUR_SUPABASE_ANON_KEY',
   ```
4. [ ] Save file

---

## Step 3: Deploy Backend ⏱️ 5 min

### Install Supabase CLI

**macOS:**
```bash
brew install supabase/tap/supabase
```

**Windows:**
```bash
npm install -g supabase
```

**Linux:**
```bash
brew install supabase/tap/supabase
```

- [ ] CLI installed
- [ ] Run: `supabase --version` to verify

### Deploy Function

```bash
# Login
supabase login

# Link project (get PROJECT_ID from dashboard URL)
supabase link --project-ref YOUR_PROJECT_ID

# Deploy
supabase functions deploy make-server-71a69640
```

- [ ] Login successful
- [ ] Project linked
- [ ] Function deployed ✓

### Test Backend

```bash
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health
```

- [ ] Returns: `{"status":"healthy","timestamp":"..."}`
- [ ] If not, check project URL and try again

---

## Step 4: Create Admin User ⏱️ 2 min

### Method 1: Supabase Dashboard (Easiest)

1. [ ] Go to Authentication → Users → Add User
2. [ ] Enter:
   - Email: `admin@edtech.com`
   - Password: `admin123456`
   - Check "Auto Confirm User" ✓
3. [ ] Click **Create User**
4. [ ] Click on the new user
5. [ ] Scroll to User Metadata → Edit
6. [ ] Replace with:
   ```json
   {
     "name": "Admin",
     "role": "admin"
   }
   ```
7. [ ] Save

### Method 2: SQL (Faster)

1. [ ] Go to SQL Editor
2. [ ] Run:
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'admin@edtech.com';
   ```
3. [ ] Query successful

---

## Step 5: Run the App ⏱️ 1 min

```bash
flutter run
```

- [ ] App compiles successfully
- [ ] App launches on device/emulator
- [ ] Landing page appears

---

## Step 6: Test Member Flow ⏱️ 5 min

1. [ ] Tap **"Apply for Membership"**
2. [ ] Tap **"Sign Up"** at bottom
3. [ ] Enter test credentials:
   - Name: Test User
   - Email: test@example.com
   - Password: test123456
4. [ ] Tap **"Create Account"**
5. [ ] Should redirect to application form
6. [ ] Fill all 5 steps:
   - [ ] Step 1: Personal info
   - [ ] Step 2: Professional background
   - [ ] Step 3: Academic info
   - [ ] Step 4: Upload test PDF (optional)
   - [ ] Step 5: Review
7. [ ] Tap **"Submit"**
8. [ ] Should see Member Dashboard
9. [ ] Status shows **"Pending Review"** 🟠

---

## Step 7: Test Admin Flow ⏱️ 3 min

1. [ ] Tap menu/logout
2. [ ] Tap **"Sign In"**
3. [ ] Enter admin credentials:
   - Email: admin@edtech.com
   - Password: admin123456
4. [ ] Should see **Admin Dashboard** 🎉
5. [ ] See statistics cards (Total: 1, Pending: 1)
6. [ ] See test user's application
7. [ ] Tap on application card
8. [ ] Review details
9. [ ] Tap **"Approve"**
10. [ ] Select expiry date (1 year from now)
11. [ ] Confirm
12. [ ] Application now shows **"Approved"** ✅

---

## Step 8: Verify Approval ⏱️ 2 min

1. [ ] Sign out from admin
2. [ ] Sign in as test user (test@example.com)
3. [ ] Should see:
   - [ ] Status: **"Approved"** 🟢
   - [ ] Green membership card
   - [ ] QR code displayed
   - [ ] Membership number shown
   - [ ] Expiry date visible

---

## Success! 🎉

Your EdTech Syndicate Flutter app is fully functional!

**Total time:** ~20 minutes

---

## Troubleshooting Quick Fixes

### ❌ App won't build
```bash
flutter clean
flutter pub get
flutter run
```

### ❌ "Supabase not initialized"
- Check credentials in `lib/main.dart`
- Make sure URL starts with `https://`
- Make sure you used anon key, not service role key

### ❌ "Failed to fetch" errors
```bash
# Re-deploy backend
supabase functions deploy make-server-71a69640

# Test health
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health
```

### ❌ Admin shows member interface
```sql
-- Run in SQL Editor
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@edtech.com';
```
Then sign out and sign in again.

### ❌ Still stuck?
See [FLUTTER_TROUBLESHOOTING.md](FLUTTER_TROUBLESHOOTING.md) for detailed solutions.

---

## What's Next?

- [ ] Customize branding/colors
- [ ] Add more test data
- [ ] Deploy to TestFlight (iOS) / Play Store Beta (Android)
- [ ] Enable production security rules
- [ ] Set up monitoring/analytics
- [ ] Configure email notifications

---

## Production Checklist

Before deploying to production:

- [ ] Change default admin password
- [ ] Use strong passwords
- [ ] Enable MFA in Supabase
- [ ] Set up proper CORS
- [ ] Configure rate limiting
- [ ] Add error tracking (Sentry, etc.)
- [ ] Test on multiple devices
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Submit to app stores

---

**Need Help?**

📖 [FLUTTER_README.md](FLUTTER_README.md) - Full documentation
🔧 [FLUTTER_TROUBLESHOOTING.md](FLUTTER_TROUBLESHOOTING.md) - Detailed solutions
👨‍💼 [CREATE_ADMIN.md](CREATE_ADMIN.md) - Admin user guide
⚙️ [FLUTTER_SETUP.md](FLUTTER_SETUP.md) - Complete setup guide

---

Last updated: December 2025
