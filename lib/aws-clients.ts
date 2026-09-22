import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";

export const bedrockClient = new BedrockRuntimeClient({
  region: process.env.AWS_REGION || process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1",
});
