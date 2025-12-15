# EdTech Syndicate Management System - User Guide

## 🎯 Overview

This is a comprehensive membership management system for an educational technology syndicate. The application handles the complete lifecycle of membership applications from submission to approval/rejection.

## 🏗️ Architecture

### Frontend Components
- **LandingPage**: Guest-facing homepage with syndicate information
- **ApplicationForm**: Multi-step form for membership applications
- **MemberDashboard**: Member portal showing status and membership card with QR code
- **AdminDashboard**: Admin interface for reviewing and managing applications
- **AuthModal**: Authentication (sign in/sign up)

### Backend (Supabase)
- **Authentication**: Supabase Auth for user management
- **Database**: Key-Value store for application data
- **Server**: Hono-based edge function handling all API requests

## 🚀 Getting Started

### 1. Create an Admin Account

**Option A: Via Supabase Dashboard**
1. Go to your Supabase Dashboard
2. Navigate to **Authentication > Users**
3. Click **"Add User"**
4. Enter email and password
5. In **User Metadata**, add:
   ```json
   {
     "name": "Admin Name",
     "role": "admin"
   }
   ```
6. Click **"Create User"**

**Option B: Via SQL Editor**
```sql
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'your-admin@email.com';
```

### 2. Test the Application

1. **As a Guest**: View the landing page and syndicate information
2. **As a Member**: Sign up and submit an application
3. **As Admin**: Sign in with admin credentials to review applications

## 📋 Features

### For Members
✅ Multi-step application form with validation
✅ Document uploads (Resume, Certificates, Recommendation Letters)
✅ Real-time application status tracking
✅ Digital membership card with QR code (when approved)
✅ Membership expiry tracking

### For Admins
✅ View all applications with filtering and search
✅ Review detailed application information
✅ Approve applications with custom expiry dates
✅ Reject applications with one click
✅ Statistics dashboard (total, pending, approved, rejected)
✅ Download applicant documents

## 🔄 Application Workflow

1. **Guest** views landing page
2. **Guest** clicks "Apply for Membership"
3. **Guest** creates account (becomes User)
4. **User** fills out multi-step application form:
   - Personal Information (name, email, phone)
   - Professional Background (position, organization, experience)
   - Academic Background (education, specialization, motivation)
   - Document Upload (resume, certificates, recommendation)
   - Review and Submit
5. **User** submits application → Status: **PENDING**
6. **Admin** reviews application
7. **Admin** approves or rejects:
   - **Approved**: Sets expiry date, generates membership number
   - **Rejected**: Application marked as rejected
8. **Member** views status card with QR code (if approved)

## 📊 Application Statuses

- **PENDING**: Submitted and awaiting admin review
- **APPROVED**: Accepted with active membership
- **REJECTED**: Not approved by admissions committee
- **EXPIRED**: Membership period has ended

## 🎨 Design Features

- Clean, modern UI with gradient backgrounds
- Responsive design (mobile and desktop)
- Professional color scheme (blue/purple gradient)
- Smooth transitions and hover effects
- Accessibility-friendly components

## 🔒 Security Features

- Authentication required for applications
- Admin role verification for admin panel access
- Secure file uploads via base64 encoding
- Session management with Supabase Auth
- Protected API endpoints with token validation

## 📱 Key User Journeys

### Member Application Journey
1. Land on homepage
2. Click "Apply for Membership"
3. Sign up for account
4. Complete 5-step application form
5. Upload required documents
6. Submit and receive confirmation
7. View application status on member dashboard
8. Download membership card (if approved)

### Admin Review Journey
1. Sign in as admin
2. View dashboard with application statistics
3. Filter/search applications
4. Click on application to view details
5. Review all information and documents
6. Approve (set expiry) or Reject
7. Applicant receives updated status

## 🛠️ Technical Stack

- **Frontend**: React + TypeScript
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **QR Codes**: qrcode library
- **Backend**: Supabase (Auth + Functions + Storage)
- **Server**: Hono (Edge Functions)
- **Database**: Supabase KV Store

## 💡 Smart Features

1. **Auto-generated Membership Numbers**: `EDU` prefix + timestamp
2. **QR Code Verification**: Scannable QR codes contain member data
3. **Multi-file Upload**: Support for multiple certificates
4. **Expiry Management**: Automatic expiry date tracking
5. **Search & Filter**: Find applications quickly
6. **Document Download**: Admin can download all submitted files
7. **Responsive Forms**: Mobile-friendly application process
8. **Progress Indicator**: Visual progress through application steps
9. **Form Validation**: Required fields and data validation
10. **Status Badges**: Color-coded status indicators

## 📝 Data Structure

### Application Object
```typescript
{
  id: string;
  userId: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  organization: string;
  yearsExperience: string;
  education: string;
  specialization: string;
  linkedin?: string;
  motivation: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  expiryDate?: string;
  membershipNumber?: string;
  files?: {
    resume?: string;
    certificates?: Array<{data: string, name: string}>;
    recommendation?: string;
  }
}
```

## 🔮 Future Enhancements (Ideas)

- Email notifications for status changes
- Batch approval/rejection
- Export applications to CSV/PDF
- Member renewal workflow
- Payment integration for membership fees
- Advanced analytics and reporting
- Member directory/networking features
- Event registration for members
- Certificate generation
- Multi-language support

## ⚠️ Important Notes

1. This is a **prototype** system - not designed for production-level PII security
2. For production use, implement:
   - Enhanced data encryption
   - GDPR/compliance features
   - Email server integration
   - Rate limiting
   - Advanced security measures
3. Admin users must be created manually (see setup instructions)
4. Files are stored as base64 in the database (for larger files, use Supabase Storage)

## 🆘 Troubleshooting

**Issue**: Can't access admin panel
- **Solution**: Ensure your user has `"role": "admin"` in user_metadata

**Issue**: Application not submitting
- **Solution**: Check that all required fields are filled and files are under size limit

**Issue**: QR code not generating
- **Solution**: Ensure application status is "approved" and membership number exists

**Issue**: Files not uploading
- **Solution**: Check file formats (PDF, DOC, DOCX for documents; PDF, JPG, PNG for certificates)

---

Built with ❤️ for EdTech Syndicate
