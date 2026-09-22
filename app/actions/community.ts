"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import { requireAuthenticatedUser } from "./auth";

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "SparQ_Database";

export async function createCommunity(formData: FormData) {
  const session = await requireAuthenticatedUser();
  const name = String(formData.get("name") ?? "").trim();
  const topic = String(formData.get("topic") ?? "").trim();
  if (!name || !topic) return { error: "Name and topic are required." };
  const community = {
    id: `community-${Date.now()}`,
    entityType: "community",
    ownerEmail: session.email,
    name,
    topic,
    members: 1,
    createdAt: new Date().toISOString(),
  };
  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: community }));
  return { success: true, community };
}