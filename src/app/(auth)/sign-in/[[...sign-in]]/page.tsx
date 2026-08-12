import { SignIn } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function Page() {
  return (
    <SignIn 
      fallbackRedirectUrl="/dashboard"
      appearance={{
        // @ts-expect-error
        baseTheme: dark,
        variables: {
          colorBackground: '#09090b',
          colorNeutral: 'white',
          colorForeground: 'white',
          colorPrimary: '#1db954',
          colorInputForeground: 'white',
          colorInput: '#27272a'
        },
        elements: {
          rootBox: "mx-auto",
          card: "bg-card border border-border rounded-xl shadow-2xl",
        }
      }}
    />
  );
}
