"use server";

import {
  CognitoIdentityProviderClient,
  RespondToAuthChallengeCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import crypto from "crypto";

const client = new CognitoIdentityProviderClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
});

function getSecretHash(username: string) {
  const clientId = process.env.NEXT_PUBLIC_CLIENT_ID;
  const clientSecret = process.env.NEXT_PUBLIC_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing Cognito configuration");
  }

  const hmac = crypto.createHmac("sha256", clientSecret);
  hmac.update(username + clientId);
  return hmac.digest("base64");
}

export async function verifyOtp(formData: FormData) {
  const otp = formData.get("otp") as string;
  const session = formData.get("session") as string;
  const email = formData.get("email") as string;
  const challengeName = (formData.get("challengeName") as string) || "SOFTWARE_TOKEN_MFA";

  if (!otp || !session || !email) {
    return { error: "Missing OTP, session, or email" };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { error: "OTP must be exactly 6 digits" };
  }

  try {
    // Map challengeName to the correct response key
    const challengeResponseKey =
      challengeName === "SMS_MFA"
        ? "SMS_MFA_CODE"
        : challengeName === "SOFTWARE_TOKEN_MFA"
        ? "SOFTWARE_TOKEN_MFA_CODE"
        : "SMS_MFA_CODE"; // fallback

    const command = new RespondToAuthChallengeCommand({
      ClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      ChallengeName: challengeName as
        | "SMS_MFA"
        | "SOFTWARE_TOKEN_MFA"
        | "NEW_PASSWORD_REQUIRED",
      Session: session,
      ChallengeResponses: {
        USERNAME: email,
        [challengeResponseKey]: otp,
        SECRET_HASH: getSecretHash(email),
      },
    });

    const response = await client.send(command);

    if (!response.AuthenticationResult) {
      return { error: "OTP verification failed. Please try again." };
    }

    // Store auth cookie on successful verification
    const cookieStore = await cookies();
    cookieStore.set("sparq_auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    if (response.AuthenticationResult.IdToken) {
      cookieStore.set("sparq_id_token", response.AuthenticationResult.IdToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
    }
  } catch (error: unknown) {
    console.error("Cognito OTP Error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during OTP verification",
    };
  }

  redirect("/feed");
}
