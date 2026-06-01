"use server";

import db from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function getCards() {
  return db.prepare(`
    SELECT c.*, s.name as source_name, s.url as source_url, s.api_key, s.method, s.headers 
    FROM dashboard_cards c
    JOIN api_sources s ON c.source_id = s.id
    ORDER BY c.position ASC
  `).all() as any[];
}

export async function addCard(formData: FormData) {
  const title = formData.get("title") as string;
  const source_id = parseInt(formData.get("source_id") as string);
  const type = formData.get("type") as string;
  const config = formData.get("config") as string;
  
  // Get max position
  const lastCard = db.prepare("SELECT MAX(position) as maxPos FROM dashboard_cards").get() as any;
  const nextPos = (lastCard?.maxPos || 0) + 1;

  db.prepare("INSERT INTO dashboard_cards (title, source_id, type, config, position) VALUES (?, ?, ?, ?, ?)")
    .run(title, source_id, type, config, nextPos);

  revalidatePath("/dashboard");
  return { success: true };
}

export async function deleteCard(id: number) {
  db.prepare("DELETE FROM dashboard_cards WHERE id = ?").run(id);
  revalidatePath("/dashboard");
  return { success: true };
}
