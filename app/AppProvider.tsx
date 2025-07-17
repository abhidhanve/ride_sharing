import React from "react";
import { PrivyProvider } from "@privy-io/react-auth";

// Replace with your actual Privy App ID
const PRIVY_APP_ID = "cmahyqsph02ivl70lcspkk57q";

export default function AppProvider({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider appId={PRIVY_APP_ID}>
      {children}
    </PrivyProvider>
  );
}
