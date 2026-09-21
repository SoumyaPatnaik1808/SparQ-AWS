"use server";

import { CognitoIdentityProviderClient, SignUpCommand } from "@aws-sdk/client-cognito-identity-provider";
import crypto from "crypto";

const client = new CognitoIdentityProviderClient({ 
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1" 
});

function getSecretHash(username: string) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;
  
  if (!clientId || !clientSecret) {
    throw new Error("Missing Cognito configuration");
  }

  const hmac = crypto.createHmac('sha256', clientSecret);
  hmac.update(username + clientId);
  return hmac.digest('base64');
}

export async function signUpUser(formData: FormData) {
  const firstName = formData.get("firstName") as string;
  const lastName = formData.get("lastName") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const intent = formData.get("intent") as string; // 'learn' or 'teach'
  const skillsToTeach = formData.get("skillsToTeach") as string; // JSON string array
  const skillsToLearn = formData.get("skillsToLearn") as string; // JSON string array
  
  if (!email || !password || !firstName || !lastName) {
    return { error: "Missing required fields" };
  }

  try {
    const command = new SignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      SecretHash: getSecretHash(email),
      Username: email,
      Password: password,
      UserAttributes: [
        { Name: "given_name", Value: firstName },
        { Name: "family_name", Value: lastName },
        { Name: "email", Value: email },
        { Name: "custom:teach_skills", Value: skillsToTeach || "[]" },
        { Name: "custom:learn_skills", Value: skillsToLearn || "[]" },
      ]
    });

    await client.send(command);
    return { success: true, email, message: "Registration successful." };
  } catch (error: unknown) {
    console.error("Cognito SignUp Error:", error);
    return { error: error instanceof Error ? error.message : "An error occurred during registration" };
  }
}
