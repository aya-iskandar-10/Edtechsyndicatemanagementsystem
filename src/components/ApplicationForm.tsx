import { useState } from 'react';
import { Upload, FileText, Award, Briefcase, GraduationCap, Send, ArrowLeft, X, CheckCircle } from 'lucide-react';
import { projectId, publicAnonKey } from '../utils/supabase/info';

interface ApplicationFormProps {
  userId: string;
  accessToken: string;
  onSubmitted: () => void;
  onBack: () => void;
}

export function ApplicationForm({ userId, accessToken, onSubmitted, onBack }: ApplicationFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    position: '',
    organization: '',
    yearsExperience: '',
    education: '',
    specialization: '',
    linkedin: '',
    motivation: '',
  });

  const [files, setFiles] = useState<{
    resume?: File;
    certificates?: File[];
    recommendation?: File;
  }>({
    certificates: []
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (field: 'resume' | 'certificates' | 'recommendation', file: File | File[]) => {
    const MAX_SIZE = 10 * 1024 * 1024; // 10MB
    
    if (field === 'certificates' && Array.isArray(file)) {
      const validFiles = file.filter(f => {
        if (f.size > MAX_SIZE) {
          alert(`File ${f.name} is too large. Maximum size is 10MB.`);
          return false;
        }
        return true;
      });
      if (validFiles.length > 0) {
        setFiles(prev => ({ ...prev, certificates: [...(prev.certificates || []), ...validFiles] }));
      }
    } else if (!Array.isArray(file)) {
      if (file.size > MAX_SIZE) {
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }
      setFiles(prev => ({ ...prev, [field]: file }));
    }
  };

  const removeFile = (field: 'resume' | 'certificates' | 'recommendation', index?: number) => {
    if (field === 'certificates' && index !== undefined) {
      setFiles(prev => ({
        ...prev,
        certificates: prev.certificates?.filter((_, i) => i !== index)
      }));
    } else {
      setFiles(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // Convert files to base64
      const fileData: any = {};
      
      if (files.resume) {
        fileData.resume = await fileToBase64(files.resume);
        fileData.resumeName = files.resume.name;
      }
      
      if (files.recommendation) {
        fileData.recommendation = await fileToBase64(files.recommendation);
        fileData.recommendationName = files.recommendation.name;
      }
      
      if (files.certificates && files.certificates.length > 0) {
        fileData.certificates = await Promise.all(
          files.certificates.map(async (file) => ({
            data: await fileToBase64(file),
            name: file.name
          }))
        );
      }

      const response = await fetch(
        `https://${projectId}.supabase.co/functions/v1/make-server-71a69640/application`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${accessToken}`
          },
          body: JSON.stringify({
            ...formData,
            files: fileData
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit application');
      }

      onSubmitted();
    } catch (err: any) {
      console.error('Submission error:', err);
      setError(err.message || 'Failed to submit application');
      setLoading(false);
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const isStepValid = (step: number) => {
    switch (step) {
      case 1:
        return formData.fullName && formData.email && formData.phone;
      case 2:
        return formData.position && formData.organization && formData.yearsExperience;
      case 3:
        return formData.education && formData.specialization;
      case 4:
        return files.resume;
      default:
        return true;
    }
  };

  return (
    <div className="min-h-screen py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Home
        </button>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
            <h2 className="text-white mb-4">Membership Application</h2>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((step) => (
                <div key={step} className="flex-1">
                  <div
                    className={`h-2 rounded-full transition-all ${
                      step <= currentStep ? 'bg-white' : 'bg-white/30'
                    }`}
                  />
                </div>
              ))}
            </div>
            <div className="mt-2 text-white text-sm">
              Step {currentStep} of 5
            </div>
          </div>

          <div className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {/* Step 1: Personal Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-6">Personal Information</h3>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dr. Jane Smith"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="jane@university.edu"
                    />
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700 mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="+1 (555) 000-0000"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Professional Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-6">Professional Background</h3>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Current Position *
                  </label>
                  <input
                    type="text"
                    value={formData.position}
                    onChange={(e) => handleInputChange('position', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Educational Technology Director"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Organization/Institution *
                  </label>
                  <input
                    type="text"
                    value={formData.organization}
                    onChange={(e) => handleInputChange('organization', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="State University"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Years of Experience in Education/EdTech *
                  </label>
                  <select
                    value={formData.yearsExperience}
                    onChange={(e) => handleInputChange('yearsExperience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select experience</option>
                    <option value="0-2">0-2 years</option>
                    <option value="3-5">3-5 years</option>
                    <option value="6-10">6-10 years</option>
                    <option value="11-15">11-15 years</option>
                    <option value="16+">16+ years</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    LinkedIn Profile (Optional)
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin}
                    onChange={(e) => handleInputChange('linkedin', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://linkedin.com/in/yourprofile"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Academic Background */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-6">Academic Background</h3>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Highest Education Level *
                  </label>
                  <select
                    value={formData.education}
                    onChange={(e) => handleInputChange('education', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select education level</option>
                    <option value="bachelor">Bachelor's Degree</option>
                    <option value="master">Master's Degree</option>
                    <option value="phd">Ph.D./Doctorate</option>
                    <option value="other">Other Advanced Degree</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Area of Specialization *
                  </label>
                  <input
                    type="text"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Instructional Design, Educational Psychology, Computer Science"
                  />
                </div>

                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Why do you want to join the EdTech Syndicate? *
                  </label>
                  <textarea
                    value={formData.motivation}
                    onChange={(e) => handleInputChange('motivation', e.target.value)}
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    placeholder="Share your motivation, goals, and how you plan to contribute to the community..."
                  />
                </div>
              </div>
            )}

            {/* Step 4: Document Upload */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-2">Supporting Documents</h3>
                  <p className="text-gray-600">Upload relevant documents to support your application</p>
                </div>

                {/* Resume Upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Resume/CV *
                  </label>
                  {!files.resume ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload resume</span>
                      <span className="text-xs text-gray-500 mt-1">PDF, DOC, or DOCX (Max 10MB)</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('resume', e.target.files[0])}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-blue-600" />
                        <span className="text-sm text-gray-700">{files.resume.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile('resume')}
                        className="p-1 hover:bg-blue-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Certificates Upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Professional Certificates (Optional)
                  </label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <Award className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600">Click to upload certificates</span>
                    <span className="text-xs text-gray-500 mt-1">Multiple files allowed</span>
                    <input
                      type="file"
                      className="hidden"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      onChange={(e) => e.target.files && handleFileUpload('certificates', Array.from(e.target.files))}
                    />
                  </label>
                  {files.certificates && files.certificates.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {files.certificates.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                          <div className="flex items-center gap-3">
                            <Award className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{file.name}</span>
                          </div>
                          <button
                            onClick={() => removeFile('certificates', index)}
                            className="p-1 hover:bg-green-100 rounded transition-colors"
                          >
                            <X className="w-4 h-4 text-gray-600" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Recommendation Letter Upload */}
                <div>
                  <label className="block text-sm text-gray-700 mb-2">
                    Letter of Recommendation (Optional)
                  </label>
                  {!files.recommendation ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                      <FileText className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-600">Click to upload letter</span>
                      <span className="text-xs text-gray-500 mt-1">PDF format preferred</span>
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.doc,.docx"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload('recommendation', e.target.files[0])}
                      />
                    </label>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <div className="flex items-center gap-3">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span className="text-sm text-gray-700">{files.recommendation.name}</span>
                      </div>
                      <button
                        onClick={() => removeFile('recommendation')}
                        className="p-1 hover:bg-purple-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-gray-600" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Review and Submit */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-gray-900 mb-2">Review Your Application</h3>
                  <p className="text-gray-600">Please review all information before submitting</p>
                </div>

                <div className="space-y-4">
                  <ReviewSection title="Personal Information">
                    <ReviewItem label="Name" value={formData.fullName} />
                    <ReviewItem label="Email" value={formData.email} />
                    <ReviewItem label="Phone" value={formData.phone} />
                  </ReviewSection>

                  <ReviewSection title="Professional Background">
                    <ReviewItem label="Position" value={formData.position} />
                    <ReviewItem label="Organization" value={formData.organization} />
                    <ReviewItem label="Experience" value={formData.yearsExperience} />
                    {formData.linkedin && <ReviewItem label="LinkedIn" value={formData.linkedin} />}
                  </ReviewSection>

                  <ReviewSection title="Academic Background">
                    <ReviewItem label="Education" value={formData.education} />
                    <ReviewItem label="Specialization" value={formData.specialization} />
                  </ReviewSection>

                  <ReviewSection title="Documents">
                    {files.resume && <ReviewItem label="Resume" value={files.resume.name} icon={<CheckCircle className="w-4 h-4 text-green-600" />} />}
                    {files.certificates && files.certificates.length > 0 && (
                      <ReviewItem label="Certificates" value={`${files.certificates.length} file(s)`} icon={<CheckCircle className="w-4 h-4 text-green-600" />} />
                    )}
                    {files.recommendation && <ReviewItem label="Recommendation" value={files.recommendation.name} icon={<CheckCircle className="w-4 h-4 text-green-600" />} />}
                  </ReviewSection>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    By submitting this application, you confirm that all information provided is accurate and complete.
                    The admissions committee will review your application within 5-7 business days.
                  </p>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
              <button
                onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                disabled={currentStep === 1}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {currentStep < 5 ? (
                <button
                  onClick={() => setCurrentStep(prev => prev + 1)}
                  disabled={!isStepValid(currentStep)}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>Next</span>
                  <ArrowLeft className="w-4 h-4 rotate-180" />
                </button>
              ) : (
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
                  <Send className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReviewSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="text-gray-900 mb-3">{title}</h4>
      <div className="space-y-2">
        {children}
      </div>
    </div>
  );
}

function ReviewItem({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      {icon}
      <div className="flex-1">
        <span className="text-sm text-gray-600">{label}:</span>
        <p className="text-gray-900">{value}</p>
      </div>
    </div>
  );
}