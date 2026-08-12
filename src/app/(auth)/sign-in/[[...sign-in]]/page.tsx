import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <SignIn 
      fallbackRedirectUrl="/dashboard"
      appearance={{
        elements: {
          rootBox: "mx-auto",
          card: "bg-card border border-border rounded-xl shadow-2xl",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "border-border text-foreground hover:bg-secondary transition-colors",
          socialButtonsBlockButtonText: "font-semibold",
          dividerLine: "bg-border",
          dividerText: "text-muted-foreground",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border-border text-foreground focus:ring-primary focus:border-primary",
          formButtonPrimary: "bg-primary text-background hover:bg-green-400 font-semibold transition-colors",
          footerActionText: "text-muted-foreground",
          footerActionLink: "text-primary hover:text-green-400"
        }
      }}
    />
  );
}
