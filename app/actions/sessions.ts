"use server";

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand, ScanCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { cookies } from "next/headers";
import { getSession, requireAuthenticatedUser, requireTeacher } from "./auth";

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
  {
    id: "demo-navigation-session-figma",
    entityType: "session",
    communityId: "figma-studio",
    communityName: "Figma studio",
    title: "Navigation architecture office hours",
    description: "Bring one routing issue for feedback on navigation patterns that stay fast as your app grows.",
    startTime: "2026-09-25T12:00:00.000Z",
    endTime: "2026-09-25T13:00:00.000Z",
    meetingUrl: "",
    hostEmail: "teacher-1@vssut.ac.in",
    capacity: 11,
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
  const email = session.email;
  const cookieStore = await cookies();

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
      const localAttendance = cookieStore.get(`sparq_attendance_${record.communityId}`)?.value;
      return localAttendance !== "not attending" && (record.hostEmail === email || attendees.includes(email) || localAttendance === "attending");
    }).map((item) => {
      const record = item as SparqSession & { attendeeEmails?: unknown };
      return {
        ...record,
        viewerType: record.hostEmail === email ? "hosting" : "attending",
      };
    }) as SparqSession[];
  } catch (error) {
    console.error("DynamoDB Session Scan Error:", error);
    return FALLBACK_SESSIONS.filter((record) =>
      record.hostEmail === session.email || cookieStore.get(`sparq_attendance_${record.communityId}`)?.value === "attending",
    ).map((record) => ({ ...record, viewerType: record.hostEmail === session.email ? "hosting" : "attending" }));
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

export async function updateSessionAttendance(communityId: string, attending: boolean) {
  const session = await requireAuthenticatedUser();
  const email = session.email;
  if (!email) return { error: "You must be logged in to update attendance." };
  const cookieStore = await cookies();
  const attendanceCookie = `sparq_attendance_${communityId}`;
  let storedSession: SparqSession | undefined;

  try {
    const response = await docClient.send(new ScanCommand({
      TableName: TABLE_NAME,
      FilterExpression: "entityType = :entityType AND communityId = :communityId",
      ExpressionAttributeValues: { ":entityType": "session", ":communityId": communityId },
    }));
    storedSession = response.Items?.[0] as SparqSession | undefined;
  } catch (error) {
    console.error("DynamoDB Attendance Scan Error:", error);
    cookieStore.set(attendanceCookie, attending ? "attending" : "not attending", { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
    return { success: true, attending, localOnly: true };
  }

  const fallbackSession = FALLBACK_SESSIONS.find((item) => item.communityId === communityId);
  const target = storedSession ?? fallbackSession;

  if (!target) return { error: "No session is scheduled for this community." };

  const attendees = Array.isArray(target.attendeeEmails) ? [...target.attendeeEmails] : [];
  const attendeeIndex = attendees.indexOf(email);
  if (attending && attendeeIndex === -1) attendees.push(email);
  if (!attending && attendeeIndex !== -1) attendees.splice(attendeeIndex, 1);

  try {
    if (storedSession) {
      await docClient.send(new UpdateCommand({
        TableName: TABLE_NAME,
        Key: { id: storedSession.id },
        UpdateExpression: "SET attendeeEmails = :attendeeEmails",
        ExpressionAttributeValues: { ":attendeeEmails": attendees },
      }));
    } else {
      await docClient.send(new PutCommand({
        TableName: TABLE_NAME,
        Item: { ...target, attendeeEmails: attendees },
      }));
    }
  } catch (error) {
    console.error("DynamoDB Attendance Update Error:", error);
    cookieStore.set(attendanceCookie, attending ? "attending" : "not attending", { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30, path: "/" });
  }

  return { success: true, attending };
}