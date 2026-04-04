import { auth } from "@clerk/nextjs/server";
import { UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex flex-col items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Header with user button */}
        <div className="flex justify-end mb-8">
          {userId ? (
            <div className="flex items-center gap-4">
              <span className="text-white">Welcome back!</span>
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-10 h-10",
                  },
                }}
              />
            </div>
          ) : null}
        </div>

        {/* Main content */}
        <div className="backdrop-blur-xl bg-jungle-teal-900/95 rounded-2xl shadow-2xl border border-jungle-teal-700/40 p-12 text-center">
          <h1 className="text-5xl font-bold text-white mb-4">
            Welcome to Third Eye
          </h1>
          <p className="text-xl text-white mb-8">
            Your secure authentication system powered by Clerk
          </p>

          {userId ? (
            <div className="space-y-4">
              <p className="text-mint-cream-400 text-lg font-medium">
                You are signed in!
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/dashboard"
                  className="px-6 py-3 bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 hover:from-jungle-teal-700 hover:to-muted-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-jungle-teal-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  Go to Dashboard
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <p className="text-white mb-8">
                Please sign in or create an account to continue
              </p>
              <div className="flex gap-4 justify-center">
                <Link
                  href="/sign-in"
                  className="px-8 py-3 bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 hover:from-jungle-teal-700 hover:to-muted-teal-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-jungle-teal-500/50 transition-all duration-300 transform hover:scale-105"
                >
                  Sign In
                </Link>
                <Link
                  href="/sign-up"
                  className="px-8 py-3 bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white hover:bg-jungle-teal-700/90 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105"
                >
                  Sign Up
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <div className="backdrop-blur-xl bg-jungle-teal-800/90 rounded-xl border border-jungle-teal-700/30 p-6 text-center">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-white font-semibold mb-2">Secure Auth</h3>
            <p className="text-muted-teal-50 text-sm">
              Enterprise-grade authentication powered by Clerk
            </p>
          </div>
          <div className="backdrop-blur-xl bg-jungle-teal-800/90 rounded-xl border border-jungle-teal-700/30 p-6 text-center">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-white font-semibold mb-2">Lightning Fast</h3>
            <p className="text-muted-teal-50 text-sm">
              Built with Next.js 16 for optimal performance
            </p>
          </div>
          <div className="backdrop-blur-xl bg-jungle-teal-800/90 rounded-xl border border-jungle-teal-700/30 p-6 text-center">
            <div className="text-3xl mb-3">🎨</div>
            <h3 className="text-white font-semibold mb-2">Beautiful UI</h3>
            <p className="text-muted-teal-50 text-sm">
              Modern dark theme with glassmorphism effects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
