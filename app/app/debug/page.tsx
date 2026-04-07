'use client';

import { useState } from "react";
import { trpc } from "@/lib/trpc";

export default function DebugPage() {
  const [pingResult, setPingResult] = useState<any>(null);
  const [authCheckResult, setAuthCheckResult] = useState<any>(null);
  const [isPinging, setIsPinging] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  // Test mutations
  const pingMutation = trpc.test.ping.useQuery(undefined, { enabled: false });
  const authCheckMutation = trpc.test.authCheck.useMutation();

  const handlePing = async () => {
    setIsPinging(true);
    setPingResult(null);
    try {
      const result = await pingMutation.refetch();
      setPingResult({ success: true, data: result.data });
    } catch (error: any) {
      setPingResult({ success: false, error: error.message });
    } finally {
      setIsPinging(false);
    }
  };

  const handleAuthCheck = async () => {
    setIsCheckingAuth(true);
    setAuthCheckResult(null);
    try {
      const result = await authCheckMutation.mutateAsync();
      setAuthCheckResult({ success: true, data: result });
    } catch (error: any) {
      setAuthCheckResult({ success: false, error: error.message });
    } finally {
      setIsCheckingAuth(false);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Debug & Testing</h1>
          <p className="text-white">Test backend connectivity and authentication</p>
        </div>

        {/* Backend Test Section */}
        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden mb-6">
          <div className="p-6 border-b border-primary-700/40">
            <h2 className="text-2xl font-bold text-white">Backend Tests</h2>
          </div>

          <div className="p-6 space-y-6">
            {/* Ping Test */}
            <div>
              <h3 className="text-white font-semibold mb-3">Ping Test (Unprotected)</h3>
              <p className="text-secondary-50 text-sm mb-4">
                Tests basic connectivity to the backend server without authentication.
              </p>
              <button
                onClick={handlePing}
                disabled={isPinging}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isPinging
                    ? 'bg-primary-800/90 text-secondary-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white'
                }`}
              >
                {isPinging ? 'Pinging...' : 'Test Ping'}
              </button>

              {pingResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  pingResult.success
                    ? 'bg-green-950/30 border-green-500/40'
                    : 'bg-red-950/30 border-red-500/40'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{pingResult.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${
                        pingResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {pingResult.success ? 'Success' : 'Failed'}
                      </p>
                      <pre className="text-sm text-white bg-primary-950/50 p-3 rounded overflow-auto">
                        {JSON.stringify(pingResult.success ? pingResult.data : pingResult.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Auth Check Test */}
            <div className="pt-6 border-t border-primary-700/40">
              <h3 className="text-white font-semibold mb-3">Auth Check Test (Protected)</h3>
              <p className="text-secondary-50 text-sm mb-4">
                Tests authentication with the backend using your current session JWT token.
              </p>
              <button
                onClick={handleAuthCheck}
                disabled={isCheckingAuth}
                className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                  isCheckingAuth
                    ? 'bg-primary-800/90 text-secondary-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-tertiary-600 to-secondary-600 hover:from-tertiary-700 hover:to-secondary-700 text-white'
                }`}
              >
                {isCheckingAuth ? 'Checking...' : 'Test Authentication'}
              </button>

              {authCheckResult && (
                <div className={`mt-4 p-4 rounded-lg border ${
                  authCheckResult.success
                    ? 'bg-green-950/30 border-green-500/40'
                    : 'bg-red-950/30 border-red-500/40'
                }`}>
                  <div className="flex items-start gap-2">
                    <span className="text-2xl">{authCheckResult.success ? '✅' : '❌'}</span>
                    <div className="flex-1">
                      <p className={`font-semibold mb-2 ${
                        authCheckResult.success ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {authCheckResult.success ? 'Authentication Successful' : 'Authentication Failed'}
                      </p>
                      <pre className="text-sm text-white bg-primary-950/50 p-3 rounded overflow-auto">
                        {JSON.stringify(authCheckResult.success ? authCheckResult.data : authCheckResult.error, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Backend Info */}
        <div className="backdrop-blur-xl bg-primary-900/95 rounded-2xl border border-primary-700/40 overflow-hidden">
          <div className="p-6 border-b border-primary-700/40">
            <h2 className="text-2xl font-bold text-white">Backend Information</h2>
          </div>

          <div className="p-6">
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Backend URL
                </label>
                <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50 font-mono text-sm">
                  {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  tRPC Endpoint
                </label>
                <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50 font-mono text-sm">
                  {process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'}/v1/trpc
                </div>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Environment
                </label>
                <div className="px-4 py-3 bg-primary-800/50 border border-primary-700/30 rounded-lg text-secondary-50">
                  {process.env.NODE_ENV || 'development'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-6 backdrop-blur-xl bg-blue-950/30 rounded-2xl border border-blue-500/40 p-6">
          <div className="flex items-start gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h3 className="text-blue-400 font-semibold mb-2">Debug Tips</h3>
              <ul className="text-secondary-50 text-sm space-y-2">
                <li>• <strong>Ping Test:</strong> Should always succeed if the backend is running</li>
                <li>• <strong>Auth Test:</strong> Should succeed if your session is valid</li>
                <li>• Check the browser console for detailed error messages</li>
                <li>• Ensure the backend is running on the correct port (8000)</li>
                <li>• Make sure CORS is properly configured in the backend</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
