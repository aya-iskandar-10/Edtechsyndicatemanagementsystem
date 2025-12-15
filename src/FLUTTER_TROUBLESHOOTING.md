# 🔧 Flutter App Troubleshooting Guide

## Authentication Issues

### Problem: "AuthRetryableFetchException" when signing in

**Causes:**
1. Supabase credentials not configured
2. Backend server not deployed
3. Network connectivity issues
4. CORS configuration

**Solutions:**

#### Step 1: Verify Supabase Configuration
Check `lib/main.dart` has correct credentials:
```dart
await Supabase.initialize(
  url: 'https://YOUR_PROJECT.supabase.co',  // Must be YOUR actual URL
  anonKey: 'YOUR_ANON_KEY',                  // Must be YOUR actual key
);
```

**Get your credentials:**
1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL
   - Anon/Public key (NOT service role key)

#### Step 2: Deploy Backend Server

The Flutter app requires the backend server to be deployed to Supabase Edge Functions.

**Deploy using Supabase CLI:**

1. **Install Supabase CLI:**
   ```bash
   # macOS
   brew install supabase/tap/supabase
   
   # Windows (via npm)
   npm install -g supabase
   
   # Linux
   brew install supabase/tap/supabase
   ```

2. **Login to Supabase:**
   ```bash
   supabase login
   ```

3. **Link your project:**
   ```bash
   supabase link --project-ref YOUR_PROJECT_ID
   ```
   
   Get PROJECT_ID from your Supabase dashboard URL:
   `https://supabase.com/dashboard/project/YOUR_PROJECT_ID`

4. **Deploy the edge function:**
   ```bash
   supabase functions deploy make-server-71a69640
   ```

5. **Verify deployment:**
   ```bash
   # Test health endpoint
   curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health
   ```
   
   Should return: `{"status":"healthy","timestamp":"..."}`

#### Step 3: Test with Debug Logs

Run the app in debug mode to see detailed logs:
```bash
flutter run -v
```

Check the console for:
- "Attempting sign in for: [email]"
- "Sign in response - Session exists: true/false"
- "User metadata: {...}"
- Any error messages

---

## Admin Role Not Detected

### Problem: Admin user sees member interface instead of admin dashboard

**Solution 1: Set role via Supabase Dashboard**

1. Go to Supabase Dashboard
2. Authentication → Users
3. Find your admin user
4. Click on the user
5. Scroll to "User Metadata"
6. Click "Edit"
7. Add:
   ```json
   {
     "name": "Admin Name",
     "role": "admin"
   }
   ```
8. Save
9. Sign out and sign in again in the Flutter app

**Solution 2: Set role via SQL Editor**

1. Go to SQL Editor in Supabase Dashboard
2. Run this query (replace email):
   ```sql
   UPDATE auth.users
   SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
   WHERE email = 'admin@example.com';
   ```
3. Sign out and sign in again

**Solution 3: Create admin via backend**

Create a custom signup for admin:
```bash
curl -X POST https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/signup \
  -H "Content-Type: application/json" \
  -H "apikey: YOUR_ANON_KEY" \
  -d '{
    "email": "admin@example.com",
    "password": "securepassword123",
    "name": "Admin User"
  }'
```

Then manually add role via Dashboard or SQL.

**Verify admin role:**
- Check debug logs when signing in
- Should see: "Sign in successful - User: Admin Name, Admin: true"
- If shows "Admin: false", role is not set correctly

---

## Network & Backend Issues

### Problem: "Failed to fetch" or timeout errors

**Check 1: Internet Connection**
- Ensure device/emulator has internet access
- Try opening a browser

**Check 2: Supabase Project Status**
- Go to Supabase Dashboard
- Check if project is active (not paused)
- Free tier projects pause after inactivity

**Check 3: Edge Function Status**
```bash
# View function logs
supabase functions logs make-server-71a69640

# Test health endpoint
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health
```

**Check 4: CORS Configuration**
The backend already has CORS enabled, but verify in `/supabase/functions/server/index.tsx`:
```typescript
app.use('*', cors());
```

---

## File Upload Issues

### Problem: File picker not working

**Android:**

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<manifest>
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
  
  <application>
    ...
  </application>
</manifest>
```

**iOS:**

Add to `ios/Runner/Info.plist`:
```xml
<dict>
  <key>NSPhotoLibraryUsageDescription</key>
  <string>We need access to select documents</string>
  
  <key>NSCameraUsageDescription</key>
  <string>We need camera access to capture documents</string>
  
  ...
</dict>
```

Then:
```bash
cd ios
pod install
cd ..
flutter clean
flutter run
```

### Problem: "File size too large"

- Maximum file size is 10MB
- Check file size before uploading
- Compress PDFs if needed

---

## Application Submission Issues

### Problem: Application not appearing after submission

**Debug Steps:**

1. Check console logs for errors
2. Verify user is authenticated
3. Check backend logs:
   ```bash
   supabase functions logs make-server-71a69640
   ```
4. Manually check KV store in Supabase Dashboard:
   - Database → Table Editor
   - Find `kv_store_71a69640` table
   - Look for key like `application:USER_ID`

**Test backend directly:**
```bash
# Get access token from sign in
# Then test application endpoint

curl -X GET \
  https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/application/USER_ID \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## QR Code Not Showing

### Problem: QR code doesn't appear on approved membership card

**Requirements:**
- Application status must be "approved"
- Membership number must exist
- Data must be valid JSON

**Debug:**
1. Check application status in member dashboard
2. Look for approval date and membership number
3. If missing, admin needs to re-approve with expiry date

---

## Build & Compilation Issues

### Problem: "Gradle build failed" (Android)

```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

### Problem: "CocoaPods not installed" (iOS)

```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
flutter run
```

### Problem: "SDK version mismatch"

Check `pubspec.yaml`:
```yaml
environment:
  sdk: '>=3.0.0 <4.0.0'
```

Then:
```bash
flutter clean
flutter pub get
```

### Problem: "Package not found"

```bash
flutter pub get
flutter pub upgrade
```

---

## Common Error Messages

### "Invalid login credentials"
- Check email/password are correct
- User must be created first (sign up)
- Check Supabase Dashboard → Authentication → Users

### "Unauthorized" (401)
- Access token expired or invalid
- Sign out and sign in again
- Check session in debug logs

### "Forbidden" (403)
- Trying to access admin endpoint without admin role
- Set admin role (see Admin Role section above)

### "Application not found" (404)
- User hasn't submitted application yet
- Application was deleted
- Check KV store in database

### "Email already registered"
- Use different email for sign up
- Or sign in with existing account

---

## Testing Checklist

Use this to verify everything works:

- [ ] App launches without errors
- [ ] Landing page displays correctly
- [ ] Can navigate to sign up
- [ ] Can create new account
- [ ] Receives confirmation (or auto-confirmed)
- [ ] Can sign in with credentials
- [ ] Member dashboard loads
- [ ] Application form opens
- [ ] All 5 steps work
- [ ] Can upload files
- [ ] Can submit application
- [ ] Status shows "Pending"
- [ ] Can sign out
- [ ] Can sign in as admin (with admin credentials)
- [ ] Admin dashboard shows applications
- [ ] Can search/filter
- [ ] Can view application details
- [ ] Can approve application
- [ ] Can set expiry date
- [ ] Member sees "Approved" status
- [ ] QR code displays
- [ ] Membership number shows

---

## Debug Commands Reference

```bash
# Check Flutter installation
flutter doctor -v

# Run with verbose logging
flutter run -v

# View real-time logs
flutter logs

# Clean build
flutter clean

# Check connected devices
flutter devices

# Analyze code for issues
flutter analyze

# Check dependencies
flutter pub get

# View Supabase function logs
supabase functions logs make-server-71a69640

# Test backend health
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health
```

---

## Still Having Issues?

1. **Check all credentials** are correctly set
2. **Deploy backend** to Supabase Edge Functions
3. **Run with verbose logs**: `flutter run -v`
4. **Check Supabase logs** in dashboard
5. **Verify admin role** is set in user metadata
6. **Test backend** directly with curl
7. **Clear app data** and try again

---

## Quick Fix Checklist

Most issues are caused by:
- ❌ Supabase credentials not set correctly
- ❌ Backend not deployed to Edge Functions
- ❌ Admin role not set in user metadata
- ❌ Project paused (free tier)
- ❌ No internet connection
- ❌ Dependencies not installed

**Quick verification:**
```bash
# 1. Check credentials in lib/main.dart
# 2. Deploy backend:
supabase functions deploy make-server-71a69640

# 3. Test backend:
curl https://YOUR_PROJECT.supabase.co/functions/v1/make-server-71a69640/health

# 4. Check admin role in Supabase Dashboard
# 5. Run app:
flutter pub get
flutter run -v
```

---

Last updated: December 2025
