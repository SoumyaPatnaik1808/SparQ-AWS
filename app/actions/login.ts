"use server";

import { CognitoIdentityProviderClient, InitiateAuthCommand } from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
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

export async function loginUser(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  if (!email || !password) {
    return { error: "Missing email or password" };
  }

  try {
    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      AuthParameters: {
        USERNAME: email,
        PASSWORD: password,
        SECRET_HASH: getSecretHash(email),
      },
    });

    const response = await client.send(command);

    if (response.ChallengeName && response.Session) {
      return {
        error: "This account requires multi-factor authentication, which is not enabled in this app.",
      };
    }

    const cookieStore = await cookies();
    cookieStore.set("sparq_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    if (response.AuthenticationResult?.IdToken) {
      cookieStore.set("sparq_id_token", response.AuthenticationResult.IdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
  } catch (error: unknown) {
    console.error("Cognito Login Error:", error);
    return { error: error instanceof Error ? error.message : "An error occurred during login" };
  }

  redirect("/feed");
}
