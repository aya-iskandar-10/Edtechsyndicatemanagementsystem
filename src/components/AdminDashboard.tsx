import { useState, useEffect } from 'react';
import { ArrowLeft, Search, Filter, Eye, Check, X, Clock, Download, Calendar, Users } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface AdminDashboardProps {
  accessToken: string;
  onBack: () => void;
  onSignOut: () => void;
}

interface Application {
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
    resumeName?: string;
    certificates?: Array<{ data: string; name: string }>;
    recommendation?: string;
    recommendationName?: string;
  };
}

export function AdminDashboard({ accessToken, onBack, onSignOut }: AdminDashboardProps) {
  const [applications, setApplications] = useState<Application[]>([]);
  const [filteredApplications, setFilteredApplications] = useState<Application[]>([]);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [showExpiryModal, setShowExpiryModal] = useState(false);
  const [expiryDate, setExpiryDate] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    approved: 0,
    rejected: 0
  });

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
    calculateStats();
  }, [applications, searchTerm, statusFilter]);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/admin/applications`,
        {
          headers: { 'Authorization': `Bearer ${accessToken}` }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch applications');
      }

      const data = await response.json();
      setApplications(data);
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (statusFilter !== 'all') {
      filtered = filtered.filter(app => app.status === statusFilter);
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(app =>
        app.fullName.toLowerCase().includes(term) ||
        app.email.toLowerCase().includes(term) ||
        app.organization.toLowerCase().includes(term)
      );
    }

    setFilteredApplications(filtered);
  };

  const calculateStats = () => {
    setStats({
      total: applications.length,
      pending: applications.filter(app => app.status === 'pending').length,
      approved: applications.filter(app => app.status === 'approved').length,
      rejected: applications.filter(app => app.status === 'rejected').length
    });
  };

  const handleApprove = async (applicationId: string) => {
    setSelectedApplication(applications.find(app => app.id === applicationId) || null);
    setShowExpiryModal(true);
  };

  const confirmApproval = async () => {
    if (!selectedApplication || !expiryDate) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/admin/application/${selectedApplication.id}/approve`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({ expiryDate })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to approve application');
      }

      await fetchApplications();
      setShowExpiryModal(false);
      setExpiryDate('');
      setSelectedApplication(null);
    } catch (err) {
      console.error('Error approving application:', err);
      alert('Failed to approve application');
    }
  };

  const handleReject = async (applicationId: string) => {
    if (!confirm('Are you sure you want to reject this application?')) return;

    try {
      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/admin/application/${applicationId}/reject`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        }
      );

      if (!response.ok) {
        throw new Error('Failed to reject application');
      }

      await fetchApplications();
    } catch (err) {
      console.error('Error rejecting application:', err);
      alert('Failed to reject application');
    }
  };

  const viewApplication = (application: Application) => {
    setSelectedApplication(application);
  };

  const downloadFile = (data: string, filename: string) => {
    const link = document.createElement('a');
    link.href = data;
    link.download = filename;
    link.click();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-7xl mx-auto">
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

        <div className="mb-8">
          <h2 className="text-gray-900 mb-2">Admin Dashboard</h2>
          <p className="text-gray-600">Manage membership applications</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Applications"
            value={stats.total}
            icon={<Users className="w-6 h-6" />}
            color="blue"
          />
          <StatCard
            label="Pending Review"
            value={stats.pending}
            icon={<Clock className="w-6 h-6" />}
            color="yellow"
          />
          <StatCard
            label="Approved"
            value={stats.approved}
            icon={<Check className="w-6 h-6" />}
            color="green"
          />
          <StatCard
            label="Rejected"
            value={stats.rejected}
            icon={<X className="w-6 h-6" />}
            color="red"
          />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email, or organization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applications List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Applicant
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Organization
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Experience
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs text-gray-500 uppercase tracking-wider">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-xs text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredApplications.map((application) => (
                  <tr key={application.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{application.fullName}</p>
                        <p className="text-sm text-gray-600">{application.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-gray-900">{application.organization}</p>
                        <p className="text-sm text-gray-600">{application.position}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900">
                      {application.yearsExperience}
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={application.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {new Date(application.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => viewApplication(application)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                        {application.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(application.id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleReject(application.id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredApplications.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-600">No applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {selectedApplication && !showExpiryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white flex items-center justify-between">
              <div>
                <h3 className="text-white mb-1">Application Details</h3>
                <p className="text-blue-100">{selectedApplication.fullName}</p>
              </div>
              <button
                onClick={() => setSelectedApplication(null)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Personal Information */}
              <Section title="Personal Information">
                <InfoRow label="Full Name" value={selectedApplication.fullName} />
                <InfoRow label="Email" value={selectedApplication.email} />
                <InfoRow label="Phone" value={selectedApplication.phone} />
              </Section>

              {/* Professional Information */}
              <Section title="Professional Background">
                <InfoRow label="Position" value={selectedApplication.position} />
                <InfoRow label="Organization" value={selectedApplication.organization} />
                <InfoRow label="Years of Experience" value={selectedApplication.yearsExperience} />
                {selectedApplication.linkedin && (
                  <InfoRow label="LinkedIn" value={selectedApplication.linkedin} isLink />
                )}
              </Section>

              {/* Academic Background */}
              <Section title="Academic Background">
                <InfoRow label="Education Level" value={selectedApplication.education} />
                <InfoRow label="Specialization" value={selectedApplication.specialization} />
              </Section>

              {/* Motivation */}
              <Section title="Motivation Statement">
                <p className="text-gray-700 leading-relaxed">{selectedApplication.motivation}</p>
              </Section>

              {/* Documents */}
              {selectedApplication.files && (
                <Section title="Supporting Documents">
                  <div className="space-y-2">
                    {selectedApplication.files.resume && (
                      <button
                        onClick={() => downloadFile(selectedApplication.files!.resume!, selectedApplication.files!.resumeName || 'resume.pdf')}
                        className="flex items-center gap-3 w-full p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-blue-600" />
                        <span className="text-gray-900">{selectedApplication.files.resumeName || 'Resume/CV'}</span>
                      </button>
                    )}
                    {selectedApplication.files.certificates?.map((cert, index) => (
                      <button
                        key={index}
                        onClick={() => downloadFile(cert.data, cert.name)}
                        className="flex items-center gap-3 w-full p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-green-600" />
                        <span className="text-gray-900">{cert.name}</span>
                      </button>
                    ))}
                    {selectedApplication.files.recommendation && (
                      <button
                        onClick={() => downloadFile(selectedApplication.files!.recommendation!, selectedApplication.files!.recommendationName || 'recommendation.pdf')}
                        className="flex items-center gap-3 w-full p-3 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                      >
                        <Download className="w-5 h-5 text-purple-600" />
                        <span className="text-gray-900">{selectedApplication.files.recommendationName || 'Letter of Recommendation'}</span>
                      </button>
                    )}
                  </div>
                </Section>
              )}
            </div>

            {/* Actions */}
            {selectedApplication.status === 'pending' && (
              <div className="border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                <button
                  onClick={() => handleReject(selectedApplication.id)}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleApprove(selectedApplication.id)}
                  className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expiry Date Modal */}
      {showExpiryModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-gray-900 mb-4">Set Membership Expiry Date</h3>
              <p className="text-gray-600 mb-4">
                Approve {selectedApplication?.fullName}'s application and set the membership expiry date.
              </p>

              <div className="mb-6">
                <label className="block text-sm text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="date"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    setShowExpiryModal(false);
                    setExpiryDate('');
                    setSelectedApplication(null);
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmApproval}
                  disabled={!expiryDate}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, color }: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: 'blue' | 'yellow' | 'green' | 'red';
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-2">
        <div className={`bg-gradient-to-br ${colors[color]} p-3 rounded-lg text-white`}>
          {icon}
        </div>
        <div className="text-3xl text-gray-900">{value}</div>
      </div>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const configs = {
    pending: 'bg-yellow-100 text-yellow-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
    expired: 'bg-gray-100 text-gray-700'
  };

  return (
    <span className={`px-3 py-1 rounded-full text-xs uppercase ${configs[status as keyof typeof configs]}`}>
      {status}
    </span>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        {children}
      </div>
    </div>
  );
}

function InfoRow({ label, value, isLink }: { label: string; value: string; isLink?: boolean }) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-sm text-gray-600 min-w-[140px]">{label}:</span>
      {isLink ? (
        <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
          {value}
        </a>
      ) : (
        <span className="text-gray-900">{value}</span>
      )}
    </div>
  );
}
