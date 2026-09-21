"use server";

import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
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

export async function confirmSignUp(formData: FormData) {
  const email = formData.get("email") as string;
  const otp = formData.get("otp") as string;

  if (!email || !otp) {
    return { error: "Missing email or verification code" };
  }

  if (!/^\d{6}$/.test(otp)) {
    return { error: "Verification code must be exactly 6 digits" };
  }

  try {
    const command = new ConfirmSignUpCommand({
      ClientId: process.env.NEXT_PUBLIC_CLIENT_ID!,
      SecretHash: getSecretHash(email),
      Username: email,
      ConfirmationCode: otp,
    });

    await client.send(command);

    return { success: true };
  } catch (error: unknown) {
    console.error("Cognito ConfirmSignUp Error:", error);
    return {
      error:
        error instanceof Error
          ? error.message
          : "An error occurred during verification",
    };
  }
}
