import { useState } from 'react';
import { TestTube, Copy, Check } from 'lucide-react';

export function QuickTest() {
  const [copied, setCopied] = useState('');

  const testAccounts = {
    admin: {
      email: 'admin@edtech.com',
      password: 'admin123',
      note: 'Admin account - Review applications'
    },
    member: {
      email: 'member@example.com',
      password: 'member123',
      note: 'Regular member - Submit applications'
    }
  };

  const copyText = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <details className="bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden">
        <summary className="px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors flex items-center gap-2">
          <TestTube className="w-5 h-5 text-green-600" />
          <span className="text-sm text-gray-900">Quick Test Accounts</span>
        </summary>
        
        <div className="p-4 border-t border-gray-200 w-80">
          <div className="space-y-4">
            {Object.entries(testAccounts).map(([key, account]) => (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-gray-900 capitalize">{key}</h4>
                </div>
                <p className="text-xs text-gray-600 mb-2">{account.note}</p>
                
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={account.email}
                      readOnly
                      className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    />
                    <button
                      onClick={() => copyText(account.email, `${key}-email`)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy email"
                    >
                      {copied === `${key}-email` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={account.password}
                      readOnly
                      className="flex-1 px-2 py-1 bg-white border border-gray-300 rounded text-xs"
                    />
                    <button
                      onClick={() => copyText(account.password, `${key}-password`)}
                      className="p-1 hover:bg-gray-200 rounded transition-colors"
                      title="Copy password"
                    >
                      {copied === `${key}-password` ? (
                        <Check className="w-4 h-4 text-green-600" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-600" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> You still need to create these accounts manually in Supabase.
              For admin, set user_metadata: {`{"role": "admin"}`}
            </p>
          </div>
        </div>
      </details>
    </div>
  );
}