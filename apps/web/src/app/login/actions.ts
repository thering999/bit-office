"use server";

import db from "@/lib/db";
import { cookies } from "next/headers";

export async function loginAction(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) {
    return { error: "Please enter both username and password" };
  }

  try {
    const user = db.prepare("SELECT * FROM users WHERE username = ? AND password = ?").get(username, password) as any;

    if (user) {
      // Set a simple cookie for authentication (not secure for production, but fits the mockup requirement)
      const cookieStore = await cookies();
      cookieStore.set("auth", "true", { path: "/" });
      return { success: true };
    } else {
      return { error: "Invalid username or password" };
    }
  } catch (err) {
    console.error("Login error:", err);
    return { error: "A database error occurred" };
  }
}
