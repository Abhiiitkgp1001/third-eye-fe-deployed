import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-frozen-water-900 to-azure-mist-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-jungle-teal-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-frozen-water-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-3/4 left-3/4 w-64 h-64 bg-muted-teal-500/20 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10">
        <SignUp
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "backdrop-blur-xl bg-jungle-teal-900/90 border border-jungle-teal-700/30 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white",
              socialButtonsBlockButton: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white hover:bg-jungle-teal-700/90",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-gradient-to-r from-frozen-water-600 to-azure-mist-600 hover:from-frozen-water-700 hover:to-azure-mist-700 text-white font-semibold shadow-lg hover:shadow-frozen-water-500/50 transition-all duration-300",
              formFieldInput: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white placeholder-muted-teal-300 focus:ring-2 focus:ring-frozen-water-500",
              formFieldLabel: "text-white",
              footerActionLink: "text-frozen-water-400 hover:text-frozen-water-300",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-muted-teal-50",
              otpCodeFieldInput: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white",
              formResendCodeLink: "text-frozen-water-400 hover:text-frozen-water-300",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}
