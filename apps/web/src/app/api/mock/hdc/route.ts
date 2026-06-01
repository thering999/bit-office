import { NextResponse } from "next/server";
export const dynamic = "force-static";

export async function GET() {
  // Simulating HDC (Health Data Center) Open Data response
  const data = {
    title: "Health Metrics Overview",
    last_updated: new Date().toISOString(),
    value: (Math.random() * 100).toFixed(1),
    unit: "%",
    status: "healthy",
    points: Array.from({ length: 12 }, () => ({
      value: Math.floor(Math.random() * 100),
    })),
    recent_events: [
      { name: "Patient Records Sync", status: "stable" },
      { name: "Immunization Data", status: "stable" },
      { name: "Chronic Disease Log", status: "syncing" },
    ]
  };

  return NextResponse.json(data);
}
