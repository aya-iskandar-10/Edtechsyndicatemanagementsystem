# 📱 EdTech Syndicate - Flutter Mobile App

A comprehensive membership management system for EdTech syndicates, built with Flutter for iOS and Android.

## 🚀 Quick Start

### Prerequisites

- Flutter SDK (3.0.0 or higher)
- Dart SDK (2.17.0 or higher)
- Android Studio / Xcode for emulators
- Supabase account with project

### Installation

1. **Install Flutter dependencies:**
   ```bash
   flutter pub get
   ```

2. **Configure Supabase:**
   
   Open `/lib/main.dart` and replace the placeholders:
   ```dart
   await Supabase.initialize(
     url: 'YOUR_SUPABASE_URL',      // Replace with your Supabase URL
     anonKey: 'YOUR_SUPABASE_ANON_KEY', // Replace with your anon key
   );
   ```

3. **Run the app:**
   ```bash
   # For Android
   flutter run

   # For iOS
   flutter run --release

   # For specific device
   flutter devices
   flutter run -d <device_id>
   ```

## 📁 Project Structure

```
lib/
├── main.dart                          # App entry point
├── models/
│   └── application.dart               # Application data model
├── providers/
│   ├── auth_provider.dart             # Authentication state
│   └── application_provider.dart      # Application management
└── screens/
    ├── landing_page.dart              # Guest landing page
    ├── auth_screen.dart               # Sign in/Sign up
    ├── application_form_screen.dart   # Multi-step form
    ├── member_dashboard_screen.dart   # Member status & card
    └── admin_dashboard_screen.dart    # Admin panel
```

## ✨ Features

### 👤 Member Features
- ✅ Multi-step application form (5 steps)
- ✅ File uploads (Resume, Certificates, Recommendations)
- ✅ Real-time status tracking
- ✅ Digital membership card with QR code
- ✅ Beautiful gradient UI

### 👨‍💼 Admin Features
- ✅ Dashboard with statistics
- ✅ Search and filter applications
- ✅ Detailed application review
- ✅ One-tap approve/reject
- ✅ Set membership expiry dates

## 🎨 Screens Overview

### Landing Page
- Professional introduction to the syndicate
- Feature highlights
- Membership benefits
- Call-to-action buttons

### Authentication
- Sign in / Sign up toggle
- Email & password authentication
- Form validation
- Error handling

### Application Form (5 Steps)
1. **Personal Information**: Name, email, phone
2. **Professional Background**: Position, organization, experience
3. **Academic Background**: Education level, specialization, motivation
4. **Documents**: Upload resume, certificates, recommendation letters
5. **Review**: Summary before submission

### Member Dashboard
- Application status card with color coding
- Digital membership card with:
  - Member information
  - QR code (for approved members)
  - Membership number
  - Expiry date
- Contact information display

### Admin Dashboard
- Statistics cards (Total, Pending, Approved, Rejected)
- Search functionality
- Status filter dropdown
- Application cards with quick info
- Detailed modal view with approve/reject actions

## 🔧 Configuration

### Update Supabase Credentials

1. Get your Supabase credentials from the Supabase Dashboard:
   - Project URL
   - Anon/Public Key

2. Update in `/lib/main.dart`:
   ```dart
   await Supabase.initialize(
     url: 'https://your-project.supabase.co',
     anonKey: 'your-anon-key-here',
   );
   ```

### Create Admin Account

Use the same method as the web app:

**Via Supabase Dashboard:**
1. Authentication → Users → Add User
2. Enter email and password
3. Set user_metadata:
   ```json
   {
     "name": "Admin Name",
     "role": "admin"
   }
   ```

**Via SQL:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `supabase_flutter` | Backend integration |
| `provider` | State management |
| `qr_flutter` | QR code generation |
| `file_picker` | File upload |
| `google_fonts` | Typography |
| `intl` | Date formatting |

## 🎯 Status Colors

- **Pending**: 🟠 Orange - Under review
- **Approved**: 🟢 Green - Active membership
- **Rejected**: 🔴 Red - Not approved
- **Expired**: ⚫ Grey - Membership ended

## 📱 Platform Support

- ✅ **Android**: API 21+ (Android 5.0 Lollipop)
- ✅ **iOS**: iOS 12.0+
- ⚠️ **Web**: Not configured (can be added)
- ⚠️ **Desktop**: Not configured (can be added)

## 🔒 Security

- Email/password authentication via Supabase Auth
- Role-based access control (Member vs Admin)
- Secure token management
- File size validation (10MB limit)
- Protected API endpoints

## 🐛 Troubleshooting

### Issue: "Target of URI doesn't exist"
**Solution**: Run `flutter pub get`

### Issue: Supabase connection error
**Solution**: 
- Check your internet connection
- Verify Supabase credentials in `main.dart`
- Check Supabase project status

### Issue: File picker not working
**Solution**: 
- **Android**: Add permissions to `AndroidManifest.xml`
  ```xml
  <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"/>
  <uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
  ```
- **iOS**: Add to `Info.plist`
  ```xml
  <key>NSPhotoLibraryUsageDescription</key>
  <string>Need access to upload documents</string>
  ```

### Issue: QR code not displaying
**Solution**: Ensure application status is "approved" and membership number exists

## 🚀 Building for Production

### Android APK
```bash
flutter build apk --release
# Output: build/app/outputs/flutter-apk/app-release.apk
```

### Android App Bundle (for Play Store)
```bash
flutter build appbundle --release
# Output: build/app/outputs/bundle/release/app-release.aab
```

### iOS
```bash
flutter build ios --release
# Then open in Xcode and archive
```

## 📊 State Management

The app uses **Provider** for state management with two main providers:

### AuthProvider
- Manages authentication state
- Handles sign in/sign up/sign out
- Stores user info and tokens
- Checks admin role

### ApplicationProvider
- Manages application data
- Handles form submission
- Fetches applications (member & admin)
- Approve/reject operations

## 🎨 Theming

The app uses a consistent color scheme:
- **Primary**: Blue (#2563EB)
- **Secondary**: Purple (#9333EA)
- **Success**: Green
- **Warning**: Orange
- **Error**: Red

Gradient backgrounds and Material Design 3 components create a modern, professional look.

## 📝 Testing Workflow

1. **Install app** on emulator/device
2. **Create account** via Sign Up
3. **Fill application form** through all 5 steps
4. **Upload documents** (test with small PDFs)
5. **Submit application**
6. **View member dashboard** with pending status
7. **Sign out** and **sign in as admin**
8. **Review application** in admin dashboard
9. **Approve** with expiry date
10. **Sign back in as member** to see approved status with QR code

## 🔮 Future Enhancements

- [ ] Push notifications for status changes
- [ ] In-app document viewer
- [ ] Offline support
- [ ] Biometric authentication
- [ ] Share membership card
- [ ] Export application as PDF
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Analytics integration

## 📄 License

This project is provided for educational purposes.

## 🆘 Support

For issues:
1. Check troubleshooting section
2. Verify Supabase backend is running
3. Check Flutter doctor: `flutter doctor`
4. Review device logs: `flutter logs`

---

**Built with Flutter** 💙

Last Updated: December 2025
