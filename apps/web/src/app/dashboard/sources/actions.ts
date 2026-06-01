"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getSources() {
  return db.prepare("SELECT * FROM api_sources ORDER BY created_at DESC").all() as any[];
}

export async function addSource(formData: FormData) {
  const name = formData.get("name") as string;
  const url = formData.get("url") as string;
  const api_key = formData.get("api_key") as string;
  const method = formData.get("method") as string;
  const headers = formData.get("headers") as string;

  db.prepare("INSERT INTO api_sources (name, url, api_key, method, headers) VALUES (?, ?, ?, ?, ?)")
    .run(name, url, api_key, method, headers);

  revalidatePath("/dashboard/sources");
  return { success: true };
}

export async function deleteSource(id: number) {
  db.prepare("DELETE FROM api_sources WHERE id = ?").run(id);
  // Also delete associated cards
  db.prepare("DELETE FROM dashboard_cards WHERE source_id = ?").run(id);
  
  revalidatePath("/dashboard/sources");
  return { success: true };
}
