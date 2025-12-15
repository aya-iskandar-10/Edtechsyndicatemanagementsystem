import { GraduationCap, Users, Shield, Award, CheckCircle, ArrowRight, LogOut } from 'lucide-react';

interface LandingPageProps {
  onApply: () => void;
  onSignIn: () => void;
  onAdminAccess: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
  onSignOut: () => void;
}

export function LandingPage({ 
  onApply, 
  onSignIn, 
  onAdminAccess, 
  isAuthenticated, 
  isAdmin,
  onSignOut 
}: LandingPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-gray-900">EdTech Syndicate</h1>
                <p className="text-sm text-gray-600">Professional Education Network</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  {isAdmin && (
                    <button
                      onClick={onAdminAccess}
                      className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                    >
                      Admin Panel
                    </button>
                  )}
                  <button
                    onClick={onSignOut}
                    className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={onSignIn}
                    className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    Sign In
                  </button>
                  <button
                    onClick={onAdminAccess}
                    className="px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                  >
                    Admin
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-full mb-6">
            <Award className="w-4 h-4" />
            <span className="text-sm">Join the Leading EdTech Professional Network</span>
          </div>
          
          <h2 className="text-gray-900 mb-6">
            Empowering Education Professionals Through Collaboration
          </h2>
          
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            The EdTech Syndicate is a premier professional organization dedicated to advancing 
            educational technology, fostering innovation, and connecting educators, technologists, 
            and industry leaders worldwide.
          </p>
          
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            <span>Apply for Membership</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          <FeatureCard
            icon={<Users className="w-6 h-6" />}
            title="Professional Network"
            description="Connect with educators, administrators, and EdTech innovators from around the globe."
          />
          <FeatureCard
            icon={<Shield className="w-6 h-6" />}
            title="Verified Credentials"
            description="Gain recognition through our rigorous verification process and professional certification."
          />
          <FeatureCard
            icon={<Award className="w-6 h-6" />}
            title="Exclusive Benefits"
            description="Access conferences, workshops, research publications, and career opportunities."
          />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
          <h3 className="text-gray-900 mb-8">Membership Benefits</h3>
          
          <div className="grid md:grid-cols-2 gap-6">
            <BenefitItem text="Access to exclusive EdTech research and publications" />
            <BenefitItem text="Priority registration for annual conferences" />
            <BenefitItem text="Professional development workshops and webinars" />
            <BenefitItem text="Networking opportunities with industry leaders" />
            <BenefitItem text="Digital membership badge and certificate" />
            <BenefitItem text="Job board and career advancement resources" />
          </div>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center max-w-3xl mx-auto">
          <h3 className="text-gray-900 mb-6">Membership Requirements</h3>
          <p className="text-gray-600 mb-8">
            To ensure the quality and professionalism of our network, we require applicants 
            to submit relevant credentials and documentation for review by our admissions committee.
          </p>
          
          <button
            onClick={onApply}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-xl hover:bg-gray-800 transition-all shadow-lg"
          >
            <span>Start Your Application</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-3 mb-4">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <span>EdTech Syndicate</span>
            </div>
            <p className="text-gray-400">
              © 2025 EdTech Syndicate. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string;
}) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
      <div className="bg-gradient-to-br from-blue-600 to-purple-600 text-white p-3 rounded-lg w-fit mb-4">
        {icon}
      </div>
      <h4 className="text-gray-900 mb-2">{title}</h4>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3">
      <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
      <span className="text-gray-700">{text}</span>
    </div>
  );
}
