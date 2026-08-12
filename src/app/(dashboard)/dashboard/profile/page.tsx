"use client";

import { UserProfile } from "@clerk/nextjs";
import { dark } from "@clerk/themes";

export default function ProfilePage() {
  return (
    <div className="animate-fade-in pb-24 max-w-5xl mx-auto">
      <div className="flex w-full justify-center">
          <UserProfile 
            routing="hash"
            appearance={{
              // @ts-expect-error - Clerk types might be misaligned
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
                rootBox: "w-full flex justify-center",
                card: "w-full max-w-full m-0 shadow-none border border-border rounded-xl",
                navbar: "hidden"
              }
            }}
          />
      </div>
    </div>
  );
}
