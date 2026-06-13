"use client";

import { useState } from "react";
import { Suspense } from "react";  // add this

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/context/AuthContext";
import LayoutServer from "./LayoutServer"; // server component wrapper
import "./globals.css";
export default function RootLayout({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());

  return (
    <LayoutServer>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <Suspense>       {/* add this */}
            {children}
          </Suspense>        {/* add this */}
        </AuthProvider>
      </QueryClientProvider>
    </LayoutServer>
  );
}