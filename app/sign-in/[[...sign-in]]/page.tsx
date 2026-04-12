import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-950 via-primary-900 to-secondary-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-primary-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-secondary-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "backdrop-blur-xl bg-primary-900/90 border border-primary-700/30 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white",
              socialButtonsBlockButton: "bg-primary-800/90 border border-primary-700/30 text-white hover:bg-primary-700/90",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-gradient-to-r from-primary-600 to-secondary-600 hover:from-primary-700 hover:to-secondary-700 text-white font-semibold shadow-lg hover:shadow-primary-500/50 transition-all duration-300",
              formFieldInput: "bg-primary-800/90 border border-primary-700/30 text-white placeholder-secondary-300 focus:ring-2 focus:ring-primary-500",
              formFieldLabel: "text-white",
              footerActionLink: "text-primary-400 hover:text-primary-300",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-secondary-50",
              otpCodeFieldInput: "bg-primary-800/90 border border-primary-700/30 text-white",
              formResendCodeLink: "text-primary-400 hover:text-primary-300",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
          afterSignOutUrl={"/"}
          // signUpUrl="/sign-up"
          forceRedirectUrl={'/app'}
        />
      </div>
    </div>
  );
}
