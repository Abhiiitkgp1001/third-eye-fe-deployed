import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-jungle-teal-950 via-muted-teal-900 to-frozen-water-900 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-jungle-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tl from-muted-teal-500/20 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10">
        <SignIn
          appearance={{
            elements: {
              rootBox: "mx-auto",
              card: "backdrop-blur-xl bg-jungle-teal-900/90 border border-jungle-teal-700/30 shadow-2xl",
              headerTitle: "text-white",
              headerSubtitle: "text-white",
              socialButtonsBlockButton: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white hover:bg-jungle-teal-700/90",
              socialButtonsBlockButtonText: "text-white font-medium",
              formButtonPrimary: "bg-gradient-to-r from-jungle-teal-600 to-muted-teal-600 hover:from-jungle-teal-700 hover:to-muted-teal-700 text-white font-semibold shadow-lg hover:shadow-jungle-teal-500/50 transition-all duration-300",
              formFieldInput: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white placeholder-muted-teal-300 focus:ring-2 focus:ring-jungle-teal-500",
              formFieldLabel: "text-white",
              footerActionLink: "text-jungle-teal-400 hover:text-jungle-teal-300",
              identityPreviewText: "text-white",
              identityPreviewEditButtonIcon: "text-white",
              formHeaderTitle: "text-white",
              formHeaderSubtitle: "text-white",
              dividerLine: "bg-white/10",
              dividerText: "text-muted-teal-50",
              otpCodeFieldInput: "bg-jungle-teal-800/90 border border-jungle-teal-700/30 text-white",
              formResendCodeLink: "text-jungle-teal-400 hover:text-jungle-teal-300",
              footer: "hidden",
            },
            layout: {
              socialButtonsPlacement: "bottom",
              socialButtonsVariant: "iconButton",
            },
          }}
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
        />
      </div>
    </div>
  );
}
