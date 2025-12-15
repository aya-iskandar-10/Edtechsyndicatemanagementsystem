import { useState, useEffect } from 'react';
import { ArrowLeft, User, Mail, Phone, Briefcase, Calendar, Download, QrCode, CheckCircle, Clock, XCircle, AlertCircle } from 'lucide-react';
import QRCode from 'qrcode';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface MemberDashboardProps {
  userId: string;
  accessToken: string;
  onBack: () => void;
  onSignOut: () => void;
}

interface Application {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  organization: string;
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  submittedAt: string;
  reviewedAt?: string;
  expiryDate?: string;
  membershipNumber?: string;
}

export function MemberDashboard({ userId, accessToken, onBack, onSignOut }: MemberDashboardProps) {
  const [application, setApplication] = useState<Application | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplication();
  }, []);

  useEffect(() => {
    if (application && application.status === 'approved') {
      generateQRCode();
    }
  }, [application]);

  const fetchApplication = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/application/${userId}`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch application');
      }

      const data = await response.json();
      setApplication(data);
    } catch (err: any) {
      console.error('Error fetching application:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!application) return;

    const qrData = JSON.stringify({
      id: application.id,
      name: application.fullName,
      membershipNumber: application.membershipNumber,
      status: application.status,
      expiryDate: application.expiryDate
    });

    try {
      const url = await QRCode.toDataURL(qrData, {
        width: 300,
        margin: 2,
        color: {
          dark: '#1e40af',
          light: '#ffffff'
        }
      });
      setQrCodeUrl(url);
    } catch (err) {
      console.error('Error generating QR code:', err);
    }
  };

  const downloadMembershipCard = () => {
    const card = document.getElementById('membership-card');
    if (!card) return;

    // Simple download - in production, you'd use html2canvas or similar
    alert('Membership card download functionality would be implemented here using html2canvas or similar library');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">Unable to Load Dashboard</h3>
          <p className="text-gray-600 mb-4">{error || 'Application not found'}</p>
          <button onClick={onBack} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const getStatusConfig = (status: Application['status']) => {
    switch (status) {
      case 'approved':
        return {
          icon: <CheckCircle className="w-6 h-6" />,
          text: 'Approved',
          color: 'text-green-600',
          bg: 'bg-green-100',
          borderColor: 'border-green-300'
        };
      case 'pending':
        return {
          icon: <Clock className="w-6 h-6" />,
          text: 'Pending Review',
          color: 'text-yellow-600',
          bg: 'bg-yellow-100',
          borderColor: 'border-yellow-300'
        };
      case 'rejected':
        return {
          icon: <XCircle className="w-6 h-6" />,
          text: 'Rejected',
          color: 'text-red-600',
          bg: 'bg-red-100',
          borderColor: 'border-red-300'
        };
      case 'expired':
        return {
          icon: <AlertCircle className="w-6 h-6" />,
          text: 'Expired',
          color: 'text-gray-600',
          bg: 'bg-gray-100',
          borderColor: 'border-gray-300'
        };
    }
  };

  const statusConfig = getStatusConfig(application.status);
  const isExpired = application.expiryDate && new Date(application.expiryDate) < new Date();

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </button>
          <button
            onClick={onSignOut}
            className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </div>

        <div className="mb-6">
          <h2 className="text-gray-900">Member Dashboard</h2>
          <p className="text-gray-600">Welcome back, {application.fullName}</p>
        </div>

        {/* Status Alert */}
        <div className={`${statusConfig.bg} border ${statusConfig.borderColor} rounded-xl p-6 mb-6`}>
          <div className="flex items-center gap-3">
            <div className={statusConfig.color}>
              {statusConfig.icon}
            </div>
            <div>
              <h3 className={`${statusConfig.color} mb-1`}>
                Application Status: {statusConfig.text}
              </h3>
              <p className="text-sm text-gray-700">
                {application.status === 'pending' && 'Your application is being reviewed by the admissions committee. You will receive an email notification once a decision is made.'}
                {application.status === 'approved' && !isExpired && 'Congratulations! Your membership is active. Use your QR code for verification at syndicate events.'}
                {application.status === 'approved' && isExpired && 'Your membership has expired. Please contact the admissions office to renew.'}
                {application.status === 'rejected' && 'Unfortunately, your application was not approved at this time. You may reapply after 6 months.'}
                {application.status === 'expired' && 'Your membership has expired. Please submit a renewal application.'}
              </p>
            </div>
          </div>
        </div>

        {/* Membership Card */}
        <div id="membership-card" className="bg-gradient-to-br from-blue-600 via-purple-600 to-blue-800 rounded-2xl shadow-2xl overflow-hidden mb-6">
          <div className="p-8 text-white">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h3 className="text-white mb-1">EdTech Syndicate</h3>
                <p className="text-blue-100">Professional Membership</p>
              </div>
              {application.membershipNumber && (
                <div className="text-right">
                  <p className="text-sm text-blue-100">Member #</p>
                  <p className="font-mono">{application.membershipNumber}</p>
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-blue-100 mb-1">Full Name</p>
                  <p className="text-xl">{application.fullName}</p>
                </div>
                
                <div>
                  <p className="text-sm text-blue-100 mb-1">Position</p>
                  <p>{application.position}</p>
                </div>
                
                <div>
                  <p className="text-sm text-blue-100 mb-1">Organization</p>
                  <p>{application.organization}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-blue-100 mb-1">Status</p>
                    <p className="uppercase text-sm font-semibold">{application.status}</p>
                  </div>
                  {application.expiryDate && (
                    <div>
                      <p className="text-sm text-blue-100 mb-1">Expires</p>
                      <p className="text-sm">{new Date(application.expiryDate).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>

              {application.status === 'approved' && qrCodeUrl && (
                <div className="flex items-center justify-center">
                  <div className="bg-white p-4 rounded-xl">
                    <img src={qrCodeUrl} alt="Membership QR Code" className="w-48 h-48" />
                    <p className="text-center text-xs text-gray-600 mt-2">Scan for verification</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="bg-black/20 backdrop-blur-sm px-8 py-4 flex items-center justify-between">
            <p className="text-sm text-blue-100">
              Member since {new Date(application.submittedAt).toLocaleDateString()}
            </p>
            {application.status === 'approved' && (
              <button
                onClick={downloadMembershipCard}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors text-sm"
              >
                <Download className="w-4 h-4" />
                Download Card
              </button>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-gray-900 mb-4">Contact Information</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-gray-900">{application.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Phone className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="text-gray-900">{application.phone}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Calendar className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">Submitted</p>
                <p className="text-gray-900">{new Date(application.submittedAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
