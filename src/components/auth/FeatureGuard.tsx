"use client";

import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface FeatureGuardProps {
  featureId: string;
  children: React.ReactNode;
}

export default function FeatureGuard({ children }: FeatureGuardProps) {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-[50vh] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // 🚀 DISABLED FEATURE SYSTEM COMPLETELY
  // No plan checks, no AI tool checks, no restrictions

  return <>{children}</>;
}