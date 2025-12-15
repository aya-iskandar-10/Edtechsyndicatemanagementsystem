import { useState } from 'react';
import { Shield, Copy, Check } from 'lucide-react';

export function AdminSetup() {
  const [copied, setCopied] = useState(false);

  const setupInstructions = `
// To create an admin account, you need to manually create a user with admin role.
// You can do this through the Supabase Dashboard:

1. Go to your Supabase Dashboard
2. Navigate to Authentication > Users
3. Click "Add User"
4. Enter email and password
5. In the "User Metadata" section, add:
   {
     "name": "Admin Name",
     "role": "admin"
   }
6. Click "Create User"

// Or use the Supabase SQL Editor to update an existing user:
UPDATE auth.users
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE email = 'admin@example.com';
  `.trim();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(setupInstructions);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <details className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <Shield className="w-5 h-5 text-purple-600" />
          <span className="text-sm text-gray-900">Admin Setup Instructions</span>
        </summary>
        
        <div className="p-4 border-t border-gray-200 max-w-md">
          <div className="mb-3">
            <h4 className="text-gray-900 mb-2">Create Admin Account</h4>
            <p className="text-sm text-gray-600">
              To access the admin panel, you need to create a user with admin privileges.
            </p>
          </div>
          
          <div className="relative">
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-xs overflow-x-auto">
              {setupInstructions}
            </pre>
            <button
              onClick={copyToClipboard}
              className="absolute top-2 right-2 p-2 bg-gray-800 hover:bg-gray-700 rounded transition-colors"
              title="Copy to clipboard"
            >
              {copied ? (
                <Check className="w-4 h-4 text-green-400" />
              ) : (
                <Copy className="w-4 h-4 text-gray-400" />
              )}
            </button>
          </div>
        </div>
      </details>
    </div>
  );
}
