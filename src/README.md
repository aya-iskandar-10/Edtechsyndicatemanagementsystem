# 🎓 EdTech Syndicate Management System

A comprehensive membership management system for educational technology syndicates, built with React, TypeScript, and Supabase.

## ✨ Features

### 👥 For Members
- **Multi-step Application Form** - Easy-to-follow 5-step application process
- **Document Uploads** - Upload resume/CV, certificates, and recommendation letters
- **Status Tracking** - Real-time application status (Pending, Approved, Rejected, Expired)
- **Digital Membership Card** - Beautiful membership card with QR code verification
- **Member Dashboard** - View your application status and membership details

### 👨‍💼 For Admins
- **Application Review** - Comprehensive admin dashboard to review all applications
- **Search & Filter** - Quickly find applications by name, email, or organization
- **Statistics Dashboard** - Visual overview of total, pending, approved, and rejected applications
- **Approve/Reject** - One-click approval (with expiry date) or rejection
- **Document Management** - Download and review all submitted documents
- **Member Management** - Set membership expiry dates and generate membership numbers

### 🔒 Security & Authentication
- Supabase Authentication with role-based access control
- Protected API endpoints with token validation
- Secure file uploads via base64 encoding
- Admin-only routes and features

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────┐
│                   Frontend (React)                  │
│  - Landing Page                                     │
│  - Application Form (Multi-step)                    │
│  - Member Dashboard (with QR Code)                  │
│  - Admin Dashboard (Review & Approve)               │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ API Calls (Fetch)
                       ↓
┌─────────────────────────────────────────────────────┐
│          Backend (Supabase Edge Functions)          │
│  - Hono Server                                      │
│  - Authentication Middleware                         │
│  - Application CRUD Operations                       │
│  - Admin Operations (Approve/Reject)                 │
└──────────────────────┬──────────────────────────────┘
                       │
                       │ Supabase Client
                       ↓
┌─────────────────────────────────────────────────────┐
│               Database (KV Store)                   │
│  - User Applications                                │
│  - Application Files (base64)                       │
│  - Status & Metadata                                │
└─────────────────────────────────────────────────────┘
```

## 🚀 Getting Started

### Prerequisites
- Supabase account and project
- Admin account with proper role metadata

### 1. Setup Admin Account

Create an admin user in your Supabase project:

**Via Supabase Dashboard:**
1. Go to Authentication > Users
2. Click "Add User"
3. Enter email and password
4. In User Metadata, add:
   ```json
   {
     "name": "Admin Name",
     "role": "admin"
   }
   ```
5. Click "Create User"

**Via SQL Editor:**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
```

### 2. Test the Application

#### As a Guest
1. Visit the landing page
2. Read about the syndicate
3. View membership benefits

#### As a Member
1. Click "Apply for Membership"
2. Create an account
3. Complete the 5-step application:
   - Personal Information
   - Professional Background
   - Academic Background
   - Document Upload
   - Review & Submit
4. View your application status on the member dashboard

#### As an Admin
1. Click "Admin" or "Admin Panel"
2. Sign in with admin credentials
3. Review applications:
   - View all applications with stats
   - Search and filter
   - View detailed information
   - Download documents
   - Approve (with expiry date) or reject

## 📋 Application Workflow

```
Guest → Sign Up → Complete Application → Submit
                                           ↓
                                      Status: PENDING
                                           ↓
                                    Admin Reviews
                                           ↓
                            ┌──────────────┴───────────────┐
                            ↓                              ↓
                       APPROVED                        REJECTED
                    (with expiry date)                (can reapply)
                    + Membership #
                    + QR Code
```

## 🎨 Application Statuses

| Status | Description | Icon | Color |
|--------|-------------|------|-------|
| **Pending** | Submitted, awaiting review | ⏱️ | Yellow |
| **Approved** | Accepted with active membership | ✅ | Green |
| **Rejected** | Not approved by committee | ❌ | Red |
| **Expired** | Membership period ended | ⚠️ | Gray |

## 💾 Data Structure

### Application Object
```typescript
{
  id: string;                    // Unique application ID
  userId: string;                // User's auth ID
  fullName: string;              // Applicant name
  email: string;                 // Contact email
  phone: string;                 // Phone number
  position: string;              // Current job title
  organization: string;          // Institution/Company
  yearsExperience: string;       // Years in EdTech
  education: string;             // Highest degree
  specialization: string;        // Area of expertise
  linkedin?: string;             // LinkedIn profile (optional)
  motivation: string;            // Why join statement
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;           // ISO timestamp
  reviewedAt?: string;           // ISO timestamp
  expiryDate?: string;           // ISO date (YYYY-MM-DD)
  membershipNumber?: string;     // Generated number (EDU...)
  files?: {
    resume?: string;             // Base64 encoded
    resumeName?: string;
    certificates?: Array<{
      data: string;              // Base64 encoded
      name: string;
    }>;
    recommendation?: string;     // Base64 encoded
    recommendationName?: string;
  }
}
```

## 🔧 Technical Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18 + TypeScript |
| **Styling** | Tailwind CSS v4 |
| **Icons** | Lucide React |
| **QR Codes** | qrcode library |
| **Authentication** | Supabase Auth |
| **Backend** | Supabase Edge Functions (Hono) |
| **Database** | Supabase KV Store |
| **Hosting** | Figma Make / Supabase |

## 📦 API Endpoints

### Public Endpoints
- `POST /make-server-71a69640/signup` - Create new user account
- `GET /make-server-71a69640/health` - Health check

### Authenticated Endpoints
- `POST /make-server-71a69640/application` - Submit application
- `GET /make-server-71a69640/application/:userId` - Get user's application

### Admin-Only Endpoints
- `GET /make-server-71a69640/admin/applications` - List all applications
- `POST /make-server-71a69640/admin/application/:id/approve` - Approve application
- `POST /make-server-71a69640/admin/application/:id/reject` - Reject application

## 🎯 Smart Features

1. **Auto-generated Membership Numbers** - `EDU` + timestamp-based unique ID
2. **QR Code Generation** - Scannable codes with member verification data
3. **Multi-file Upload Support** - Accept multiple certificates
4. **Real-time Status Updates** - Instant feedback on application status
5. **File Size Validation** - 10MB limit per file with user notifications
6. **Progress Tracking** - Visual progress bar through application steps
7. **Form Validation** - Step-by-step validation with helpful error messages
8. **Responsive Design** - Works seamlessly on desktop and mobile
9. **Search & Filter** - Powerful admin tools to manage applications
10. **Statistics Dashboard** - Visual overview of application metrics

## 📱 Responsive Design

The application is fully responsive and optimized for:
- 📱 Mobile devices (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)
- 🖥️ Large screens (1440px+)

## 🔮 Future Enhancements

- [ ] Email notifications for status changes
- [ ] Batch approval/rejection operations
- [ ] Export applications to CSV/PDF
- [ ] Member renewal workflow
- [ ] Payment integration for membership fees
- [ ] Advanced analytics and reporting
- [ ] Member directory and networking features
- [ ] Event registration system
- [ ] Certificate generation and printing
- [ ] Multi-language support (i18n)
- [ ] Calendar integration
- [ ] Mobile app (React Native)

## ⚠️ Important Notes

### Production Considerations

This is a **prototype system** suitable for development and testing. For production deployment:

1. **Enhanced Security**
   - Implement end-to-end encryption for sensitive data
   - Add rate limiting to prevent abuse
   - Use Supabase Storage for large files instead of base64
   - Add CAPTCHA to prevent bot submissions

2. **Compliance**
   - Implement GDPR/CCPA compliance features
   - Add data retention policies
   - Include terms of service and privacy policy
   - Implement audit logging

3. **Infrastructure**
   - Set up proper email service (SendGrid, AWS SES, etc.)
   - Configure CDN for assets
   - Implement database backups
   - Set up monitoring and alerting

4. **User Experience**
   - Add email verification
   - Implement password reset flow
   - Add notification system
   - Create help documentation

## 🐛 Troubleshooting

### Issue: Can't access admin panel
**Solution:** Ensure your user has `"role": "admin"` in user_metadata. Check via Supabase Dashboard > Authentication > Users.

### Issue: Application not submitting
**Solution:** 
- Check all required fields are filled
- Ensure files are under 10MB
- Check browser console for errors
- Verify Supabase connection

### Issue: QR code not generating
**Solution:** 
- Ensure application status is "approved"
- Check that membership number exists
- Verify browser supports canvas

### Issue: Files not uploading
**Solution:** 
- Check file formats (PDF, DOC, DOCX for documents; PDF, JPG, PNG for certificates)
- Ensure file size is under 10MB
- Check browser permissions

## 📄 License

This project is provided as-is for educational and demonstration purposes.

## 🤝 Support

For questions or issues:
1. Check the troubleshooting section
2. Review the GUIDE.md file
3. Check Supabase logs in the dashboard
4. Review browser console for errors

---

Built with ❤️ for EdTech Syndicate Management

**Last Updated:** December 2025
