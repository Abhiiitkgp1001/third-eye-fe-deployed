import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-tertiary-900 to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-tertiary-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-secondary-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "bg-secondary-background opacity-100 border border-gray-800 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white",
              socialButtonsBlockButton: "bg-primary-800/90 border border-primary-700/30 text-white hover:bg-primary-700/90",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-gradient-to-r from-tertiary-600 to-secondary-600 hover:from-tertiary-700 hover:to-secondary-700 text-white font-semibold shadow-lg hover:shadow-tertiary-500/50 transition-all duration-300",
              formFieldInput: "bg-primary-800/90 border border-primary-700/30 text-white placeholder-secondary-300 focus:ring-2 focus:ring-tertiary-500",
              formFieldLabel: "text-white",
              footerActionLink: "text-tertiary-400 hover:text-tertiary-300",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-secondary-50",
              otpCodeFieldInput: "bg-primary-800/90 border border-primary-700/30 text-white",
              formResendCodeLink: "text-tertiary-400 hover:text-tertiary-300",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }} 
          forceRedirectUrl={'/app'}
          afterSignOutUrl={'/'}
          signInUrl={"/sign-in"}
        />
      </div>
    </div>
  );
}
