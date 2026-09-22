"use server";

import { cookies } from "next/headers";

export async function getSession() {
  const cookieStore = await cookies();
  const email = cookieStore.get("sparq_email")?.value ?? null;
  return { authenticated: cookieStore.get("sparq_auth")?.value === "authenticated", email, isTeacher: email === "teacher-1@vssut.ac.in" };
}

export async function requireTeacher() {
  const session = await getSession();
  if (!session.authenticated || !session.isTeacher) {
    throw new Error("Only the teacher account can perform this action.");
  }
  return session;
}

export async function requireAuthenticatedUser() {
  const session = await getSession();
  if (!session.authenticated || !session.email) {
    throw new Error("You must be logged in to perform this action.");
  }
  return session;
}

export async function signUpUser(formData: FormData) {
  void formData;
  return { error: "Registration is disabled. Please use an approved account." };
}
