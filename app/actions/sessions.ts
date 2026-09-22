"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";
import { getSession, requireTeacher } from "./auth";

const client = new DynamoDBClient({ region: process.env.NEXT_PUBLIC_AWS_REGION || "ap-south-1" });
const docClient = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.DYNAMODB_TABLE_NAME || "SparQ_Database";

const FALLBACK_SESSIONS: SparqSession[] = [
  {
    id: "demo-shader-session",
    entityType: "session",
    communityId: "shader-lab",
    communityName: "Shader Lab",
    title: "Live shader critique",
    description: "Bring one procedural terrain experiment for a focused community critique.",
    startTime: "2026-09-23T12:30:00.000Z",
    endTime: "2026-09-23T13:30:00.000Z",
    meetingUrl: "",
    hostEmail: "teacher-1@vssut.ac.in",
    capacity: 18,
    status: "scheduled",
    attendeeEmails: ["student-1@vssut.ac.in", "student-2@vssut.ac.in", "student-3@vssut.ac.in"],
  },
  {
    id: "demo-navigation-session",
    entityType: "session",
    communityId: "react-native",
    communityName: "React Native builders",
    title: "Navigation architecture office hours",
    description: "Bring one routing issue for feedback on navigation patterns that stay fast as your app grows.",
    startTime: "2026-09-25T12:00:00.000Z",
    endTime: "2026-09-25T13:00:00.000Z",
    meetingUrl: "",
    hostEmail: "teacher-1@vssut.ac.in",
    capacity: 24,
    status: "scheduled",
    attendeeEmails: ["student-1@vssut.ac.in", "student-2@vssut.ac.in", "student-3@vssut.ac.in"],
  },
];

export interface SparqSession {
  id: string;
  entityType: "session";
  communityId: string;
  communityName: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  meetingUrl: string;
  hostEmail: string;
  capacity: number;
  status: "scheduled";
  attendeeEmails?: string[];
  viewerType?: "hosting" | "attending";
}

export async function getSessions(): Promise<SparqSession[]> {
  const session = await getSession();
  if (!session.authenticated || !session.email) return [];

  try {
    const response = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "entityType = :entityType",
      ExpressionAttributeValues: { ":entityType": "session" },
    }));
    const storedSessions = (response.Items ?? []).filter((item) => item.entityType === "session");
    const items = storedSessions.length ? storedSessions : FALLBACK_SESSIONS;
    return items.filter((item) => {
      const record = item as SparqSession & { attendeeEmails?: unknown };
      const attendees = Array.isArray(record.attendeeEmails) ? record.attendeeEmails : [];
      return record.hostEmail === session.email || (session.email !== null && attendees.includes(session.email));
    }).map((item) => {
      const record = item as SparqSession & { attendeeEmails?: unknown };
      return {
        ...record,
        viewerType: record.hostEmail === session.email ? "hosting" : "attending",
      };
    }) as SparqSession[];
  } catch (error) {
    console.error("DynamoDB Session Scan Error:", error);
    return [];
  }
}

export async function createSession(formData: FormData) {
  const session = await requireTeacher();
  const title = String(formData.get("title") ?? "").trim();
  const communityId = String(formData.get("communityId") ?? "").trim();
  const communityName = String(formData.get("communityName") ?? "").trim();
  const startTime = String(formData.get("startTime") ?? "").trim();
  const endTime = String(formData.get("endTime") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const meetingUrl = String(formData.get("meetingUrl") ?? "").trim();
  const capacity = Number(formData.get("capacity") ?? 20);

  if (!title || !communityId || !startTime || !endTime || !description) {
    return { error: "Title, community, time, and session details are required." };
  }

  const item: SparqSession & { attendeeEmails: string[]; createdAt: string } = {
    id: `session-${Date.now()}`,
    entityType: "session",
    communityId,
    communityName,
    title,
    description,
    startTime: new Date(startTime).toISOString(),
    endTime: new Date(endTime).toISOString(),
    meetingUrl,
    hostEmail: session.email ?? "teacher-1@vssut.ac.in",
    capacity: Number.isFinite(capacity) && capacity > 0 ? capacity : 20,
    status: "scheduled",
    attendeeEmails: [session.email ?? "teacher-1@vssut.ac.in"],
    createdAt: new Date().toISOString(),
  };

  await docClient.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  return { success: true, session: item };
}