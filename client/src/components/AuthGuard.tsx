"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function AuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {

  const router = useRouter();
  const [loading,setLoading] = useState(true);

  useEffect(() => {

    const token = localStorage.getItem("token");

    if (!token) {
      router.replace("/login");
    } else {
      setLoading(false);
    }

  }, []);

  if(loading) return null;

  return <>{children}</>;
}