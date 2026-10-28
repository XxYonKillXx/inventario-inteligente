"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/layout/DashboardLayout";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function DashboardRootLayout({ children }: { children: React.ReactNode }) {
  const router  = useRouter();
  const [ok, setOk] = useState(false);

  useEffect(() => {
    const token   = localStorage.getItem("ii_token");
    const usuario = localStorage.getItem("ii_usuario");
    if (!token || !usuario) {
      router.replace("/login");
    } else {
      setOk(true);
    }
  }, [router]);

  if (!ok) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Verificando sesión..." />
      </div>
    );
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}
