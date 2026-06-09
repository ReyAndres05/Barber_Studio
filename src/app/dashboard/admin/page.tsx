"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/admin/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-matte-black text-white">
      <div className="h-10 w-10 border-4 border-gold-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );
}
