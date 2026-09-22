"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ALLOWED_CREDENTIALS: Record<string, string> = {
  "student-1@vssut.ac.in": "Student-1-AWS",
  "student-2@vssut.ac.in": "Student-2-AWS",
  "student-3@vssut.ac.in": "Student-3-AWS",
  "teacher-1@vssut.ac.in": "Teacher-1-AWS",
};

export async function loginUser(formData: FormData) {
  const email = (formData.get("email") as string)?.trim().toLowerCase();
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Missing email or password" };
  }

  if (ALLOWED_CREDENTIALS[email] !== password) {
    return { error: "Invalid email or password" };
  }

  const cookieStore = await cookies();
  cookieStore.set("sparq_auth", "authenticated", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  cookieStore.set("sparq_email", email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  redirect("/feed");
}
