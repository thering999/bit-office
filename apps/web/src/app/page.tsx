"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

const OfficeSplash = dynamic(() => import("@/components/OfficeSplash"), { ssr: false });

import { getConnection } from "@/lib/storage";

export default function Home() {
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(true);

  // Check if already connected — skip splash
  useEffect(() => {
    const conn = getConnection();
    if (conn) {
      setShowSplash(false);
      router.replace("/office");
    }
  }, [router]);

  const handleComplete = useCallback(() => {
    setShowSplash(false);
    router.replace("/pair");
  }, [router]);

  if (!showSplash) return null;

  return <OfficeSplash onComplete={handleComplete} />;
}
