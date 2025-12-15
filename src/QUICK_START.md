# 🚀 Quick Start Guide

## ⚡ Get Running in 5 Minutes

### Step 1: Create Admin Account (Required)

Choose one method:

**A. Via Supabase Dashboard (Easiest)**
```
1. Open Supabase Dashboard
2. Go to: Authentication → Users → Add User
3. Enter:
   - Email: admin@edtech.com
   - Password: (choose secure password)
   - User Metadata:
     {
       "name": "Admin",
       "role": "admin"
     }
4. Click "Create User"
```

**B. Via SQL Editor**
```sql
-- First create user normally, then update:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@email.com';
```

### Step 2: Test the Flow

#### 🔵 Test as Member
1. Click "Apply for Membership"
2. Sign up with test email
3. Fill application form (5 steps)
4. Submit application
5. View pending status on member dashboard

#### 🟣 Test as Admin
1. Sign out (if signed in as member)
2. Click "Sign In" or "Admin"
3. Use admin credentials from Step 1
4. Review application in admin dashboard
5. Click Approve, set expiry date
6. Application approved!

#### 🟢 View as Approved Member
1. Sign out from admin
2. Sign in as the member from test 1
3. View membership card with QR code
4. See membership number and expiry date

### Step 3: Explore Features

**Member Features:**
- ✅ Multi-step application form
- ✅ Document uploads (resume, certificates)
- ✅ Status tracking
- ✅ Digital membership card
- ✅ QR code for verification

**Admin Features:**
- ✅ Application dashboard with stats
- ✅ Search and filter
- ✅ Detailed application review
- ✅ One-click approve/reject
- ✅ Document downloads

---

## 📱 User Roles

| Role | Email Pattern | Access |
|------|--------------|--------|
| **Guest** | None | View landing page only |
| **Member** | Any email | Submit & view applications |
| **Admin** | Has `role: "admin"` | Review & manage all applications |

---

## 🎯 Quick Test Accounts

Create these for testing:

```javascript
// Admin
Email: admin@edtech.com
Password: admin123
Metadata: {"name": "Admin", "role": "admin"}

// Member 1
Email: member1@example.com
Password: member123
Metadata: {"name": "John Doe"}

// Member 2
Email: member2@example.com
Password: member123
Metadata: {"name": "Jane Smith"}
```

---

## 🔍 Verify Everything Works

### ✅ Checklist

- [ ] Landing page loads
- [ ] Can create new account
- [ ] Can submit application
- [ ] Application appears in member dashboard
- [ ] Admin can sign in
- [ ] Admin sees application in dashboard
- [ ] Admin can approve application
- [ ] Member sees approved status
- [ ] QR code generates
- [ ] Membership card displays correctly

---

## 🐛 Common Issues

### "Unauthorized" Error
**Cause:** Not signed in or invalid token
**Fix:** Sign out and sign back in

### "Application not found"
**Cause:** User hasn't submitted application yet
**Fix:** Submit application first

### Can't access admin panel
**Cause:** User doesn't have admin role
**Fix:** Add `"role": "admin"` to user_metadata

### QR code not showing
**Cause:** Application not approved
**Fix:** Admin needs to approve application first

---

## 📊 Application Lifecycle

```
1. Guest visits site
   ↓
2. Creates account (becomes User)
   ↓
3. Submits application
   ↓ STATUS: PENDING
4. Admin reviews
   ↓
5. Admin approves/rejects
   ↓ STATUS: APPROVED or REJECTED
6. Member views status
   ↓ (if approved)
7. Member gets QR code & card
```

---

## 🎨 UI Navigation

**Landing Page**
- Apply for Membership → Application Form
- Sign In → Auth Modal
- Admin → Admin Panel (if admin)

**Application Form**
- 5 steps with progress bar
- Previous/Next navigation
- Submit → Member Dashboard

**Member Dashboard**
- View status card
- See QR code (if approved)
- Back to Home

**Admin Dashboard**
- View all applications
- Search & filter
- Click application → Detail modal
- Approve/Reject buttons

---

## 💡 Pro Tips

1. **Use the helper widgets** at bottom of landing page:
   - Bottom-right: Admin setup instructions
   - Bottom-left: Quick test account reference

2. **Test the full flow** before customizing

3. **Check browser console** if something doesn't work

4. **Admin role is crucial** - must be set in user_metadata

5. **File uploads** have 10MB limit per file

6. **QR codes** contain: ID, name, membership #, status, expiry

---

## 📞 Need Help?

1. Check GUIDE.md for detailed docs
2. Check README.md for architecture
3. Review troubleshooting section
4. Check Supabase logs
5. Check browser console

---

**Ready to go? Start with Step 1 above!** 🚀
