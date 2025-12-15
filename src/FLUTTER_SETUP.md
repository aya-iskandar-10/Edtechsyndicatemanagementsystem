# 🚀 Flutter App Setup Guide

## Step-by-Step Setup

### 1️⃣ Install Flutter

**macOS:**
```bash
# Download Flutter SDK
git clone https://github.com/flutter/flutter.git -b stable
export PATH="$PATH:`pwd`/flutter/bin"

# Verify installation
flutter doctor
```

**Windows:**
1. Download Flutter SDK from https://flutter.dev
2. Extract to `C:\flutter`
3. Add to PATH: `C:\flutter\bin`
4. Run `flutter doctor` in Command Prompt

**Linux:**
```bash
sudo snap install flutter --classic
flutter doctor
```

### 2️⃣ Setup IDE

**VS Code:**
1. Install "Flutter" extension
2. Install "Dart" extension
3. Restart VS Code

**Android Studio:**
1. Install Flutter plugin
2. Install Dart plugin
3. Restart IDE

### 3️⃣ Configure Supabase

1. **Get Credentials:**
   - Go to https://supabase.com/dashboard
   - Select your project
   - Go to Settings → API
   - Copy:
     - Project URL
     - Anon (public) key

2. **Update main.dart:**
   ```dart
   // Open lib/main.dart and replace:
   await Supabase.initialize(
     url: 'YOUR_PROJECT_URL_HERE',
     anonKey: 'YOUR_ANON_KEY_HERE',
   );
   ```

### 4️⃣ Install Dependencies

```bash
cd edtech_syndicate  # Navigate to project folder
flutter pub get      # Install all dependencies
```

### 5️⃣ Setup Emulators

**Android Emulator:**
```bash
# List available devices
flutter emulators

# Launch emulator
flutter emulators --launch <emulator_id>

# Or use Android Studio → AVD Manager
```

**iOS Simulator (macOS only):**
```bash
open -a Simulator

# Or: Xcode → Open Developer Tool → Simulator
```

### 6️⃣ Run the App

```bash
# Check connected devices
flutter devices

# Run on connected device
flutter run

# Run in release mode (faster)
flutter run --release

# Run on specific device
flutter run -d <device-id>
```

### 7️⃣ Create Admin Account

**Option A: Supabase Dashboard**
1. Go to Supabase Dashboard
2. Authentication → Users → Add User
3. Email: `admin@edtech.com`
4. Password: `admin123` (or your choice)
5. User Metadata:
   ```json
   {
     "name": "Admin",
     "role": "admin"
   }
   ```
6. Click "Create User"

**Option B: SQL Editor**
```sql
-- Create regular user first, then:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@edtech.com';
```

### 8️⃣ Test the App

#### As Member:
1. Launch app
2. Tap "Apply for Membership"
3. Create account
4. Fill all 5 form steps
5. Upload a test PDF resume
6. Submit application
7. View pending status

#### As Admin:
1. Sign out
2. Tap "Sign In"
3. Use admin credentials
4. View applications in dashboard
5. Tap an application
6. Tap "Approve"
7. Select expiry date
8. Confirm approval

#### Back to Member:
1. Sign out from admin
2. Sign in as member
3. View approved status
4. See QR code on membership card

## 🔧 Platform-Specific Setup

### Android Additional Setup

1. **AndroidManifest.xml** (`android/app/src/main/AndroidManifest.xml`):
   ```xml
   <manifest>
     <!-- Add permissions before <application> -->
     <uses-permission android:name="android.permission.INTERNET"/>
     <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
     <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
     
     <application>
       <!-- App config -->
     </application>
   </manifest>
   ```

2. **Minimum SDK** (`android/app/build.gradle`):
   ```gradle
   android {
     defaultConfig {
       minSdkVersion 21  // Ensure this is at least 21
     }
   }
   ```

### iOS Additional Setup

1. **Info.plist** (`ios/Runner/Info.plist`):
   ```xml
   <dict>
     <!-- Add before closing </dict> -->
     <key>NSPhotoLibraryUsageDescription</key>
     <string>We need access to select documents for your application</string>
     
     <key>NSCameraUsageDescription</key>
     <string>We need camera access to capture documents</string>
   </dict>
   ```

2. **Minimum iOS Version** (`ios/Podfile`):
   ```ruby
   platform :ios, '12.0'
   ```

3. **Install Pods:**
   ```bash
   cd ios
   pod install
   cd ..
   ```

## ✅ Verification Checklist

- [ ] Flutter doctor shows no errors
- [ ] Supabase credentials configured
- [ ] Dependencies installed (`flutter pub get`)
- [ ] Emulator/device connected
- [ ] App launches successfully
- [ ] Can create account
- [ ] Can submit application
- [ ] Admin account created
- [ ] Admin can review applications
- [ ] QR code generates on approval

## 🐛 Common Issues & Solutions

### "Gradle build failed"
```bash
cd android
./gradlew clean
cd ..
flutter clean
flutter pub get
flutter run
```

### "CocoaPods not installed" (iOS)
```bash
sudo gem install cocoapods
cd ios
pod install
cd ..
```

### "SDK version conflict"
- Open `pubspec.yaml`
- Ensure `sdk: '>=3.0.0 <4.0.0'`
- Run `flutter pub get`

### "Supabase initialization failed"
- Check internet connection
- Verify URL and key in `main.dart`
- Check Supabase project is active

### "File picker not working"
- Check platform permissions (see above)
- Restart app after adding permissions
- For iOS, run `cd ios && pod install`

## 📱 Quick Commands Reference

```bash
# Check Flutter installation
flutter doctor -v

# List devices
flutter devices

# Install dependencies
flutter pub get

# Clean build
flutter clean

# Run app
flutter run

# Build APK (Android)
flutter build apk

# Build for iOS
flutter build ios

# Check app size
flutter build apk --analyze-size

# Run tests
flutter test

# Format code
flutter format .

# Analyze code
flutter analyze
```

## 🎯 Next Steps

1. ✅ Complete setup above
2. 📖 Read FLUTTER_README.md for features
3. 🧪 Test the full workflow
4. 🎨 Customize colors/branding
5. 📦 Build for production

## 💡 Tips

- Use **hot reload** (press `r` in terminal) during development
- Use **hot restart** (press `R`) for state changes
- Check logs with `flutter logs`
- Use `flutter run -v` for verbose output
- Install Flutter DevTools for debugging

## 📞 Need Help?

1. Check Flutter doctor: `flutter doctor`
2. Read error messages carefully
3. Check Supabase dashboard for backend issues
4. Review device logs
5. Clear cache: `flutter clean`

---

Ready to start? Run `flutter pub get` then `flutter run`! 🚀
